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
   FingerPrintIcon,
   PencilIcon
}from '@heroicons/react/24/outline';
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
   const [editingField, setEditingField] = useState<string | null>(null);
   const [editedValue, setEditedValue] = useState<string>('');
   const [editedCourses, setEditedCourses] = useState<string[]>([]);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
    useEffect(() => {
       const fetchProfile = async () => {
           setLoading(true);
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
               setEditedCourses(data.courses);
               setError(null);
               setIsModalOpen(true);
           } catch (error: any) {
               setError(error.message || 'Failed to fetch users');
               console.error('Error fetching users:', error);
               setIsModalOpen(false);
           } finally {
               setLoading(false);
           }
       };
        if (session?.user_id) {
           fetchProfile();
       } else {
           setIsModalOpen(false);
       }
   }, [session]);
    const closeModal = () => {
       setIsModalOpen(false);
   };
    const handleEditClick = (field: string, value: any) => {
       setEditingField(field);
       setEditedValue(String(value));
   };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setEditedValue(e.target.value);
   };
    const handleCourseChange = (index: number, value: string) => {
       const newCourses = [...editedCourses];
       newCourses[index] = value;
       setEditedCourses(newCourses);
   };
   const handleSaveField = async () => {
    if (!profileData || !editingField) return;

    setLoading(true);
    try {
        const response = await fetch(`http://localhost:5000/users/editProfile/${session?.user_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [editingField]: editedValue }), // Send only the edited field
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user profile');
        }

        const updatedProfile = { ...profileData, [editingField]: editedValue };
        setProfile(updatedProfile); // Update the frontend state
        setError(null);
        setEditingField(null);
        setEditedValue('');
    } catch (error: any) {
        setError(error.message || 'Failed to update user profile');
        console.error('Error updating user profile:', error);
    } finally {
        setLoading(false);
    }
};

const handleSaveAllChanges = async () => {
    if (!profileData) return;

    setLoading(true);
    try {
        // Create an object with updated fields, excluding courses
        const updatedFields = { ...profileData };
        //delete updatedFields.courses; // Ensure courses are not sent

        const response = await fetch(`http://localhost:5000/users/editProfile/${session?.user_id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFields),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user profile');
        }

        setProfile({ ...profileData }); // Update the frontend state without modifying courses
        setError(null);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        setEditingField(null);
        setEditedValue('');
    } catch (error: any) {
        setError(error.message || 'Failed to update user profile');
        console.error('Error updating user profile:', error);
    } finally {
        setLoading(false);
    }
};


   const handleCancelClick = () => {
       setEditingField(null);
       setEditedValue('');
   };

   return (
       <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-12 relative ${isModalOpen ? 'overflow-hidden' : ''}`}>
           {loading && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                   <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-500"></div>
               </div>
           )}
           {isModalOpen && (
               <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                   <div className="relative bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-2xl transform transition-all duration-300 ease-out">
                       {/* Close Button */}
                       <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-300 focus:outline-none">
                           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                           </svg>
                       </button>
                       {successMessage && (
                           <div className="bg-green-500 text-white p-3 rounded mb-4">
                               {successMessage}
                           </div>
                       )}
                       {error && (
                           <div className="bg-red-500 text-white p-3 rounded mb-4">
                               {error}
                           </div>
                       )}
                       {profileData ? (
                           <div>
                               <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">User Profile</h2>
                               <div className="mb-4">
                                   <div className="flex items-center mb-2">
                                       <UserIcon className="h-5 w-5 text-blue-300 mr-2" />
                                       
                                       {editingField === 'name' ? (
                                           <input
                                               type="text"
                                               value={editedValue}
                                               onChange={handleInputChange}
                                               className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                           />
                                       ) : (
                                        <>
                                         <span className="text-gray-300">Name: </span>
                                           <span className="text-gray-300"> {profileData.name}</span>
                                        </>
                                       )}
                                       {editingField === 'name' ? (
                                           <>
                                               <button onClick={handleSaveField} className="ml-2 text-green-500 hover:text-green-400 focus:outline-none">Save</button>
                                               <button onClick={handleCancelClick} className="ml-2 text-red-500 hover:text-red-400 focus:outline-none">Cancel</button>
                                           </>
                                       ) : (
                                           <PencilIcon onClick={() => handleEditClick('name', profileData.name)} className="h-4 w-4 text-gray-400 ml-2 cursor-pointer hover:text-gray-300" />
                                       )}
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <EnvelopeIcon className="h-5 w-5 text-yellow-300 mr-2" />
                                       {editingField === 'email' ? (
                                           <input
                                               type="text"
                                               value={editedValue}
                                               onChange={handleInputChange}
                                               className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                           />
                                       ) : (
                                            <>
                                            <span className="text-gray-300">Email: </span>
                                           <span className="text-gray-300">{profileData.email}</span>
                                           </>
                                       )}
                                       {editingField === 'email' ? (
                                           <>
                                               <button onClick={handleSaveField} className="ml-2 text-green-500 hover:text-green-400 focus:outline-none">Save</button>
                                               <button onClick={handleCancelClick} className="ml-2 text-red-500 hover:text-red-400 focus:outline-none">Cancel</button>
                                           </>
                                       ) : (
                                           <PencilIcon onClick={() => handleEditClick('email', profileData.email)} className="h-4 w-4 text-gray-400 ml-2 cursor-pointer hover:text-gray-300" />
                                       )}
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <IdentificationIcon className="h-5 w-5 text-purple-300 mr-2" />
                                       {editingField === 'role' ? (
                                           <input
                                               type="text"
                                               value={editedValue}
                                               onChange={handleInputChange}
                                               className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                           />
                                       ) : (
                                            <>
                                            <span className="text-gray-300">Role: </span>
                                             <span className="text-gray-300">{profileData.role}</span>
                                            </>
                                           
                                       )}
                                       {editingField === 'role' ? (
                                           <>
                                               <button onClick={handleSaveField} className="ml-2 text-green-500 hover:text-green-400 focus:outline-none">Save</button>
                                               <button onClick={handleCancelClick} className="ml-2 text-red-500 hover:text-red-400 focus:outline-none">Cancel</button>
                                           </>
                                       ) : (
                                           <PencilIcon onClick={() => handleEditClick('role', profileData.role)} className="h-4 w-4 text-gray-400 ml-2 cursor-pointer hover:text-gray-300" />
                                       )}
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <LockClosedIcon className="h-5 w-5 text-violet-300 mr-2" />
                                       {editingField === 'mfa_enabled' ? (
                                           <input
                                               type="text"
                                               value={editedValue}
                                               onChange={handleInputChange}
                                               className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                           />
                                       ) : (
                                          <>
                                          <span className="text-gray-300">MFA Enabled: </span>
                                           <span className="text-gray-300">{profileData.mfa_enabled}</span>
                                          </>
                                       )}
                                       {editingField === 'mfa_enabled' ? (
                                           <>
                                               <button onClick={handleSaveField} className="ml-2 text-green-500 hover:text-green-400 focus:outline-none">Save</button>
                                               <button onClick={handleCancelClick} className="ml-2 text-red-500 hover:text-red-400 focus:outline-none">Cancel</button>
                                           </>
                                       ) : (
                                           <PencilIcon onClick={() => handleEditClick('mfa_enabled', profileData.mfa_enabled)} className="h-4 w-4 text-gray-400 ml-2 cursor-pointer hover:text-gray-300" />
                                       )}
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <CakeIcon className="h-5 w-5 text-green-300 mr-2" />
                                       {editingField === 'age' ? (
                                           <input
                                               type="number"
                                               value={editedValue}
                                               onChange={handleInputChange}
                                               className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                           />
                                       ) : (
                                          <>
                                          <span className="text-gray-300">Age: </span>
                                           <span className="text-gray-300">{profileData.age}</span>
                                          </>
                                       )}
                                       {editingField === 'age' ? (
                                           <>
                                               <button onClick={handleSaveField} className="ml-2 text-green-500 hover:text-green-400 focus:outline-none">Save</button>
                                               <button onClick={handleCancelClick} className="ml-2 text-red-500 hover:text-red-400 focus:outline-none">Cancel</button>
                                           </>
                                       ) : (
                                           <PencilIcon onClick={() => handleEditClick('age', profileData.age)} className="h-4 w-4 text-gray-400 ml-2 cursor-pointer hover:text-gray-300" />
                                       )}
                                   </div>
                                   <div className="flex items-center mb-2">
                                       <CalendarIcon className="h-5 w-5 text-green-300 mr-2" />
                                        <span className="text-gray-300">Created At: </span>
                                       <span className="text-gray-300">{new Date(profileData.created_at).toLocaleDateString()}</span>
                                   </div>
                               </div>
                               <div>
                                   <h3 className="text-xl font-semibold mb-2 text-blue-400 border-b border-blue-600 pb-2">Courses</h3>
                                   <ul className="list-none pl-0">
                                       {editedCourses.map((course, index) => (
                                           <li key={index} className="mb-2 p-3 bg-gray-700 bg-opacity-50 rounded-md border border-gray-600 flex items-center">
                                               <AcademicCapIcon className="h-5 w-5 text-blue-300 mr-2" />
                                               <input
                                                   type="text"
                                                   value={course}
                                                   onChange={(e) => handleCourseChange(index, e.target.value)}
                                                   className="bg-gray-700 text-gray-300 rounded px-2 py-1 ml-2 focus:outline-none"
                                               />
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                               <button onClick={handleSaveAllChanges} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4" type="button">
                                   Save All Changes
                               </button>
                           </div>
                       ) : (
                           <h2 className="text-4xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
                       )}
                   </div>
               </div>
           )}
       </div>
   );
}