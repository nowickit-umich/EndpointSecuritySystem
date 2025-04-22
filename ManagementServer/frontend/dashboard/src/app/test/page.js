'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
    const [testData, setTestData] = useState(null);
    const [dbData, setDbData] = useState(null);

    // used to show loading status while waiting for data from the backend
    const [loading, setLoading] = useState(true);

    // call the nextjs api route /api/test from the client
    // which causes the nextjs server to connect to the backend api
    // allowing the client to access the backend api 
    // through the authenticated session with the nextjs server 
    // (backend only sees request from nextjs server)   
    // https://nextjs.org/docs/pages/building-your-application/routing/api-routes
    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/api/test");
            const testData = await res.json();
            setTestData(testData);
            const res1 = await fetch("/api/dbtest");
            const dbData = await res1.json();
            setDbData(dbData);
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div>
            <br></br>
            <h1>API TEST</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                <h1>Data from API test Route</h1>
                <p>{JSON.stringify(testData, null, 2)}</p>
                <h1>Data from API dbtest Route</h1>
                <p>{JSON.stringify(dbData, null, 2)}</p>
                </div>
            )}
        </div>
    );
}
