import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const parseSignupError = (rawError) => {
    if (typeof rawError === 'string') {
      const normalized = rawError.toLowerCase();
      if (normalized.includes('already exists') || normalized.includes('already in use')) {
        return 'Email already exists. Please log in or use a different email.';
      }
      return rawError;
    }

    if (rawError && typeof rawError === 'object') {
      const firstEntry = Object.entries(rawError)[0];
      if (firstEntry) {
        const [field, messageList] = firstEntry;
        const firstMessage = Array.isArray(messageList) ? messageList[0] : String(messageList);
        if (field === 'email') {
          return 'Email already exists. Please log in or use a different email.';
        }
        return `${field}: ${firstMessage}`;
      }
    }

    return 'Signup failed. Please check your details.';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      nameRef.current?.focus();
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      emailRef.current?.focus();
      return;
    }
    if (!form.password) {
      setError('Password is required');
      passwordRef.current?.focus();
      return;
    }
    if (!form.confirmPassword) {
      setError('Please confirm your password');
      confirmPasswordRef.current?.focus();
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      confirmPasswordRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await register(form.name.trim(), form.email, form.password, form.role);
      if (!data.success) {
        const backendError = parseSignupError(data.error);
        throw new Error(backendError);
      }
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-wood-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-wood-700">Sign Up</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <input
          ref={nameRef}
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          required
        />
        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          required
        />
        <input
          ref={passwordRef}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          required
        />
        <input
          ref={confirmPasswordRef}
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border rounded-lg"
        >
          <option value="user">User</option>
          <option value="therapist">Therapist</option>
        </select>
        <button
          type="submit"
          className="w-full bg-wood-700 text-white py-2 rounded-lg font-semibold hover:bg-wood-800 transition"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <div className="mt-4 text-sm text-center">
          Already have an account? <a href="/login" className="text-wood-700 underline">Log in</a>
        </div>
      </form>
    </div>
  );
}
