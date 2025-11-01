import {mutation, query} from '@convex/_generated/server'
import {v} from 'convex/values'

// Save new interaction stats between two X accounts (creates new entry each time)
export const createInteractionStats = mutation({
  args: {
    // Subject account being analyzed (e.g., "@bozzhik")
    subject: v.object({
      username: v.string(),
      name: v.string(),
      profileImage: v.optional(v.string()),
      id: v.string(),
    }),

    // Reference account for interaction analysis (e.g., "@sui")
    reference: v.object({
      username: v.string(),
      name: v.string(),
      profileImage: v.optional(v.string()),
    }),

    // Interaction metrics between analyzed and target accounts
    interactions: v.object({
      tweetsCount: v.number(),
      repliesCount: v.number(),
      quotesCount: v.number(),
      likesCount: v.number(),
      retweetsCount: v.number(),
      mentionsCount: v.number(),
      impressions: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Always create new interaction stats entry (history of all generations)
    const statsId = await ctx.db.insert('stats', {
      subject: args.subject,
      reference: args.reference,
      interactions: args.interactions,
      collectedAt: now,
    })
    return statsId
  },
})

// Note: upsertInteractionStats removed - using createInteractionStats for history tracking

// Get interaction stats for a specific subject account with a reference
export const getInteractionStats = query({
  args: {
    subjectUsername: v.string(), // @username of subject account
    referenceUsername: v.string(), // @username of reference account
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_subject_and_reference', (q) => q.eq('subject.username', args.subjectUsername).eq('reference.username', args.referenceUsername))
      .first()
  },
})

// Get all interaction stats for a specific subject account (all references)
export const getAllInteractionStatsForSubject = query({
  args: {
    subjectUsername: v.string(), // @username of subject account
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_subject', (q) => q.eq('subject.username', args.subjectUsername))
      .collect()
  },
})

// Get all interaction stats for a specific reference account (all subjects)
export const getAllInteractionStatsForReference = query({
  args: {
    referenceUsername: v.string(), // @username of reference account
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('stats')
      .withIndex('by_reference', (q) => q.eq('reference.username', args.referenceUsername))
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

// Note: getUnique* functions removed - inefficient queries, can be added later if needed
