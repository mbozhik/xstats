'use client'

import type {StatsCardData} from '@convex/x'

import {cn} from '@/lib/utils'

import Image from 'next/image'
import {H1, H4, SMALL, SPAN} from '~/ui/typography'

export default function StatsCard({userData, stats, referenceUsername}: StatsCardData) {
  return (
    <div
      id="stats-card"
      className={cn('relative w-full mx-auto', 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg rounded-lg overflow-hidden')}
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: document.documentElement.classList.contains('dark') ? 'linear-gradient(135deg, #171717 0%, #262626 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <div className={cn('px-6 py-8 sm:px-4 sm:py-6', 'flex gap-20 sm:gap-10')}>
        {/* Left side - Profile and branding */}
        <div className="flex-shrink-0 flex flex-col justify-center items-center gap-3">
          <div className="size-24 sm:size-16 rounded-full overflow-hidden border-4 sm:border-3 border-neutral-300 dark:border-neutral-600">
            {userData.avatar ? (
              <Image src={userData.avatar} alt={`${userData.name} avatar`} width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <span className="text-neutral-600 dark:text-neutral-300 text-2xl font-bold">{userData.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="text-center space-y-1">
            <H1 className="sm:text-xl text-neutral-900 dark:text-neutral-100">{userData.name}</H1>
            <SPAN className="sm:text-xs text-neutral-600 dark:text-neutral-400">@{userData.username}</SPAN>
          </div>
        </div>

        {/* Right side - User info and stats */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              {value: userData.followerCount.toLocaleString(), label: 'Followers'},
              {value: stats.posts.toLocaleString(), label: 'Posts'},
              {value: stats.impressions.toLocaleString(), label: 'Impressions'},
              {value: `${stats.engagement.toFixed(1)}%`, label: 'Engagement'},
            ].map((stat, index) => (
              <div className="space-y-1 sm:space-y-0.5" key={index}>
                <H1 className="text-4xl sm:text-3xl text-neutral-900 dark:text-neutral-100">{stat.value}</H1>
                <H4 className="sm:text-sm font-normal text-neutral-500 dark:text-neutral-400">{stat.label}</H4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="bg-neutral-100/90 dark:bg-neutral-800/90 border-t border-neutral-200 dark:border-neutral-700 backdrop-blur-sm">
        <SMALL className={cn('py-1.5 text-center', 'text-neutral-700 dark:text-neutral-300')}>xstats for @{referenceUsername}</SMALL>
      </div>
    </div>
  )
}
