import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Recipe Recommender</h2>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/ingredients">My Ingredients</Link>
        <Link to="/auth">Login</Link>
        <Link to="/auth">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;