import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link> | 
      <Link to="/stores">Stores</Link> | 
      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="/">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;
