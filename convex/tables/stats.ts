import type {Doc} from '@convex/_generated/dataModel'
import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

// Create stats record
export const createStats = mutation({
  args: {
    userId: v.id('users'),
    communityId: v.id('communities'),
    raw: v.object({
      tweets: v.number(),
      views: v.number(),
      replies: v.number(),
      retweets: v.number(),
      likes: v.number(),
      quotes: v.number(),
      bookmarks: v.number(),
    }),
    calculated: v.object({
      impressions: v.number(),
      engagement: v.number(),
      engagementRate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('stats', args)
  },
})

// Get stats by user and community
export const getStatsByUserAndCommunity = query({
  args: {
    userId: v.id('users'),
    communityId: v.id('communities'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_user_community', (q) => q.eq('userId', args.userId).eq('communityId', args.communityId))
      .collect()
  },
})

// Get all stats for user
export const getUserStats = query({
  args: {userId: v.id('users')},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect()
  },
})

// Get stats by ID
export const getStatsById = query({
  args: {id: v.id('stats')},
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get recent stats for user and community (for caching)
export const getRecentStatsForUserAndCommunity = query({
  args: {
    userId: v.id('users'),
    communityId: v.id('communities'),
    since: v.number(), // timestamp in milliseconds
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_user_community', (q) => q.eq('userId', args.userId).eq('communityId', args.communityId))
      .filter((q) => q.gte(q.field('_creationTime'), args.since))
      .order('desc') // most recent first
      .take(1) // only need the most recent
  },
})

// Helper function to populate user data
function populateUser(user: Doc<'users'> | null) {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
  }
}

// Helper function to populate community data
function populateCommunity(community: Doc<'communities'> | null) {
  if (!community) return null
  return {
    name: community.name,
    username: community.username,
    slug: community.slug,
    avatar: community.avatar,
    hashtag: community.hashtag,
  }
}

// Get all stats with populated user and community data
export const getAllStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query('stats').order('desc').collect()

    return Promise.all(
      stats.map(async (stat) => ({
        ...stat,
        user: populateUser(await ctx.db.get(stat.userId)),
        community: populateCommunity(await ctx.db.get(stat.communityId)),
      })),
    )
  },
})
