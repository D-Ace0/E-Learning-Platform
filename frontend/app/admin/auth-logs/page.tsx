'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthLog {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  } | null;
  email: string;
  event: string;
  timestamp: string;
  status: 'Success' | 'Failure' | 'Pending MFA' | 'Failed';
  message: string;
}

export default function AuthLogsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const url = userId 
          ? `http://localhost:5000/auth/logs/${userId}`
          : 'http://localhost:5000/auth/logs';
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch authentication logs');
        }

        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchLogs();
    }
  }, [session, userId]);

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.email.toLowerCase().includes(searchLower) ||
        log.event.toLowerCase().includes(searchLower) ||
        log.message.toLowerCase().includes(searchLower) ||
        log.status.toLowerCase().includes(searchLower)
      );
    }
    
    if (filter === 'all') return true;
    return log.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Authentication Logs</h1>
          {userId && userName && (
            <p className="text-gray-600 mt-2">Showing logs for user: {userName}</p>
          )}
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search logs..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
            <option value="Pending MFA">Pending MFA</option>
            <option value="Failed">Failed</option>
          </select>
          {userId && (
            <button
              onClick={() => router.push('/admin/auth-logs')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              View All Logs
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.user_id ? log.user_id.email : log.email}</div>
                  {log.user_id && (
                    <div className="text-sm text-gray-500">{log.user_id.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.event}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${log.status === 'Success' ? 'bg-green-100 text-green-800' : ''}
                    ${log.status === 'Failure' || log.status === 'Failed' ? 'bg-red-100 text-red-800' : ''}
                    ${log.status === 'Pending MFA' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 