'use client'

import type {UserStatsData} from '@/lib/x-api/types'

import {cn} from '@/lib/utils'

import Image from 'next/image'
import {H1, H4, SMALL, SPAN} from '~/ui/typography'

type UserData = UserStatsData['user']
type StatsData = UserStatsData['stats']['raw'] & UserStatsData['stats']['calculated']

export default function StatsCard({userData, stats, referenceUsername}: {userData: UserData; stats: StatsData; referenceUsername: string}) {
  return (
    <div
      id="stats-card"
      className={cn('relative w-full mx-auto', 'flex flex-col', 'bg-card border border-border shadow-lg rounded-lg overflow-hidden')}
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div className={cn('px-8 py-8', 'flex-1', 'flex gap-24')}>
        {/* Left side - Profile */}
        <div className="flex-shrink-0 flex flex-col justify-center items-center gap-4">
          <div className="size-28 rounded-full overflow-hidden border-4 border-border">
            {userData.avatar ? (
              <Image src={userData.avatar} alt={`${userData.name} avatar`} width={112} height={112} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-3xl font-bold">{userData.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="text-center space-y-1">
            <H1 className="text-foreground">{userData.name}</H1>
            <SPAN className="text-muted-foreground">@{userData.username}</SPAN>
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-8">
            {[
              {value: userData.followersCount.toLocaleString(), label: 'Followers'},
              {value: stats.tweets.toLocaleString(), label: 'Tweets'},
              {value: stats.impressions.toLocaleString(), label: 'Impressions'},
              {value: stats.engagement.toLocaleString(), label: 'Engagement'},
            ].map((stat, index) => (
              <div className="space-y-1" key={index}>
                <H1 className="text-5xl text-foreground">{stat.value}</H1>
                <H4 className="text-muted-foreground font-normal">{stat.label}</H4>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border-t py-2">
        <SMALL className="text-center text-muted-foreground flex items-center justify-center gap-1">
          <span className="font-medium">@{userData.username}</span>
          <span className="text-muted-foreground/70">×</span>
          <span className="font-medium">@{referenceUsername}</span>
          <span className="text-muted-foreground/70">xstats</span>
        </SMALL>
      </div>
    </div>
  )
}
