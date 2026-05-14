import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Leads() {
  const [leads, setLeads] = useState([])
  const [realtors, setRealtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')
  const [realtorFilter, setRealtorFilter] = useState('All')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'

  const fetchData = async () => {
    try {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: realtorsData } = await supabase
        .from('realtors')
        .select('id, name')

      setLeads(leadsData || [])
      setRealtors(realtorsData || [])
      setLoading(false)
    } catch (error) {
      console.error('fetchData error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
  fetchData()
  const interval = setInterval(fetchData, 60000)
  return () => clearInterval(interval)
  }, [])

  const filtered = leads
    .filter(l => typeFilter === 'All' || l.type === typeFilter)
    .filter(l => realtorFilter === 'All' || String(l.realtor_id) === String(realtorFilter))

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getRealtorName = (id) => {
    const realtor = realtors.find(r => String(r.id) === String(id))
    return realtor ? realtor.name : id
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a2e' }}>📋 Leads ({filtered.length})</h2>

      {/* Фильтры и переключатель */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Фильтр по типу */}
          {['All', 'Buy', 'Sell'].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{
              padding: '8px 20px', borderRadius: '20px', border: 'none',
              cursor: 'pointer', fontWeight: '600',
              background: typeFilter === f ? '#1a1a2e' : 'white',
              color: typeFilter === f ? 'white' : '#1a1a2e',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {f === 'All' ? '📋 All' : f === 'Buy' ? '🏠 Buy' : '💰 Sell'}
            </button>
          ))}

          {/* Фильтр по риелтору */}
          <select
            value={realtorFilter}
            onChange={e => setRealtorFilter(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              border: '1px solid #ddd', background: 'white',
              fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <option value="All">👥 All Realtors</option>
            {realtors.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Переключатель вида */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '20px', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setViewMode('table')} style={{
            padding: '6px 16px', borderRadius: '16px', border: 'none',
            cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            background: viewMode === 'table' ? '#1a1a2e' : 'transparent',
            color: viewMode === 'table' ? 'white' : '#666'
          }}>☰ Table</button>
          <button onClick={() => setViewMode('cards')} style={{
            padding: '6px 16px', borderRadius: '16px', border: 'none',
            cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            background: viewMode === 'cards' ? '#1a1a2e' : 'transparent',
            color: viewMode === 'cards' ? 'white' : '#666'
          }}>⊞ Cards</button>
        </div>
      </div>

      {/* Таблица */}
      {viewMode === 'table' && (
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
                <th style={{ padding: '14px 16px', textAlign: 'left' }}>Realtor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    No leads found
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
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{getRealtorName(l.realtor_id)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Карточки */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No leads found</div>
          ) : (
            filtered.map(l => (
              <div key={l.id} style={{
                background: 'white', borderRadius: '12px',
                padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${l.type === 'Buy' ? '#3498db' : '#2ecc71'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    background: l.type === 'Buy' ? '#cce5ff' : '#d4edda',
                    color: l.type === 'Buy' ? '#004085' : '#155724'
                  }}>
                    {l.type === 'Buy' ? '🏠 BUY' : '💰 SELL'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>{formatDate(l.created_at)}</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>👤 {l.client_name}</div>
                  <div style={{ color: '#555', fontSize: '14px' }}>📞 {l.phone}</div>
                </div>

                {l.address && (
                  <div style={{ color: '#555', fontSize: '13px', marginBottom: '4px' }}>
                    📍 {l.address}
                  </div>
                )}
                {l.area && (
                  <div style={{ color: '#555', fontSize: '13px', marginBottom: '8px' }}>
                    🗺️ {l.area}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                  {l.budget && <span>💰 ${l.budget.toLocaleString()}</span>}
                  {l.beds && <span>🛏 {l.beds} beds</span>}
                  {l.baths && <span>🚿 {l.baths} baths</span>}
                  {l.sqft && <span>📏 {l.sqft} sqft</span>}
                </div>

                <div style={{ fontSize: '12px', color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
                  👔 {getRealtorName(l.realtor_id)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Leads
