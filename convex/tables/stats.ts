import {mutation, query} from '../_generated/server'
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
