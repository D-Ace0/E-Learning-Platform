'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error messages

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous error

    try {
      const data: Record<string, string> = { email, password };
      if (mfaToken) {
        data.mfaToken = mfaToken;
      }

      const response = await axios.post('http://localhost:5000/auth/login', data, {
        withCredentials: true, // Enables sending cookies
      });

      if (response.status === 202 && response.data.message.includes('MFA token sent to your email')) {
        setMfaRequired(true);
      } else if (response.status === 200) {
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      console.error('Login failed', error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred during login'); // Set error message
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      setIsLoggedIn(false);
      setMfaRequired(false);
      setEmail('');
      setPassword('');
      setMfaToken('');
    } catch (error: any) {
      console.error('Logout failed', error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred during logout'); // Set error message
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://www.vectorlogo.zone/logos/nestjs/nestjs-icon.svg"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          {isLoggedIn ? 'Welcome!' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 text-center text-red-500 font-medium">
            {error} {/* Display the error message here */}
          </div>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Sign Out
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            {mfaRequired && (
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-gray-900">
                  MFA Token
                </label>
                <div className="mt-2">
                  <input
                    id="mfaToken"
                    name="mfaToken"
                    type="text"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    required
                    autoComplete="one-time-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
            )
            }
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {mfaRequired ? 'Submit MFA Token' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <a href="signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign Up
            </a>
          </p>
    </div>
  );
};

export default Signin;
