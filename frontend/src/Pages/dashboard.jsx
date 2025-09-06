import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState({});
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (role === "admin") {
      fetch("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch((err) => console.error("API error:", err));
    }
  }, [role, token]);

  return (
    <div>
      <h2>Dashboard ({role})</h2>

      {role === "admin" && (
        <div>
          <p>Total Users: {data.total_users}</p>
          <p>Total Stores: {data.total_stores}</p>
          <p>Total Ratings: {data.total_ratings}</p>
        </div>
      )}

      {role === "user" && <p>Welcome User! You can rate stores.</p>}
      {role === "store_owner" && <p>Welcome Store Owner! You can view your store ratings.</p>}
    </div>
  );
}

export default Dashboard;
