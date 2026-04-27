import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)

  return {
    authenticated: Boolean(user),
    user
  }
})
