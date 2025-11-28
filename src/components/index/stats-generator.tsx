'use client'

import {UserRound} from 'lucide-react'

import {api} from '@convex/_generated/api'

import {useCommunity} from '@/hooks/use-community'
import {useDebounce} from '@/hooks/use-debounce'
import {useStatsGeneration} from '@/hooks/use-stats-generation'
import {cn, cleanXAvatarUrl} from '@/lib/utils'

import {useState} from 'react'
import {useQuery} from 'convex/react'

import Image from 'next/image'
import StatsCard from '~/index/stats-card'
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

  const {
    isGenerating,
    isGeneratingImage,
    result,
    error,
    handleGenerate: generateStats,
    handleGenerateImage,
  } = useStatsGeneration({
    username,
    communitySlug: community?.slug || '',
    communityValid,
  })

  // Debounce username input to avoid excessive API calls
  const debouncedUsername = useDebounce(username.trim(), 700)

  // Query user data from Convex only when debounced username changes
  const userFromDb = useQuery(api.tables.users.getUserByUsername, debouncedUsername ? {username: debouncedUsername} : 'skip')

  // Determine user data for display
  const userData = userFromDb
    ? {
        exists: true,
        profileImage: cleanXAvatarUrl(userFromDb.avatar),
        lastScraped: userFromDb.lastActivity ? new Date(userFromDb.lastActivity).toLocaleDateString() : undefined,
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
        <div data-slot="input-config" className="flex sm:flex-col gap-2">
          <InputGroup>
            <InputGroupInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 !pl-1 !pt-0.5 sm:!pt-0.75" />

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

                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ) : userData.exists ? (
              <Card data-slot="card-output-generator-form" className="p-2 sm:p-1.5 pr-6 sm:pr-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.75 sm:gap-2.5">
                  <div className={cn(userData.profileImage ? '' : 'p-2', 'size-12 sm:size-14 rounded-lg overflow-hidden', 'grid place-items-center', 'bg-foreground/10 dark:bg-foreground/10')}>{userData.profileImage ? <Image quality={100} src={userData.profileImage} alt={`${username} profile`} width={500} height={500} className="size-full object-cover" /> : <UserRound className={cn('size-full', 'text-muted-foreground')} strokeWidth={1.5} />}</div>

                  <div className="space-y-0.5">
                    <H4 className="font-semibold">@{username}</H4>

                    <SMALL className="text-muted-foreground">{userData.lastScraped ? `scraped ${userData.lastScraped} (${userData.requestCount} requests)` : 'not scraped yet'}</SMALL>
                  </div>
                </div>

                {isGenerating && userData.exists && <Spinner className="size-6 text-muted-foreground" />}
              </Card>
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <Alert data-module="error-stats" variant="destructive">
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SMALL data-module="status-stats" className="text-muted-foreground text-center">
        {isGenerating
          ? 'Generating your stats card...' // fetching
          : result
            ? 'Your Stats Card' // generated
            : userData.exists
              ? 'Click generate to create your stats card' // initial
              : null}
      </SMALL>

      {(result || isGenerating) && (
        <div data-module="preview-stats" className="space-y-4">
          <div className="text-center"></div>

          <div className="flex justify-center">
            {isGenerating ? (
              <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-lg px-8 py-10">
                <div className="flex gap-24">
                  {/* Left side skeleton */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <Skeleton className="size-28 rounded-full mb-4" />
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Right side skeleton */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-8">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ) : result && community ? (
              <StatsCard
                userData={{
                  ...result.user,
                  avatar: cleanXAvatarUrl(result.user.avatar),
                }}
                stats={{
                  ...result.stats.raw,
                  impressions: result.stats.calculated.impressions,
                  engagement: result.stats.calculated.engagement,
                }}
                referenceUsername={communityUsername || community.slug}
              />
            ) : null}
          </div>

          {result && !isGenerating && (
            <div className="flex justify-center">
              <Button onClick={handleGenerateImageClick} disabled={isGeneratingImage} className="min-w-48 sm:w-full">
                {isGeneratingImage ? 'Generating Image...' : 'Download Image'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
