import * as migration_20250725_204953_customers_deliveryFrequencyDays from './20250725_204953_customers_deliveryFrequencyDays';
import * as migration_20250728_143449_invoices_isLatest from './20250728_143449_invoices_isLatest';
import * as migration_20250127_000000_populate_invoice_area_block from './20250127_000000_populate_invoice_area_block';
import * as migration_20250128_120000_migrate_invoice_transactions_structure from './20250128_120000_migrate_invoice_transactions_structure';
import * as migration_20250128_150000_invoices_add_totals_group from './20250128_150000_invoices_add_totals_group';

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
  {
    up: migration_20250128_120000_migrate_invoice_transactions_structure.up,
    down: migration_20250128_120000_migrate_invoice_transactions_structure.down,
    name: '20250128_120000_migrate_invoice_transactions_structure'
  },
  {
    up: migration_20250128_150000_invoices_add_totals_group.up,
    down: migration_20250128_150000_invoices_add_totals_group.down,
    name: '20250128_150000_invoices_add_totals_group'
  },
];
