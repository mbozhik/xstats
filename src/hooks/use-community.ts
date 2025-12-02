'use client'

import type {Doc} from '@convex/_generated/dataModel'
import {api} from '@convex/_generated/api'

import {useSearchParams} from 'next/navigation'
import {useQuery} from 'convex/react'

type Community = Doc<'communities'>

export function useCommunity() {
  const searchParams = useSearchParams()
  const communitySlug = searchParams.get('community') || 'sui-tr-community'

  // Получаем данные сообщества из Convex с оптимизированным запросом
  const communityData = useQuery(api.tables.communities.getCommunityBySlug, communitySlug ? {slug: communitySlug} : 'skip')

  // Определяем состояния на основе Convex query
  const isLoading = communityData === undefined
  const community = communityData as Community | null

  // Валидация формата slug (быстрая клиентская проверка)
  const isValidSlug = /^[a-z0-9-]+$/.test(communitySlug)

  // Определяем ошибки
  let error: string | null = null
  let isValid = false

  if (!isValidSlug) {
    error = 'Invalid community slug format'
  } else if (isLoading) {
    // Загрузка - ошибок нет
  } else if (!community) {
    error = 'Community not found'
  } else if (!community.isActive) {
    error = 'Community is currently inactive'
  } else {
    isValid = true
  }

  return {
    communitySlug,
    community,
    communityUsername: community?.username,
    communityName: community?.name,
    isLoading,
    error,
    isValid,
  }
}
