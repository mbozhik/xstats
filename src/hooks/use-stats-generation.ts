'use client'

import type {UserStatsData, GenerateStatsResponse} from '@/lib/x-api/types'

import {useState} from 'react'
import {useToPng} from '@hugocxl/react-to-image'
import {toast} from 'sonner'

interface UseStatsGenerationProps {
  username: string
  communitySlug: string
  communityValid: boolean
}

export function useImageGeneration(result: UserStatsData | null) {
  const [imageState, convertToPng, imageRef] = useToPng<HTMLDivElement>({
    quality: 1.0,
    backgroundColor: '#0A0A0A',
    pixelRatio: 3,
    onSuccess: (dataUrl) => {
      if (!result) return
      const a = document.createElement('a')
      a.href = dataUrl
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')
      a.download = `xstats-${result.user.username}-${dateStr}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Image downloaded successfully!')
    },
    onError: (error) => {
      console.error('Error generating image:', error)
      toast.error('Failed to generate image')
    },
  })

  return {
    isGeneratingImage: imageState.isLoading,
    imageRef,
    handleGenerateImage: convertToPng,
  }
}

export function useStatsGeneration({username, communitySlug, communityValid}: UseStatsGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<UserStatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    if (!communityValid) {
      toast.error('Invalid community')
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
          communitySlug,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 429 && errorData.source === 'rate_limited_blocked') {
          // Rate limit exceeded - blocked
          setError(errorData.message || 'Rate limit exceeded')
          toast.error(errorData.message || 'Rate limit exceeded. Try again tomorrow.')
          return
        }

        if (response.status >= 500 || errorData.error?.includes('Service configuration')) {
          setError(errorData.message || `Server error: ${response.status}`)
          toast.error('Failed to generate stats')
          return
        }

        toast.error(errorData.message || `Request failed: ${response.status}`)
        return
      }

      const responseData: GenerateStatsResponse = await response.json()

      // Handle different response sources
      switch (responseData.source) {
        case 'cache':
          toast.info('Stats loaded from cache (updated within 24h)')
          break
        case 'rate_limited_cache':
          toast.warning('Rate limit reached - showing cached data')
          break
        case 'fresh':
        default:
          if (responseData.warning) {
            toast.warning(responseData.warning)
          } else {
            toast.success('Stats generated successfully!')
          }
          break
      }

      setResult(responseData.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      toast.error('Connection failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    result,
    error,
    handleGenerate,
  }
}
