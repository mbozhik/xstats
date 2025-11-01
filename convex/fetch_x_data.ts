// X API configuration (Convex)

import type {UserData} from '@convex/x'

export const FETCH_CONFIG = {
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY as string,
  RAPIDAPI_HOST: 'twitter-api47.p.rapidapi.com',
}

if (!FETCH_CONFIG.RAPIDAPI_KEY || !FETCH_CONFIG.RAPIDAPI_HOST) {
  throw new Error('X API credentials not configured. Please set RAPIDAPI_KEY and RAPIDAPI_HOST environment variables.')
}

export const X_ENDPOINTS = {
  USER_BY_USERNAME: '/v3/user/by-username',
  USER_TWEETS_AND_REPLIES: '/v3/user/tweets-and-replies',
} as const

export interface XUserData {
  data: UserData
}

export interface XTweetMetrics {
  retweet_count: number
  like_count: number
  reply_count: number
  quote_count: number
}

export interface XTweet {
  id: string
  text: string
  created_at: string
  public_metrics: XTweetMetrics
  entities?: {
    mentions?: Array<{
      username: string
    }>
  }
}

export interface XPostsResponse {
  data?: XTweet[]
}

// API Error class
export class XAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
  ) {
    super(message)
    this.name = 'XAPIError'
  }
}

// Generic fetch function with error handling
async function xApiRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://${FETCH_CONFIG.RAPIDAPI_HOST}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Rapidapi-Key': FETCH_CONFIG.RAPIDAPI_KEY,
      'X-Rapidapi-Host': FETCH_CONFIG.RAPIDAPI_HOST,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new XAPIError('User not found', 404, endpoint)
    }
    if (response.status === 429) {
      throw new XAPIError('Rate limit exceeded. Please try again later.', 429, endpoint)
    }
    throw new XAPIError(`X API error: ${response.status} ${response.statusText}`, response.status, endpoint)
  }

  return response.json()
}

// Get user data by username
export async function getUserByUsername(username: string): Promise<XUserData> {
  if (!username?.trim()) {
    throw new XAPIError('Username is required', 400, X_ENDPOINTS.USER_BY_USERNAME)
  }

  const data = await xApiRequest<XUserData>(X_ENDPOINTS.USER_BY_USERNAME, {username})

  // Validate required fields
  if (!data?.data?.id || !data?.data?.name || !data?.data?.username) {
    throw new XAPIError('Incomplete user data received', 502, X_ENDPOINTS.USER_BY_USERNAME)
  }

  return data
}

// Get user's tweets and replies
export async function getUserTweetsAndReplies(userId: string): Promise<XPostsResponse> {
  return xApiRequest<XPostsResponse>(X_ENDPOINTS.USER_TWEETS_AND_REPLIES, {userId})
}

// Analyze interactions with target account
export function analyzeInteractionsWithTarget(tweets: XTweet[], targetUsername: string) {
  const interactions = {
    tweetsCount: 0,
    repliesCount: 0,
    likesCount: 0,
    retweetsCount: 0,
    quotesCount: 0,
    mentionsCount: 0,
  }

  const targetUsernameLower = `@${targetUsername.toLowerCase()}`

  for (const tweet of tweets) {
    if (!tweet.text) continue

    const text = tweet.text.toLowerCase()

    // Count mentions of target account
    if (text.includes(targetUsernameLower)) {
      interactions.mentionsCount++
    }

    // Count retweets
    if (tweet.text.startsWith('RT @')) {
      interactions.retweetsCount++
      continue // Retweets don't count as regular tweets
    }

    // Count replies (tweets starting with @)
    if (tweet.text.startsWith('@')) {
      interactions.repliesCount++
      continue // Replies don't count as regular tweets
    }

    // Count regular tweets
    interactions.tweetsCount++

    // Count quotes (tweets with links that mention target)
    if (text.includes('https://t.co/') && text.includes(targetUsernameLower)) {
      interactions.quotesCount++
    }
  }

  return interactions
}
