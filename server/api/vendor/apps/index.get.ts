import { getVendorApps } from '~/server/utils/apps'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)

  if (!vendor) {
    return {
      success: true,
      apps: []
    }
  }

  return {
    success: true,
    apps: getVendorApps(vendor.id)
  }
})
