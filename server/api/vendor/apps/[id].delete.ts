/**
 * DELETE /api/vendor/apps/:id
 * Delete a vendor's own app listing. Only the owning vendor may delete.
 */
import { createError, defineEventHandler, getRouterParams } from 'h3'
import { deleteVendorApp } from '~/server/utils/apps'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)

  if (!vendor) {
    throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })
  }

  const { id } = getRouterParams(event)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id' })
  }

  const deleted = deleteVendorApp(id, vendor.id)

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'App not found or access denied' })
  }

  return { success: true }
})
