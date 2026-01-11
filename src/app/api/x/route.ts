import {NextRequest, NextResponse} from 'next/server'

import type {GenerateStatsParams, UserStatsData, XUserInfoResponse, XSearchResponse, XTweetData, XSearchTweetsParamsSearchType} from '@/lib/x-api/types'
import {xApiProvider, LITE_MODE} from '@/lib/x-api/config'

import {ConvexHttpClient} from 'convex/browser'
import {api} from '@convex/_generated/api'

const DETAILED_LOGGING: boolean = false

interface SearchMetrics {
  query: string
  duration: number
  resultsCount: number
  apiCalls: number
  cacheHit: boolean
}

// Логирование метрик для анализа производительности
function logSearchMetrics(metrics: SearchMetrics) {
  console.log(`🔍 Search metrics:`, metrics)
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Engagement score calculation weights
const ENGAGEMENT_WEIGHTS = {
  replies: 3, // Each reply counts as 3 points
  quotes: 3, // Each quote counts as 3 points
  retweets: 2, // Each retweet counts as 2 points
  likes: 0.5, // Each like counts as 0.5 points
  bookmarks: 2, // Each bookmark counts as 2 points
} as const

// Input validation patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,15}$/ // X/Twitter username: 1-15 chars, letters, numbers, underscores only
const COMMUNITY_SLUG_REGEX = /^[a-z0-9-]+$/ // Community slug: lowercase letters, numbers, hyphens for URL-friendly format

// Extended tweet interface for actual API responses (may differ from declared types)
interface ExtendedTweetData extends XTweetData {
  id?: string
  text?: string
  created_at?: string
}

// Helper function to get date one year ago in YYYY-MM-DD format
function getOneYearAgoDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)
  return date.toISOString().split('T')[0] // Returns YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🔄 X API Request - Mode: ${LITE_MODE ? 'LITE' : 'FULL'} - Request ID: ${requestId} – ${DETAILED_LOGGING ? '🛠️' : '👁️'}`)

  try {
    const body = (await request.json()) as GenerateStatsParams
    const {username, communitySlug} = body

    if (DETAILED_LOGGING) {
      console.log(`📋 Request Parameters - Request ID: ${requestId}`, {
        username,
        communitySlug,
        timestamp: new Date().toISOString(),
      })
    }

    // Validate that X API key is configured
    if (!process.env.X_RAPIDAPI_KEY) {
      if (DETAILED_LOGGING) {
        console.error(`❌ API Key Missing - Request ID: ${requestId}`)
      }
      return NextResponse.json(
        {
          error: 'Service configuration error',
          message: 'X API key is not configured on the server',
          timestamp: new Date().toISOString(),
        },
        {status: 500},
      )
    }

    if (!username || !communitySlug) {
      if (DETAILED_LOGGING) {
        console.warn(`⚠️ Missing Parameters - Request ID: ${requestId}`, {username, communitySlug})
      }
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          message: 'username and communitySlug are required',
          timestamp: new Date().toISOString(),
        },
        {status: 400},
      )
    }

    // Check rate limit (3 requests per day per user)
    // const rateLimitCheck = await checkRateLimit(username)
    // if (!rateLimitCheck.allowed) {
    //   return NextResponse.json(
    //     {
    //       error: 'Rate limit exceeded',
    //       message: rateLimitCheck.message,
    //       retryAfter: rateLimitCheck.retryAfter,
    //       timestamp: new Date().toISOString(),
    //     },
    //     {status: 429},
    //   )
    // }

    // Validate username format (Twitter username rules)
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error: 'Invalid username format',
          message: 'Username must be 1-15 characters, containing only letters, numbers, and underscores',
          timestamp: new Date().toISOString(),
        },
        {status: 400},
      )
    }

    // Validate communitySlug format
    if (!COMMUNITY_SLUG_REGEX.test(communitySlug)) {
      return NextResponse.json(
        {
          error: 'Invalid communitySlug format',
          message: 'Community slug must contain only lowercase letters, numbers, and hyphens',
          timestamp: new Date().toISOString(),
        },
        {status: 400},
      )
    }

    // Get user info
    if (DETAILED_LOGGING) {
      console.log(`👤 Fetching user info - Request ID: ${requestId}`, {username})
    }
    const userInfo = await fetchUserInfo(username)
    if (DETAILED_LOGGING) {
      console.log(`✅ User info fetched - Request ID: ${requestId}`, {
        userId: userInfo.id,
        username: userInfo.profile,
        followersCount: userInfo.sub_count,
        friends: userInfo.friends,
        blue_verified: userInfo.blue_verified,
      })
    }

    // Get community configuration (this would come from your database)
    // For now, using hardcoded example - you should fetch from Convex
    if (DETAILED_LOGGING) {
      console.log(`🏘️ Fetching community targets - Request ID: ${requestId}`, {communitySlug})
    }
    const communityTargets = await getCommunityTargets(communitySlug)
    if (DETAILED_LOGGING) {
      console.log(`✅ Community targets fetched - Request ID: ${requestId}`, communityTargets)
    }

    // Search for user's tweets involving community targets
    if (DETAILED_LOGGING) {
      console.log(`🔍 Starting tweet search - Request ID: ${requestId}`, {
        username,
        targets: communityTargets,
        liteMode: LITE_MODE,
      })
    }
    const searchResult = await searchUserTweets(username, communityTargets, requestId)
    const tweetsData = searchResult.data
    if (DETAILED_LOGGING) {
      console.log(`✅ Tweet search completed - Request ID: ${requestId}`, {
        tweetsFound: tweetsData.timeline?.length || 0,
        searchMetrics: searchResult.metrics,
      })
    }

    // Calculate metrics
    if (DETAILED_LOGGING) {
      console.log(`📊 Calculating stats - Request ID: ${requestId}`, {
        tweetsCount: tweetsData.timeline?.length || 0,
      })
    }
    const statsData = await calculateStats(username, userInfo, tweetsData, requestId)
    if (DETAILED_LOGGING) {
      console.log(`✅ Stats calculated - Request ID: ${requestId}`, {
        user: {
          id: statsData.user.id,
          username: statsData.user.username,
          followersCount: statsData.user.followersCount,
          requestCount: statsData.user.requestCount,
        },
        stats: statsData.stats,
      })
    }

    // Save data to Convex
    if (DETAILED_LOGGING) {
      console.log(`💾 Saving to database - Request ID: ${requestId}`)
    }
    let saveWarning: string | null = null
    try {
      await saveToConvex(statsData, communitySlug)
      if (DETAILED_LOGGING) {
        console.log(`✅ Successfully saved to database - Request ID: ${requestId}`)
      }
    } catch (convexError) {
      if (DETAILED_LOGGING) {
        console.error(`❌ Failed to save to Convex - Request ID: ${requestId}:`, convexError)
      }
      saveWarning = 'Warning: Stats generated but failed to save to database.'
    }

    const responseData = saveWarning ? {data: statsData, warning: saveWarning} : {data: statsData}

    if (DETAILED_LOGGING) {
      console.log(`📤 Sending response - Request ID: ${requestId}`, {
        hasWarning: Boolean(saveWarning),
        userId: statsData.user.id,
        tweetsProcessed: statsData.stats.raw.tweets,
        impressions: statsData.stats.calculated.impressions,
        engagement: statsData.stats.calculated.engagement,
        engagementRate: statsData.stats.calculated.engagementRate,
      })
    }

    if (saveWarning) {
      return NextResponse.json(responseData)
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`💥 Stats generation error${DETAILED_LOGGING ? ` - Request ID: ${requestId}` : ''}:`, error)

    // Determine appropriate status code based on error type
    let statusCode = 500
    let errorMessage = 'Unknown error occurred'

    if (error instanceof Error) {
      errorMessage = error.message

      // Check for specific error types to set appropriate status codes
      if (error.message.includes('not found')) {
        statusCode = 404
      } else if (error.message.includes('Rate limit') || error.message.includes('rate limit')) {
        statusCode = 429
      } else if (error.message.includes('Invalid') || error.message.includes('format')) {
        statusCode = 400
      } else if (error.message.includes('Access') || error.message.includes('forbidden')) {
        statusCode = 403
      }

      if (DETAILED_LOGGING) {
        console.error(`🚨 Error details - Request ID: ${requestId}`, {
          errorType: error.constructor.name,
          message: error.message,
          statusCode,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
        })
      }
    } else {
      if (DETAILED_LOGGING) {
        console.error(`🚨 Non-Error object thrown - Request ID: ${requestId}`, {
          errorType: typeof error,
          errorValue: String(error),
        })
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate stats',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        requestId, // Include request ID in error response for easier debugging
      },
      {status: statusCode},
    )
  }
}

