import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const filtered = filter === 'All' ? leads : leads.filter(l => l.type === filter)

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a2e' }}>📋 Leads ({filtered.length})</h2>

      {/* Фильтр */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['All', 'Buy', 'Sell'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 20px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', fontWeight: '600',
            background: filter === f ? '#1a1a2e' : 'white',
            color: filter === f ? 'white' : '#1a1a2e',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {f === 'All' ? '📋 All' : f === 'Buy' ? '🏠 Buy' : '💰 Sell'}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Area</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Budget</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Beds</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Baths</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No leads yet
                </td>
              </tr>
            ) : (
              filtered.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{formatDate(l.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: l.type === 'Buy' ? '#cce5ff' : '#d4edda',
                      color: l.type === 'Buy' ? '#004085' : '#155724'
                    }}>
                      {l.type === 'Buy' ? '🏠 Buy' : '💰 Sell'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{l.client_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{l.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>{l.area || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    {l.budget ? `$${l.budget.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>{l.beds || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>{l.baths || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Leads