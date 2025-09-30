import { APIError, CollectionBeforeDeleteHook } from 'payload'

export const checkEmployeeDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Check for related trips
  const trips = await req.payload.find({
    collection: 'trips',
    where: {
      employee: { in: [id] }
    },
    limit: 1,
    depth: 0,
    select: {
      employee: true,
    },
  });
  
  if (trips.docs.length) {
    throw new APIError('Cannot delete employee: Employee is assigned to trips. Please reassign or complete trips first.', 400);
  }
}