// async function checkRateLimit(username: string): Promise<{allowed: boolean; message?: string; retryAfter?: number}> {
//   try {
//     const user = await convex.query(api.tables.users.getUserByUsername, {username})

//     if (!user) {
//       // New user, allow request
//       return {allowed: true}
//     }

//     const now = Date.now()
//     const oneDayAgo = now - 24 * 60 * 60 * 1000 // 24 hours in milliseconds

//     // Count requests in the last 24 hours based on lastActivity
//     // Since we don't store individual request timestamps, we'll use a simple heuristic:
//     // If lastActivity was within last 24h and requestCount >= 3, deny
//     const recentRequests = user.lastActivity > oneDayAgo ? user.requestCount : 0

//     if (recentRequests >= 3) {
//       const timeUntilReset = Math.ceil((user.lastActivity + 24 * 60 * 60 * 1000 - now) / (60 * 60 * 1000)) // hours until reset
//       return {
//         allowed: false,
//         message: `Rate limit exceeded. You can make 3 requests per day. Try again in ${timeUntilReset} hours.`,
//         retryAfter: timeUntilReset * 3600, // seconds
//       }
//     }

//     return {allowed: true}
//   } catch (error) {
//     console.error('Rate limit check error:', error)
//     // Allow request on error to avoid blocking users due to db issues
//     return {allowed: true}
//   }
// }

