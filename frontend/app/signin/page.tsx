'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const MAX_ATTEMPTS = 3;

  const handleBack = () => {
    setMfaRequired(false);
    setMfaCode('');
    setAttempts(0);
    setError(null);
    if (lockoutTime) {
      setLockoutTime(null);
      setCountdown(0);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (lockoutTime && Date.now() >= lockoutTime) {
      setLockoutTime(null);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [countdown, lockoutTime]);

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 202) {
        setError('New code has been sent to your email');
        setTimeout(() => setError(null), 3000);
      } else {
        setError('Failed to resend code');
      }
    } catch {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutDuration = 30; // seconds
      setLockoutTime(Date.now() + (lockoutDuration * 1000));
      setCountdown(lockoutDuration);
      setMfaCode(''); // Clear the input
      setError(`Too many failed attempts. Please wait ${lockoutDuration} seconds before trying again`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if user is in lockout period
    if (lockoutTime && Date.now() < lockoutTime) {
      setError(`Please wait ${Math.ceil(countdown)} seconds before trying again`);
      return;
    }

    setLoading(true);

    try {
      // First attempt: try to login with just email and password
      if (!mfaRequired) {
        const response = await fetch("http://localhost:5000/auth/login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // If MFA is required
        if (response.status === 202) {
          setMfaRequired(true);
          setLoading(false);
          return;
        }

        // If there's an error
        if (!response.ok) {
          setError(data.message || 'Authentication failed');
          setLoading(false);
          return;
        }

        // If login is successful without MFA
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result || result.error) {
          setError(result?.error || 'Authentication failed');
          return;
        }

        if (result.ok) {
          router.push('/');
          router.refresh();
          return;
        }
      }

      // Second attempt: if MFA is required, try with the MFA code
      if (mfaRequired) {
        const result = await signIn('credentials', {
          email,
          password,
          mfaToken: mfaCode,
          redirect: false,
        });

        if (!result) {
          setError('An error occurred during MFA verification');
          handleFailedAttempt();
          return;
        }

        if (result.error) {
          setError(result.error);
          handleFailedAttempt();
          return;
        }

        if (result.ok) {
          router.push('/');
          router.refresh();
          return;
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An error occurred during login');
      if (mfaRequired) {
        handleFailedAttempt();
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = Boolean(loading || (lockoutTime && Date.now() < lockoutTime));

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://www.vectorlogo.zone/logos/nestjs/nestjs-icon.svg"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          {mfaRequired ? 'Enter MFA Code' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {!mfaRequired ? (
            <>
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
            </>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Login
                </button>
                <div className="text-sm text-gray-500">
                  Attempts: <span className="font-medium">{attempts}/{MAX_ATTEMPTS}</span>
                </div>
              </div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-900">
                Enter the code sent to your email
              </label>
              <div className="mt-2">
                <input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  autoComplete="off"
                  disabled={isDisabled}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isDisabled}
                  className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                >
                  Resend Code
                </button>
              </div>
              {countdown > 0 && (
                <div className="mt-2 text-sm text-gray-500 text-center">
                  Please wait {countdown} seconds before trying again
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isDisabled}
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                isDisabled
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  {mfaRequired ? 'Verifying...' : 'Signing in...'}
                </div>
              ) : (
                mfaRequired ? 'Verify Code' : 'Sign in'
              )}
            </button>
          </div>
        </form>

        {!mfaRequired && (
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <a href="signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign Up
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signin;
