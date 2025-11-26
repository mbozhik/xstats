import {mutation, query} from '../_generated/server'
import {v} from 'convex/values'

// Create or update user
export const upsertUser = mutation({
  args: {
    id: v.string(),
    username: v.string(),
    name: v.string(),
    avatar: v.string(),
    followersCount: v.number(),
    requestCount: v.number(),
    lastActivity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_x_id', (q) => q.eq('id', args.id))
      .unique()

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        username: args.username,
        name: args.name,
        avatar: args.avatar,
        followersCount: args.followersCount,
        requestCount: args.requestCount,
        lastActivity: args.lastActivity,
      })
      return existing._id
    } else {
      // Create new user
      return await ctx.db.insert('users', {
        id: args.id,
        username: args.username,
        name: args.name,
        avatar: args.avatar,
        followersCount: args.followersCount,
        requestCount: args.requestCount,
        lastActivity: args.lastActivity,
      })
    }
  },
})

// Get user by ID
export const getUserById = query({
  args: {id: v.string()},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_x_id', (q) => q.eq('id', args.id))
      .unique()
  },
})

// Get user by username
export const getUserByUsername = query({
  args: {username: v.string()},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique()
  },
})
