/**
 * POST /api/auth/passkey/register-options
 * Returns PublicKeyCredentialCreationOptions for passkey registration.
 * The user must be authenticated.
 */
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { requireUser } from '~/server/utils/auth'
import { getCredentialsByUserId, storeChallenge } from '~/server/utils/passkey'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const existingCredentials = getCredentialsByUserId(user.id)

  const config = useRuntimeConfig(event)
  const baseUrl = (config.public?.siteUrl as string | undefined) || process.env.SITE_URL || 'http://localhost:3000'
  const rpId = new URL(baseUrl).hostname

  const options = await generateRegistrationOptions({
    rpName: 'Moonmart',
    rpID: rpId,
    userName: user.email,
    userDisplayName: user.full_name || user.email,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map((c) => ({
      id: c.credential_id,
      transports: JSON.parse(c.transports) as AuthenticatorTransport[]
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  })

  // Persist the challenge so we can verify it in register-verify
  const challengeId = storeChallenge(user.id, options.challenge)
  setCookie(event, 'pk_challenge_id', challengeId, {
    maxAge: 300,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return options
})
