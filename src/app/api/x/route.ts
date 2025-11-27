import {NextRequest, NextResponse} from 'next/server'
import {xApiProvider, LITE_MODE} from '@/lib/x-api/config'
import type {GenerateStatsParams, UserStatsData, XUserInfoResponse, XSearchResponse} from '@/lib/x-api/types'
import {ConvexHttpClient} from 'convex/browser'
import {api} from '@convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Engagement score calculation weights
const ENGAGEMENT_WEIGHTS = {
  replies: 3, // Each reply counts as 3 points
  quotes: 3, // Each quote counts as 3 points
  retweets: 1, // Each retweet counts as 1 point
  likes: 0.5, // Each like counts as 0.5 points
  bookmarks: 1, // Each bookmark counts as 1 point
} as const

// Input validation patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,15}$/ // X/Twitter username: 1-15 chars, letters, numbers, underscores only
const COMMUNITY_SLUG_REGEX = /^[a-z0-9-]+$/ // Community slug: lowercase letters, numbers, hyphens for URL-friendly format

export async function POST(request: NextRequest) {
  console.log(`🔄 X API Request - Mode: ${LITE_MODE ? 'LITE' : 'FULL'}`)

  try {
    const body = (await request.json()) as GenerateStatsParams
    const {username, communitySlug} = body

    // Validate that X API key is configured
    if (!process.env.X_RAPIDAPI_KEY) {
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
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          message: 'username and communitySlug are required',
          timestamp: new Date().toISOString(),
        },
        {status: 400},
      )
    }

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
    const userInfo = await fetchUserInfo(username)

    // Get community configuration (this would come from your database)
    // For now, using hardcoded example - you should fetch from Convex
    const communityTargets = await getCommunityTargets(communitySlug)

    // Search for user's tweets involving community targets
    const tweetsData = await searchUserTweets(username, communityTargets)

    // Calculate metrics
    const statsData = await calculateStats(username, userInfo, tweetsData)

    // Save data to Convex
    let saveWarning: string | null = null
    try {
      await saveToConvex(statsData, communitySlug)
    } catch (convexError) {
      console.error('Failed to save to Convex:', convexError)
      saveWarning = 'Warning: Stats generated but failed to save to database.'
    }

    if (saveWarning) {
      return NextResponse.json({...statsData, warning: saveWarning})
    }

    return NextResponse.json(statsData)
  } catch (error) {
    console.error('Stats generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate stats',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {status: 500},
    )
  }
}

async function fetchUserInfo(username: string): Promise<XUserInfoResponse> {
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
    throw new Error(`Failed to fetch user info: ${response.status}` + (errorBody ? ` - ${errorBody}` : ''))
  }

  const data = await response.json()

  if (data.status !== 'active') {
    throw new Error(`User status is "${data.status}" (expected "active")`)
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
}

async function getCommunityTargets(communitySlug: string) {
  const community = await convex.query(api.tables.communities.getCommunityBySlug, {slug: communitySlug})

  if (!community) {
    throw new Error(`Community not found: ${communitySlug}`)
  }

  // Return targets in the format expected by search function
  return {
    username: community.username,
    hashtag: community.hashtag,
    cashtag: community.cashtag,
  }
}

async function searchUserTweets(username: string, targets: {username: string; hashtag: string; cashtag: string}): Promise<XSearchResponse> {
  let query: string

  if (LITE_MODE) {
    // Simple lite mode: search only by hashtag (without # prefix) in user's tweets
    query = `${targets.hashtag} (from:${username})`
  } else {
    // Full mode: comprehensive search with all community targets
    const queryParts = [`(from:${username})`]

    // Add community username mentions
    if (targets.username) {
      queryParts.push(`@${targets.username}`)
    }

    // Add hashtag
    if (targets.hashtag) {
      queryParts.push(`#${targets.hashtag}`)
    }

    // Add cashtag
    if (targets.cashtag) {
      queryParts.push(`$${targets.cashtag}`)
    }

    query = queryParts.filter(Boolean).join(' ')
  }

  const endpoint = xApiProvider.endpoints.searchTweets
  const url = new URL(endpoint.path, xApiProvider.baseUrl)
  url.searchParams.set('query', query)
  url.searchParams.set('search_type', 'Top')

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
    throw new Error(`Failed to search tweets: ${response.status}` + (errorBody ? ` - ${errorBody}` : ''))
  }

  return await response.json()
}

async function calculateStats(username: string, userInfo: XUserInfoResponse, tweetsData: XSearchResponse): Promise<UserStatsData> {
  // Check if user exists to determine requestCount
  const existingUser = await convex.query(api.tables.users.getUserByUsername, {username})

  // Aggregate metrics from all tweets
  const metrics = tweetsData.timeline.reduce(
    (acc, tweet) => ({
      tweets: acc.tweets + 1,
      views: acc.views + parseInt(tweet.views || '0', 10),
      replies: acc.replies + tweet.replies,
      retweets: acc.retweets + tweet.retweets,
      likes: acc.likes + tweet.favorites,
      quotes: acc.quotes + tweet.quotes,
      bookmarks: acc.bookmarks + tweet.bookmarks,
    }),
    {tweets: 0, views: 0, replies: 0, retweets: 0, likes: 0, quotes: 0, bookmarks: 0},
  )

  // Calculate engagement score using predefined weights
  const engagementScore = metrics.replies * ENGAGEMENT_WEIGHTS.replies + metrics.quotes * ENGAGEMENT_WEIGHTS.quotes + metrics.retweets * ENGAGEMENT_WEIGHTS.retweets + metrics.likes * ENGAGEMENT_WEIGHTS.likes + metrics.bookmarks * ENGAGEMENT_WEIGHTS.bookmarks

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
      },
    },
  }
}

// Save data to Convex database
async function saveToConvex(statsData: UserStatsData, communitySlug: string) {
  // Save user data and get Convex ID
  const userConvexId = await convex.mutation(api.tables.users.upsertUser, {
    id: statsData.user.id,
    username: statsData.user.username,
    name: statsData.user.name,
    avatar: statsData.user.avatar,
    followersCount: statsData.user.followersCount,
    requestCount: statsData.user.requestCount,
    lastActivity: statsData.user.lastActivity,
  })

  // Get community for stats
  const community = await convex.query(api.tables.communities.getCommunityBySlug, {slug: communitySlug})
  if (!community) {
    throw new Error(`Community not found: ${communitySlug}`)
  }

  // Save stats data
  await convex.mutation(api.tables.stats.createStats, {
    userId: userConvexId,
    communityId: community._id,
    raw: statsData.stats.raw,
    calculated: statsData.stats.calculated,
  })
}
