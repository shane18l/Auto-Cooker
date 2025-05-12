import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  let username = '';
  let isValidToken = false;

  if (token) {
    try {
      const user = jwtDecode(token);
      username = user.email?.split('@')[0] ?? user.sub ?? 'User';
      isValidToken = true; // Valid token, so update this flag
    } catch (e) {
      console.error("Invalid token:", e.message);
      sessionStorage.removeItem('token');  // Remove invalid token
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate('/auth'); 
  };

  return (
    <nav className="navbar">
      <h2>Recipe Recommender</h2>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/fav_recipes">My Recipes</Link>
        <Link to="/ingredients">Fridge</Link>
        {isValidToken ? (
          <div className="navbar-user">
            <span className="navbar-username">Hello, {username}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <>
            <Link to="/auth">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;