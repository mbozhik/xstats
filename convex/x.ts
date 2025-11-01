import type {Doc} from '@convex/_generated/dataModel'
import {action} from '@convex/_generated/server'
import {api} from '@convex/_generated/api'
import {v} from 'convex/values'

// Import X API client
import {getUserByUsername, getUserTweetsAndReplies, analyzeInteractionsWithTarget} from './fetch_x_data'

// Generated types from schema (for database documents)
export type UsersTable = Doc<'users'>
export type StatsTable = Doc<'stats'>

export type UserData = Omit<UsersTable, '_id' | '_creationTime' | 'requestCount' | 'createdAt' | 'updatedAt'>
type InteractionsData = NonNullable<StatsTable['interactions']>
type SubjectAccount = NonNullable<StatsTable['subject']>

export type StatsCardData = {
  userData: UserData
  stats: {
    impressions: number
    posts: number
    engagement: number
  }
  referenceUsername: string
  generatedAt: number
}

// Get user data from X API
export const getUserData = action({
  args: {username: v.string()},
  handler: async (ctx, args): Promise<UserData> => {
    const data = await getUserByUsername(args.username)
    return {
      id: data.data.id,
      username: args.username,
      name: data.data.name,
      avatar: data.data.avatar || undefined,
      followerCount: data.data.followerCount || 0,
    }
  },
})

// Get user tweets and analyze interactions with target account
export const getUserInteractions = action({
  args: {userId: v.string(), targetUsername: v.string()},
  handler: async (ctx, args): Promise<InteractionsData> => {
    if (!args.userId?.trim()) {
      throw new Error('User ID is required')
    }

    const tweetsResponse = await getUserTweetsAndReplies(args.userId)
    const interactions = analyzeInteractionsWithTarget(tweetsResponse.data || [], args.targetUsername)

    return {
      ...interactions,
      impressions: undefined, // X API doesn't provide impressions
    }
  },
})

// Generate complete stats and card data for a user
export const generateUserStats = action({
  args: {username: v.string(), targetUsername: v.string()},
  handler: async (ctx, args): Promise<StatsCardData> => {
    if (!args.username?.trim()) {
      throw new Error('Username is required')
    }
    if (!args.targetUsername?.trim()) {
      throw new Error('Target username is required')
    }

    // Normalize usernames (remove @ if present)
    const username = args.username.replace(/^@/, '')
    const targetUsername = args.targetUsername.replace(/^@/, '')

    // Get user data
    const userData = await ctx.runAction(api.x.getUserData, {username})

    // Validate user data
    if (!userData.id || !userData.name) {
      throw new Error('Invalid user data received')
    }

    // Save user to database
    await ctx.runMutation(api.tables.users.getOrCreateUser, {
      id: userData.id,
      username: userData.username,
      name: userData.name,
      avatar: userData.avatar,
      followerCount: userData.followerCount,
    } as Omit<UsersTable, '_id' | 'requestCount' | 'createdAt' | 'updatedAt'>)

    // Get interactions
    const interactions = await ctx.runAction(api.x.getUserInteractions, {
      userId: userData.id,
      targetUsername,
    })

    // Prepare account data
    const subjectAccount: SubjectAccount = {
      username: userData.username,
      name: userData.name,
      profileImage: userData.avatar,
      id: userData.id,
    }

    const targetAccount = {
      username: targetUsername,
      name: targetUsername,
      profileImage: undefined,
    }

    // Save stats to database
    await ctx.runMutation(api.tables.stats.createInteractionStats, {
      subject: subjectAccount,
      reference: targetAccount,
      interactions,
    } as Omit<StatsTable, '_id' | 'collectedAt'>)

    // Calculate stats for card
    const totalPosts = interactions.tweetsCount + interactions.repliesCount + interactions.quotesCount
    const totalEngagements = interactions.likesCount + interactions.retweetsCount
    const engagement = totalPosts > 0 ? (totalEngagements / totalPosts) * 100 : 0

    // Return complete card data
    return {
      userData,
      stats: {
        impressions: interactions.impressions || 0,
        posts: totalPosts,
        engagement,
      },
      referenceUsername: targetUsername,
      generatedAt: Date.now(),
    }
  },
})
