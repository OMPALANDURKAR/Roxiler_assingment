import React, { useState } from "react";
import { useParams } from "react-router-dom";

function RateStore() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const token = localStorage.getItem("token");

  const submitRating = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/stores/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Rating submitted!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Rate Store</h2>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <button onClick={submitRating}>Submit</button>
    </div>
  );
}

export default RateStore;
