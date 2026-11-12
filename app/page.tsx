"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LatestReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: LatestReview | null;
  reviews: Review[];
}

export default function Home() {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/restaurants/1");
        const data = (await res.json()) as Partial<RestaurantData> & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Failed to load restaurant.");
          return;
        }
        if (!cancelled) setRestaurant(data as RestaurantData);
      } catch {
        if (!cancelled) setError("Failed to load restaurant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-lg">Loading restaurant…</p>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-lg text-red-600">{error ?? "Restaurant not found."}</p>
      </main>
    );
  }

  const averageRating = restaurant.averageRating;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {restaurant.cuisine} · {restaurant.area}
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-5xl font-bold text-gray-900">
            {averageRating !== null ? averageRating.toFixed(1) : "N/A"}
          </span>
          <div>
            <div className="text-2xl" aria-label={`Rated ${averageRating ?? 0} out of 5`}>
              <span className="text-amber-500">{"★".repeat(Math.max(0, Math.round(averageRating ?? 0)))}</span>{" "}
              <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - Math.round(averageRating ?? 0)))}</span>
            </div>
            <p className="mt-2 text-gray-700">
              {restaurant.totalReviews} {restaurant.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </section>

      {restaurant.latestReview && (
        <section className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold">Latest Review</h2>
          <p className="mt-2 text-lg text-gray-900">{restaurant.latestReview.comment}</p>
          <p className="mt-1 text-sm text-gray-700">
            <span className="text-amber-500">{"★".repeat(restaurant.latestReview.rating)}</span> · {restaurant.latestReview.rating}/5 ·{" "}
            {new Date(restaurant.latestReview.createdAt).toLocaleDateString()}
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {restaurant.reviews.length === 0 ? (
          <p className="mt-2 text-gray-600">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {restaurant.reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-500">{"★".repeat(r.rating)}</span>
                  <time className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</time>
                </div>
                <p className="mt-2 text-gray-900">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10">
        <Link
          href="/review"
          className="inline-block rounded-full bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-md hover:bg-amber-600"
        >
          Write a Review
        </Link>
      </div>
    </main>
  );
}
