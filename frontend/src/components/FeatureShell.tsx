import { useEffect, useState } from 'react'
import { getJson } from '../services/api'

type ApiHealthResponse = {
  module: string
  status: string
  message: string
  nextSteps?: string[]
}

type FeatureShellProps = {
  title: string
  ownerHint: string
  endpoint: string
  children: React.ReactNode
}

export function FeatureShell({ title, ownerHint, endpoint, children }: FeatureShellProps) {
  const [data, setData] = useState<ApiHealthResponse | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    getJson<ApiHealthResponse>(`${endpoint}/health`)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError('')
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [endpoint])

  return (
    <section className="feature-shell">
      <header className="feature-header">
        <div>
          <p className="eyebrow">Feature module</p>
          <h2>{title}</h2>
          <p className="owner-hint">Suggested ownership: {ownerHint}</p>
        </div>
        <div className="status-card">
          <strong>Backend placeholder</strong>
          {data ? <span>{data.status}</span> : <span>{error || 'Loading...'}</span>}
        </div>
      </header>

      <div className="feature-grid">
        <article className="panel panel-main">{children}</article>
        <aside className="panel panel-side">
          <h3>Module API</h3>
          <p>{endpoint}</p>
          <h4>Current placeholder</h4>
          <p>{data?.message ?? error ?? 'Waiting for backend response'}</p>
          {data?.nextSteps?.length ? (
            <ul>
              {data.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
