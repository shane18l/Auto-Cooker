import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={styles.background}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Recipe Recommender</h2>
        <div>
          <Link to="/login" style={styles.navButton}>Login</Link>
          <Link to="/register" style={styles.navButton}>Register</Link>
        </div>
      </nav>
      <div style={styles.content}>
        <h1>Welcome to Recipe Recommender</h1>
        <p>Let us help you decide what to cook based on your ingredients!</p>
      </div>
    </div>
  );
}

const styles = {
  background: {
    backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836")', // Change to any image URL or local file
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 40px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  logo: {
    margin: 0,
  },
  navButton: {
    color: 'white',
    marginLeft: '20px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '8px 12px',
    border: '1px solid white',
    borderRadius: '5px',
  },
  content: {
    textAlign: 'center',
    marginTop: '20vh',
    padding: '0 20px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'inline-block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

export default HomePage;