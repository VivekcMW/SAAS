import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = getSessionUser(event)

  return {
    authenticated: Boolean(user),
    user
  }
})
