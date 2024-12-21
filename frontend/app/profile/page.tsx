'use client'

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
interface User {
   _id: string;
   name: string;
   email: string;
   role: string;
   mfa_enabled: string;
   age: number;
   courses: string[];
   created_at: string;
}
export default function ProfilePage() {
   const { data: session } = useSession();
   const [profileData, setProfile] = useState<User | null>(null);
   const [error, setError] = useState<string | null>(null);
    useEffect(() => {
       const fetchProfile = async () => {
           try {
               const response = await fetch(`http://localhost:5000/users/${session?.user_id}`, {
                   headers: {
                       'Authorization': `Bearer ${session?.accessToken}`
                   }
               });
               if (!response.ok) {
                   const errorData = await response.json();
                   throw new Error(errorData.message || 'Failed to Fetch user profile');
               }
               const data = await response.json();
               setProfile(data);
               setError(null);
           } catch (error: any) {
               setError(error.message || 'Failed to fetch users');
               console.error('Error fetching users:', error);
           }
       };
       if (session?.user_id) {
           fetchProfile();
       }
   }, [session]);
    return (
       // {{ edit_1 }}
       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-12">
           <div className="container mx-auto px-4">
               {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {session && profileData ? (
                       // {{ edit_2 }}
                       <div key={profileData._id} className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-2xl border border-gray-700">
                           <h2 className="text-3xl font-bold mb-4 text-blue-400 border-b border-blue-600 pb-2">{profileData.name}</h2>
                           <div className="mb-4">
                               <p className="text-sm text-gray-300 mb-1"><strong className="text-blue-300">Email:</strong> {profileData.email}</p>
                               <p className="text-sm text-gray-300 mb-1"><strong className="text-purple-300">Role:</strong> {profileData.role}</p>
                               <p className="text-sm text-gray-300 mb-1"><strong className="text-violet-300">MFA Enabled:</strong> {profileData.mfa_enabled}</p>
                               <p className="text-sm text-gray-300 mb-1"><strong className="text-green-300">Age:</strong> {profileData.age}</p>
                               <p className="text-sm text-gray-300 mb-1"><strong className="text-green-300">Created At:</strong> {new Date(profileData.created_at).toLocaleDateString()}</p>
                           </div>
                           <div>
                               <h3 className="text-xl font-semibold mb-2 text-blue-400 border-b border-blue-600 pb-2">Courses</h3>
                               <ul className="list-none pl-0">
                                   {profileData.courses.map((course, index) => (
                                       // {{ edit_3 }}
                                       <li key={index} className="mb-2 p-2 bg-gray-700 bg-opacity-50 rounded-md border border-gray-600">
                                           <span className="text-sm text-gray-300">
                                               <strong className="text-blue-300">Course:</strong> {course}
                                           </span>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       </div>
                   ) : (
                       <h2 className="text-4xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
                   )}
               </div>
           </div>
       </div>
   );
}