import type {UserStatsData} from '@/lib/x-api/types'

import {cn} from '@/lib/utils'

import {forwardRef} from 'react'

import Image from 'next/image'
import {Button} from '~/ui/button'
import {Badge} from '~/ui/badge'

type UserData = UserStatsData['user']
type StatsData = UserStatsData['stats']['raw'] & UserStatsData['stats']['calculated']

const VARIANTS = ['community', 'x-style', 'unstyled'] as const
export type CardVariant = (typeof VARIANTS)[number]

interface StatsCardProps {
  userData: UserData
  stats: StatsData
  referenceUsername: string
  variant: CardVariant
  communityColors: string[]
  isExport?: boolean
}

const VARIANT_STYLES = {
  community: (communityColors: string[]) => ({
    primary: communityColors[0],
    secondary: communityColors[1],
    text: communityColors[2],
  }),
  'x-style': () => ({
    primary: '#000000',
    secondary: '#101010',
    text: '#F1F3F4',
  }),
  unstyled: () => ({
    primary: '#171717',
    secondary: '#1F1F1F',
    text: '#FAFAFA',
  }),
} as const

export function VariantSelector({currentVariant, onVariantChange}: {currentVariant: CardVariant; onVariantChange: (variant: CardVariant) => void}) {
  const labels = {community: 'Community', 'x-style': 'X Style', unstyled: 'Unstyled'}

  return (
    <div className="flex justify-center gap-1 sm:w-full">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={currentVariant === variant ? 'outline' : 'ghost'} size="sm" className="px-2.25 sm:flex-1 sm:h-9 duration-200 border border-transparent" onClick={() => onVariantChange(variant)}>
          {labels[variant]}
        </Button>
      ))}
    </div>
  )
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(function StatsCard({userData, stats, referenceUsername, variant, communityColors, isExport = false}, ref) {
  const colors = VARIANT_STYLES[variant](communityColors)

  const brandedCommunity = referenceUsername === 'SuiTRCommunity'

  const formatStatNumber = (num: number) => {
    if (num >= 1000000) {
      // Миллионы: показываем 1 знак после запятой если < 10M, иначе без запятой
      const value = num / 1000000
      if (value < 10) {
        return `${value.toFixed(1).replace('.0', '')}M`
      }
      return `${Math.round(value)}M`
    }
    if (num >= 1000) {
      // Тысячи: показываем 1 знак после запятой если < 100K, иначе без запятой
      const value = num / 1000
      if (value < 100) {
        return `${value.toFixed(1).replace('.0', '')}K`
      }
      return `${Math.round(value)}K`
    }
    return num.toLocaleString('ru-RU').replace(/,/g, '.').replace(/\s/g, ' ')
  }

  return (
    <section>
      <div
        ref={ref}
        id="stats-card"
        className={cn(
          'relative flex flex-col bg-background border border-border shadow-lg rounded-xl overflow-hidden',
          isExport
            ? 'w-[600px] h-[300px]' // export size
            : 'w-full mx-auto',
        )}
        style={{
          background: `linear-gradient(150deg, ${colors.secondary} 20%, ${colors.primary}30 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div className="absolute inset-0 w-full h-full rounded-lg pointer-events-none">
          <div className="absolute top-[-35%] right-[10%] size-[150px]" style={{background: `radial-gradient(circle, ${colors.primary} 0%, transparent 50%)`, filter: 'blur(100px)', opacity: 0.4}} />
          <div className="absolute bottom-[-20%] left-[-20%] size-[200px]" style={{background: `radial-gradient(circle, ${colors.primary} 0%, transparent 50%)`, filter: 'blur(100px)', opacity: 0.4}} />
        </div>

        <div
          className={cn(
            'flex-1 relative z-10',
            isExport
              ? 'px-6 pt-10 pb-9 grid grid-cols-10' // desktop layout for export
              : 'px-6 pt-10 pb-9 sm:p-6 grid grid-cols-10 sm:flex sm:flex-col sm:gap-4', // responsive for preview
          )}
        >
          {/* Left side - Profile */}
          <div
            className={cn(
              'flex flex-col items-center self-center justify-center flex-shrink-0 gap-4',
              isExport
                ? 'col-span-3' // desktop layout
                : 'col-span-3 sm:gap-2.5', // responsive
            )}
          >
            <div
              className={cn(
                'overflow-hidden border-4 border-transparent rounded-full outline-4 outline-offset-1',
                isExport
                  ? 'size-28' // desktop size
                  : 'size-28 sm:size-24', // responsive
              )}
              style={{outlineColor: `${colors.text}20`}}
            >
              {userData.avatar ? (
                <Image src={userData.avatar} alt={`${userData.name} avatar`} width={112} height={112} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted" style={{backgroundColor: `${colors.text}10`}}>
                  <span className="text-3xl sm:text-2xl font-bold text-muted-foreground" style={{color: colors.text}}>
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex flex-col text-center">
              <span className="text-2xl font-bold" style={{color: colors.text}}>
                {userData.name}
              </span>
              <span className="text-muted-foreground" style={{color: `${colors.text}60`}}>
                @{userData.username}
              </span>
            </div>
          </div>

          <div className="col-span-1"></div>
          {/* {isExport ? null : <div className="col-span-1"></div>} */}

          {/* Right side - Stats */}
          <div className={cn('flex flex-col justify-center flex-1', isExport ? 'col-span-6' : 'col-span-6')}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                {value: userData.followersCount, label: 'Followers'},
                {value: stats.tweets, label: 'Tweets'},
                {value: stats.impressions, label: 'Impressions'},
                {value: stats.engagement, label: 'Engagement'},
              ].map((stat, index) => (
                <div className="space-y-1 relative" key={index}>
                  <span className="relative block text-5xl font-bold tracking-tight text-nowrap" style={{color: colors.text}}>
                    {formatStatNumber(stat.value)}

                    {stat.label === 'Engagement' && stats.engagementRate !== undefined && stats.engagementRate > 0 && (
                      <Badge variant="secondary" className={cn('absolute -top-2 -right-1.5', 'px-1.25 py-0.25 text-xs', variant !== 'community' && 'ring-[0.5px] ring-white/15')} style={{backgroundColor: brandedCommunity && variant === 'community' ? `${colors.primary}` : `${colors.secondary}`, color: colors.text}}>
                        {stats.engagementRate}%
                      </Badge>
                    )}
                  </span>
                  <span className="block text-lg font-medium text-muted-foreground" style={{color: `${colors.text}50`}}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="py-2 border-t bg-muted/50"
          style={{
            borderColor: `${colors.text}20`,
            backgroundColor: `${colors.secondary}80`,
          }}
        >
          <div className="flex items-center justify-center gap-1 text-sm text-center text-muted-foreground" style={{color: `${colors.text}60`}}>
            <span className="font-medium lowercase">@{userData.username}</span>
            <span className="text-muted-foreground/70">×</span>
            <span className="font-medium lowercase">@{referenceUsername}</span>
            <span style={{color: variant === 'community' ? (brandedCommunity ? `${colors.primary}95` : colors.text) : `${colors.text}95`}}>xstats</span>
          </div>
        </div>
      </div>
    </section>
  )
})

export default StatsCard
