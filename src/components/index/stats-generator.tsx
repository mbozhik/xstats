'use client'

import type {UserStatsData, GenerateStatsResponse} from '@/lib/x-api/types'

import {useState} from 'react'
import {toast} from 'sonner'

import {Alert, AlertTitle, AlertDescription} from '~/ui/alert'

export default function StatsGenerator() {
  const [username, setUsername] = useState('')
  const [communitySlug, setCommunitySlug] = useState('sui-tr-community')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<UserStatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!username.trim() || !communitySlug.trim()) {
      console.warn('Please fill in both username and community slug')
      toast.error('Please fill in both username and community slug')
      return
    }

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

        // Для серьезных API ошибок показываем Alert
        if (response.status >= 500 || errorData.error?.includes('Service configuration')) {
          setError(errorData.message || `Server error: ${response.status}`)
          toast.error('Failed to generate stats')
          return
        }

        // Для менее серьезных ошибок - toast
        toast.error(errorData.message || `Request failed: ${response.status}`)
        return
      }

      const responseData: GenerateStatsResponse = await response.json()

      // Проверяем, есть ли предупреждение в ответе
      if (responseData.warning) {
        toast.warning(responseData.warning)
      } else {
        toast.success('Stats generated successfully!')
      }

      setResult(responseData.data)
    } catch (err) {
      // Сетевые ошибки - показываем Alert
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      toast.error('Connection failed')
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
        <Alert variant="destructive">
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
