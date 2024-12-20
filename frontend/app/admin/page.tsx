'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'profile'>('users');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session) return;
      try {
        const response = await fetch('http://localhost:5000/users/allUsers', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      }
    };

    const fetchProfile = async () => {
      if (!session) return;
      try {
        const response = await fetch(`http://localhost:5000/users/${session?.user_id}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
        console.error('Error fetching profile:', err);
      }
    };

    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [session, activeTab]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session || session?.role !== 'admin') {
    return <p>Unauthorized</p>;
  }

  const handleTabChange = (tab: 'users' | 'profile') => {
    setActiveTab(tab);
  };

  const handleUpdate = (userId: string) => {
    console.log(`Updating user with ID: ${userId}`);
    // Add your update logic here
  };

  const handleDelete = (userId: string) => {
    console.log(`Deleting user with ID: ${userId}`);
    // Add your delete logic here
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 rounded-md mr-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleTabChange('profile')}
        >
          Profile
        </button>
      </div>
      {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                    <button
                      onClick={() => handleUpdate(user._id)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'profile' && profile && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
          <div className="mb-4">
            <p><strong>ID:</strong> {profile._id}</p>
          </div>
          <div className="mb-4">
            <p><strong>Name:</strong> {profile.name}</p>
          </div>
          <div className="mb-4">
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
          <div className="mb-4">
            <p><strong>Role:</strong> {profile.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
