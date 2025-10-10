'use client'

import {UserRound} from 'lucide-react'

import {cn} from '@/lib/utils'

import React, {useState, useEffect} from 'react'
import Image from 'next/image'

import {Skeleton} from '~/ui/skeleton'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from '~/ui/input-group'
import {Button} from '~/ui/button'
import {Card} from '~/ui/card'
import {H4, SMALL, SPAN} from '~/ui/typography'

export default function GeneratorForm() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<{
    exists: boolean
    profileImage?: string
    lastScraped?: string
  } | null>(null)

  // Mock request to get user data (later will be used convex)
  useEffect(() => {
    if (!username.trim()) {
      setUserData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setUserData(null)

    const timer = setTimeout(() => {
      const exists = false

      setUserData({
        exists,
        profileImage: exists ? `https://example.com/avatars/${username}.jpg` : undefined,
        lastScraped: exists ? '10.10.25' : undefined,
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [username])

  return (
    <section data-section="generator-form-index" className="space-y-6">
      <div data-slot="input-generator-form" className="flex gap-2 sm:gap-1.5">
        <InputGroup>
          <InputGroupInput placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 !pl-1 !pt-0.5 sm:!pt-0.75" />

          <InputGroupAddon>
            <InputGroupText>
              x.com <span className="!-ml-1.75">/</span>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <Button disabled={!username.trim()}>Generate</Button>
      </div>

      {username && (
        <div data-slot="output-generator-form" className="space-y-4">
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
                <div className={cn('p-2 size-12 rounded-xl', 'grid place-items-center', 'bg-foreground/10 dark:bg-foreground/10')}>{userData.profileImage ? <Image src={userData.profileImage} alt={`${username} profile`} width={48} height={48} className="size-full rounded-xl object-cover" /> : <UserRound className={cn('size-full', 'text-muted-foreground')} strokeWidth={1.5} />}</div>

                <div className="space-y-0.5">
                  <H4 className="font-semibold">@{username}</H4>

                  <SMALL className="text-muted-foreground">{userData.lastScraped ? `scraped ${userData.lastScraped}` : 'not scraped yet'}</SMALL>
                </div>
              </div>

              <div className="size-4 bg-foreground rounded-full animate-pulse"></div>
            </Card>
          ) : null}

          <SPAN className="text-muted-foreground text-center">
            Click <span className="text-foreground animate-pulse">generate</span> to get your card
          </SPAN>
        </div>
      )}
    </section>
  )
}
