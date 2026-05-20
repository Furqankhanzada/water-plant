// import { isAdminFieldLevel } from '@/collections/access/isAdmin'

export const tenantField = {
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants',
  required: true,

  defaultValue: ({ req }) => {
    // If a user is logged in, return their ID
    if (req.user) {
      console.log("----------------------", req.user.tenant)
      return req.user.tenant
    }
    return null
  },
  // access: {
    // read: () => true,
    // create: () => true,
    // update: isAdminFieldLevel,
  // },
  admin: {
  //   readOnly: ({ req: { user } }) => {
  //     return Boolean(user?.roles.includes('admin'))
  //   }
  //   // position: 'sidebar',
  },
}