'use client';
import { useEffect } from 'react';
interface ErrorProps {
 error: Error;
 reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
 useEffect(() => {
   // Log the error to the console or an error tracking service
   console.error('An error occurred:', error);
 }, [error]);
  return (
   <div style={{ textAlign: 'center', padding: '50px' }}>
     <h1>Oops! Something went wrong.</h1>
     <p>
       {error.message ||
         'An unexpected error occurred. Please try again later.'}
     </p>
     <button onClick={() => reset()}>Try again</button>
   </div>
 );
}
