'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
 _id: string;
 name: string;
 email: string;
 role: string;
 mfa_enabled:string;
 age:number;
 courses: string[]
 created_at: string
}
export default function AdminPage() {
 const { data: session } = useSession();
 const [users, setUsers] = useState<User[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedUser, setSelectedUser] = useState<User | null>(null);
 const [editedUser, setEditedUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(false);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 const [viewedUser, setViewedUser] = useState<User | null>(null);

  useEffect(() => {
   const fetchUsers = async () => {
     setLoading(true);
     try {
       const response = await fetch('http://localhost:5000/users/allUsers', {
         headers: {
           Authorization: `Bearer ${session?.accessToken}`,
         },
       });
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to fetch users');
       }
       const data = await response.json();
       setUsers(data);
       setError(null);
     } catch (err: any) {
       setError(err.message || 'Failed to fetch users');
       console.error('Error fetching users:', err);
     } finally {
       setLoading(false);
     }
   };
    if (session?.accessToken) {
     fetchUsers();
   }
 }, [session?.accessToken]);
  const openModal = (user: User) => {
   setSelectedUser(user);
   setEditedUser({ ...user });
   setIsModalOpen(true);
 };
 const openViewModal = (user: User) => {
    setViewedUser(user);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewedUser(null);
  };
  const closeModal = () => {
   setIsModalOpen(false);
   setSelectedUser(null);
   setEditedUser(null);
   setError(null);
 };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   if (editedUser) {
     setEditedUser({ ...editedUser, [name]: value });
   }
 };

 
  const handleUpdateSubmit = async () => {
   if (!editedUser || !selectedUser) return;
   const confirmUpdate = window.confirm("Are you sure you wanna update?")
   if(!confirmUpdate) return
   setLoading(true);
   try {
     const response = await fetch(`http://localhost:5000/users/editProfile/${session?.user_id}`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${session?.accessToken}`,
       },
       body: JSON.stringify(editedUser),
     });
     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || 'Failed to update user');
     }
     setUsers(users.map(user => user._id === selectedUser._id ? editedUser : user));
     closeModal();
     console.log(`User with ID: ${selectedUser._id} updated successfully`);
     setError(null);
   } catch (err: any) {
     setError(err.message || 'Failed to update user');
     console.error('Error updating user:', err);
   } finally {
     setLoading(false);
   }
 };
  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm("Are you sure you wanna Delete this user?")
   if(!confirmDelete) return
   setLoading(true);
   try {
     const response = await fetch(`http://localhost:5000/users/delete/${userId}`, {
       method: 'DELETE',
       headers: {
         Authorization: `Bearer ${session?.accessToken}`,
       },
     });
     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || 'Failed to delete user');
     }
     setUsers(users.filter(user => user._id !== userId));
     console.log(`User with ID: ${userId} deleted successfully`);
     setError(null);
   } catch (err: any) {
     setError(err.message || 'Failed to delete user');
     console.error('Error deleting user:', err);
   } finally {
     setLoading(false);
   }
 };

 
  return (
   <main className="p-4">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
       <Link 
         href="/admin/auth-logs" 
         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
       >
         View All Authentication Logs
       </Link>
     </div>
     {error && <div className="text-red-500 mb-4">{error}</div>}
     {loading && <div className="text-gray-500 mb-4">Loading...</div>}
     <div className="overflow-x-auto">
       <table className="min-w-full bg-white border border-gray-300">
         <thead>
           <tr className="bg-gray-100">
             <th className="py-2 px-4 border-b">ID</th>
             <th className="py-2 px-4 border-b">Name</th>
             <th className="py-2 px-4 border-b">Email</th>
             <th className="py-2 px-4 border-b">Role</th>
             <th className="py-2 px-4 border-b">Actions</th>
           </tr>
         </thead>
         <tbody>
           {users.map((user) => (
             <tr key={user._id} className="hover:bg-gray-50">
               <td className="py-2 px-4 border-b">{user._id}</td>
               <td className="py-2 px-4 border-b">{user.name}</td>
               <td className="py-2 px-4 border-b">{user.email}</td>
               <td className="py-2 px-4 border-b">{user.role}</td>
               <td className="py-2 px-4 border-b">
                 <button onClick={() => openModal(user)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">
                   Update
                 </button>
                 <button onClick={() => handleDelete(user._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                   Delete
                 </button>
                 <button onClick={() => openViewModal(user)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">
                    View
                  </button>
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>

     {isViewModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            {viewedUser && (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                  <p className="text-gray-700">{viewedUser.name}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                  <p className="text-gray-700">{viewedUser.email}</p>
                </div>
                 <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                  <p className="text-gray-700">{viewedUser.role}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">age:</label>
                  <p className="text-gray-700">{viewedUser.age}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">courses:</label>
                  <ul className="list-disc list-inside">
                    {viewedUser.courses.map((course, index) => (
                      <li key={index} className="text-gray-700">{course}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">mfa_enabled:</label>
                  <p className="text-gray-700">{viewedUser.mfa_enabled}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">created_at:</label>
                  <p className="text-gray-700">{viewedUser.created_at}</p>
                </div>
                <div className="mb-4">
                  <Link 
                    href={`/admin/auth-logs?userId=${viewedUser._id}&userName=${encodeURIComponent(viewedUser.name)}`} 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View User's Authentication Logs
                  </Link>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={closeViewModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {isModalOpen && (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
         <div className="bg-white p-8 rounded shadow-lg w-96">
           <h2 className="text-2xl font-bold mb-4">Edit User</h2>
           {editedUser && (
             <form>
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                 <input type="text" name="name" value={editedUser.name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                 <input type="email" name="email" value={editedUser.email} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                 <select name="role" value={editedUser.role} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                   <option value="user">User</option>
                   <option value="admin">Admin</option>
                 </select>
               </div>
               <div className="flex justify-end">
                 <button type="button" onClick={closeModal} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mr-2">
                   Cancel
                 </button>
                 <button type="button" onClick={handleUpdateSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                   Submit
                 </button>
               </div>
             </form>
           )}
         </div>
       </div>
     )}
   </main>
 );
}