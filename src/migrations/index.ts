import * as migration_20250725_204953_customers_deliveryFrequencyDays from './20250725_204953_customers_deliveryFrequencyDays';

export const migrations = [
  {
    up: migration_20250725_204953_customers_deliveryFrequencyDays.up,
    down: migration_20250725_204953_customers_deliveryFrequencyDays.down,
    name: '20250725_204953_customers_deliveryFrequencyDays'
  },
];
