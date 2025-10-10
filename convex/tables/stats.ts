import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

// Save or update interaction stats between two X accounts
export const upsertInteractionStats = mutation({
  args: {
    // Account being analyzed (e.g., "@bozzhik")
    analyzedAccount: v.object({
      username: v.string(),
      name: v.string(),
      profileImage: v.optional(v.string()),
      id: v.optional(v.string()),
    }),

    // Target account for interaction analysis (e.g., "@sui")
    targetAccount: v.object({
      username: v.string(),
      name: v.string(),
      profileImage: v.optional(v.string()),
    }),

    // Interaction metrics between analyzed and target accounts
    interactions: v.object({
      tweetsCount: v.number(),
      repliesCount: v.number(),
      likesCount: v.number(),
      retweetsCount: v.number(),
      quotesCount: v.number(),
      mentionsCount: v.number(),
      impressions: v.optional(v.number()),
      engagement: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if interaction stats already exist for this pair
    const existingStats = await ctx.db
      .query('stats')
      .withIndex('by_analyzed_and_target', (q) => q.eq('analyzedAccount.username', args.analyzedAccount.username).eq('targetAccount.username', args.targetAccount.username))
      .first()

    if (existingStats) {
      // Update existing interaction stats
      await ctx.db.patch(existingStats._id, {
        analyzedAccount: args.analyzedAccount,
        targetAccount: args.targetAccount,
        interactions: args.interactions,
        collectedAt: now,
      })
      return existingStats._id
    } else {
      // Create new interaction stats entry
      const statsId = await ctx.db.insert('stats', {
        analyzedAccount: args.analyzedAccount,
        targetAccount: args.targetAccount,
        interactions: args.interactions,
        collectedAt: now,
      })
      return statsId
    }
  },
})

// Get interaction stats for a specific analyzed account with a target
export const getInteractionStats = query({
  args: {
    analyzedUsername: v.string(), // @username of account being analyzed
    targetUsername: v.string(), // @username of target account
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_analyzed_and_target', (q) => q.eq('analyzedAccount.username', args.analyzedUsername).eq('targetAccount.username', args.targetUsername))
      .first()
  },
})

// Get all interaction stats for a specific analyzed account (all targets)
export const getAllInteractionStatsForAnalyzed = query({
  args: {
    analyzedUsername: v.string(), // @username of account being analyzed
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_analyzed_account', (q) => q.eq('analyzedAccount.username', args.analyzedUsername))
      .collect()
  },
})

// Get all interaction stats for a specific target account (all analyzers)
export const getAllInteractionStatsForTarget = query({
  args: {
    targetUsername: v.string(), // @username of target account
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_target_account', (q) => q.eq('targetAccount.username', args.targetUsername))
      .collect()
  },
})

// Get recent stats (last N entries)
export const getRecentStats = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    return await ctx.db.query('stats').withIndex('by_collected_at').order('desc').take(limit)
  },
})

// Get unique analyzed account handles (for basic listing)
export const getUniqueAnalyzedAccountUsernames = query({
  handler: async (ctx) => {
    const allStats = await ctx.db.query('stats').collect()
    const analyzedUsernames = new Set<string>()

    for (const stat of allStats) {
      analyzedUsernames.add(stat.analyzedAccount.username)
    }

    return Array.from(analyzedUsernames).sort()
  },
})

// Get unique target account handles (for basic listing)
export const getUniqueTargetAccountUsernames = query({
  handler: async (ctx) => {
    const allStats = await ctx.db.query('stats').collect()
    const targetUsernames = new Set<string>()

    for (const stat of allStats) {
      targetUsernames.add(stat.targetAccount.username)
    }

    return Array.from(targetUsernames).sort()
  },
})
