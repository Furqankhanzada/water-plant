import { BeforeListTableServerProps } from 'payload'

const rupee = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
})

export const Info = async (props: BeforeListTableServerProps) => {
  const db = props.payload.db

  const [employeesAgg, expensesAgg] = await Promise.all([
    db.collections['employee'].aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: { $ifNull: ['$salary', 0] } },
        },
      },
    ]),
    (() => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return db.collections['expenses'].aggregate([
        {
          $match: {
            type: { $eq: 'salary' },
            expenseAt: { $gte: monthStart, $lt: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            paidThisMonth: { $sum: { $ifNull: ['$amount', 0] } },
            count: { $sum: 1 },
          },
        },
      ])
    })(),
  ])

  const employees = employeesAgg[0] || { totalEmployees: 0, totalSalary: 0 }
  const expenses = expensesAgg[0] || { paidThisMonth: 0 }
  const total = Math.max(0, Number(employees.totalSalary) || 0)
  const paid = Math.max(0, Math.min(Number(expenses.paidThisMonth) || 0, total))
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0

  return (
    <div
      style={{
        display: 'inline-block',
        fontSize: '20px',
        margin: '0 0 8px 0',
      }}
    >
      <div>
        <i>Employees:</i> <b>{employees.totalEmployees}</b> | <i>Total Salary:</i>{' '}
        <b>{rupee.format(employees.totalSalary)}</b> | <i>Paid this month:</i>{' '}
        <b>{rupee.format(expenses.paidThisMonth)}</b>
      </div>
      <div
        aria-label="Salary paid progress"
        style={{
          marginTop: '6px',
          width: '100%',
          height: '10px',
          background: '#eee',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: pct >= 100 ? 'var(--theme-text)' : 'var(--theme-text)',
            transition: 'width 200ms ease-out',
          }}
          title={`${pct}%`}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{pct}% paid</div>
    </div>
  )
}