async function fetchUserInfo(username: string): Promise<XUserInfoResponse> {
  try {
    const endpoint = xApiProvider.endpoints.userInfo
    const url = new URL(endpoint.path, xApiProvider.baseUrl)
    url.searchParams.set('screenname', username)

    const response = await fetch(url.toString(), {
      method: endpoint.method,
      headers: xApiProvider.headers,
    })

    if (!response.ok) {
      let errorBody: string | undefined
      try {
        errorBody = await response.text()
      } catch {
        errorBody = undefined
      }

      if (response.status === 404) {
        throw new Error(`User "${username}" not found`)
      } else if (response.status === 429) {
        throw new Error('X API rate limit exceeded. Please try again later.')
      } else if (response.status === 403) {
        throw new Error('Access to X API is forbidden. Please check API credentials.')
      }

      throw new Error(`Failed to fetch user info: ${response.status}` + (errorBody ? ` - ${errorBody}` : ''))
    }

    const data = await response.json()

    if (!data) {
      throw new Error('Empty response from X API')
    }

    if (data.status !== 'active') {
      throw new Error(`User "${username}" status is "${data.status}" (expected "active")`)
    }

    // Validate required fields
    if (!data.id || !data.profile) {
      throw new Error('Invalid user data received from X API')
    }

    return {
      status: data.status,
      profile: data.profile,
      rest_id: data.rest_id,
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      sub_count: data.sub_count,
      friends: data.friends,
      blue_verified: data.blue_verified,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Unexpected error while fetching user info: ${String(error)}`)
  }
}

async function getCommunityTargets(communitySlug: string) {
  try {
    const community = await convex.query(api.tables.communities.getCommunityBySlug, {slug: communitySlug})

    if (!community) {
      throw new Error(`Community not found: ${communitySlug}`)
    }

    // Validate that community has at least one target
    if (!community.username && !community.hashtag && !community.cashtag) {
      throw new Error(`Community "${communitySlug}" has no search targets configured`)
    }

    // Return targets in the format expected by search function
    return {
      username: community.username || '',
      hashtag: community.hashtag || '',
      cashtag: community.cashtag || '',
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to fetch community targets: ${String(error)}`)
  }
}

