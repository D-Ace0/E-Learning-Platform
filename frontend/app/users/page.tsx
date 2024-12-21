'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2'; // Import SweetAlert2
interface User {
   _id: string;
   name: string;
   email: string;
   role: string;
   courses?: string[];
   created_at: string;
}
export default function Users() {
   const { data: session, status } = useSession();
   const [users, setUsers] = useState<User[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [notFound, setNotFound] = useState(false);
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setSearchTerm(event.target.value);
   };
    const viewUserDetails = async (userId: string) => {
       if (!session) {
           Swal.fire({
               icon: 'error',
               title: 'Oops...',
               text: 'You need to be logged in to view user details!',
           });
           return;
       }
        setLoading(true);
       try {
           // Determine the endpoint based on user role
           const endpoint = session.role === 'student' ? `http://localhost:5000/users/allInstructors` : `http://localhost:5000/users/allStudents`;
            const response = await fetch(endpoint, {
               headers: {
                   'Authorization': `Bearer ${session.accessToken}`,
               },
           });
            if (!response.ok) {
               const errorData = await response.json();
               Swal.fire({
                   icon: 'error',
                   title: 'Error',
                   text: errorData.message || 'Failed to fetch user details',
               });
               throw new Error(errorData.message || 'Failed to fetch user details');
           }
            const users = await response.json();
            const user = users.find((u: User) => u._id === userId); // Find the specific user by ID
            if (!user) {
                throw new Error('User not found');
            }
            const userDetails = `
                <strong>Name:</strong> ${user.name || 'N/A'}<br>
                <strong>Email:</strong> ${user.email || 'N/A'}<br>
                <strong>Role:</strong> ${user.role || 'N/A'}<br>
                <strong>Created At:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                <strong>Courses:</strong> ${user.courses ? user.courses.join(', ') : 'N/A'}
            `;
            Swal.fire({
               icon: 'info',
               title: 'User Details',
               html: userDetails,
           });
       } catch (error: any) {
           console.error('Error fetching user details:', error);
       } finally {
           setLoading(false);
       }
   };
    useEffect(() => {
       const fetchUsers = async () => {
           if (!session) return;
           setLoading(true);
           setError(null);
           setNotFound(false);
           try {
               let url = 'http://localhost:5000/users';
               if (searchTerm) {
                   url = `http://localhost:5000/users/search/${searchTerm}`;
               }
                // Adjust the URL based on user role
               if (session.role === 'student') {
                   url = `http://localhost:5000/users/allInstructors`;
               } else if (session.role === 'instructor') {
                   url = `http://localhost:5000/users/allStudents`;
               }
                const response = await fetch(url, {
                   headers: {
                       'Authorization': `Bearer ${session.accessToken}`,
                   },
               });
                if (!response.ok) {
                   const errorData = await response.json();
                   throw new Error(errorData.message || 'Failed to fetch users');
               }
                const data = await response.json();
               if (Array.isArray(data)) {
                   setUsers(data);
                   setNotFound(data.length === 0);
               } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                   setUsers([data]);
                   setNotFound(false);
               } else {
                   setUsers([]);
                   setNotFound(true);
               }
           } catch (err: any) {
               setError(err.message || 'Failed to fetch users');
               setUsers([]);
               setNotFound(true);
           } finally {
               setLoading(false);
           }
       };
        fetchUsers();
   }, [session, searchTerm]);
    if (status === 'loading') {
       return <p>Loading...</p>;
   }
    return (
       <div className="container mx-auto p-8">
           <h1 className="text-4xl font-bold text-center mb-8">User List</h1>
           <input
               type="text"
               placeholder="Search users..."
               className="border p-2 mb-4 w-full"
               value={searchTerm}
               onChange={handleSearchChange}
           />
           {loading && (
               <div className="flex justify-center items-center">
                   <div className="spinner"></div>
               </div>
           )}
           {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
           {notFound && <p className="text-gray-500 text-center mb-4">No users found.</p>}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {session ? (
                   users.map((user) => (
                       <div key={user._id} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
                           <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                           <p className="text-gray-700 mb-4">{user.email}</p>
                           <p className="text-sm text-blue-500 mb-2"><strong>Role:</strong> {user.role}</p>
                           <p className="text-sm text-gray-600 mb-2">
                               <strong>Created At:</strong> {new Date(user.created_at).toLocaleDateString()}
                           </p>
                           <button
                               onClick={() => viewUserDetails(user._id)}
                               className="mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                           >
                               View Details
                           </button>
                       </div>
                   ))
               ) : (
                   <h2 className="text-3xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
               )}
           </div>
       </div>
   );
}