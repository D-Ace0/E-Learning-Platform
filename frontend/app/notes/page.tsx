'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Notes {
  _id: string;
  title: string;
  content: string;
module_id: string;
course_id: string;

}
interface Module {
  title: string;
  _id: string;
  name: string;
}
interface Course {
  title: string | number | readonly string[] | undefined;
  _id: string;
  name: string;
}


const NotesPage: React.FC = () => {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<Notes[]>([]);
  const [myNotes, setMyNotes] = useState<Notes[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  useEffect(() => {
    if (error || message) {
      const timeout = setTimeout(() => {
        setError(null);
        setMessage(null);
      }, 3000);
  
      return () => clearTimeout(timeout);
    }
  }, [error, message]);
  useEffect(() => {
   console.log(session?.accessToken);

    const fetchNotes = async () => {
      if (!session) return;
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
      if (!session) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/notes/myNote/${session.user_id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
            
        } );
        if (!response.data) {
          throw new Error('Failed to fetch notes');
        } else {
          setMyNotes(response.data);
        }
      } catch (err: any) {
        setError(err?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    const fetchModules = async () => {
      if (!session) return;
      console.log('Fetching modules...');
      try {
        const response = await axios.get('http://localhost:5000/module', {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        console.log('Modules response:', response.data); // Log the data
        setModules(response.data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
  
    const fetchCourses = async () => {
      if (!session) return;
      console.log('Fetching courses...');
      try {
        const response = await axios.get('http://localhost:5000/courses', {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        setCourses(response.data);
        console.log('Courses response:', response.data); // Log the data
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
   

    const fetchData = async () => {
      await fetchNotes();
      await fetchMyNotes();
      await fetchModules();
      await fetchCourses();
    };
    fetchData();
  }, [session]);

  const handleDeleteNote = async (noteId: string) => {
    if (!session) {
      setError('User is not authenticated');
      return;
    }
  
    try {
      // Optimistically update the state to remove the note immediately
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      setMyNotes((prevMyNotes) => prevMyNotes.filter((note) => note._id !== noteId));
  
      const response = await axios.delete(`http://localhost:5000/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
  
      if (response?.status === 200) {
        setMessage('Note deleted successfully');
      } else {
        // If backend says "note not found," it means the note was already deleted
        setError('Note not found, but it has already been removed from the ui ');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Handle "Note not found" gracefully
        setError('Note not found, but it has already been removed.');
      } else {
        setError(err?.response?.data?.message || 'Something went wrong');
      }
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

  const handleCreateNote = async (title: string, content: string, module_id: string, course_id: string) => {
    if (!session) {
      setError('User is not authenticated');
      return;
    }
  
    // Validation for empty fields
    if (!title.trim() || !content.trim() || !module_id || !course_id) {
      setError('All fields (title, content, module, and course) are required.');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/notes',
        { title, content, module_id, course_id, user_id: session.user_id },
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
  
      if (response?.status === 201) {
        setMessage('Note created successfully');
        setNotes((prevNotes) => [...prevNotes, response.data]);
        setMyNotes((prevMyNotes) => [...prevMyNotes, response.data]); // Update both lists
        setNewNote({ title: '', content: '' }); // Clear the form
      } else {
        setError('Failed to create note');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    }
  };
  

  const handleAutosave = async (noteId: string, title: string, content: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/notes/${noteId}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
  
      if (response?.status === 200) {
        setMessage('Note updated successfully');
        // Update both notes and myNotes state
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === noteId ? { ...note, title, content } : note
          )
        );
        setMyNotes((prevMyNotes) =>
          prevMyNotes.map((note) =>
            note._id === noteId ? { ...note, title, content } : note
          )
        );
      } else {
        setError('Failed to update note');
      }
    } catch (err) {
      setError('Something went wrong');
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
  
        {/* Create Note Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Module Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={modulesLoading || modules.length === 0}
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.title}
                  </option>
                ))}
              </select>
              {modules.length === 0 && !modulesLoading && (
                <p className="text-red-500 mt-2">No modules available.</p>
              )}
            </div>
  
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={coursesLoading || courses.length === 0}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {courses.length === 0 && !coursesLoading && (
                <p className="text-red-500 mt-2">No courses available.</p>
              )}
            </div>
          </div>
  
          {/* Note Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter note title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            <button
              onClick={() =>
                handleCreateNote(
                  newNote.title,
                  newNote.content,
                  selectedModule,
                  selectedCourse
                )
              }
              disabled={
                !selectedModule || !selectedCourse || !newNote.title || !newNote.content
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Note
            </button>
          </div>
        </div>
  
        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'all'
            ? notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Title */}
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                handleAutosave(note._id, e.target.innerText, note.content)
              }
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              {note.title || "Untitled Note"} {/* Default title fallback */}
            </h2>

                    <p className="text-gray-500 italic mb-1">
                      Module: {modules.find((m) => m._id === note.module_id)?.title || 'Unknown'}
                    </p>
                    <p className="text-gray-500 italic mb-4">
                      Course: {courses.find((c) => c._id === note.course_id)?.title || 'Unknown'}
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleAutosave(note._id, note.title, e.target.innerText)
                      }
                      className="text-gray-600 mb-4"
                    >
                      {note.content}
                    </p>
                    <div className="flex space-x-3">
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
                    <h2
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleAutosave(note._id, e.target.innerText, note.content)
                      }
                      className="text-xl font-semibold text-gray-900 mb-2"
                    >
                      {note.title}
                    </h2>
                    <p className="text-gray-500 italic mb-1">
                      Module: {modules.find((m) => m._id === note.module_id)?.title || 'Unknown'}
                    </p>
                    <p className="text-gray-500 italic mb-4">
                      Course: {courses.find((c) => c._id === note.course_id)?.title || 'Unknown'}
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        handleAutosave(note._id, note.title, e.target.innerText)
                      }
                      className="text-gray-600 mb-4"
                    >
                      {note.content}
                    </p>
                    <div className="flex space-x-3">
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




