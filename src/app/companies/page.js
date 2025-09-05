'use client';

import { useEffect, useState } from 'react';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/mongodb');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setCompanies(result.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Companies List</h1>
      <div className="grid gap-4">
        {companies.map((company, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <pre>{JSON.stringify(company, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}