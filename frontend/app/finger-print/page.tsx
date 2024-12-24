'use client';

import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const FingerPrintPage: React.FC = () => {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
   const params = useParams();
  const { data: session } = useSession();


  const handleRegisterFingerprint = async () => {
    if (!session?.accessToken) {
        setError('User is not authenticated.');
        return;
    }
   
    setLoading(true); // Start loading
    setError(null); // Reset error state
    setMessage(null); // Reset message state

    try {
        // Generate the visitorId using FingerprintJS
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        setVisitorId(visitorId);

        // Log payload
     
        // Make the Axios POST request
        const response = await axios.post(
            'http://localhost:5000/fingerprint/register',
            {
                userId: session.user_id, // Ensure this is the correct key
                fingerprint: visitorId,
            },
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        // Log backend response
        

        if (response?.status === 201) {
            setMessage('Fingerprint registered successfully!');
        } else {
            setError('Failed to register fingerprint.');
        }
    } catch (err: any) {
       
        setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
        setLoading(false); // Stop loading
    }
};

 

  const handlleVerifyFingerprint = async () => {
    if (!session?.accessToken) {
      setError('User is not authenticated.');
      return;
  }
    setLoading(true); // Start loading
    setError(null); // Reset error state
    setMessage(null);
    setVisitorId(null);
    try {

      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const visitorId = result.visitorId;
      setVisitorId(visitorId);

   
      const response = await axios.post(
        'http://localhost:5000/fingerprint/verify',
        {
          userId: session.user_id, // Ensure this is the correct key
          fingerprint: visitorId,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
     
      if(response.data === true){
        setMessage('Fingerprint verified successfully!');
      }
      else{
        setError('Failed to verify fingerprint.');
      }
      
      
    } catch (error:any) {
      setMessage(error?.response?.data?.message || 'Something went wrong.');
    }
    finally {
      setLoading(false); // Stop loading
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
        onClick={handlleVerifyFingerprint}
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