'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}
interface Thread {
  _id: string;
  title: string;
  course_id: string; // Reflects the actual field from backend
  createdBy: string;
  EnvolvedUsers_ids: User[];
}
interface Forum {
  _id: string;
  title: string;
  course_id: string;
  createdBy: string;
  instructor_id: string;
}
export default function ForumDetailsPage() {
  const { data: session } = useSession();
  const { forumId } = useParams();
  const [forum, setForum] = useState<Forum | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThread, setNewThread] = useState({ title: '' });
  const [loadingForum, setLoadingForum] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const searchParams = useSearchParams(); // Get search parameters
  const course_id = searchParams.get('courseId'); // Extract courseId from query params
  const fetchForumDetails = async () => {
    setLoadingForum(true);
    try {
      const response = await fetch(`http://localhost:5000/forum/${course_id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch forum details');
      }
      const data = await response.json();
      setForum(data);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoadingForum(false);
    }
  };
  const fetchThreads = async () => {
    setLoadingThreads(true);
    try {
      const response = await fetch(`http://localhost:5000/threads/${course_id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch threads');
      }
      const data = await response.json();
      setThreads(data);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoadingThreads(false);
    }
  };
  const handleCreateThread = async () => {
    if (!newThread.title.trim()) {
      Swal.fire('Error', 'Thread title cannot be empty', 'error');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/threads/course/${course_id}/${forumId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(newThread),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create thread');
      }
      const createdThread = await response.json();
      setThreads([...threads, createdThread]);
      setNewThread({ title: '' });
      Swal.fire('Success', 'Thread created successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };
  const handleDeleteThread = async (threadId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete thread');
      }
      setThreads(threads.filter((thread) => thread._id !== threadId));
      Swal.fire('Success', 'Thread deleted successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };
  useEffect(() => {
    if (session?.accessToken) {
      fetchForumDetails();
      fetchThreads();
    }
  }, [session, forumId]);
  return (
    <div className="container mx-auto px-4 py-8">
      {loadingForum ? (
        <p>Loading forum details...</p>
      ) : (
        forum && (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">{forum.title}</h1>
            <p className="text-center text-gray-600 mb-8">Course ID: {course_id}</p>
          </>
        )
      )}
      {/* Create Thread */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create a New Thread</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Thread Title"
            className="flex-grow border p-2 rounded"
            value={newThread.title}
            onChange={(e) => setNewThread({ title: e.target.value })}
          />
          <button
            onClick={handleCreateThread}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Create
          </button>
        </div>
      </div>
      {/* Display Threads */}
      {loadingThreads ? (
        <p>Loading threads...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {threads.map((thread) => (
            <div key={thread._id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-4">{thread.title}</h3>
              <div className="text-sm text-gray-600 mb-4">
                <p>Users in the thread:</p>
                <ul>
                  {thread.EnvolvedUsers_ids.map((user, index) => (
                    <li key={user._id || `${user.email}-${index}`}>
                      {user.name} - {user.email}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Link href={`/forums/${forumId}/${thread._id}?courseId=${course_id}&threadId=${thread._id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  View Thread
                </Link>
                <button
                  onClick={() => handleDeleteThread(thread._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loadingThreads && threads.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No threads available for this forum.</p>
      )}
    </div>
  );
}