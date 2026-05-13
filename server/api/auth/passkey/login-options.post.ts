/**
 * POST /api/auth/passkey/login-options
 * Returns PublicKeyCredentialRequestOptions for passkey authentication.
 * Accepts optional { email } body to scope to a specific user's credentials.
 */
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { findUserByEmail } from '~/server/utils/auth'
import { getCredentialsByUserId, storeChallenge } from '~/server/utils/passkey'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const email = (body?.email as string | undefined)?.trim().toLowerCase()

  let allowCredentials: { id: string; transports: AuthenticatorTransport[] }[] = []
  let userId: string | null = null

  if (email) {
    const user = findUserByEmail(email)
    if (user) {
      userId = user.id
      const creds = getCredentialsByUserId(user.id)
      allowCredentials = creds.map((c) => ({
        id: c.credential_id,
        transports: JSON.parse(c.transports) as AuthenticatorTransport[]
      }))
    }
  }

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const rpId = new URL(baseUrl).hostname

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    allowCredentials,
    userVerification: 'preferred'
  })

  const challengeId = storeChallenge(userId, options.challenge)
  setCookie(event, 'pk_challenge_id', challengeId, {
    maxAge: 300,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return options
})