async function searchUserTweets(username: string, targets: {username: string; hashtag: string; cashtag: string}, requestId: string): Promise<{data: XSearchResponse; metrics: SearchMetrics}> {
  const startTime = Date.now()
  let apiCalls = 0
  const cacheHit = false
  const MAX_TWEETS = 500 // Защита от бесконечного цикла + экономия ресурсов
  // const RATE_LIMIT_DELAY = 1500 // 1.5 сек (40 req/min) - баланс скорости и безопасности
  // API возвращает по 20 твитов на страницу, мы ВРОДЕ не контролируем это значение

  let query: string

  if (LITE_MODE) {
    // Simple lite mode: search only by hashtag (without # prefix) in user's tweets
    query = `${targets.hashtag} (from:${username}) since:${getOneYearAgoDate()}`
  } else {
    // Full mode: comprehensive search with all community targets
    // Fixed logic: (from:username) AND (community_condition1 OR community_condition2 OR ...)
    const queryParts = [`(from:${username})`]

    // Build community conditions
    const communityConditions = []
    if (targets.username) {
      communityConditions.push(`@${targets.username}`)
    }
    if (targets.hashtag) {
      communityConditions.push(`${targets.hashtag}`) // hashtag without # prefix
      communityConditions.push(`#${targets.hashtag}`)
    }
    if (targets.cashtag) {
      communityConditions.push(`$${targets.cashtag}`)
    }

    // Add community conditions if any exist
    if (communityConditions.length > 0) {
      queryParts.push(`(${communityConditions.join(' OR ')})`)
    }

    // Add time constraint
    queryParts.push(`since:${getOneYearAgoDate()}`)

    // Exclude replies to focus on posts with better metrics (original tweets & quotes)
    queryParts.push('-filter:replies')

    query = queryParts.join(' ')
  }

  try {
    const allTweets: XTweetData[] = []
    let cursor: string | undefined = undefined
    let hasMore = true

    // Загружаем страницы последовательно до достижения лимита
    while (hasMore && allTweets.length < MAX_TWEETS) {
      const endpoint = xApiProvider.endpoints.searchTweets
      const url = new URL(endpoint.path, xApiProvider.baseUrl)
      url.searchParams.set('query', query)
      url.searchParams.set('search_type', 'Top' as NonNullable<XSearchTweetsParamsSearchType>)

      if (cursor) {
        url.searchParams.set('cursor', cursor)
      }

      apiCalls++

      // Rate limiting: задержка между запросами (кроме первого)
      // if (apiCalls > 1) {
      //   console.log(`⏱️ Rate limiting: waiting ${RATE_LIMIT_DELAY}ms before request ${apiCalls}`)
      //   await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY))
      // }

      const response = await fetch(url.toString(), {
        method: endpoint.method,
        headers: xApiProvider.headers,
      })

      if (!response.ok) {
        let errorBody: string | undefined
        try {
          errorBody = await response.text()
        } catch {
          errorBody = undefined
        }

        // Special handling for rate limit errors
        if (response.status === 429) {
          console.log('🚫 Rate limit exceeded, returning collected data so far')
          break // Прерываем пагинацию и возвращаем собранные данные
        }

        // Log failed request metrics
        const failedMetrics: SearchMetrics = {
          query,
          duration: Date.now() - startTime,
          resultsCount: allTweets.length,
          apiCalls,
          cacheHit,
        }
        logSearchMetrics(failedMetrics)

        throw new Error(`Failed to search tweets: ${response.status}` + (errorBody ? ` - ${errorBody}` : ''))
      }

      const data = await response.json()

      if (DETAILED_LOGGING) {
        console.log(`📄 Search page ${apiCalls} - Request ID: ${requestId}`, {
          tweetsInPage: data.timeline?.length || 0,
          hasNextCursor: Boolean(data.next_cursor),
          totalTweetsSoFar: allTweets.length,
        })
      }

      // Добавляем твиты из текущей страницы
      if (data.timeline && Array.isArray(data.timeline)) {
        allTweets.push(...data.timeline)

        // Логируем детали твитов для дебага (первые 3 твита страницы)
        if (DETAILED_LOGGING && data.timeline.length > 0) {
          console.log(
            `📝 Sample tweets from page ${apiCalls} - Request ID: ${requestId}`,
            (data.timeline.slice(0, 3) as ExtendedTweetData[]).map((tweet: ExtendedTweetData) => ({
              id: tweet.id,
              text: tweet.text ? tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : '') : '',
              views: tweet.views,
              replies: tweet.replies,
              retweets: tweet.retweets,
              favorites: tweet.favorites,
              quotes: tweet.quotes,
              bookmarks: tweet.bookmarks,
              created_at: tweet.created_at,
            })),
          )
        }
      }

      // Проверяем, есть ли следующая страница
      cursor = data.next_cursor
      hasMore = Boolean(cursor) && data.timeline && data.timeline.length > 0

      // Ограничиваем общее количество твитов
      if (allTweets.length >= MAX_TWEETS) {
        allTweets.splice(MAX_TWEETS) // Обрезаем до максимума
        hasMore = false
      }

      // Защита от бесконечного цикла - если получили пустой результат, останавливаемся
      if (data.timeline && data.timeline.length === 0) {
        hasMore = false
      }
    }

    const duration = Date.now() - startTime
    const resultsCount = allTweets.length

    const metrics: SearchMetrics = {
      query,
      duration,
      resultsCount,
      apiCalls,
      cacheHit,
    }

    logSearchMetrics(metrics)

    // Возвращаем объединенный результат
    return {
      data: {
        status: 'success',
        timeline: allTweets,
      },
      metrics,
    }
  } catch (error) {
    // Ensure metrics are logged even on error
    const errorMetrics: SearchMetrics = {
      query,
      duration: Date.now() - startTime,
      resultsCount: 0,
      apiCalls,
      cacheHit,
    }
    logSearchMetrics(errorMetrics)
    throw error
  }
}

