/**
 * Form Error Management Composable
 * Centralized error handling for all forms in the platform
 */

export interface FormError {
  field?: string
  message: string
  type: 'validation' | 'submission' | 'network' | 'server'
  code?: string
}

export interface FieldValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface FormValidationSchema {
  [field: string]: FieldValidationRule[]
}

export const useFormErrors = () => {
  // Error state management
  const errors = ref<FormError[]>([])
  const fieldErrors = ref<Record<string, string[]>>({})
  const isSubmitting = ref(false)
  const submissionError = ref<string | null>(null)

  // Clear all errors
  const clearErrors = () => {
    errors.value = []
    fieldErrors.value = {}
    submissionError.value = null
  }

  // Clear errors for a specific field
  const clearFieldError = (field: string) => {
    errors.value = errors.value.filter(error => error.field !== field)
    delete fieldErrors.value[field]
  }

  // Add a single error
  const addError = (error: FormError) => {
    errors.value.push(error)
    
    if (error.field) {
      if (!fieldErrors.value[error.field]) {
        fieldErrors.value[error.field] = []
      }
      fieldErrors.value[error.field].push(error.message)
    }
  }

  // Add multiple errors
  const addErrors = (newErrors: FormError[]) => {
    newErrors.forEach(error => addError(error))
  }

  // Set submission error
  const setSubmissionError = (message: string) => {
    submissionError.value = message
    addError({
      message,
      type: 'submission'
    })
  }

  // Validate a single field
  const validateField = (field: string, value: any, rules: FieldValidationRule[]): string[] => {
    const fieldErrors: string[] = []

    for (const rule of rules) {
      // Required validation
      if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
        fieldErrors.push(rule.message || `${field} is required`)
        continue
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) continue

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(rule.message || `${field} must be at least ${rule.minLength} characters`)
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(rule.message || `${field} must be no more than ${rule.maxLength} characters`)
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message || `${field} format is invalid`)
        }
      }

      // Array validations
      if (Array.isArray(value)) {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(rule.message || `Please select at least ${rule.minLength} ${field}`)
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(rule.message || `Please select no more than ${rule.maxLength} ${field}`)
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) {
          fieldErrors.push(customError)
        }
      }
    }

    return fieldErrors
  }

  // Validate entire form
  const validateForm = (data: Record<string, any>, schema: FormValidationSchema): boolean => {
    clearErrors()
    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const errors = validateField(field, value, rules)
      
      if (errors.length > 0) {
        isValid = false
        errors.forEach(message => {
          addError({
            field,
            message,
            type: 'validation'
          })
        })
      }
    }

    return isValid
  }

  // Handle API errors
  const handleApiError = (error: any) => {
    clearErrors()

    if (error?.data?.errors) {
      // Structured API errors
      if (Array.isArray(error.data.errors)) {
        addErrors(error.data.errors)
      } else {
        // Field-specific errors
        Object.entries(error.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              addError({ field, message, type: 'server' })
            })
          } else {
            addError({ field, message: messages as string, type: 'server' })
          }
        })
      }
    } else if (error?.data?.message) {
      setSubmissionError(error.data.message)
    } else if (error?.message) {
      setSubmissionError(error.message)
    } else {
      setSubmissionError('An unexpected error occurred. Please try again.')
    }
  }

  // Submit form with error handling
  const submitForm = async (
    submitFn: () => Promise<any>,
    options: {
      onSuccess?: (result: any) => void
      onError?: (error: any) => void
      loadingMessage?: string
    } = {}
  ) => {
    if (isSubmitting.value) return

    isSubmitting.value = true
    clearErrors()

    try {
      const result = await submitFn()
      options.onSuccess?.(result)
      return result
    } catch (error) {
      handleApiError(error)
      options.onError?.(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  // Get errors for a specific field
  const getFieldErrors = (field: string): string[] => {
    return fieldErrors.value[field] || []
  }

  // Check if field has errors
  const hasFieldError = (field: string): boolean => {
    return getFieldErrors(field).length > 0
  }

  // Check if form has any errors
  const hasErrors = computed(() => errors.value.length > 0)

  // Get all validation errors
  const validationErrors = computed(() => 
    errors.value.filter(error => error.type === 'validation')
  )

  // Get all submission errors
  const submissionErrors = computed(() => 
    errors.value.filter(error => error.type === 'submission' || error.type === 'server')
  )

  return {
    // State
    errors: readonly(errors),
    fieldErrors: readonly(fieldErrors),
    isSubmitting: readonly(isSubmitting),
    submissionError: readonly(submissionError),
    
    // Computed
    hasErrors,
    validationErrors,
    submissionErrors,
    
    // Methods
    clearErrors,
    clearFieldError,
    addError,
    addErrors,
    setSubmissionError,
    validateField,
    validateForm,
    handleApiError,
    submitForm,
    getFieldErrors,
    hasFieldError
  }
}

// Common validation rules
export const validationRules = {
  required: (message?: string): FieldValidationRule => ({
    required: true,
    message: message || 'This field is required'
  }),
  
  minLength: (length: number, message?: string): FieldValidationRule => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`
  }),
  
  maxLength: (length: number, message?: string): FieldValidationRule => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`
  }),
  
  email: (message?: string): FieldValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address'
  }),
  
  url: (message?: string): FieldValidationRule => ({
    pattern: /^https?:\/\/.+\..+/,
    message: message || 'Please enter a valid URL'
  }),
  
  phone: (message?: string): FieldValidationRule => ({
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: message || 'Please enter a valid phone number'
  }),
  
  minSelection: (count: number, message?: string): FieldValidationRule => ({
    minLength: count,
    message: message || `Please select at least ${count} option${count !== 1 ? 's' : ''}`
  }),
  
  maxSelection: (count: number, message?: string): FieldValidationRule => ({
    maxLength: count,
    message: message || `Please select no more than ${count} option${count !== 1 ? 's' : ''}`
  }),
  
  custom: (validator: (value: any) => string | null, message?: string): FieldValidationRule => ({
    custom: validator,
    message
  })
}
