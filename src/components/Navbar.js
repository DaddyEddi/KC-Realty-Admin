import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Navbar({ session }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav style={{
      background: '#1a1a2e', color: 'white',
      padding: '12px 24px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        🏠 KC Realty Admin
      </div>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>📊 Dashboard</Link>
        <Link to="/realtors" style={{ color: 'white', textDecoration: 'none' }}>👥 Realtors</Link>
        <Link to="/leads" style={{ color: 'white', textDecoration: 'none' }}>📋 Leads</Link>
        <span style={{ color: '#aaa', fontSize: '13px' }}>{session.user.email}</span>
        <button onClick={handleLogout} style={{
          background: '#e74c3c', color: 'white',
          border: 'none', padding: '8px 16px',
          borderRadius: '6px', cursor: 'pointer'
        }}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar