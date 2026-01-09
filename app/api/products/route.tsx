import { NextResponse } from "next/server";

export async function GET() {
  const products = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    photo: `/images/temp/${(i % 3) + 1}.jpg`,
    name: `Product ${i + 1}`,
    description: "This is a temporary product from mock backend.",
    amount: (20 + (i % 10)).toFixed(2),
  }));

  return NextResponse.json(products);
}


