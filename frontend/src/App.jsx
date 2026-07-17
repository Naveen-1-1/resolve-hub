import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

function App() {
  const [listings, setListings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setListings)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!listings) return <p>Loading...</p>;

  return (
    <Container>
      <h1>Listings ({listings.length})</h1>
      <pre>{JSON.stringify(listings, null, 2)}</pre>
    </Container>
  );
}

export default App;
