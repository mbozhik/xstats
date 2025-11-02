'use client'

import {UserRound} from 'lucide-react'

import type {StatsCardData} from '@convex/x'
import {api} from '@convex/_generated/api'

import {cn} from '@/lib/utils'

import {useState, useEffect} from 'react'
import {useQuery, useAction} from 'convex/react'
import {toast} from 'sonner'
import html2canvas from 'html2canvas-pro'

import Image from 'next/image'
import StatsCard from '~~/index/stats-card'
import {Skeleton} from '~/ui/skeleton'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '~/ui/input-group'
import {Button} from '~/ui/button'
import {Card} from '~/ui/card'
import {H4, SPAN, SMALL} from '~/ui/typography'
import {Separator} from '@/components/ui/separator'

const DEFAULT_TARGET_USERNAME = 'SuiTrcommunity'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function StatsGenerator() {
  const [username, setUsername] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [cardData, setCardData] = useState<StatsCardData | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Debounce username input to avoid excessive API calls
  const debouncedUsername = useDebounce(username.trim(), 500)

  // Query user data from Convex only when debounced username changes
  const userFromDb = useQuery(api.tables.users.getUserByUsername, debouncedUsername ? {username: debouncedUsername} : 'skip')

  // Action to generate user stats and card data
  const generateStats = useAction(api.x.generateUserStats)

  // Determine user data for display
  const userData = userFromDb
    ? {
        exists: true,
        profileImage: userFromDb.avatar,
        lastScraped: userFromDb.updatedAt ? new Date(userFromDb.updatedAt).toLocaleDateString() : undefined,
        requestCount: userFromDb.requestCount,
      }
    : {
        exists: false,
        profileImage: undefined,
        lastScraped: undefined,
        requestCount: 0,
      }

  // Show loading when user is typing (before debounce) or when query is loading
  const isLoading = (username.trim() !== '' && debouncedUsername !== username.trim()) || (userFromDb === undefined && debouncedUsername !== '')

  // Handle generate button click
  const handleGenerate = async () => {
    if (!username.trim()) return

    setIsGenerating(true)
    try {
      // Generate stats and get card data in one call
      const card = await generateStats({
        username: username.trim(),
        targetUsername: DEFAULT_TARGET_USERNAME, // Default target account
      })

      setCardData(card)
      toast.success('Stats card generated successfully!')
    } catch (error) {
      console.error('Error generating stats:', error)
      toast.error('Error generating stats')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle image generation and download
  const handleGenerateImage = async () => {
    if (!cardData) return

    setIsGeneratingImage(true)
    try {
      // Find the stats card element in the preview
      const cardElement = document.querySelector('[id="stats-card"]') as HTMLElement
      if (!cardElement) return

      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: false,
        width: cardElement.offsetWidth,
        height: cardElement.offsetHeight,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          const now = new Date()
          const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')
          a.download = `xstats-${cardData.userData.username}-${dateStr}.png`
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

  return (
    <section data-section="stats-generator-index" className="space-y-6">
      <div data-slot="input-stats-generator" className="flex sm:flex-col gap-2 sm:gap-1.5">
        <InputGroup>
          <InputGroupInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 !pl-1 !pt-0.5 sm:!pt-0.75" />

          <InputGroupAddon>
            <InputGroupText>
              x.com <span className="!-ml-1.75">/</span>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <Button disabled={!username.trim() || isGenerating} onClick={handleGenerate}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {username && (
        <div data-slot="output-stats-generator" className="space-y-4">
          {isLoading ? (
            <Card data-slot="card-output-generator-form" className="p-2 sm:p-1.5 pr-6 sm:pr-4">
              <div className="flex items-center gap-2.75 sm:gap-2.5">
                <Skeleton className="size-12 rounded-xl" />

                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>

                <Skeleton className="size-4 rounded-full" />
              </div>
            </Card>
          ) : userData ? (
            <Card data-slot="card-output-generator-form" className="p-2 sm:p-1.5 pr-6 sm:pr-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.75 sm:gap-2.5">
                <div className={cn(userData.profileImage ? '' : 'p-2', 'size-12 rounded-lg overflow-hidden', 'grid place-items-center', 'bg-foreground/10 dark:bg-foreground/10')}>{userData.profileImage ? <Image src={userData.profileImage} alt={`${username} profile`} width={48} height={48} className="size-full object-cover" /> : <UserRound className={cn('size-full', 'text-muted-foreground')} strokeWidth={1.5} />}</div>

                <div className="space-y-0.5">
                  <H4 className="font-semibold">@{username}</H4>

                  <SMALL className="text-muted-foreground">{userData.lastScraped ? `scraped ${userData.lastScraped} (${userData.requestCount} requests)` : 'not scraped yet'}</SMALL>
                </div>
              </div>

              <div className={cn('size-4 bg-foreground rounded-full', isGenerating ? 'animate-pulse' : 'opacity-10 animate-pulse')}></div>
            </Card>
          ) : null}

          {!cardData && !isGenerating && <SPAN className="text-muted-foreground text-center">{userData?.exists ? 'Click generate to refresh your stats' : 'Click generate to create your first stats card'}</SPAN>}
        </div>
      )}

      {/* Stats Card Preview */}
      {(cardData || isGenerating) && (
        <div className="space-y-4">
          <Separator className="mt-6 mb-4" />

          <SPAN className="text-muted-foreground text-center">{isGenerating ? 'Generating your stats card...' : 'Your Stats Card'}</SPAN>

          <div className="flex justify-center">
            {isGenerating ? (
              <div className="w-full mx-auto bg-card border border-border rounded-lg px-6 py-8 sm:px-4 sm:py-6">
                <div className="flex gap-20 sm:gap-10 h-full">
                  {/* Left side skeleton */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <Skeleton className="size-24 sm:size-16 rounded-full animate-pulse mb-4" />
                    <Skeleton className="h-6 w-16 animate-pulse mb-2" />
                    <Skeleton className="h-4 w-20 animate-pulse" />
                  </div>

                  {/* Right side skeleton */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 sm:h-12 w-full animate-pulse" />
                      <Skeleton className="h-16 sm:h-12 w-full animate-pulse" />
                      <Skeleton className="h-16 sm:h-12 w-full animate-pulse" />
                      <Skeleton className="h-16 sm:h-12 w-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ) : cardData ? (
              <StatsCard {...cardData} />
            ) : null}
          </div>

          {cardData && !isGenerating && (
            <div className="flex justify-center">
              <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="min-w-48 sm:w-full">
                {isGeneratingImage ? 'Generating Image...' : 'Download Image'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
