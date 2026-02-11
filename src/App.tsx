import { useEffect, useState } from 'react'
import './App.css'

type Proposal = {
  id: string
  query: string
  proposal: string
  status: string
  url?: string
}

function App() {
  const [token, setToken] = useState('')
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [error, setError] = useState('')

  const apiBase = 'http://localhost:3000'

  const fetchProposals = async () => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed')
      setProposals(data.proposals || [])
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approve = async (id: string) => {
    await fetch(`${apiBase}/proposals/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchProposals()
  }

  useEffect(() => {
    if (token) fetchProposals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Upwork Proposals</div>
          <div className="subtitle">Drafts, approvals, and auto‑submit status</div>
        </div>
        <button className="button secondary" onClick={fetchProposals}>Refresh</button>
      </div>

      <div className="card">
        <div className="row">
          <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste JWT" />
          <button className="button" onClick={fetchProposals}>Load</button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="list">
        {proposals.map((p) => (
          <div key={p.id} className="card proposal">
            <div className="meta">
              <strong>{p.query}</strong>
              <span className={`badge ${p.status}`}>{p.status}</span>
            </div>
            {p.url && (
              <a className="link" href={p.url} target="_blank" rel="noreferrer">
                Open job
              </a>
            )}
            <p>{p.proposal}</p>
            {p.status !== 'approved' && (
              <button className="button success" onClick={() => approve(p.id)}>
                Approve & Auto‑Submit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
