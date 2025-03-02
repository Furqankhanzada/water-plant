import { CronJob } from 'cron'

import { generateAndSendInvoices } from '@/scripts/generateAndSendInvoices'

export default class CronService {
  constructor() {
    this.scheduleInvoices()
  }
  scheduleInvoices() {
    // At 11:00 on every day-of-month from 2 through 5 in every month.
    CronJob.from({
      cronTime: '0 11 2-5 */1 *',
      onTick: function () {
        generateAndSendInvoices()
      },
      start: true,
    })
  }
  scheduleDueDateReminders() {}
  duePaymentReminders() {}
}
