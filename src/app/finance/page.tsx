'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { CreditCard, Plus, Edit2, Check, X, Building, TrendingUp, TrendingDown, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  accounts,
  fixedExpenses as initialFixed,
  recentTransactions,
  monthlySnapshots,
  FixedExpense,
} from '@/lib/finance-data'

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`
}

function AccountCard({ account }: { account: typeof accounts[0] }) {
  const positive = account.change >= 0
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-1">{account.institution}</p>
          <p className="text-sm font-medium text-white/80">{account.name}</p>
          {account.last4 !== '—' && <p className="text-[11px] text-white/25 mt-0.5">···· {account.last4}</p>}
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Building className="w-4 h-4 text-white/40" strokeWidth={1.75} />
        </div>
      </div>

      <p className={cn('text-metric-lg tabular leading-none mb-2', account.balance === 0 ? 'text-white/20' : 'text-white')}>
        {account.balance === 0 ? '—' : fmt(account.balance)}
      </p>

      <div className="flex items-center justify-between">
        <div className={cn('flex items-center gap-1 text-[11px] font-medium', account.change === 0 ? 'text-white/20' : positive ? 'text-w-green' : 'text-w-red')}>
          {account.change !== 0 && (positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {account.change === 0 ? 'No data yet' : `${positive ? '+' : ''}${fmt(Math.abs(account.change))} this month`}
        </div>
        <button className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors">
          <Link className="w-3 h-3" />
          {account.connected ? 'Connected' : 'Connect'}
        </button>
      </div>
    </div>
  )
}

interface EditableExpense extends FixedExpense {
  editing?: boolean
  tempAmount?: string
}

export default function FinancePage() {
  const [expenses, setExpenses] = useState<EditableExpense[]>(initialFixed)
  const [addingExpense, setAddingExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' })
  const [addingRevenue, setAddingRevenue] = useState(false)
  const [newRevenue, setNewRevenue] = useState({ description: '', amount: '' })
  const [transactions, setTransactions] = useState(recentTransactions)
  const [tab, setTab] = useState<'overview' | 'transactions'>('overview')

  const totalRevenueMTD = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0)
  const totalExpensesMTD = expenses.reduce((s, e) => s + (e.billingCycle === 'monthly' ? e.amount : e.amount / 12), 0)
    + transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netMTD = totalRevenueMTD - totalExpensesMTD

  const startEdit = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, editing: true, tempAmount: String(e.amount) } : e))
  }
  const saveEdit = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, amount: parseFloat(e.tempAmount || '0') || e.amount, editing: false } : e))
  }
  const cancelEdit = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, editing: false } : e))
  }

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return
    const entry: EditableExpense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: parseFloat(newExpense.amount) || 0,
      category: 'Other',
      billingCycle: 'monthly',
      nextDate: 'Next month',
      editable: true,
    }
    setExpenses(prev => [...prev, entry])
    setNewExpense({ name: '', amount: '' })
    setAddingExpense(false)
  }

  const addManualRevenue = () => {
    if (!newRevenue.description || !newRevenue.amount) return
    setTransactions(prev => [{
      id: Date.now().toString(),
      date: 'Today',
      description: newRevenue.description,
      amount: parseFloat(newRevenue.amount) || 0,
      type: 'revenue',
      category: 'Manual',
      account: 'wf-business',
      manual: true,
    }, ...prev])
    setNewRevenue({ description: '', amount: '' })
    setAddingRevenue(false)
  }

  const currentMonthData = monthlySnapshots.length > 0
    ? (() => {
        const d = [...monthlySnapshots]
        d[d.length - 1] = { ...d[d.length - 1], revenue: totalRevenueMTD }
        return d
      })()
    : []

  return (
    <div className="min-h-screen px-4 pt-5 pb-4 md:px-8 md:pt-8 max-w-[1100px] md:mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-w-blue" />
          <h1 className="text-xl font-bold text-white">Finance</h1>
        </div>
        <p className="text-sm text-white/30">Month-to-date</p>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {accounts.map(a => <AccountCard key={a.id} account={a} />)}
      </div>

      {/* MTD summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Revenue MTD', value: totalRevenueMTD, color: 'text-w-green' },
          { label: 'Expenses MTD', value: totalExpensesMTD, color: 'text-w-red' },
          { label: 'Net MTD', value: netMTD, color: netMTD >= 0 ? 'text-w-green' : 'text-w-red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2">{label}</p>
            <p className={cn('text-metric-md tabular leading-none', color)}>{fmt(Math.abs(value))}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6">
        {(['overview', 'transactions'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize',
              tab === t
                ? 'bg-white/[0.08] text-white'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses chart */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Revenue vs Expenses — 6 Months</p>
            {currentMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={currentMonthData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                    formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']}
                  />
                  <Bar dataKey="revenue" fill="#00c896" radius={[3, 3, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ff4757" radius={[3, 3, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-white/20">No data yet — connect bank or log manually</p>
              </div>
            )}
          </div>

          {/* Net trend */}
          <div className="rounded-xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Net Profit — 6 Months</p>
            {currentMonthData.length > 0 ? (<ResponsiveContainer width="100%" height={200}>
              <AreaChart data={currentMonthData.map(m => ({ ...m, net: m.revenue - m.expenses }))}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d91ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3d91ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Net']}
                />
                <Area type="monotone" dataKey="net" stroke="#3d91ff" strokeWidth={1.5} fill="url(#netGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-white/20">No data yet</p>
              </div>
            )}
          </div>

          {/* Fixed Expenses */}
          <div className="rounded-xl p-5 lg:col-span-2" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Fixed Expenses</p>
              <button
                onClick={() => setAddingExpense(!addingExpense)}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-0">
              {expenses.map(expense => (
                <div key={expense.id} className="metric-row">
                  <div className="flex-1">
                    <p className="text-sm text-white/80">{expense.name}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">{expense.category} · {expense.nextDate}</p>
                  </div>
                  {expense.editing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm">$</span>
                      <input
                        type="number"
                        value={expense.tempAmount}
                        onChange={e => setExpenses(prev => prev.map(x => x.id === expense.id ? { ...x, tempAmount: e.target.value } : x))}
                        className="w-20 bg-white/[0.06] border rounded px-2 py-1 text-sm text-white text-right focus:outline-none"
                        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && saveEdit(expense.id)}
                      />
                      <button onClick={() => saveEdit(expense.id)} className="text-w-green hover:opacity-70"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => cancelEdit(expense.id)} className="text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white/70 tabular-nums">${expense.amount.toLocaleString()}<span className="text-white/25 text-[10px]">/mo</span></span>
                      {expense.editable && (
                        <button onClick={() => startEdit(expense.id)} className="text-white/20 hover:text-white/50 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {addingExpense && (
              <div className="mt-3 flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                  type="text"
                  placeholder="Expense name"
                  value={newExpense.name}
                  onChange={e => setNewExpense(p => ({ ...p, name: e.target.value }))}
                  className="flex-1 bg-white/[0.06] border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                />
                <span className="text-white/30 text-sm">$</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                  className="w-24 bg-white/[0.06] border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                />
                <button onClick={addExpense} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: 'rgba(61,145,255,0.2)', border: '1px solid rgba(61,145,255,0.3)' }}>
                  Add
                </button>
                <button onClick={() => setAddingExpense(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px] text-white/30">Total fixed / month</span>
              <span className="text-sm font-semibold text-white/60 tabular-nums">
                ${expenses.reduce((s, e) => s + (e.billingCycle === 'monthly' ? e.amount : Math.round(e.amount / 12)), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">Recent Transactions</p>
            <button
              onClick={() => setAddingRevenue(!addingRevenue)}
              className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Revenue
            </button>
          </div>

          {addingRevenue && (
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <input
                type="text"
                placeholder="Description"
                value={newRevenue.description}
                onChange={e => setNewRevenue(p => ({ ...p, description: e.target.value }))}
                className="flex-1 bg-white/[0.06] border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <span className="text-white/30 text-sm">$</span>
              <input
                type="number"
                placeholder="Amount"
                value={newRevenue.amount}
                onChange={e => setNewRevenue(p => ({ ...p, amount: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addManualRevenue()}
                className="w-24 bg-white/[0.06] border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <button onClick={addManualRevenue} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'rgba(0,200,150,0.2)', border: '1px solid rgba(0,200,150,0.3)' }}>
                Add
              </button>
              <button onClick={() => setAddingRevenue(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div>
            {transactions.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.type === 'revenue' ? 'bg-w-green' : 'bg-w-red')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/75 truncate">{t.description}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{t.date} · {t.category}{t.manual ? ' · manual' : ''}</p>
                </div>
                <span className={cn('text-sm font-medium tabular-nums', t.type === 'revenue' ? 'text-w-green' : 'text-w-red')}>
                  {t.type === 'revenue' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
