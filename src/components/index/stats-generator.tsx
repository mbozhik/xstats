'use client'

import {UserRound} from 'lucide-react'

import type {CardVariant} from '~/index/stats-card'
import {api} from '@convex/_generated/api'

import {useCommunity} from '@/hooks/use-community'
import {useDebounce} from '@/hooks/use-debounce'
import {useStatsGeneration, useImageGeneration} from '@/hooks/use-stats-generation'
import {cn, cleanXAvatarUrl, getTimeAgo} from '@/lib/utils'

import {useState} from 'react'
import {useQuery} from 'convex/react'

import Image from 'next/image'
import StatsCard, {VariantSelector} from '~/index/stats-card'
import {Alert, AlertTitle, AlertDescription} from '~/ui/alert'
import {Skeleton} from '~/ui/skeleton'
import {Spinner} from '~/ui/spinner'
import {Card} from '~/ui/card'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '~/ui/input-group'
import {Button} from '~/ui/button'
import {H4, SMALL} from '~/ui/typography'

export default function StatsGenerator() {
  const {community, communityUsername, isLoading: communityLoading, error: communityError, isValid: communityValid} = useCommunity()

  const [username, setUsername] = useState('')
  const [cardVariant, setCardVariant] = useState<CardVariant>('community')

  const {
    isGenerating,
    result,
    error,
    handleGenerate: generateStats,
  } = useStatsGeneration({
    username,
    communitySlug: community?.slug || '',
    communityValid,
  })

  const {isGeneratingImage, imageRef, handleGenerateImage} = useImageGeneration(result)

  // Debounce username input to avoid excessive API calls
  const debouncedUsername = useDebounce(username.trim(), 700)

  // Query user data from Convex only when debounced username changes
  const userFromDb = useQuery(api.tables.users.getUserByUsername, debouncedUsername ? {username: debouncedUsername} : 'skip')

  // Determine user data for display
  const userData = userFromDb
    ? {
        exists: true,
        profileImage: cleanXAvatarUrl(userFromDb.avatar),
        lastScraped: userFromDb.lastActivity || undefined,
        requestCount: userFromDb.requestCount,
      }
    : {
        exists: false,
        profileImage: undefined,
        lastScraped: undefined,
        requestCount: 0,
      }

  // Show loading when user is typing (before debounce) or when query is loading
  const isUserLoading = (username.trim() !== '' && debouncedUsername !== username.trim()) || (userFromDb === undefined && debouncedUsername !== '')

  // Use functions from the hook
  const handleGenerate = () => generateStats()
  const handleGenerateImageClick = () => handleGenerateImage()

  if (communityLoading) {
    return (
      <Skeleton className="h-[20vh] grid place-items-center">
        <Spinner className="size-4" />
      </Skeleton>
    )
  }

  if (communityError || !communityValid) {
    return <Skeleton className="h-[20vh] grid place-items-center bg-red-950/20"></Skeleton>
  }

  return (
    <section data-section="stats-generator-index" className="space-y-6">
      <div data-module="config-stats" className="space-y-4">
        <div data-slot="input-config" className="flex gap-2 sm:flex-col">
          <InputGroup>
            <InputGroupInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value.replace('@', ''))} className="flex-1 !pl-1 !pt-0.5 sm:!pt-0.75" />

            <InputGroupAddon>
              <InputGroupText>
                x.com <span className="!-ml-1.75">/</span>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          <Button onClick={handleGenerate} disabled={!username.trim() || !communityValid || isGenerating || communityLoading}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {username && (
          <div data-slot="output-config">
            {isUserLoading ? (
              <Card data-slot="card-output-generator-form" className="p-2 sm:p-1.5 pr-6 sm:pr-4">
                <div className="flex items-center gap-2.75 sm:gap-2.5">
                  <Skeleton className="size-12 sm:size-14" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-20 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
              </Card>
            ) : (
              <Card data-slot="card-output-generator-form" className="p-2 sm:p-1.5 pr-6 sm:pr-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.75 sm:gap-2.5">
                  <div className={cn(userData.profileImage ? '' : 'p-2', 'size-12 sm:size-14 rounded-lg overflow-hidden', 'grid place-items-center', 'bg-foreground/10 dark:bg-foreground/10')}>{userData.profileImage ? <Image quality={100} src={userData.profileImage} alt={`${username} profile`} width={500} height={500} className="object-cover size-full" /> : <UserRound className={cn('size-full', 'text-muted-foreground')} strokeWidth={1.5} />}</div>

                  <div className="space-y-0.5">
                    <H4 className="font-semibold">@{username}</H4>

                    <SMALL className="text-muted-foreground">{userData.exists ? (userData.lastScraped ? `Last analyzed ${getTimeAgo(userData.lastScraped)} (${userData.requestCount})` : 'Data collection running...') : 'Profile not indexed'}</SMALL>
                  </div>
                </div>

                {isGenerating && userData.exists && <Spinner className="size-6 text-muted-foreground" />}
              </Card>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert data-module="error-stats" variant="destructive">
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SMALL data-module="status-stats" className="text-center text-muted-foreground">
        {isGenerating
          ? 'Generating your stats card...' // fetching
          : result
            ? 'Your Stats Card' // generated
            : userData.exists
              ? 'Click generate to create your stats card' // initial
              : null}
      </SMALL>

      {(result || isGenerating) && (
        <div data-module="preview-stats" className="space-y-4.5">
          <div className="text-center"></div>

          {isGenerating ? (
            <div className="w-full max-w-2xl mx-auto border rounded-xl bg-card border-border overflow-hidden">
              <div className="px-6 pt-10 pb-9 sm:p-6 flex-1 grid grid-cols-10 relative sm:flex sm:flex-col sm:gap-4">
                {/* Left side skeleton - Profile */}
                <div className="flex flex-col items-center self-center justify-center flex-shrink-0 col-span-3 gap-4 sm:gap-2.5">
                  <Skeleton className="rounded-full size-28 sm:size-24" />
                  <div className="flex flex-col gap-0 text-center">
                    <Skeleton className="w-16 h-6 mb-1 mx-auto" />
                    <Skeleton className="w-20 h-4 mx-auto" />
                  </div>
                </div>

                <div className="col-span-1"></div>

                {/* Right side skeleton - Stats */}
                <div className="flex flex-col justify-center flex-1 col-span-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {Array.from({length: 4}).map((_, index) => (
                      <div key={index} className="space-y-1">
                        <Skeleton className="w-full h-10" />
                        <Skeleton className="w-12 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer skeleton */}
              <div className="py-2 border-t bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-sm text-center">
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-16 h-4" />
                </div>
              </div>
            </div>
          ) : result && community ? (
            <>
              {/* Visible preview card */}
              <StatsCard
                variant={cardVariant}
                userData={{
                  ...result.user,
                  avatar: cleanXAvatarUrl(result.user.avatar) || '',
                }}
                stats={{
                  ...result.stats.raw,
                  impressions: result.stats.calculated.impressions,
                  engagement: result.stats.calculated.engagement,
                  engagementRate: result.stats.calculated.engagementRate,
                }}
                referenceUsername={communityUsername || community.slug}
                communityColors={community.branding.colors}
              />

              {/* Hidden export card with fixed dimensions */}
              <div className="sr-only">
                <StatsCard
                  ref={imageRef}
                  variant={cardVariant}
                  userData={{
                    ...result.user,
                    avatar: cleanXAvatarUrl(result.user.avatar) || '',
                  }}
                  stats={{
                    ...result.stats.raw,
                    impressions: result.stats.calculated.impressions,
                    engagement: result.stats.calculated.engagement,
                    engagementRate: result.stats.calculated.engagementRate,
                  }}
                  referenceUsername={communityUsername || community.slug}
                  communityColors={community.branding.colors}
                  isExport={true}
                />
              </div>
            </>
          ) : null}

          {result && !isGenerating && (
            <div className="flex sm:flex-col items-center justify-between sm:gap-3">
              <VariantSelector currentVariant={cardVariant} onVariantChange={setCardVariant} />

              <Button size="sm" className="min-w-48 sm:h-9 sm:w-full" onClick={handleGenerateImageClick} disabled={isGeneratingImage}>
                {isGeneratingImage ? 'Generating Image...' : 'Download Image'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
