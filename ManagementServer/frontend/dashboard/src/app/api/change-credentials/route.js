import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch('http://backend:5001/change-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newUsername: body.newUsername,
        newPassword: body.newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to change credentials' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Credentials changed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Change credentials error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 