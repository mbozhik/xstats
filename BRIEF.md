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
