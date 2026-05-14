import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Realtors() {
  const [realtors, setRealtors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealtors()
  }, [])

  const fetchRealtors = async () => {
    const { data } = await supabase.from('realtors').select('*').order('created_at', { ascending: false })
    setRealtors(data || [])
    setLoading(false)
  }

  const isActive = (realtor) => {
    if (!realtor.active_until) return false
    return new Date(realtor.active_until) > new Date()
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '32px', background: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1a1a2e' }}>👥 Realtors ({realtors.length})</h2>
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: 'white' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Areas</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Active Until</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {realtors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  No realtors yet
                </td>
              </tr>
            ) : (
              realtors.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500' }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', color: '#666', fontSize: '13px' }}>{r.id}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px' }}>{(r.areas || []).join(', ')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: isActive(r) ? '#d4edda' : '#f8d7da',
                      color: isActive(r) ? '#155724' : '#721c24'
                    }}>
                      {isActive(r) ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px' }}>{formatDate(r.active_until)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                      background: r.is_trial ? '#fff3cd' : '#cce5ff',
                      color: r.is_trial ? '#856404' : '#004085'
                    }}>
                      {r.is_trial ? '🎁 Trial' : '💎 Paid'}
                    </span>
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

export default Realtors