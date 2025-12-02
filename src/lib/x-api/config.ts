export interface XApiEndpointConfig {
  path: string
  method: 'GET' | 'POST'
  description: string
  requiredParams?: string[]
  optionalParams?: string[]
  defaultParams?: Record<string, string>
}

export interface XApiProvider {
  name: string
  baseUrl: string
  headers: Record<string, string>
  endpoints: Record<string, XApiEndpointConfig>
}

// Default configuration for X (Twitter) API via RapidAPI
export const xApiProvider: XApiProvider = {
  name: 'RapidAPI Twitter API',
  baseUrl: 'https://twitter-api45.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
    'x-rapidapi-key': process.env.X_RAPIDAPI_KEY!,
  },
  endpoints: {
    userInfo: {
      path: '/screenname.php',
      method: 'GET',
      description: 'Get user information by screenname',
      requiredParams: ['screenname'],
      optionalParams: ['rest_id'],
    },
    searchTweets: {
      path: '/search.php',
      method: 'GET',
      description: 'Search tweets by query',
      requiredParams: ['query'],
      optionalParams: ['search_type', 'cursor'],
    },
  },
}

export type XApiEndpointKey = keyof typeof xApiProvider.endpoints

// Lite mode for development - simpler queries to save API limits
// In lite mode: searches only for hashtag (without #) in user's tweets
// Full mode: searches for @username mentions, #hashtags, and $cashtags
export const LITE_MODE = process.env.X_RAPIDAPI_LITE_MODE !== 'false'
