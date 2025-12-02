// Essential types for X (Twitter) API responses

export interface XUserInfoResponse {
  status: string
  profile: string // screenname/username
  rest_id: string
  id: string
  name: string
  avatar: string
  sub_count: number // followers count
  friends: number // following count
  blue_verified?: boolean | null
}

export interface XTweetData {
  tweet_id: string
  views: string // API returns as string
  replies: number
  retweets: number
  favorites: number // likes
  quotes: number
  bookmarks: number
  entities: {
    hashtags: string[]
    symbols: string[] // cashtags
    user_mentions: string[]
  }
}

export interface XSearchResponse {
  status: string
  timeline: XTweetData[]
}

// Types for API parameters
export interface XUserInfoParams {
  screenname: string
  rest_id?: string
}

export interface XSearchTweetsParams {
  query: string
  search_type?: 'Top' | 'Latest' | 'People' | 'Photos' | 'Videos'
}

// Final output structure matching Convex schema
export interface UserStatsData {
  user: {
    id: string
    username: string
    name: string
    avatar: string
    followersCount: number
    requestCount: number
    lastActivity: number
  }
  stats: {
    raw: {
      tweets: number
      views: number
      replies: number
      retweets: number
      likes: number
      quotes: number
      bookmarks: number
    }
    calculated: {
      impressions: number // sum of views
      engagement: number // weighted score: (replies × 3) + (quotes × 3) + (retweets × 2) + (likes × 0.5) + (bookmarks × 2)
      engagementRate: number // engagement rate percentage: (engagement / impressions) × 100
    }
  }
}

// Input types for our API endpoint
export interface GenerateStatsParams {
  username: string // X username without @
  communitySlug: string // community identifier
}

export interface GenerateStatsResponse {
  data: UserStatsData
  warning?: string
}
