import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let username = '';
  if (token) {
    console.log(jwtDecode(token));
    try {
      const user = jwtDecode(token);
      username = user.email?.split('@')[0] ?? user.sub ?? 'User';
    } catch (e) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth'); 
  };

  return (
    <nav className="navbar">
      <h2>Recipe Recommender</h2>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/fav_recipes">My Recipes</Link>
        <Link to="/ingredients">Fridge</Link>
        {token ? (
          <>
            <div className="navbar-user">
              <span className="navbar-username">Hello, {username}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/auth">Login</Link>
            <Link to="/auth">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;