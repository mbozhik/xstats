import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  users: defineTable({
    id: v.string(), // X id
    username: v.string(), // X username
    name: v.string(), // display name from X profile
    avatar: v.string(), // profile picture from X
    followersCount: v.number(), // number of followers
    requestCount: v.number(), // number of requested stats
    lastActivity: v.number(), // when user last requested stats
  })
    .index('by_x_id', ['id'])
    .index('by_username', ['username']),

  communities: defineTable({
    name: v.string(), // human-readable name (Pudgy Penguins)
    branding: v.object({
      colors: v.array(v.string()), // brand colors (primary, secondary, text)
      others: v.any(),
    }),
    slug: v.string(), // URL-friendly identifier (pengu)

    id: v.string(), // X id
    username: v.string(), // X username to track (pudgypenguins)
    avatar: v.string(), // profile picture from X
    hashtag: v.string(), // hashtags to track (#PENGU)
    cashtag: v.string(), // cashtags to track ($PENGU)

    isActive: v.boolean(), // whether community is active
  })
    .index('by_slug', ['slug'])
    .index('by_username', ['username']),

  stats: defineTable({
    userId: v.id('users'), // reference to users table
    communityId: v.id('communities'), // reference to communities table

    // Raw Metrics
    raw: v.object({
      tweets: v.number(), // total tweets involving community targets
      views: v.number(), // total views across all tweets (search)
      replies: v.number(), // total replies across all tweets (search)
      retweets: v.number(), // total retweets across all tweets (search)
      likes: v.number(), // total likes across all tweets (search)
      quotes: v.number(), // total quote tweets across all tweets (search)
      bookmarks: v.number(), // total bookmarks across all tweets (search)
    }),

    // Calculated Metrics
    calculated: v.object({
      impressions: v.number(), // total views across all analyzed tweets (sum of `views`)
      engagement: v.number(), // weighted engagement score using all raw metrics: (replies × 3) + (quotes × 3) + (retweets × 1) + (likes × 0.5) + (bookmarks × 1)
    }),
  }).index('by_user_community', ['userId', 'communityId']),
})
