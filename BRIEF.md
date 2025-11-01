# Development Brief

## Goal

Build **xstats** — an internal tool for SUI community (Turkish) that generates dynamic Stat Cards based on interactions with the SUI community (Turkish) account.  
The product should later be extendable so that any user can input a different handle and generate their own card.

## Audience

- Initially: SUI community (Turkish) team and members.
- Later: other projects or communities that want to showcase engagement with their accounts.

## User flow

- User opens the site.
- Enters their X (Twitter) handle in a single input field.
- System fetches data about their interactions with SUI community (Turkish).
- A Stat Card is generated with metrics and displayed.
- User can preview the card and see a history of their generated cards.

## Data and metrics

- Tweets and replies involving SUI community (Turkish).
- Engagements: likes, retweets, quotes.
- Impressions (if available).
- Basic profile data: avatar, handle, followers, following.

## Functional scope

**Basic functionality (MVP):**

- Input field for user handle (no authentication required at this stage).
- Fetch data from X API for interactions with SUI community (Turkish).
- Aggregate metrics (tweets, engagements, impressions if available).
- Generate a Stat Card (PNG/SVG) with profile info and metrics.
- Store results in Convex database.
- Preview screen for the generated card.
- History screen showing previous generated cards for the same user.

**Additional functionality (later):**

- Support for any target handle (not only SUI community (Turkish)).
- Branding customization (logo, background, colors).
- Scheduling auto-refresh (daily/weekly).
- Multi-user dashboard with saved configurations.
- Export/share options for embedding cards externally.

## UI Components and Design System

**Technology Stack:**

- Use shadcn/ui components from `@/components/ui/` for all UI elements
- All interface elements must be built using these components
- Ensure consistent styling and theming across the entire application

**Available UI Components:**

- alert-dialog
- alert
- avatar
- badge
- button-group
- button
- card
- collapsible
- command
- dialog
- drawer
- empty
- form
- hover-card
- input-group
- input
- item
- kbd
- label
- popover
- select
- separator
- skeleton
- sonner
- spinner
- table
- tabs
- textarea
- typography

## Plan for V1

### Database Schema Updates

- [х] Add `users` table to Convex schema with fields:
  - `id` (X user ID)
  - `username` (X handle without @)
  - `name` (display name)
  - `avatar` (profile image URL)
  - `requestCount` (number of times stats were requested)
  - `lastRequestedAt` (timestamp of last stats request)
  - `createdAt` (when user was first added)
  - `updatedAt` (when user data was last updated)

### Convex Functions

- [х] `getOrCreateUser` - get existing user or create new from Twitter API data
- [х] `updateUserRequestStats` - increment request count and update last requested timestamp
- [х] `getUserByUsername` - find user in database by username
- [х] Enhanced stats functions to link with users table

### Twitter API Integration

- [ ] Add Twitter API client using RapidAPI
- [ ] `getUserData(username)` - fetch basic user info from `/v3/user/by-username`
- [ ] `getUserInteractions(userId, targetUsername)` - fetch tweets/replies/engagements relative to target account
- [ ] Error handling for API limits and invalid users
- [ ] Data transformation to match our schema format

### UI Updates

- [ ] Update `generator-form.tsx` to:
  - Check if user exists in Convex on username input
  - Show user preview card with avatar, name, last scraped date
  - Show "not scraped yet" for new users
  - Enable/disable generate button based on user existence
- [ ] Add loading states for API calls
- [ ] Add error handling for invalid usernames

### Stats Generation Flow

- [ ] When "Generate" clicked:
  - Fetch fresh user data from Twitter API
  - Update/create user record in Convex
  - Fetch interaction data with target account (@SuiTrcommunity)
  - Calculate metrics (tweets, replies, likes, retweets, quotes, mentions)
  - Save new stats entry to Convex
  - Update user's request count and timestamp

### Additional Considerations

- [ ] Add rate limiting for Twitter API calls
- [ ] Cache user data to avoid unnecessary API calls
- [ ] Add proper error messages for API failures
- [ ] Consider adding target account selection (for future extensibility)
- [ ] Add data validation and sanitization
