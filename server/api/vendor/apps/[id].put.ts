/**
 * PUT /api/vendor/apps/:id
 * Update a vendor's own app listing. Only the owning vendor may edit.
 */
import { createError, defineEventHandler, getRouterParams, readBody } from 'h3'
import { updateVendorApp } from '~/server/utils/apps'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)

  if (!vendor) {
    throw createError({ statusCode: 400, statusMessage: 'Vendor profile not found' })
  }

  const { id } = getRouterParams(event)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing app id' })
  }

  const body = await readBody(event)

  const updated = updateVendorApp(id, vendor.id, {
    name: typeof body.name === 'string' ? body.name : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    longDescription: typeof body.longDescription === 'string' ? body.longDescription : undefined,
    category: typeof body.category === 'string' ? body.category : undefined,
    pricingType: ['free', 'trial', 'paid', 'contact'].includes(body.pricingType) ? body.pricingType : undefined,
    pricingValue: body.pricingValue !== undefined ? (body.pricingValue === null ? null : Number(body.pricingValue)) : undefined,
    pricingPeriod: typeof body.pricingPeriod === 'string' ? body.pricingPeriod : body.pricingPeriod === null ? null : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
    logo: typeof body.logo === 'string' ? body.logo : undefined,
    provider: typeof body.provider === 'string' ? body.provider : undefined
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'App not found or access denied' })
  }

  return { success: true, app: updated }
})
