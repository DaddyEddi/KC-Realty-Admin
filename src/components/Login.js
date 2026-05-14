import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh',
      background: '#f0f2f5'
    }}>
      <div style={{
        background: 'white', padding: '40px',
        borderRadius: '12px', width: '360px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' }}>
          🏠 KC Realty Admin
        </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '12px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box'
              }}
              required
            />
          </div>
          {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: '#2ecc71', color: 'white',
              border: 'none', borderRadius: '8px',
              fontSize: '16px', cursor: 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login