import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

// Create community
export const createCommunity = mutation({
  args: {
    name: v.string(),
    branding: v.any(),
    slug: v.string(),
    id: v.string(),
    username: v.string(),
    avatar: v.string(),
    hashtag: v.string(),
    cashtag: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('communities', args)
  },
})

// Get community by slug
export const getCommunityBySlug = query({
  args: {slug: v.string()},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('communities')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
  },
})

// Get all active communities
export const getActiveCommunities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('communities')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()
  },
})

// Get community by ID
export const getCommunityById = query({
  args: {id: v.id('communities')},
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get all communities
export const getAllCommunities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('communities').order('desc').collect()
  },
})
