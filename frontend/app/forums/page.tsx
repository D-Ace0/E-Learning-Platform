'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import Link from 'next/link'; // Import Link for navigation

interface Forum {
  _id: string;
  title: string;
  course_id: string;
  createdby: string;
  instructor_id: string;
}

export default function ForumsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId'); // Extracting courseId from the URL

  const [forums, setForums] = useState<Forum[]>([]);
  const [newForum, setNewForum] = useState({ title: '' });
  const [loading, setLoading] = useState(false);

  const fetchForums = async () => {
    if (!courseId) {
      Swal.fire('Error', 'Course ID is missing in the URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/forum/${courseId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      console.log("fetching all")
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch forums here');
      }

      const data = await response.json();
      setForums(data);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    if (!courseId) {
      Swal.fire('Error', 'Course ID is missing in the URL', 'error');
      return;
    }

    if (!newForum.title) {
      Swal.fire('Error', 'Forum title is required', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/forum/course/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(newForum),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create forum');
      }

      const createdForum = await response.json();
      setForums([...forums, createdForum]);
      setNewForum({ title: '' });
      Swal.fire('Success', 'Forum created successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteForum = async (forumId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/forum/${forumId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete forum');
      }

      setForums(forums.filter((forum) => forum._id !== forumId));
      Swal.fire('Success', 'Forum deleted successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchForums();
    }
  }, [session, courseId]);

  if (loading) return <p>Loading forums...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Forums</h1>

      {/* Create Forum */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create a New Forum</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Forum Title"
            className="flex-grow border p-2 rounded"
            value={newForum.title}
            onChange={(e) => setNewForum({ title: e.target.value })}
          />
          <button
            onClick={handleCreateForum}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* Display Forums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {forums.map((forum) => (
          <div
            key={forum._id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-4">{forum.title}</h3>
            <p className="text-sm text-gray-600 mb-4">Course ID: {forum.course_id}</p>
            <div className="flex gap-4">
              {/* Link to the specific forum's page */}
              <Link
                href={`/forums/${forum._id}?courseId=${forum.course_id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                View Forum               {/* i want to send the course_id in the forum to use it as parameter in the [forumid] */}

              </Link>
              <button
                onClick={() => handleDeleteForum(forum._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {forums.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No forums available for this course.</p>
      )}
    </div>
  );
}
