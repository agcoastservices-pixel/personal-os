export interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'spending'
  balance: number
  change: number   // MoM delta
  connected: boolean
  last4: string
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  category: string
  billingCycle: 'monthly' | 'annual'
  nextDate: string
  editable: boolean
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'revenue' | 'expense'
  category: string
  account: string
  manual?: boolean
}

export interface MonthlySnapshot {
  month: string
  revenue: number
  expenses: number
}

// Accounts — balances start at 0 until connected via Plaid or manually entered
export const accounts: Account[] = [
  {
    id: 'wf-business',
    name: 'Wells Fargo Business',
    institution: 'Wells Fargo',
    type: 'checking',
    balance: 0,
    change: 0,
    connected: false,
    last4: '—',
  },
  {
    id: 'cashapp-spending',
    name: 'Cash App Spending',
    institution: 'Cash App',
    type: 'spending',
    balance: 0,
    change: 0,
    connected: false,
    last4: '—',
  },
  {
    id: 'cashapp-savings',
    name: 'Cash App Savings',
    institution: 'Cash App',
    type: 'savings',
    balance: 0,
    change: 0,
    connected: false,
    last4: '—',
  },
]

// Fixed expenses — pre-populated as a template the user edits to match their actuals
export const fixedExpenses: FixedExpense[] = [
  { id: 'rent',      name: 'Rent',                 amount: 0, category: 'Housing',   billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'phone',     name: 'Phone',                amount: 0, category: 'Utilities', billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'gym',       name: 'Gym Membership',        amount: 0, category: 'Health',   billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'sw',        name: 'CRM / Software',        amount: 0, category: 'Software', billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'insurance', name: 'Business Insurance',    amount: 0, category: 'Insurance',billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'gas',       name: 'Fuel',                  amount: 0, category: 'Vehicle',  billingCycle: 'monthly', nextDate: '—', editable: true },
  { id: 'ads',       name: 'Ads (Meta / Google)',   amount: 0, category: 'Marketing',billingCycle: 'monthly', nextDate: '—', editable: true },
]

// No transactions until synced or manually entered
export const recentTransactions: Transaction[] = []

// No monthly history until data exists
export const monthlySnapshots: MonthlySnapshot[] = []
