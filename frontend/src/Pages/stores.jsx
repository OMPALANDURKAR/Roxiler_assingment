import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Stores() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stores")
      .then((res) => res.json())
      .then((d) => setStores(d))
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div>
      <h2>Stores</h2>
      {stores.length === 0 ? (
        <p>No stores available. Ask admin to add one!</p>
      ) : (
        stores.map((s) => (
          <div key={s.id}>
            <h3>{s.name}</h3>
            <p>{s.address}</p>
            <p>Average Rating: {s.avg_rating} ({s.total_ratings} ratings)</p>
            <Link to={`/rate/${s.id}`}>Rate this store</Link>
          </div>
        ))
      )}
    </div>
  );
}

export default Stores;
