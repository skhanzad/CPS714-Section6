# User Guide — Gamification

This guide documents the gamification data model, how Drizzle is used, the exported methods in `src/database/queries/gamification.ts`, where those methods are consumed by pages, API routes and components in the app.

---

## 1) Schema overview (tables)

All tables live in `src/database/schema.ts` and are defined using `drizzle-orm/pg-core` helpers.

### General Tables

- `users`
  - `id: uuid` (PK)
  - `first_name`, `last_name`, `email`, `student_id`, `password`
  - `permission_level: smallint` — controls admin/department permissions

- `events`
  - Minimal table with `id: uuid` (used to link credit transactions to events)

### Gamification Tables

- `rewards_profile` (rewardsProfilesTable)
  - `id: uuid` (PK)
  - `user_id: uuid` — FK -> `users.id`
  - `earned_credits: integer` — lifetime earned points
  - `current_credits: integer` — current balance

- `credit_transactions`
  - `id: uuid` (PK)
  - `profile_id: uuid` — FK -> `rewards_profile.id`
  - `event_id: uuid` — FK -> `events.id` (nullable)
  - `amount: integer` — positive for earned, negative for redemptions
  - `received_at: timestamp` — when the transaction occurred

- `rewards`
  - `id: uuid` (PK)
  - `item: text`, `description`, `image_url`
  - `quantity: integer` — inventory count
  - `default_cost: integer`, `discount_cost: integer | null`
  - `listed_at: timestamp`

- `redeemed_rewards`
  - `id: uuid` (PK)
  - `user_id: uuid` — FK -> `users.id`
  - `reward_id: uuid` — FK -> `rewards.id`
  - `total_cost: integer`
  - `redeemed_at: timestamp`

These tables form the core of the gamification subsystem: `rewards_profile` tracks points, `credit_transactions` records deposits/withdrawals, `rewards` hold redeemable items, and `redeemed_rewards` stores redemption history.

---

## 2) How Drizzle is used in this project

- `src/database/connection.ts` creates the database client:

  - It uses `drizzle-orm/node-postgres` with a `PoolConfig` (loaded from environment variables) and exports a `db` instance.

- `src/database/schema.ts` defines tables using `pgTable` and typed column helpers such as `uuid`, `text`, `integer`, and `timestamp`.

- Queries in `src/database/queries/gamification.ts` use the `db` instance and Drizzle query builder methods such as:
  - `db.select().from(...).where(...)`
  - `db.insert(...).values(...).returning()`
  - `db.update(...).set(...).where(...)`
  - `db.transaction(async (tx) => { ... })` for atomic multi-step operations
  - `sql` template tag for arithmetic updates (e.g. `sql`${table.column} - ${value}``)

Because the schema and queries are strongly typed via Drizzle, most operations return typed rows and benefit from editor auto-completion.

---

## 3) Gamification methods (`src/database/queries/gamification.ts`)

Below are the primary backend exported functions and what they do. In general, these functions provide the data and data operations for the frontend components.

- `getRewardsProfile(userId: string)`
  - Returns an array of reward profile rows for the given user (usually 0 or 1 row).
  - Used to determine `currentCredits` and `earnedCredits` for a user.

- `addCredits(profileId: string, amount: number, eventId: string)`
  - Performs a credits-adding operation by incrementing `currentCredits` and `earnedCredits` atomically inside a transaction.
  - Throws if `amount <= 0`.

- `redeemReward(rewardId: string, profileId: string, quantity: number)`
  - Performs an atomic redemption flow inside a transaction:
    1. Loads the `rewards` row and checks inventory.
    2. Computes unit cost (prefers `discountCost` if present)
    3. Checks that `rewards_profile.currentCredits` is sufficient for the total cost
    4. Decrements `rewards.quantity`
    5. Inserts a negative `credit_transactions` record
    6. Decrements `rewards_profile.currentCredits`
    7. Inserts a `redeemed_rewards` row
  - Returns a structured result object: `{ success: true }` on success, or `{ success: false, error: '<reason>' }` where `error` can be:
    - `unavailable` — reward not found or insufficient inventory
    - `insufficient` — profile doesn't have enough credits
    - `invalid_quantity` — quantity <= 0 (the function returns this early)
    - `unknown` — any other unexpected case

