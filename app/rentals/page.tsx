import RentalsView from "@/components/rentals-view";

async function fetchRentals() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
    
  const res = await fetch(`${baseUrl}/api/rentals`, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch rentals: ${res.status}`);
  }
  
  return res.json();
}

export default async function RentalsPage() {
  try {
    const data = await fetchRentals();
    return <RentalsView data={data} />;
  } catch (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Error Loading Rentals</h1>
        <p>Unable to load rental products. Please try again later.</p>
        <details>
          <summary>Error Details</summary>
          <pre>{String(error)}</pre>
        </details>
      </div>
    );
  }
}
