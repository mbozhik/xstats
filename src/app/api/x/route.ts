import {NextRequest, NextResponse} from 'next/server'
import {xApiProvider} from '@/lib/x-api/config'
import type {GenerateStatsParams, UserStatsData, XUserInfoResponse, XSearchResponse} from '@/lib/x-api/types'
import {ConvexHttpClient} from 'convex/browser'
import {api} from '@convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Lite mode for development - simpler queries to save API limits
// In lite mode: searches only for hashtag (without #) in user's tweets
// Full mode: searches for @username mentions, #hashtags, and $cashtags
const LITE_MODE = process.env.X_RAPIDAPI_LIGHT_MODE !== 'false'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateStatsParams
    const {username, communitySlug} = body

    if (!username || !communitySlug) {
      return NextResponse.json({error: 'Missing required parameters: username and communitySlug'}, {status: 400})
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

    return NextResponse.json(statsData)
  } catch (error) {
    console.error('Stats generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate stats',
        message: error instanceof Error ? error.message : 'Unknown error',
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
    throw new Error(`Failed to fetch user info: ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'active') {
    throw new Error('User not found or inactive')
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

    query = queryParts.join(' ')
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
    throw new Error(`Failed to search tweets: ${response.status}`)
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
      views: acc.views + parseInt(tweet.views || '0'),
      replies: acc.replies + tweet.replies,
      retweets: acc.retweets + tweet.retweets,
      likes: acc.likes + tweet.favorites,
      quotes: acc.quotes + tweet.quotes,
      bookmarks: acc.bookmarks + tweet.bookmarks,
    }),
    {tweets: 0, views: 0, replies: 0, retweets: 0, likes: 0, quotes: 0, bookmarks: 0},
  )

  // Calculate engagement score: (replies × 3) + (quotes × 3) + (retweets × 1) + (likes × 0.5) + (bookmarks × 1)
  const engagementScore = metrics.replies * 3 + metrics.quotes * 3 + metrics.retweets * 1 + metrics.likes * 0.5 + metrics.bookmarks * 1

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
