import { NextResponse } from "next/server";
import { Role } from "@/auth/User";
import { getCurrentUser } from "@/app/lib/getCurrentUser";
import { createReward } from "@/database/queries/gamification";

const isAdmin = (role?: Role) =>
  role === Role.DEPARTMENTADMIN || role === Role.SYSTEMADMIN;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json(
        { ok: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { item, description, imageUrl, quantity, defaultCost, discountCost } =
      body ?? {};

    if (!item || typeof item !== "string") {
      return NextResponse.json(
        { ok: false, error: "Item name is required" },
        { status: 400 }
      );
    }

    const qty = Number(quantity);
    const cost = Number(defaultCost);
    const discount =
      discountCost === undefined ||
      discountCost === null ||
      String(discountCost).trim() === ""
        ? null
        : Number(discountCost);

    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json(
        { ok: false, error: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(cost) || cost <= 0) {
      return NextResponse.json(
        { ok: false, error: "Default cost must be a positive integer" },
        { status: 400 }
      );
    }

    if (
      discount !== null &&
      (!Number.isInteger(discount) || discount <= 0 || discount > cost)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Discount cost must be a positive integer less than or equal to default cost",
        },
        { status: 400 }
      );
    }

    const reward = await createReward({
      item: item.trim(),
      description: description ? String(description) : null,
      imageUrl: imageUrl ? String(imageUrl) : null,
      quantity: qty,
      defaultCost: cost,
      discountCost: discount,
    });

    return NextResponse.json(
      { ok: true, data: reward, message: "Reward listed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Create reward error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create reward" },
      { status: 500 }
    );
  }
}
