// use the api route to send requests from the frontend server
// this prevents CORS error due to the api request being sent by the client(web browser)

import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const response = await fetch("http://backend:5001/dbtest");
        const data = await response.json();
        
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