- `listAvailableRewards()`
  - Returns rewards where `quantity > 0`.

- `listRewards()`
  - Lists all rewards ordered by `listedAt` descending.

- `createReward(input)`
  - Inserts a new `rewards` row and returns the created reward.

- `listRedeemedRewards(userID: string)`
  - Returns redeemed rewards for a user joined with reward details (item, description, imageUrl), ordered by `redeemedAt DESC`.

- `listLeaderboardByN(N: number)`
  - Returns the top N users by `earnedCredits` (joins `rewards_profile` with `users` and includes `points` and `currentCredits`).

All methods use Drizzle query helpers and are designed to be safe for server-side use.

---

## 4) API routes and `RewardsCatalogClient`

This section focuses on the server API surface for gamification (rewards) and the client-side catalog component that talks to it. See Section 5 for details on the pages that wire these pieces together.

- `POST /api/rewards/redeem` (`src/app/api/rewards/redeem/route.ts`)
  - Authenticated endpoint. Payload: `{ rewardId: string, quantity?: number }` (defaults to 1).
  - Server flow:
    1. Identify current user via `getCurrentUser()` (reads auth cookie/session).
    2. Look up the user's rewards profile via `getRewardsProfile(user.id)`.
    3. Call `redeemReward(rewardId, profile.id, quantity)` (transactional).
    4. Map `redeemReward` results into HTTP responses: success (200), client errors (400/404), or server errors (500).

- `POST /api/rewards/create` (`src/app/api/rewards/create/route.ts`)
  - Admin-only endpoint that validates the request body and calls `createReward(...)` to insert a new reward.

- `RewardsCatalogClient` (`src/app/rewards/RewardsCatalogClient.tsx`)
  - Client UI responsible for rendering a list of rewards and allowing users to redeem or (for admins) create rewards.
  - It receives prepared reward data and profile info from `src/app/rewards/page.tsx` (server component) and performs client-side interactions:
    - On redeem: `fetch('/api/rewards/redeem', { method: 'POST', body: JSON.stringify({ rewardId, quantity }) })` and handles the structured JSON response. It updates local UI state (points, messages) and triggers a `router.refresh()` on success.
    - On create (admin): `fetch('/api/rewards/create', ...)` with the new reward payload.
  - Notes: the client relies on same-origin cookies for authentication and expects the server APIs to return `{ ok: true }` or `{ ok: false, error: '...' }` with appropriate status codes.

## 5) Front-end components (pages)

This section describes the top-level pages built by the gamification team and how they consume the server APIs and Drizzle-backed methods. These pages are server components (Next.js App Router) that prepare data for client components where applicable.

- `src/app/rewards/page.tsx` (Rewards Catalog)
  - Server component that:
    - Calls `getCurrentUser()` to identify the visitor.
    - Loads the user's rewards profile with `getRewardsProfile(user.id)` (when authenticated).
    - Calls `listRewards()` to fetch reward rows.
    - Normalizes `listedAt` to ISO strings and passes props into `RewardsCatalogClient`.
  - The `RewardsCatalogClient` (see Section 4) handles user interactions (redeem/create) and calls the API routes described above.

- `src/app/my-rewards/page.tsx` (My Redeemed Rewards)
  - Server component that:
    - Calls `getCurrentUser()` and, if authenticated, `listRedeemedRewards(user.id)`.
    - Renders a read-only history of the user's redemptions (item, description, redeemedAt, totalCost).
  - This page depends on the `redeemed_rewards` table and the `listRedeemedRewards` query.

- `src/app/leaderboard/page.tsx` (Leaderboard)
  - Server component that:
    - Calls `listLeaderboardByN(MAX_ROWS)` to obtain the top users by accumulated points and current balance.
    - Formats rows and renders an accessible table of rank, name, total points, and current balance.
  - This page depends on the `rewards_profile` table and the `listLeaderboardByN` query.

Notes on coordination between components and APIs:

- Pages call server-side query helpers directly (Drizzle) to prepare data for the client; client components call the server API routes for mutating actions (redeem/create). This keeps mutating code on the server where transactions and auth checks can run safely.
- If you add new front-end features (e.g., quantity selection, filtering), prefer to add server-side helpers for business logic (so client code only sends minimal payloads and receives structured error responses).

---

Created on: November 23, 2025
