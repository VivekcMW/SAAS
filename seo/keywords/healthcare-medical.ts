/**
 * Healthcare & Medical SEO Keywords
 * Comprehensive keyword strategy for healthcare and medical software category
 */

import type { CategoryKeywords } from './types'

export const healthcareKeywords: CategoryKeywords = {
  category: 'Healthcare & Medical',
  categoryId: 'healthcare',
  primaryKeywords: [
    'healthcare software',
    'medical software',
    'healthcare management software',
    'medical practice software',
    'healthcare technology',
    'medical management platform',
    'healthcare solutions',
    'medical practice management'
  ],
  secondaryKeywords: [
    'electronic health records',
    'patient management software',
    'medical billing software',
    'telemedicine platform',
    'healthcare analytics',
    'medical scheduling software',
    'pharmacy management',
    'healthcare compliance'
  ],
  longTailKeywords: [
    'best healthcare management software for medical practices',
    'comprehensive electronic health records system',
    'medical practice management software for clinics',
    'telemedicine platform for healthcare providers',
    'patient management and scheduling software',
    'medical billing and coding software solutions',
    'healthcare analytics and reporting platform',
    'HIPAA compliant healthcare software'
  ],
  brandKeywords: [
    'Epic alternative',
    'Cerner competitor',
    'athenahealth alternative',
    'eClinicalWorks competitor',
    'NextGen alternative',
    'AllScripts competitor'
  ],
  locationKeywords: [
    'healthcare software USA',
    'medical software Europe',
    'healthcare platform worldwide',
    'medical solutions global'
  ],
  subcategories: {
    'electronic-health-records': {
      name: 'Electronic Health Records (EHR)',
      path: '/marketplace/category/healthcare-ehr',
      keywords: [
        'electronic health records',
        'EHR software',
        'electronic medical records',
        'EMR system',
        'patient records software',
        'digital health records',
        'medical records management',
        'healthcare records platform'
      ],
      longTail: [
        'best electronic health records software for medical practices',
        'comprehensive EHR system for healthcare providers',
        'HIPAA compliant electronic medical records platform',
        'cloud-based EHR software for clinics'
      ],
      searchVolume: 'high',
      competition: 'high'
    },
    'practice-management': {
      name: 'Practice Management',
      path: '/marketplace/category/healthcare-practice',
      keywords: [
        'medical practice management',
        'healthcare practice software',
        'clinic management system',
        'medical office software',
        'practice management platform',
        'healthcare administration',
        'medical practice automation',
        'clinic workflow software'
      ],
      longTail: [
        'best medical practice management software for clinics',
        'comprehensive healthcare practice administration platform',
        'medical office management and workflow software',
        'clinic operations and patient management system'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'telemedicine': {
      name: 'Telemedicine',
      path: '/marketplace/category/healthcare-telemedicine',
      keywords: [
        'telemedicine software',
        'telehealth platform',
        'virtual care software',
        'remote patient monitoring',
        'online consultation platform',
        'digital health platform',
        'virtual healthcare',
        'telehealth solutions'
      ],
      longTail: [
        'best telemedicine software for healthcare providers',
        'comprehensive telehealth platform for remote care',
        'virtual consultation and patient monitoring software',
        'HIPAA compliant telemedicine solutions'
      ],
      searchVolume: 'high',
      competition: 'medium'
    },
    'medical-billing': {
      name: 'Medical Billing',
      path: '/marketplace/category/healthcare-billing',
      keywords: [
        'medical billing software',
        'healthcare billing platform',
        'medical coding software',
        'revenue cycle management',
        'medical claims software',
        'healthcare revenue software',
        'medical billing automation',
        'insurance billing software'
      ],
      longTail: [
        'best medical billing software for healthcare practices',
        'comprehensive healthcare revenue cycle management',
        'automated medical billing and coding platform',
        'insurance claims processing software'
      ],
      searchVolume: 'medium',
      competition: 'medium'
    },
    'patient-engagement': {
      name: 'Patient Engagement',
      path: '/marketplace/category/healthcare-patient',
      keywords: [
        'patient engagement software',
        'patient portal platform',
        'patient communication software',
        'patient experience platform',
        'healthcare CRM',
        'patient relationship management',
        'patient education software',
        'healthcare patient platform'
      ],
      longTail: [
        'best patient engagement software for healthcare providers',
        'comprehensive patient portal and communication platform',
        'patient experience and relationship management software',
        'healthcare patient education and engagement tools'
      ],
      searchVolume: 'medium',
      competition: 'low'
    },
    'medical-imaging': {
      name: 'Medical Imaging',
      path: '/marketplace/category/healthcare-imaging',
      keywords: [
        'medical imaging software',
        'PACS system',
        'radiology software',
        'medical image management',
        'diagnostic imaging platform',
        'medical image viewer',
        'radiology information system',
        'medical imaging solutions'
      ],
      longTail: [
        'best medical imaging software for radiology departments',
        'comprehensive PACS and medical image management system',
        'radiology information and imaging platform',
        'diagnostic imaging and analysis software'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'pharmacy-management': {
      name: 'Pharmacy Management',
      path: '/marketplace/category/healthcare-pharmacy',
      keywords: [
        'pharmacy management software',
        'pharmacy system',
        'prescription management',
        'pharmacy dispensing software',
        'medication management',
        'pharmacy automation',
        'drug inventory software',
        'pharmacy workflow platform'
      ],
      longTail: [
        'best pharmacy management software for pharmacies',
        'comprehensive prescription and medication management system',
        'pharmacy dispensing and inventory software',
        'automated pharmacy workflow and management platform'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'laboratory-management': {
      name: 'Laboratory Management',
      path: '/marketplace/category/healthcare-laboratory',
      keywords: [
        'laboratory management software',
        'LIMS system',
        'lab information system',
        'laboratory workflow software',
        'lab data management',
        'laboratory automation',
        'lab testing software',
        'clinical lab software'
      ],
      longTail: [
        'best laboratory management software for medical labs',
        'comprehensive LIMS and lab information system',
        'laboratory workflow and data management platform',
        'clinical lab testing and automation software'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'mental-health': {
      name: 'Mental Health',
      path: '/marketplace/category/healthcare-mental',
      keywords: [
        'mental health software',
        'therapy practice software',
        'behavioral health platform',
        'counseling software',
        'psychology practice management',
        'mental health EMR',
        'therapy session software',
        'behavioral health management'
      ],
      longTail: [
        'best mental health software for therapy practices',
        'comprehensive behavioral health management platform',
        'therapy and counseling practice software',
        'mental health EMR and patient management system'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'dental-software': {
      name: 'Dental Software',
      path: '/marketplace/category/healthcare-dental',
      keywords: [
        'dental practice software',
        'dental management system',
        'dental EMR software',
        'dental office software',
        'dental patient management',
        'dental scheduling software',
        'dental billing software',
        'dental practice platform'
      ],
      longTail: [
        'best dental practice management software for dentists',
        'comprehensive dental office and patient management system',
        'dental EMR and scheduling platform',
        'dental billing and practice automation software'
      ],
      searchVolume: 'medium',
      competition: 'low'
    },
    'veterinary-software': {
      name: 'Veterinary Software',
      path: '/marketplace/category/healthcare-veterinary',
      keywords: [
        'veterinary software',
        'vet practice management',
        'veterinary EMR',
        'animal hospital software',
        'vet clinic software',
        'veterinary patient management',
        'vet practice platform',
        'animal care software'
      ],
      longTail: [
        'best veterinary practice management software for vets',
        'comprehensive animal hospital and clinic software',
        'veterinary EMR and patient management system',
        'vet practice automation and scheduling platform'
      ],
      searchVolume: 'low',
      competition: 'low'
    },
    'medical-devices': {
      name: 'Medical Devices',
      path: '/marketplace/category/healthcare-devices',
      keywords: [
        'medical device software',
        'healthcare IoT platform',
        'medical device management',
        'connected health devices',
        'medical device monitoring',
        'healthcare device platform',
        'medical equipment software',
        'device data management'
      ],
      longTail: [
        'best medical device management software for healthcare',
        'comprehensive healthcare IoT and device platform',
        'connected medical device monitoring system',
        'medical equipment and device data management'
      ],
      searchVolume: 'low',
      competition: 'low'
    }
  }
}
