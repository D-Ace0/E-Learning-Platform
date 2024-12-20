'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface User {
 _id: string;
 name: string;
 email: string;
 role: string;
}
export default function AdminPage() {
 const { data: session } = useSession();
 const [users, setUsers] = useState<User[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedUser, setSelectedUser] = useState<User | null>(null);
 const [editedUser, setEditedUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(false);
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
   setLoading(true);
   try {
     const response = await fetch(`http://localhost:5000/users/editProfile/${selectedUser._id}`, {
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
     <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
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
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
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