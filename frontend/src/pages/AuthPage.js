import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import Navbar from './Navbar';
const API_URL = process.env.REACT_APP_API_URL;

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); 

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage(
          isRegistering
            ? `Succesfully registered: ${data.email}`
            : `Welcome back, ${data.email}!`
        );
        if (!isRegistering) {
            setTimeout(() => navigate('/'), 1000);
        }
      } else {
          if (data.detail === "Email already registered") {
          setMessage("This email is already tied to an account!");
        } else if (data.detail === "Invalid credentials") {
          setMessage("Invalid credentials");
        } else {
          setMessage("Something went wrong.");
        }
      }
    } catch (error) { 
      console.error('Error:', error);
      setMessage('Server error.');
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        {message && <p className="message">{message}</p>}

        <p className="toggle">
          {isRegistering ? 'Already have an account?' : 'New here?'}{' '}
          <span onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Login' : 'Register'}
          </span>
        </p>
      </form>
    </div>
  );
}

export default AuthPage;