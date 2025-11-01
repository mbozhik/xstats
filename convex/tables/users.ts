import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

// Get user by username
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
  },
})

// Get or create user from Twitter API data
export const getOrCreateUser = mutation({
  args: {
    id: v.string(),
    username: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    followerCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    const now = Date.now()

    if (existingUser) {
      // Update existing user data
      await ctx.db.patch(existingUser._id, {
        id: args.id,
        name: args.name,
        avatar: args.avatar,
        followerCount: args.followerCount,
        requestCount: existingUser.requestCount + 1,
        updatedAt: now,
      })
      return existingUser._id
    } else {
      // Create new user
      const userId = await ctx.db.insert('users', {
        id: args.id,
        username: args.username,
        name: args.name,
        avatar: args.avatar,
        followerCount: args.followerCount,
        requestCount: 1,
        createdAt: now,
        updatedAt: now,
      })
      return userId
    }
  },
})

// Note: Request statistics are now updated in getOrCreateUser

// Get users ordered by most recently updated
export const getRecentUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20
    return await ctx.db.query('users').withIndex('by_updated_at').order('desc').take(limit)
  },
})

// Get user with stats count
export const getUserWithStatsCount = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    if (!user) {
      return null
    }

    // Get all stats for this user to calculate count and last date
    const stats = await ctx.db
      .query('stats')
      .withIndex('by_subject', (q) => q.eq('subject.username', args.username))
      .collect()

    return {
      user,
      totalStats: stats.length,
      lastStatsAt: stats.length > 0 ? Math.max(...stats.map((s) => s.collectedAt)) : null,
    }
  },
})
