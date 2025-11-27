'use client'

import type {UserStatsData} from '@/lib/x-api/types'

import {useState} from 'react'

export default function StatsGenerator() {
  const [username, setUsername] = useState('')
  const [communitySlug, setCommunitySlug] = useState('sui-tr-community')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<UserStatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!username.trim() || !communitySlug.trim()) return

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/x', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: username.trim(),
          communitySlug: communitySlug.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data: UserStatsData = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">X Stats Generator</h1>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Username</label>
          <input type="text" placeholder="yuppibaladam" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 bg-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Community Slug</label>
          <input type="text" placeholder="sui-tr-community" value={communitySlug} onChange={(e) => setCommunitySlug(e.target.value)} className="w-full p-2 bg-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none" />
        </div>

        <button onClick={handleGenerate} disabled={!username.trim() || !communitySlug.trim() || isGenerating} className="w-full p-2 bg-primary text-primary-foreground rounded disabled:opacity-50 hover:bg-primary/90 transition-colors">
          {isGenerating ? 'Generating...' : 'Generate Stats'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded">
          <h3 className="font-bold text-destructive">Error:</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Results</h2>

          {/* User Info */}
          <div className="p-4 rounded bg-card border">
            <h3 className="mb-2 font-bold text-muted-foreground">User Info</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>ID: {result.user.id}</div>
              <div>Username: @{result.user.username}</div>
              <div>Name: {result.user.name}</div>
              <div>Followers: {result.user.followersCount}</div>
              <div>Requests: {result.user.requestCount}</div>
              <div>Last Activity: {new Date(result.user.lastActivity).toLocaleString()}</div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            {result.user.avatar && <img src={result.user.avatar} alt="Avatar" className="size-24 mt-2 rounded-full border" />}
          </div>

          {/* Raw Stats */}
          <div className="p-4 rounded bg-muted border">
            <h3 className="mb-2 font-bold text-muted-foreground">Raw Metrics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(result.stats.raw).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>

          {/* Calculated Stats */}
          <div className="p-4 rounded bg-accent border">
            <h3 className="mb-2 font-bold text-muted-foreground">Calculated Metrics</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(result.stats.calculated).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
