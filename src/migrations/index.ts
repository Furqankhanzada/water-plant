import * as migration_20250725_204953_customers_deliveryFrequencyDays from './20250725_204953_customers_deliveryFrequencyDays';
import * as migration_20250728_143449_invoices_isLatest from './20250728_143449_invoices_isLatest';
import * as migration_20250127_000000_populate_invoice_area_block from './20250127_000000_populate_invoice_area_block';

export const migrations = [
  {
    up: migration_20250725_204953_customers_deliveryFrequencyDays.up,
    down: migration_20250725_204953_customers_deliveryFrequencyDays.down,
    name: '20250725_204953_customers_deliveryFrequencyDays',
  },
  {
    up: migration_20250728_143449_invoices_isLatest.up,
    down: migration_20250728_143449_invoices_isLatest.down,
    name: '20250728_143449_invoices_isLatest'
  },
  {
    up: migration_20250127_000000_populate_invoice_area_block.up,
    down: migration_20250127_000000_populate_invoice_area_block.down,
    name: '20250127_000000_populate_invoice_area_block'
  },
];
