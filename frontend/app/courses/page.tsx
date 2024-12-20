'use client';
import { useEffect, useState } from'react';
import { useSession } from 'next-auth/react';
interface Course {
 title: string;
 description: string;
 category: string;
 difficulty_level: string;
 video: string;
 pdf: string;
 created_at: string;
}
export default function Courses() {
 const { data: session, status } = useSession();
 console.log(session)
 const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
   async function fetchProducts() {
     if (!session) return;
      try {
       const response = await fetch('http://localhost:5000/courses', {
         headers: {
           'Authorization': `Bearer ${session.accessToken}`
         }
       });
        if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to fetch courses');
       }
        const data: Course[] = await response.json();
       console.log('Fetched courses:', data);
        if (Array.isArray(data)) {
         setCourses(data);
       } else {
         console.error('Expected an array but got:', data);
         throw new Error('Invalid data format received from the server');
       }
     } catch (error) {
       console.error('Error fetching courses:', error);
     }
   }
    if (session) {
     fetchProducts();
   }
 }, [session]);
  if (status === 'loading') {
   return <p>Loading...</p>;
 }
  return (
   <div className="container mx-auto p-8">
     <h1 className="text-4xl font-bold text-center mb-8">Course List</h1>
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
       {session ? (
         courses.map((course) => (
           <div key={course.title} className="bg-white shadow-md rounded-lg p-6 text-center">
             <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
             <p className="text-gray-700 mb-4">{course.description}</p>
             <p className="text-sm text-blue-500 mb-2"><strong>Category:</strong> {course.category}</p>
             <p className="text-sm text-green-500 mb-2"><strong>Difficulty Level:</strong> {course.difficulty_level}</p>
             <a href={course.video} className="text-blue-600 hover:underline mb-2 block">Watch Video</a>
             <a href={course.pdf} className="text-blue-600 hover:underline">Download PDF</a>
           </div>
         ))
       ) : (
         <h2 className="text-3xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
       )}
     </div>
   </div>
 );
}
