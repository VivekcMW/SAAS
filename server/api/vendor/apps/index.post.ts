import { createVendorApp } from '~/server/utils/apps'
import { getVendorProfileForUser, requireVendor } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireVendor(event)
  const vendor = getVendorProfileForUser(user.id)
  const body = await readBody(event)

  if (!vendor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vendor profile not found for current user'
    })
  }

  if (!body?.name || !body?.description || !body?.category) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, description, and category are required'
    })
  }

  const app = createVendorApp(vendor.id, {
    name: body.name,
    description: body.description,
    category: body.category,
    pricingType: body.pricingType,
    pricingValue: body.pricingValue,
    pricingPeriod: body.pricingPeriod,
    tags: Array.isArray(body.tags) ? body.tags : [],
    logo: body.logo,
    provider: body.provider || vendor.company_name
  })

  return {
    success: true,
    app
  }
})
