import {defineSchema, defineTable} from 'convex/server'
import {v} from 'convex/values'

export default defineSchema({
  users: defineTable({
    // X user data
    id: v.string(), // X internal user ID
    username: v.string(), // Username without @ (e.g., "bozzhik")
    name: v.string(), // Display name
    avatar: v.optional(v.string()), // Profile image URL
    followerCount: v.number(), // Number of followers

    // Request tracking
    requestCount: v.number(), // Number of times stats were requested

    // Metadata
    createdAt: v.number(), // When user was first added to our system
    updatedAt: v.number(), // When user data was last updated
  })
    .index('by_username', ['username'])
    .index('by_updated_at', ['updatedAt']),

  stats: defineTable({
    // Account being analyzed (e.g., "@bozzhik")
    subject: v.object({
      username: v.string(), // @username of the account being analyzed
      name: v.string(), // Display name of analyzed account
      profileImage: v.optional(v.string()), // Profile image URL
      id: v.string(), // X internal user ID
    }),

    // Account for interaction analysis (e.g., "@sui")
    reference: v.object({
      username: v.string(), // @username of the target account
      name: v.string(), // Display name of target account
      profileImage: v.optional(v.string()), // Profile image URL
    }),

    // Interaction metrics between analyzed and target accounts
    interactions: v.object({
      tweetsCount: v.number(), // Number of tweets (for total posts calculation)
      repliesCount: v.number(), // Number of replies (for total posts calculation)
      quotesCount: v.number(), // Number of quotes (for total posts calculation)
      likesCount: v.number(), // Number of likes (for engagement calculation)
      retweetsCount: v.number(), // Number of retweets (for engagement calculation)
      mentionsCount: v.number(), // Number of mentions of target account
      impressions: v.optional(v.number()), // Total impressions (if available)
    }),

    // Collection metadata
    collectedAt: v.number(), // When data was collected
  })
    .index('by_subject', ['subject.username'])
    .index('by_reference', ['reference.username'])
    .index('by_subject_and_reference', ['subject.username', 'reference.username'])
    .index('by_collected_at', ['collectedAt']),
})
