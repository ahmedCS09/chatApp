"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [buttonBg, setButtonBg] = useState('linear-gradient(to right, #007bff, #0056b3)');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)', paddingTop: '80px' }}>
      <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', width: '100%', maxWidth: '450px', animation: 'fadeIn 0.5s ease-in-out' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '15px', color: '#333', fontSize: '28px', fontWeight: 'bold' }}>Forgot Password?</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>Enter your email and we'll send you a reset link.</p>
        
        {submitted && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>If email exists, reset link sent</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', border: '2px solid #e1e5e9', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '14px', background: buttonBg, color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(0,123,255,0.3)' }}
            onMouseEnter={() => setButtonBg('linear-gradient(to right, #0056b3, #004085)')}
            onMouseLeave={() => setButtonBg('linear-gradient(to right, #007bff, #0056b3)')}
          >
            Send Reset Link
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>
          Remember your password? <Link href="../login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}