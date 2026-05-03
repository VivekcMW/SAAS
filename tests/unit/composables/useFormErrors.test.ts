import { describe, it, expect, beforeEach } from 'vitest'
import { useFormErrors } from '~/composables/useFormErrors'
import type { FormValidationSchema } from '~/composables/useFormErrors'

// useFormErrors uses ref/computed from '#imports' which is aliased to
// tests/unit/__mocks__/nuxt-imports.ts (real Vue reactivity) in vitest.config.ts

describe('useFormErrors', () => {
  // Each test gets a fresh composable instance to avoid state leakage
  let form: ReturnType<typeof useFormErrors>

  beforeEach(() => {
    form = useFormErrors()
  })

  // ── addError / clearErrors ──────────────────────────────────────────────

  describe('addError', () => {
    it('pushes error into errors array', () => {
      form.addError({ message: 'Something went wrong', type: 'submission' })
      expect(form.errors.value).toHaveLength(1)
      expect(form.errors.value[0].message).toBe('Something went wrong')
    })

    it('indexes field-specific errors in fieldErrors', () => {
      form.addError({ field: 'email', message: 'Invalid email', type: 'validation' })
      expect(form.fieldErrors.value['email']).toContain('Invalid email')
    })

    it('does not add to fieldErrors when field is omitted', () => {
      form.addError({ message: 'Generic error', type: 'submission' })
      expect(Object.keys(form.fieldErrors.value)).toHaveLength(0)
    })
  })

  describe('clearErrors', () => {
    it('removes all errors and field errors', () => {
      form.addError({ field: 'email', message: 'Bad email', type: 'validation' })
      form.addError({ message: 'Submit failed', type: 'submission' })
      form.clearErrors()
      expect(form.errors.value).toHaveLength(0)
      expect(Object.keys(form.fieldErrors.value)).toHaveLength(0)
    })
  })

  describe('clearFieldError', () => {
    it('removes only errors for the specified field', () => {
      form.addError({ field: 'email', message: 'Bad email', type: 'validation' })
      form.addError({ field: 'password', message: 'Too short', type: 'validation' })
      form.clearFieldError('email')
      expect(form.fieldErrors.value['email']).toBeUndefined()
      expect(form.fieldErrors.value['password']).toContain('Too short')
    })
  })

  describe('hasErrors computed', () => {
    it('is false when no errors', () => {
      expect(form.hasErrors.value).toBe(false)
    })

    it('is true after an error is added', () => {
      form.addError({ message: 'Oops', type: 'submission' })
      expect(form.hasErrors.value).toBe(true)
    })
  })

  // ── validateField ────────────────────────────────────────────────────────

  describe('validateField', () => {
    it('returns error for required field with empty value', () => {
      const errs = form.validateField('name', '', [{ required: true }])
      expect(errs).toHaveLength(1)
      expect(errs[0]).toMatch(/required/i)
    })

    it('returns no error for required field with value', () => {
      const errs = form.validateField('name', 'Alice', [{ required: true }])
      expect(errs).toHaveLength(0)
    })

    it('enforces minLength on strings', () => {
      const errs = form.validateField('password', 'ab', [{ minLength: 8 }])
      expect(errs).toHaveLength(1)
      expect(errs[0]).toMatch(/at least 8/i)
    })

    it('passes when string meets minLength', () => {
      const errs = form.validateField('password', 'abcdefgh', [{ minLength: 8 }])
      expect(errs).toHaveLength(0)
    })

    it('enforces maxLength on strings', () => {
      const errs = form.validateField('username', 'averylongname', [{ maxLength: 5 }])
      expect(errs).toHaveLength(1)
      expect(errs[0]).toMatch(/no more than 5/i)
    })

    it('enforces pattern on strings', () => {
      const errs = form.validateField('email', 'not-an-email', [
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ])
      expect(errs).toHaveLength(1)
      expect(errs[0]).toMatch(/invalid/i)
    })

    it('runs custom validator and returns its message', () => {
      const errs = form.validateField('age', 17, [
        { custom: (v) => (v < 18 ? 'Must be 18 or older' : null) }
      ])
      expect(errs).toHaveLength(1)
      expect(errs[0]).toBe('Must be 18 or older')
    })

    it('skips optional field that is empty', () => {
      const errs = form.validateField('bio', '', [{ minLength: 10 }])
      expect(errs).toHaveLength(0)
    })

    it('uses the custom message override', () => {
      const errs = form.validateField('name', '', [
        { required: true, message: 'Full name is required' }
      ])
      expect(errs[0]).toBe('Full name is required')
    })
  })

  // ── validateForm ─────────────────────────────────────────────────────────

  describe('validateForm', () => {
    const schema: FormValidationSchema = {
      email: [{ required: true }, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
      password: [{ required: true }, { minLength: 8 }]
    }

    it('returns true for valid data and leaves errors empty', () => {
      const valid = form.validateForm({ email: 'user@example.com', password: 'secure123' }, schema)
      expect(valid).toBe(true)
      expect(form.errors.value).toHaveLength(0)
    })

    it('returns false and populates errors for invalid data', () => {
      const valid = form.validateForm({ email: '', password: 'short' }, schema)
      expect(valid).toBe(false)
      expect(form.errors.value.length).toBeGreaterThan(0)
    })

    it('clears previous errors before re-validating', () => {
      form.validateForm({ email: '', password: '' }, schema)
      const firstCount = form.errors.value.length

      form.validateForm({ email: 'user@example.com', password: 'secure123' }, schema)
      expect(form.errors.value).toHaveLength(0)
      expect(firstCount).toBeGreaterThan(0)
    })
  })

  // ── handleApiError ────────────────────────────────────────────────────────

  describe('handleApiError', () => {
    it('handles structured array errors from API', () => {
      form.handleApiError({
        data: { errors: [{ field: 'email', message: 'Taken', type: 'server' }] }
      })
      expect(form.fieldErrors.value['email']).toContain('Taken')
    })

    it('handles field-keyed object errors from API', () => {
      form.handleApiError({
        data: { errors: { username: ['Already taken', 'Must be unique'] } }
      })
      expect(form.fieldErrors.value['username']).toContain('Already taken')
      expect(form.fieldErrors.value['username']).toContain('Must be unique')
    })

    it('handles plain message from API', () => {
      form.handleApiError({ data: { message: 'Server error' } })
      expect(form.submissionError.value).toBe('Server error')
    })

    it('handles error.message fallback', () => {
      form.handleApiError({ message: 'Network timeout' })
      expect(form.submissionError.value).toBe('Network timeout')
    })

    it('uses generic message when nothing is provided', () => {
      form.handleApiError({})
      expect(form.submissionError.value).toMatch(/unexpected error/i)
    })
  })

  // ── getFieldErrors / hasFieldError ────────────────────────────────────────

  describe('getFieldErrors / hasFieldError', () => {
    it('getFieldErrors returns empty array for unknown field', () => {
      expect(form.getFieldErrors('unknown')).toEqual([])
    })

    it('getFieldErrors returns messages for a field with errors', () => {
      form.addError({ field: 'email', message: 'Required', type: 'validation' })
      expect(form.getFieldErrors('email')).toContain('Required')
    })

    it('hasFieldError returns false when no error', () => {
      expect(form.hasFieldError('email')).toBe(false)
    })

    it('hasFieldError returns true after error is added', () => {
      form.addError({ field: 'email', message: 'Bad', type: 'validation' })
      expect(form.hasFieldError('email')).toBe(true)
    })
  })
})
