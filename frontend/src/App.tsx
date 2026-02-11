import { useEffect, useState } from 'react'
import './App.css'

type Proposal = {
  id: string
  query: string
  proposal: string
  status: string
  url?: string
  answers?: Record<string, any>
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

  const saveAnswers = async (id: string, answers: string) => {
    await fetch(`${apiBase}/proposals/${id}/answers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: safeJson(answers) || { raw: answers } }),
    })
    fetchProposals()
  }

  const submit = async (id: string) => {
    await fetch(`${apiBase}/proposals/${id}/submit`, {
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
          <div className="subtitle">Drafts, approvals, answers, and auto‑submit status</div>
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
            <textarea
              className="input"
              rows={3}
              placeholder='Screening answers (JSON or text)'
              defaultValue={p.answers ? JSON.stringify(p.answers) : ''}
              onBlur={(e) => saveAnswers(p.id, e.target.value)}
            />
            <div className="row">
              {p.status !== 'approved' && (
                <button className="button success" onClick={() => approve(p.id)}>
                  Approve
                </button>
              )}
              <button className="button" onClick={() => submit(p.id)}>Auto‑Submit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default App
