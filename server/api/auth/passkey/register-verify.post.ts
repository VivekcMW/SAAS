/**
 * POST /api/auth/passkey/register-verify
 * Verifies a credential from navigator.credentials.create() and stores it.
 */
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { getCookie, deleteCookie } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { consumeChallenge, saveCredential } from '~/server/utils/passkey'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const challengeId = getCookie(event, 'pk_challenge_id')
  if (!challengeId) throw createError({ statusCode: 400, statusMessage: 'Challenge missing or expired.' })

  const stored = consumeChallenge(challengeId)
  if (!stored || stored.userId !== user.id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired challenge.' })
  }

  deleteCookie(event, 'pk_challenge_id')

  const body = await readBody(event)

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const rpId = new URL(baseUrl).hostname

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: stored.challenge,
    expectedOrigin: baseUrl,
    expectedRPID: rpId,
    requireUserVerification: false
  })

  if (!verification.verified || !verification.registrationInfo) {
    throw createError({ statusCode: 400, statusMessage: 'Passkey registration verification failed.' })
  }

  const { credential, credentialDeviceType } = verification.registrationInfo
  const transports: string[] = body.response?.transports ?? []

  // Convert Uint8Array public key to base64url string for storage
  const publicKeyB64 = Buffer.from(credential.publicKey).toString('base64url')

  saveCredential(user.id, credential.id, publicKeyB64, credential.counter, transports)

  return { verified: true, deviceType: credentialDeviceType }
})
