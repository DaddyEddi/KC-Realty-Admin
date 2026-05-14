import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function RealtorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [realtor, setRealtor] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const { data: realtorData } = await supabase
        .from('realtors')
        .select('*')
        .eq('id', id)
        .single()

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('realtor_id', id)
        .order('created_at', { ascending: false })

      setRealtor(realtorData)
      setLeads(leadsData || [])
      setLoading(false)
    } catch (error) {
      console.error('fetchData error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const isActive = (r) => r?.active_until && new Date(r.active_until) > new Date()

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!realtor) return <div style={{ padding: '40px', textAlign: 'center' }}>Realtor not found</div>

  const buyLeads = leads.filter(l => l.type === 'Buy')
  const sellLeads = leads.filter(l => l.type === 'Sell')

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>

      {/* Кнопка назад */}
      <button onClick={() => navigate('/realtors')} style={{
        marginBottom: '24px', padding: '8px 16px',
        background: 'white', border: '1px solid #ddd',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
      }}>
        ← Back to Realtors
      </button>

      {/* Профиль риелтора */}
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>👤 {realtor.name}</h2>
            <p style={{ color: '#666', margin: '0 0 4px' }}>🆔 ID: {realtor.id}</p>
            <p style={{ color: '#666', margin: '0 0 4px' }}>📍 Areas: {(realtor.areas || []).join(', ')}</p>
            <p style={{ color: '#666', margin: '0' }}>📅 Registered: {formatDate(realtor.created_at)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
              background: isActive(realtor) ? '#d4edda' : '#f8d7da',
              color: isActive(realtor) ? '#155724' : '#721c24',
              display: 'block', marginBottom: '8px'
            }}>
              {isActive(realtor) ? '✅ Active' : '❌ Inactive'}
            </span>
            <span style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              background: realtor.is_trial ? '#fff3cd' : '#cce5ff',
              color: realtor.is_trial ? '#856404' : '#004085',
              display: 'block', marginBottom: '8px'
            }}>
              {realtor.is_trial ? '🎁 Trial' : '💎 Paid'}
            </span>
            <p style={{ color: '#666', fontSize: '13px', margin: '0' }}>
              Until: {formatDate(realtor.active_until)}
            </p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px', marginBottom: '24px'
      }}>
        {[
          { title: 'Total Leads', value: leads.length, color: '#3498db' },
          { title: 'Buy Leads', value: buyLeads.length, color: '#27ae60' },
          { title: 'Sell Leads', value: sellLeads.length, color: '#e74c3c' },
        ].map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px',
            padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${card.color}`, textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
            <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>{card.title}</div>
          </div>
        ))}
      </div>

      {/* Лиды */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, color: '#1a1a2e' }}>📋 Leads ({leads.length})</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Client</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Area</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666' }}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No leads yet
                </td>
              </tr>
            ) : (
              leads.map((l, i) => (
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RealtorDetail