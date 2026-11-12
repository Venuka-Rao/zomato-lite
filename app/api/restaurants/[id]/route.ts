import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurantId = Number(id);

  const restaurant = await sql`SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`;
  if (restaurant.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const countResult = await sql`SELECT COUNT(*)::int AS total FROM reviews WHERE restaurant_id = ${restaurantId}`;
  const totalReviews = countResult[0]?.total ?? 0;

  const avgResult = await sql`SELECT ROUND(AVG(rating), 1) AS average_rating FROM reviews WHERE restaurant_id = ${restaurantId}`;
  const averageRating = avgResult[0]?.average_rating != null ? Number(avgResult[0].average_rating) : null;

  const latest = await sql`SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = ${restaurantId} ORDER BY created_at DESC LIMIT 1`;
  const latestReview = latest[0]
    ? { id: latest[0].id, rating: latest[0].rating, comment: latest[0].comment, createdAt: latest[0].created_at }
    : null;

  const reviews = latest[0]
    ? await sql`SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = ${restaurantId} AND id <> ${latest[0].id} ORDER BY created_at DESC`
    : [];

  const reviewsData = reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.created_at }));

  return NextResponse.json({
    name: restaurant[0].name,
    cuisine: restaurant[0].cuisine,
    area: restaurant[0].area,
    averageRating,
    totalReviews,
    latestReview,
    reviews: reviewsData,
  });
}
