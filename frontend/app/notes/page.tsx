'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Notes {
  _id: string;
  title: string;
  content: string;
}

const NotesPage: React.FC = () => {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<Notes[]>([]);
  const [myNotes, setMyNotes] = useState<Notes[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  useEffect(() => {
    if (!session) return;

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/notes', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.data) {
          throw new Error('Failed to fetch notes');
        }

        setNotes(response.data);
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    const fetchMyNotes = async () => {
        setLoading(true);
        
        const response = await axios.post(
            'http://localhost:5000/notes/my-notes',
            {
                userId: session.user_id, // Ensure this is the correct key
         
            },
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!response.data) {
            throw new Error('Failed to fetch notes');
        }
        else{
            setMyNotes(response.data);

        }
    }
    

    fetchNotes();
    fetchMyNotes();

  }, [session]);

  const handleDeleteNote = async (noteId: string) => {
    if (!session) {
      setError('User is not authenticated');
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response?.status === 204) {
        setMessage('Note deleted successfully');
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      } else {
        setError('Failed to delete note');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    }
  };

  const handlePatchNote = async (noteId: string, title: string, content: string) => {
    if (!session) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/notes/${noteId}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response?.status === 200) {
        setMessage('Note updated successfully');
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, title, content } : note
          )
        );
      } else {
        setError('Failed to update note');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    }
  };

  const handleCreateNote = async (title: string, content: string) => {
    if (!session) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/notes',
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response?.status === 201) {
        setMessage('Note created successfully');
        setNotes((prevNotes) => [...prevNotes, response.data]);
      } else {
        setError('Failed to create note');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    }
  };

return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notes Dashboard</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Notes
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Notes
          </button>
        </nav>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"/>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'all' 
          ? notes.map((note) => (
            <div 
              key={note._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h2>
                <p className="text-gray-600 mb-4">{note.content}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePatchNote(note._id, note.title, note.content)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
          : myNotes.map((note) => (
            <div 
              key={note._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h2>
                <p className="text-gray-600 mb-4">{note.content}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handlePatchNote(note._id, note.title, note.content)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>
);
};

export default NotesPage;
