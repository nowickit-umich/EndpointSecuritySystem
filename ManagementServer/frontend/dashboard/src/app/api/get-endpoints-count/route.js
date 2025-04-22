import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://backend:5001/get-endpoints-count');
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to get endpoints count' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get endpoints count' },
      { status: 500 }
    );
  }
} 