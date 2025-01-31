import { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user?.roles.includes('admin'))
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user?.roles.includes('admin'))
}
