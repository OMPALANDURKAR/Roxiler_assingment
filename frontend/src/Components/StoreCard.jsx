import React, { useState } from "react";
import "../App.css";

export default function StoreCard({ name, category, location, hours, rating }) {
  const [userRating, setUserRating] = useState(rating);

  return (
    <div className="store-card glow-effect">
      <h3>{name}</h3>
      <p>
        <strong>Category:</strong> {category}
      </p>
      <p>
        <strong>Location:</strong> {location}
      </p>
      <p>
        <strong>Hours:</strong> {hours}
      </p>

      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= userRating ? "active" : ""}`}
            onClick={() => setUserRating(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
