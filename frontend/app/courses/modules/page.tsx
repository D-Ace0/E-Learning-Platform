'use client';
import {useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
interface Module {
 course_id: string;
 title: string;
 content: string;
 resources: string[];
 created_at: string;
}
export default function Modules() {
 const { data: session } = useSession();
 const [modules, setModules] = useState<Module[]>([]);
 const [error, setError] = useState<string | null>(null);
 const searchParams = useSearchParams();
 const courseId = searchParams.get('courseId');

 useEffect(() => {
   async function fetchModules() {
     if (!session || !courseId) return;
      try {
       const response = await fetch(`http://localhost:5000/module/course/${courseId}`, {
         headers: {
           Authorization: `Bearer ${session.accessToken}`,
         },
       });
        if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to fetch');
       }
        const data = await response.json();
       if (Array.isArray(data)) {
         setModules(data);
       } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
         setModules([data]);
       } else {
         setModules([]);
         console.log('Expected an array or single module object');
       }
     } catch (err: any) {
       console.error('Error fetching modules:', err);
       setError(err.message);
     }
   }
    fetchModules();
 }, [session, courseId]);
  if (!session) {
   return <p>Loading...</p>;
 }
  return (
   <div className="container mx-auto p-8">
     <h1 className="text-4xl font-bold text-center mb-8">Modules List</h1>
     {error ? (
       <div className="text-red-500 text-center mb-4">{error}</div>
     ) : (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
         {modules.map((module) => (
           <div key={module.title} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
             <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
             <h2 className="text-xl font-semibold mb-2">CourseID: {module.course_id}</h2>
             <p className="text-gray-700 mb-4">{module.content}</p>
             <div className="text-left mb-4">
               <p className="text-sm text-blue-500 mb-2"><strong>Resources:</strong></p>
               <ul className="list-disc list-inside text-gray-700">
                 {module.resources.map((resource, index) => (
                   <li key={index}>
                     <a href={resource} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                       {resource}
                     </a>
                   </li>
                 ))}
               </ul>
             </div>
             <p className="text-sm text-gray-500"><strong>Created At:</strong> {new Date(module.created_at).toLocaleDateString()}</p>
           </div>
         ))}
       </div>
     )}
   </div>
 );
}
