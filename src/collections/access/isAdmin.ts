import { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  if (user?.collection === 'employee') {
    return false
  }
  return Boolean(user?.roles?.includes('admin'))
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
   if (user?.collection === 'employee') {
    return false
  }
  return Boolean(user?.roles?.includes('admin'))
}
