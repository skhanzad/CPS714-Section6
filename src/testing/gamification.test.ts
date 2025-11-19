import { describe, it, expect, vi } from "vitest";

// Shared variable that each test will set to the desired mock return value.
let mockResult: any = null;

// Create a chainable, thenable object similar to Drizzle's query builder.
const makeChain = (result: any) => {
  const chain: any = {
    from: () => chain,
    leftJoin: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    where: () => chain,
    // make the chain awaitable: awaiting the chain resolves to `result`
    then: (onFulfilled: any) => Promise.resolve(result).then(onFulfilled),
  };
  return chain;
};

// Mock the connection module so imports of `db.select()` return our chain.
vi.mock("../database/connection", () => ({
  db: {
    select: (..._args: any[]) => makeChain(mockResult),
  },
}));

describe("gamification queries", () => {
  it("listAvailableRewards returns rewards", async () => {
    vi.resetModules();
    mockResult = [
      {
        id: "1111-uuid",
        item: "Sticker",
        description: "A sticker",
        image_url: null,
        quantity: 10,
        default_cost: 5,
        discount_cost: null,
        listed_at: new Date().toISOString(),
      },
    ];

    const { listAvailableRewards } = await import("../database/queries/gamification");
    const res = await listAvailableRewards();
    expect(res).toEqual(mockResult);
  });

  it("listRedeemedRewards returns redeemed rewards for a user", async () => {
    vi.resetModules();
    mockResult = [
      {
        id: "r1",
        userId: "u1",
        rewardId: "rew1",
        totalCost: 20,
        redeemedAt: new Date().toISOString(),
        item: "Badge",
        description: "A cool badge",
        imageUrl: null,
      },
    ];

    const { listRedeemedRewards } = await import("../database/queries/gamification");
    const res = await listRedeemedRewards("u1");
    expect(res).toEqual(mockResult);
  });

  it("listLeaderboardByN returns top N users", async () => {
    vi.resetModules();
    mockResult = [
      {
        userId: "u1",
        firstName: "Alice",
        lastName: "Barnett",
        points: 150,
      },
    ];

    const { listLeaderboardByN } = await import("../database/queries/gamification");
    const res = await listLeaderboardByN(1);
    expect(res).toEqual(mockResult);
  });
});
