'use client'

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
   EnvelopeIcon,
   IdentificationIcon,
   UserIcon,
   LockClosedIcon,
   CakeIcon,
   CalendarIcon,
   AcademicCapIcon,
   FingerPrintIcon
} from '@heroicons/react/24/outline';
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
   const [isModalOpen, setIsModalOpen] = useState(false);
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
               setIsModalOpen(true); // Open modal after successful fetch
           } catch (error: any) {
               setError(error.message || 'Failed to fetch users');
               console.error('Error fetching users:', error);
               setIsModalOpen(false); // Ensure modal is closed on error
           }
       };
       if (session?.user_id) {
           fetchProfile();
       } else {
           setIsModalOpen(false); // Ensure modal is closed if no session
       }
   }, [session]);
    const closeModal = () => {
       setIsModalOpen(false);
   };
    return (
       <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-12 relative ${isModalOpen ? 'overflow-hidden' : ''}`}>
           {isModalOpen && (
               <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                   <div className="relative bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-2xl transform transition-all duration-300 ease-out">
                       {/* Close Button */}
                       <button
                           onClick={closeModal}
                           className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
                       >
                           <svg
                               className="h-6 w-6"
                               fill="none"
                               stroke="currentColor"
                               viewBox="0 0 24 24"
                               xmlns="http://www.w3.org/2000/svg"
                           >
                               <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth="2"
                                   d="M6 18L18 6M6 6l12 12"
                               ></path>
                           </svg>
                       </button>
                       {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
                       {profileData ? (
                           <div className="flex flex-col">
                               <div className="flex items-center mb-6 border-b border-blue-600 pb-4">
                                   <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                                       <span className="text-4xl text-blue-400 font-bold">{profileData.name.charAt(0).toUpperCase()}</span>
                                   </div>
                                   <div>
                                       <h2 className="text-3xl font-bold text-blue-400">{profileData.name}</h2>
                                       <div className="flex items-center text-sm text-gray-400">
                                           <FingerPrintIcon className="h-4 w-4 text-gray-400 mr-1" />
                                           <span>User ID: {profileData._id}</span>
                                       </div>
                                   </div>
                               </div>
                               <div className="mb-6">
                                   <div className="flex items-center mb-2">
                                       <EnvelopeIcon className="h-5 w-5 text-blue-300 mr-2" />
                                        <span className="text-gray-300">Email:</span>
                                       <span className="text-gray-300">{profileData.email}</span>
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <IdentificationIcon className="h-5 w-5 text-purple-300 mr-2" />
                                        <span className="text-gray-300">Role:</span>
                                       <span className="text-gray-300">{profileData.role}</span>
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <LockClosedIcon className="h-5 w-5 text-violet-300 mr-2" />
                                        <span className="text-gray-300">MFA Enabled:</span>
                                       <span className="text-gray-300">{profileData.mfa_enabled}</span>
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <CakeIcon className="h-5 w-5 text-green-300 mr-2" />
                                        <span className="text-gray-300">Age:</span>
                                       <span className="text-gray-300">{profileData.age}</span>
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <CalendarIcon className="h-5 w-5 text-green-300 mr-2" />
                                        <span className="text-gray-300">Joined:</span>
                                       <span className="text-gray-300">{new Date(profileData.created_at).toLocaleDateString()}</span>
                                   </div>
                               </div>
                               <div>
                                   <h3 className="text-xl font-semibold mb-2 text-blue-400 border-b border-blue-600 pb-2">Courses</h3>
                                   <ul className="list-none pl-0">
                                       {profileData.courses.map((course, index) => (
                                           <li key={index} className="mb-2 p-3 bg-gray-700 bg-opacity-50 rounded-md border border-gray-600 flex items-center">
                                               <AcademicCapIcon className="h-5 w-5 text-blue-300 mr-2" />
                                               <span className="text-sm text-gray-300">
                                                   {course}
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
           )}
           {!isModalOpen && (
               <div className="container mx-auto px-4">
                   <h2 className="text-4xl font-bold text-red-500 text-center">3amel eh ya 3asal 8===></h2>
               </div>
           )}
       </div>
   );
}