import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      restaurantId?: number;
      rating?: number;
      comment?: string;
    };

    const { restaurantId, rating, comment } = body;

    // 1. Rating must be an integer between 1 and 5
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });
    }

    // 2. Comment must be a non-empty string after trimming whitespace
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json({ error: "Comment must be a non-empty string." }, { status: 400 });
    }

    // 3. restaurantId must refer to an existing restaurant
    const restaurant = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
    if (restaurant.length === 0) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 400 });
    }

    const review = await sql`INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES (${restaurantId}, ${rating}, ${comment.trim()}, NOW()) RETURNING id`;
    const reviewId = review[0].id;

    return NextResponse.json({ success: true, reviewId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
