/**
 * API Endpoint: Submit Product Onboarding
 * Handles the submission of onboarding form data and transforms it into app data
 */

import { transformOnboardingToApp, generateUniqueId as generateAppId, validateOnboardingData } from '~/utils/productTransformation';

export default defineEventHandler(async (event) => {
  try {
    // Only allow POST requests
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
    }

    const body = await readBody(event);
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required'
      });
    }

    // Validate required fields
    const { formData } = body;
    
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form data is required'
      });
    }

    // Validate essential fields
    if (!validateOnboardingData(formData)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product name, company name, and description are required'
      });
    }

    try {
      // Transform onboarding data to app format
      const appData = transformOnboardingToApp(formData);
      
      // Generate unique ID for the submission
      const submissionId = generateAppId();
      appData.id = submissionId;
      
      // Set submission metadata
      appData.submissionDate = new Date().toISOString();
      appData.status = 'submitted'; // Will be reviewed by admin
      
      // TODO: Save to actual database
      // For now, we'll simulate saving to database
      console.log('Saving app submission:', {
        id: submissionId,
        name: appData.name,
        provider: appData.provider,
        status: appData.status,
        fundingInfo: appData.fundingInfo ? {
          seekingFunding: appData.fundingInfo.seekingFunding,
          fundingStage: appData.fundingInfo.fundingStage,
          fundingAmount: appData.fundingInfo.fundingAmount
        } : null
      });
      
      // Simulate database save delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // TODO: Send notification email to admin
      // TODO: Send confirmation email to user
      
      return {
        success: true,
        data: {
          submissionId,
          status: 'submitted',
          message: 'Your application has been submitted successfully. Our team will review it within 24-48 hours.',
          nextSteps: [
            'Our team will review your submission',
            'You will receive an email notification about the review status',
            'If approved, your app will be published on the marketplace',
            'You can track the status in your dashboard'
          ]
        }
      };
      
    } catch (transformError) {
      console.error('Error transforming onboarding data:', transformError);
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid form data structure'
      });
    }
    
  } catch (error) {
    // If it's already a proper error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    // Otherwise, create a generic server error
    console.error('Error processing onboarding submission:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});
