# Development Brief

## Goal

Build **x-stats** — a website where users can enter their X username and receive a statistics card relative to specific community.

The service provides rental services for communities. For example:

- Pudgy Penguins community can rent the service to allow their users to generate stats cards relative to @pudgypenguins (username), #PENGU (hashtag), $PENGU (cashtag)
- Multiple usernames/hashtags/cashtags can be configured per community
- Each community gets their own branded version of the site

## Audience

- Initially: NFT communities that want to provide engagement tracking for their members
- Later: Any communities or projects that want to showcase member engagement with their accounts/tags

## User flow

- User opens the community-branded site
- Enters their X handle in a single input field
- System fetches data about their interactions with the community's configured usernames/hashtags/cashtags
- A Stats Card is generated with metrics and displayed
- User can preview the card and see a history of their generated cards

## Data and metrics

- Tweets involving target account or tags
- Tweets data (replies, quotes, retweets, likes, bookmarks)
- Manual calculation of engagement and impressions based on all tweets data
- Basic profile data: avatar, handle, followers

## Database entities

**Three main entities to store:**

### 1. Users - people who request statistics

- `id` - X id
- `username` - X username
- `name` - display name from X profile
- `avatar` - profile picture from X
- `followersCount` - number of followers
- `requestCount` - number of requested stats
- `lastActivity` - when user last requested stats

### 2. Communities - usernames + hashtags + cashtags that communities rent access to

- `name` - human-readable name (Pudgy Penguins)
- `branding` – brand platform ({colors: [#000000, #CCCCCC, #4F3342], others: ...})
- `slug` - URL-friendly identifier (pengu)

- `id` - X id
- `username` - X username to track (pudgypenguins)
- `avatar` - profile picture from X
- `hashtag` - hashtags to track (#PENGU)
- `cashtag` - cashtags to track ($PENGU)

- `isActive` - whether community is active

### 3. Stats - the generated statistics data

- `userId` - reference to users table
- `communityId` - reference to communities table

**Raw Metrics (grouped in `raw` object):**

- `raw.tweets` - total tweets involving community targets
- `raw.views` - total views across all tweets (search)
- `raw.replies` - total replies across all tweets (search)
- `raw.retweets` - total retweets across all tweets (search)
- `raw.likes` - total likes across all tweets (search)
- `raw.quotes` - total quote tweets across all tweets (search)
- `raw.bookmarks` - total bookmarks across all tweets (search)

**Calculated Metrics (grouped in `calculated` object):**

- `calculated.impressions` - total views across all analyzed tweets (sum of `raw.views`)
- `calculated.engagement` - weighted engagement score using all raw metrics: `(raw.replies × 3) + (raw.quotes × 3) + (raw.retweets × 1) + (raw.likes × 0.5) + (raw.bookmarks × 1)`

## Functional scope

**Basic functionality (MVP):**

- Input field for user X handle
- Fetch data from X API for interactions with target usernames/hashtags/cashtags
- Aggregate and calculate engagement metrics
- Store all entities in Convex database
- Preview screen for the generated card
- Generate a Stats Card (PNG/SVG) with profile info and metrics
- Export/share options for embedding cards externally
- History screen showing previous generated cards for the same user

**Additional functionality (later):**

- Community branding customization (logo, background, colors, themes)
- Multi-user dashboard with saved configurations
- Analytics dashboard for community managers
- API access for communities to integrate stats into their platforms