async function calculateStats(username: string, userInfo: XUserInfoResponse, tweetsData: XSearchResponse, requestId: string): Promise<UserStatsData> {
  try {
    // Check if user exists to determine requestCount
    let existingUser
    try {
      existingUser = await convex.query(api.tables.users.getUserByUsername, {username})
    } catch (convexError) {
      console.warn('Failed to fetch existing user from Convex:', convexError)
      existingUser = null // Continue without existing user data
    }

    // Validate tweets data
    if (!tweetsData || !tweetsData.timeline) {
      throw new Error('Invalid tweets data received from X API')
    }

    // Aggregate metrics from all tweets with error handling
    const metrics = (tweetsData.timeline as ExtendedTweetData[]).reduce(
      (acc: {tweets: number; views: number; replies: number; retweets: number; likes: number; quotes: number; bookmarks: number}, tweet: ExtendedTweetData) => {
        try {
          return {
            tweets: acc.tweets + 1,
            views: acc.views + parseInt(tweet.views || '0', 10),
            replies: acc.replies + (tweet.replies || 0),
            retweets: acc.retweets + (tweet.retweets || 0),
            likes: acc.likes + (tweet.favorites || 0),
            quotes: acc.quotes + (tweet.quotes || 0),
            bookmarks: acc.bookmarks + (tweet.bookmarks || 0),
          }
        } catch (tweetError) {
          if (DETAILED_LOGGING) {
            console.warn(`Error processing tweet - Request ID: ${requestId}:`, tweetError, tweet)
          }
          return acc // Skip malformed tweet
        }
      },
      {tweets: 0, views: 0, replies: 0, retweets: 0, likes: 0, quotes: 0, bookmarks: 0},
    )

    if (DETAILED_LOGGING) {
      console.log(`📈 Raw metrics aggregated - Request ID: ${requestId}`, metrics)
    }

    // Calculate engagement score using predefined weights
    const engagementScore = metrics.replies * ENGAGEMENT_WEIGHTS.replies + metrics.quotes * ENGAGEMENT_WEIGHTS.quotes + metrics.retweets * ENGAGEMENT_WEIGHTS.retweets + metrics.likes * ENGAGEMENT_WEIGHTS.likes + metrics.bookmarks * ENGAGEMENT_WEIGHTS.bookmarks

    // Calculate engagement rate (percentage)
    const engagementRate = metrics.views > 0 ? (engagementScore / metrics.views) * 100 : 0

    if (DETAILED_LOGGING) {
      console.log(`🎯 Engagement calculations - Request ID: ${requestId}`, {
        engagementScore,
        engagementRate,
        weights: ENGAGEMENT_WEIGHTS,
      })
    }

    return {
      user: {
        id: userInfo.id,
        username: userInfo.profile,
        name: userInfo.name,
        avatar: userInfo.avatar,
        followersCount: userInfo.sub_count,
        requestCount: (existingUser?.requestCount || 0) + 1,
        lastActivity: Date.now(),
      },
      stats: {
        raw: metrics,
        calculated: {
          impressions: metrics.views, // sum of all views
          engagement: engagementScore,
          engagementRate: Math.round(engagementRate * 100) / 100, // 2 decimal places
        },
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to calculate stats: ${String(error)}`)
  }
}

// Save data to Convex database
async function saveToConvex(statsData: UserStatsData, communitySlug: string) {
  try {
    // Save user data and get Convex ID
    let userConvexId
    try {
      userConvexId = await convex.mutation(api.tables.users.upsertUser, {
        id: statsData.user.id,
        username: statsData.user.username,
        name: statsData.user.name,
        avatar: statsData.user.avatar,
        followersCount: statsData.user.followersCount,
        requestCount: statsData.user.requestCount,
        lastActivity: statsData.user.lastActivity,
      })
    } catch (userError) {
      throw new Error(`Failed to save user data: ${userError instanceof Error ? userError.message : String(userError)}`)
    }

    // Get community for stats
    let community
    try {
      community = await convex.query(api.tables.communities.getCommunityBySlug, {slug: communitySlug})
    } catch (communityError) {
      throw new Error(`Failed to fetch community: ${communityError instanceof Error ? communityError.message : String(communityError)}`)
    }

    if (!community) {
      throw new Error(`Community not found: ${communitySlug}`)
    }

    // Save stats data
    try {
      await convex.mutation(api.tables.stats.createStats, {
        userId: userConvexId,
        communityId: community._id,
        raw: statsData.stats.raw,
        calculated: statsData.stats.calculated,
      })
    } catch (statsError) {
      throw new Error(`Failed to save stats data: ${statsError instanceof Error ? statsError.message : String(statsError)}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Unexpected error while saving to database: ${String(error)}`)
  }
}
