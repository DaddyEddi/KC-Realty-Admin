import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const [stats, setStats] = useState({
    totalRealtors: 0,
    activeRealtors: 0,
    trialRealtors: 0,
    totalLeads: 0,
    buyLeads: 0,
    sellLeads: 0,
    todayLeads: 0
  })
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const now = new Date().toISOString()
      const today = new Date().toISOString().split('T')[0]

      const { data: realtors } = await supabase.from('realtors').select('*')
      const { data: leads } = await supabase.from('leads').select('*')

      const activeRealtors = realtors?.filter(r => r.active_until && r.active_until > now) || []
      const trialRealtors = activeRealtors.filter(r => r.is_trial)
      const todayLeads = leads?.filter(l => l.created_at?.startsWith(today)) || []

      setStats({
        totalRealtors: realtors?.length || 0,
        activeRealtors: activeRealtors.length,
        trialRealtors: trialRealtors.length,
        totalLeads: leads?.length || 0,
        buyLeads: leads?.filter(l => l.type === 'Buy').length || 0,
        sellLeads: leads?.filter(l => l.type === 'Sell').length || 0,
        todayLeads: todayLeads.length
      })

      const last14 = []
      for (let i = 13; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        const dayLeads = leads?.filter(l => l.created_at?.startsWith(dateStr)) || []
        last14.push({
          date: label,
          Total: dayLeads.length,
          Buy: dayLeads.filter(l => l.type === 'Buy').length,
          Sell: dayLeads.filter(l => l.type === 'Sell').length
        })
      }
      setChartData(last14)
      setLoading(false)
    } catch (error) {
      console.error('fetchStats error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const cards = [
    { title: 'Active Realtors', value: stats.activeRealtors, color: '#2ecc71' },
    { title: 'Trial Realtors', value: stats.trialRealtors, color: '#f39c12' },
    { title: 'Total Leads', value: stats.totalLeads, color: '#3498db' },
    { title: 'Buy Leads', value: stats.buyLeads, color: '#9b59b6' },
    { title: 'Sell Leads', value: stats.sellLeads, color: '#e74c3c' },
    { title: 'Today Leads', value: stats.todayLeads, color: '#1abc9c' },
  ]

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a2e' }}>📊 Dashboard</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px', marginBottom: '32px'
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.color }}>
              {card.value}
            </div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>📈 Leads — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Total" stroke="#3498db" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Buy" stroke="#9b59b6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Sell" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard
