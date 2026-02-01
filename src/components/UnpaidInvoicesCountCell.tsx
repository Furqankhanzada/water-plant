import { DefaultServerCellComponentProps } from 'payload'

const UnpaidInvoicesCountCell = async ({ rowData, payload }: DefaultServerCellComponentProps) => {
  // Get customer ID from the invoice
  const customerId = typeof rowData.customer === 'string' ? rowData.customer : rowData.customer?.id;
  
  if (!customerId) {
    return <div>-</div>;
  }
  
  // Fetch all invoices for this customer, sorted by dueAt descending (most recent first)
  const invoices = await payload.find({
    collection: 'invoice',
    where: {
      customer: {
        equals: customerId,
      },
    },
    sort: '-dueAt',
    limit: 10,
    select: {
      status: true,
    }
  });

  // Count consecutive unpaid invoices from the most recent
  let count = 0;
  for (const invoice of invoices.docs) {
    // Skip if status is null or undefined
    if (!invoice.status) {
      continue;
    }
    // If we encounter a paid or partially-paid invoice, stop counting
    if (invoice.status === 'paid' || invoice.status === 'partially-paid') {
      break;
    }
    // Only count unpaid invoices
    if (invoice.status === 'unpaid') {
      count++;
    }
  }

  return (
    <div>
      {count > 0 ? (
        <span style={{ color: '#ef4444' }}>
          {count}
        </span>
      ) : (
        <span>-</span>
      )}
    </div>
  )
};

export default UnpaidInvoicesCountCell;
