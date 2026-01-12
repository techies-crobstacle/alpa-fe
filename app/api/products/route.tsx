import { NextResponse } from "next/server";

const BRANDS = ["Nike", "Adidas", "Zara", "Puma"];
const CATEGORIES = ["T-Shirt", "Shirt", "SweatShirt", "Hoodies"];
const GENDERS = ["Male", "Female"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 9;

  const ALL_PRODUCTS = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    brand: BRANDS[i % BRANDS.length],
    category: CATEGORIES[i % CATEGORIES.length],
    gender: GENDERS[i % GENDERS.length],
    photo: `/images/temp/${(i % 18) + 1}.jpg`,
    name: `${BRANDS[i % BRANDS.length]} Product ${i + 1}`,
    description: "Mock backend product",
    amount: (20 + (i % 10)).toFixed(2),
  }));

  const start = (page - 1) * limit;
  const end = start + limit;

  return NextResponse.json({
    data: ALL_PRODUCTS.slice(start, end),
    total: ALL_PRODUCTS.length,
    page,
    limit,
    totalPages: Math.ceil(ALL_PRODUCTS.length / limit),
  });
}
