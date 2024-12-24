'use client';

import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';

const FingerPrintPage: React.FC = () => {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();
const params = useParams(); // To get the `quizId`
  // Function to generate and fetch visitor ID using FingerprintJS
  const getVisitorId = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    setVisitorId(result.visitorId);
    return result.visitorId;
  };

  const handleRegisterFingerprint = async () => {
    if (!session?.accessToken) {
      setError('User is not authenticated.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const fingerprint = await getVisitorId();

      const response = await axios.post(
        'http://localhost:5000/fingerprint/register',
        {
          userId: session.user_id,
          fingerprint,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response?.status === 201) {
        setMessage('Fingerprint registered successfully!');
      } else {
        setError('Failed to register fingerprint.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFingerprint = async () => {
    if (!session?.accessToken) {
      setError('User is not authenticated.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const fingerprint = await getVisitorId();

      const response = await axios.post(
        'http://localhost:5000/fingerprint/verify',
        {
          userId: session.user_id,
          fingerprint:fingerprint,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.data === true) {
        // Redirect to the quiz link if verification is successful
        // Replace with the actual quiz ID
        
        router.push(`/quiz/questions/${params.quizId}`);
      } else {
        setError('Failed to verify fingerprint. Please register first before accessing the quiz.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {message && (
          <div className="mb-4 p-4 text-green-800 bg-green-100 border border-green-200 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 text-red-800 bg-red-100 border border-red-200 rounded">
            {error}
          </div>
        )}
        <button
          onClick={handleRegisterFingerprint}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Fingerprint'}
        </button>
        <button
          onClick={handleVerifyFingerprint}
          className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 mt-4 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Fingerprint'}
        </button>
      </div>
    </div>
  );
};

export default FingerPrintPage;
