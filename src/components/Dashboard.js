import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const navigate = useNavigate()
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
  const [topRealtors, setTopRealtors] = useState([])
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

      // График — последние 14 дней
      const last14 = []
      for (let i = 13; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        const dayLeads = leads?.filter(l => l.created_at?.startsWith(dateStr)) || []
        last14.push({
          date: label,
          Buy: dayLeads.filter(l => l.type === 'Buy').length,
          Sell: dayLeads.filter(l => l.type === 'Sell').length
        })
      }
      setChartData(last14)

      // Top Realtors
      const realtorLeadsCount = {}
      leads?.forEach(l => {
        const rid = String(l.realtor_id)
        realtorLeadsCount[rid] = (realtorLeadsCount[rid] || 0) + 1
      })

      const top = realtors?.map(r => ({
        id: r.id,
        name: r.name,
        leads: realtorLeadsCount[String(r.id)] || 0,
        active: r.active_until && r.active_until > now
      }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5)

      setTopRealtors(top || [])
      setLoading(false)
    } catch (error) {
      console.error('fetchStats error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cards = [
    { title: 'Active Realtors', value: stats.activeRealtors, color: '#2ecc71' },
    { title: 'Trial Realtors', value: stats.trialRealtors, color: '#f39c12' },
    { title: 'Total Leads', value: stats.totalLeads, color: '#3498db' },
    { title: 'Buy Leads', value: stats.buyLeads, color: '#27ae60' },
    { title: 'Sell Leads', value: stats.sellLeads, color: '#e74c3c' },
    { title: 'Today Leads', value: stats.todayLeads, color: '#1abc9c' },
  ]

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a2e' }}>📊 Dashboard</h2>

      {/* Карточки */}
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

      {/* График и Top Realtors */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>

        {/* График */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>📈 Leads — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Buy" fill="#27ae60" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sell" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Realtors */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>🏆 Top Realtors</h3>
          {topRealtors.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No data yet</div>
          ) : (
            topRealtors.map((r, i) => (
              <div
                key={r.id}
                onClick={() => navigate(`/realtors/${r.id}`)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: i < topRealtors.length - 1 ? '1px solid #f0f0f0' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? '#f39c12' : i === 1 ? '#95a5a6' : '#cd7f32',
                    color: 'white', fontWeight: 'bold', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: r.active ? '#27ae60' : '#e74c3c' }}>
                      {r.active ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontWeight: 'bold', fontSize: '18px', color: '#3498db'
                }}>
                  {r.leads}
                  <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal', marginLeft: '4px' }}>leads</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
