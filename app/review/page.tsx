"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReviewPage() {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    if (rating === null) {
      setError("Please select a star rating before submitting.");
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      setError("Please write a review comment.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: 1, rating, comment: trimmedComment }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.status === 201) {
        setStatus("success");
        setRating(null);
        setComment("");
      } else {
        setError(data.error ?? "Failed to submit review.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Write a Review</h1>
      <p className="mt-2 text-gray-600">Share your experience with Ludhiana Burrito.</p>

      {status === "success" && (
        <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-4">
          <p className="font-semibold text-green-700">Thank you! Your review was submitted.</p>
          <Link href="/" className="mt-3 inline-block text-amber-600 underline">
            Back to restaurant
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <fieldset>
          <legend className="text-lg font-semibold">Your rating</legend>
          <div className="mt-3 flex gap-2" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((i) => {
              const filled = rating !== null && i <= rating;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-pressed={rating === i}
                  aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                  className={`text-4xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded ${filled ? "text-amber-500" : "text-gray-400"}`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6">
          <label htmlFor="comment" className="block font-semibold">
            Your review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience?"
            className="mt-2 w-full rounded-xl border border-gray-300 p-3 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 rounded-full bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Submit Review"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6">
        <Link href="/" className="text-amber-600 underline">
          ← Back to restaurant
        </Link>
      </div>
    </main>
  );
}
