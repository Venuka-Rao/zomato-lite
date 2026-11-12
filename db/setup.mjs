import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in the environment.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Create tables
await sql`CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  area TEXT NOT NULL
)`;

await sql`CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;

// Seed data
const [restaurant] = await sql`INSERT INTO restaurants (name, cuisine, area) VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32') RETURNING id`;
const restaurantId = restaurant.id;

await sql`INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES (${restaurantId}, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days')`;
await sql`INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES (${restaurantId}, 4, 'Good, but slow service', NOW() - INTERVAL '6 days')`;
await sql`INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES (${restaurantId}, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days')`;

console.log("Database schema created and seeded successfully.");
