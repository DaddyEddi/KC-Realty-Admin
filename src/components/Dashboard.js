import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
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
    setLoading(false)
  }

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
        gap: '20px'
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.color }}>
              {card.value}
            </div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard