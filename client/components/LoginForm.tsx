"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsapp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: formData.name,
            user_mail: formData.email,
            password: formData.password,
            user_number: formData.phone,
            user_whatsapp_number: formData.whatsapp || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Registration failed');
          return;
        }

        setIsSignUp(false);
        setError('');
        setFormData({ name: '', email: formData.email, password: '', confirmPassword: '', phone: '', whatsapp: '' });

      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_mail: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Login failed');
          return;
        }
        router.push('/properties');
        console.log('Logged in:', data.user);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 
                focus:outline-none transition text-gray-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Mail"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 
              focus:outline-none transition text-gray-700"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 
                focus:outline-none transition text-gray-700"
              />
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Enter WhatsApp Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none
                 transition text-gray-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="min 8 characters"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none 
              transition text-gray-700"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="min 8 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none
                 transition text-gray-700"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold
             hover:bg-green-700 transition duration-200 mt-2 "
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-blue-600 font-semibold hover:underline ml-1"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginForm