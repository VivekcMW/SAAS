/**
 * Contact form handler. Validates input and sends an email to the admin team.
 */

import { createError, defineEventHandler, readBody } from 'h3'
import { buildContactEmail, sendEmail } from '~/server/utils/email'

interface ContactBody {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)

  const name = (body?.name || '').trim()
  const email = (body?.email || '').trim()
  const message = (body?.message || '').trim()
  const subject = (body?.subject || '').trim() || undefined

  if (!name || !email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email, and message are required'
    })
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }
  if (message.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Message is too long' })
  }

  const result = await sendEmail(buildContactEmail({ name, email, subject, message }))

  if (!result.ok) {
    return {
      success: true,
      delivered: false,
      message:
        'Thanks for your message. We have logged it and will follow up shortly.'
    }
  }

  return {
    success: true,
    delivered: true,
    message: 'Thank you for your message. We will get back to you shortly!'
  }
})
