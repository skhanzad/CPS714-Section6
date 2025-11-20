# Group 6 Technical Documentation

## Integration (User Manual)

The following lists available APIs for gamification integration.

### Rewards Profile

A rewards profile provides a high level summary of points collected over time. The profile `id` is required to preform other operations such as adding points.

**Type**: Server Side Function

**Location**: `src/database/queries/gamification.ts`

**API**: `getRewardsProfile(userId: string)`

- `userId`: User ID associated to the points profile.

**Returns**: Rewards Profile Object

```ts
interface RewardsProfile {
  id: string;
  userId: string;
  earnedCredits: number;
  currentCredits: number;
}
```

### Attendance Reward

A user must receive a defined amount of points when registering for an event. A server side function may be called to allocate points to a user's profile.

**Type**: Server Side Function

**Location**: `src/database/queries/gamification.ts`

**API**: `addCredits(profileId: string, amount: number, eventId: string)`

- `profileId` - Rewards profile ID
- `amount` - Points to receive (> 0)
- `eventId` - The associated `eventId` rewarding the user

### Point Redemption

A users points profile can be display to the user using the following component. The component also includes a redirect to the rewards page, allowing the user to redeem collected points.

**Type**: React Server Component

**Location**: `src/components/gamification/RewardsProfileCard.tsx`

**API**: `<RewardsProfileCard />`

**Side Effect**: When clicked the user will be redirect to the rewards page.

## Internal

Internal documentation of gamification (domain specific) APIs

## Server Operations

## Client Components & Functionality

## Pages
