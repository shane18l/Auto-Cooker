import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import the CSS file
import Navbar from './Navbar'

function HomePage() {
  return (
    <>
        <div className="home-container">
            <Navbar />
            <div className="content">
                <h1>Welcome to Recipe Recommender</h1>
                <p>Let us help you decide what to cook based on your ingredients!</p>
            </div>
        </div>
        
        <div className="info-section">
            <section>
                <h2>How It Works</h2>
                <p>Tell us what's in your fridge. We'll do the rest.</p>
            </section>
            <section>
                <h2>Featured Recipes</h2>
                <p>Popular picks from this week.</p>
                <img src="https://source.unsplash.com/600x300/?food" alt="Food" />
            </section>
            <section>
                <h2>About Us</h2>
                <p>We’re students using AI to reduce food waste. 💡</p>
            </section>

         
            
        </div>
        <footer className="footer">
            <p>© 2025 RecipeRec. All rights reserved.</p>
            <p><a href="#">About Us</a> | <a href="#">Contact</a></p>
        </footer>
  </>
  );
   
    
}

export default HomePage;