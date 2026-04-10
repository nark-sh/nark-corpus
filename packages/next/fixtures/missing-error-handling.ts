import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json({ data });
}
