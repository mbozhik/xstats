import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  stats: defineTable({
    // Account being analyzed (e.g., "@bozzhik")
    analyzedAccount: v.object({
      username: v.string(), // @username of the account being analyzed
      name: v.string(), // Display name of analyzed account
      profileImage: v.optional(v.string()), // Profile image URL
      id: v.optional(v.string()), // X internal user ID
    }),

    // Target account for interaction analysis (e.g., "@sui")
    targetAccount: v.object({
      username: v.string(), // @username of the target account
      name: v.string(), // Display name of target account
      profileImage: v.optional(v.string()), // Profile image URL
    }),

    // Interaction metrics between analyzed and target accounts
    interactions: v.object({
      tweetsCount: v.number(), // Number of tweets mentioning/interacting with target
      repliesCount: v.number(), // Number of replies to target account
      likesCount: v.number(), // Number of likes on target's content
      retweetsCount: v.number(), // Number of retweets of target's content
      quotesCount: v.number(), // Number of quote tweets mentioning target
      mentionsCount: v.number(), // Number of mentions of target account
      impressions: v.optional(v.number()), // Total impressions from interactions
      engagement: v.optional(v.number()), // Overall engagement score
    }),

    // Collection metadata
    collectedAt: v.number(), // When data was collected
  })
    .index('by_analyzed_account', ['analyzedAccount.username'])
    .index('by_target_account', ['targetAccount.username'])
    .index('by_analyzed_and_target', ['analyzedAccount.username', 'targetAccount.username'])
    .index('by_collected_at', ['collectedAt'])
    .index('by_pair_and_date', ['analyzedAccount.username', 'targetAccount.username', 'collectedAt']),
})
