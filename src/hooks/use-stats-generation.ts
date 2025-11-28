'use client'

import type {UserStatsData, GenerateStatsResponse} from '@/lib/x-api/types'

import {useState} from 'react'
import html2canvas from 'html2canvas-pro'
import {toast} from 'sonner'

interface UseStatsGenerationProps {
  username: string
  communitySlug: string
  communityValid: boolean
}

export function useStatsGeneration({username, communitySlug, communityValid}: UseStatsGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
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

        if (response.status >= 500 || errorData.error?.includes('Service configuration')) {
          setError(errorData.message || `Server error: ${response.status}`)
          toast.error('Failed to generate stats')
          return
        }

        toast.error(errorData.message || `Request failed: ${response.status}`)
        return
      }

      const responseData: GenerateStatsResponse = await response.json()

      if (responseData.warning) {
        toast.warning(responseData.warning)
      } else {
        toast.success('Stats generated successfully!')
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

  const handleGenerateImage = async () => {
    if (!result) return

    setIsGeneratingImage(true)
    try {
      const cardElement = document.querySelector('[id="stats-card"]') as HTMLElement
      if (!cardElement) return

      // Создаем клон элемента с фиксированными размерами
      const clonedElement = cardElement.cloneNode(true) as HTMLElement
      clonedElement.style.width = '600px'
      clonedElement.style.height = '300px'
      clonedElement.style.maxWidth = '600px'
      clonedElement.style.position = 'absolute'
      clonedElement.style.left = '-9999px'
      clonedElement.style.top = '-9999px'

      // Вставляем клон в DOM для правильного рендеринга
      document.body.appendChild(clonedElement)

      // Ждем рендеринга
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(clonedElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        width: 600,
        height: 300,
        windowWidth: 600,
        windowHeight: 300,
      })

      // Удаляем клон
      document.body.removeChild(clonedElement)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          const now = new Date()
          const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')
          a.download = `xstats-${result.user.username}-${dateStr}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast.success('Image downloaded successfully!')
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error('Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return {
    isGenerating,
    isGeneratingImage,
    result,
    error,
    handleGenerate,
    handleGenerateImage,
  }
}
