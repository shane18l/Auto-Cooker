import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Navbar from './Navbar';

function HomePage() {
    const [recipes, setRecipes] = useState([]);
    const [recipeIndex, setRecipeIndex] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8000/featured")
            .then((res) => res.json())
            .then((data) => setRecipes(data))
            .catch((err) => console.error("Error fetching recipes:", err));
    }, []);

    const nextRecipe = () => {
        setRecipeIndex((prev) => (prev + 1) % recipes.length);
    };

    const prevRecipe = () => {
        setRecipeIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setSuggestion('');
    };

    return (
        <>
            <div className="home-container">
                <Navbar />
                <div className="content">
                    <h1>Welcome to Recipe Recommender</h1>
                    <p>Let us help you decide what to cook based on your ingredients!</p>
                </div>
                <div className="how-it-works-overlay">
                    <h2>How It Works</h2>
                    <p>Tell us what's in your fridge. We'll do the rest.</p>
                </div>
            </div>

            <div className="info-section">
                <section>
                    <h2>Featured Recipes</h2>
                    <p>Popular picks from this week.</p>
                    <div className="recipe-carousel">
                        <button onClick={prevRecipe}>←</button>
                        {recipes.length > 0 ? (
                            <div className="recipe-card">
                                <a href={recipes[recipeIndex].source_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={recipes[recipeIndex].image_url}
                                        alt={recipes[recipeIndex].recipe_title}
                                        className="recipe-image"
                                    />
                                </a>
                                <p className="recipe-title">{recipes[recipeIndex].recipe_title}</p>
                            </div>
                        ) : (
                            <p>Loading recipes...</p>
                        )}
                        <button onClick={nextRecipe}>→</button>
                    </div>
                </section>

                <section>
                    <h2>Suggestions</h2>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            placeholder="Got an idea to improve the site?"
                            rows="12"
                            cols="50"
                            required
                        />
                        <br />
                        <button type="submit">Submit</button>
                    </form>
                    {submitted && <p>Thanks for your suggestion! 🙌</p>}
                </section>
            </div>

            <section className="more-info">
                <section>
                    <div className="mission"> 
                        <h2>Our Mission</h2>
                        <p>We know deciding what to cook can sometimes be an added stress.<br />
                            So our job is to make cooking an easy and fun process!
                        </p>
                    </div>
                    <img src="/easy_cooking.jpg" alt="Our Mission" /> 
                </section>
            </section>

            <footer className="footer">
                <p>© 2025 RecipeRec. All rights reserved.</p>
            </footer>
        </>
    );
}

export default HomePage;