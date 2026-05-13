/**
 * POST /api/auth/passkey/login-verify
 * Verifies a passkey authentication assertion and creates a session.
 */
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { getCookie, deleteCookie } from 'h3'
import { getDb, logActivity } from '~/server/utils/database'
import { createSession } from '~/server/utils/auth'
import { consumeChallenge, getCredentialById, updateCredentialCounter } from '~/server/utils/passkey'
import { logGeoEvent } from '~/server/utils/geoTracker'

export default defineEventHandler(async (event) => {
  const challengeId = getCookie(event, 'pk_challenge_id')
  if (!challengeId) throw createError({ statusCode: 400, statusMessage: 'Challenge missing or expired.' })

  const stored = consumeChallenge(challengeId)
  if (!stored) throw createError({ statusCode: 400, statusMessage: 'Invalid or expired challenge.' })
  deleteCookie(event, 'pk_challenge_id')

  const body = await readBody(event)

  const credential = getCredentialById(body.id as string)
  if (!credential) throw createError({ statusCode: 400, statusMessage: 'Unknown passkey credential.' })

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const rpId = new URL(baseUrl).hostname

  // Decode stored public key back to Uint8Array
  const publicKey = Uint8Array.from(Buffer.from(credential.public_key, 'base64url'))

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: stored.challenge,
    expectedOrigin: baseUrl,
    expectedRPID: rpId,
    credential: {
      id: credential.credential_id,
      publicKey,
      counter: credential.counter,
      transports: JSON.parse(credential.transports) as AuthenticatorTransport[]
    },
    requireUserVerification: false
  })

  if (!verification.verified) {
    throw createError({ statusCode: 400, statusMessage: 'Passkey authentication failed.' })
  }

  updateCredentialCounter(credential.credential_id, verification.authenticationInfo.newCounter)

  const db = getDb()
  const user = db.prepare(`SELECT id, email FROM users WHERE id = ?`).get(credential.user_id) as
    | { id: string; email: string } | undefined

  if (!user) throw createError({ statusCode: 500, statusMessage: 'User not found.' })

  await createSession(event, user.id)

  logActivity({
    actorId: user.id,
    actorEmail: user.email,
    action: 'passkey_login',
    entityType: 'user',
    entityId: user.id,
  })
  logGeoEvent(event, { userId: user.id, eventType: 'passkey_login' })

  return { success: true }
})
