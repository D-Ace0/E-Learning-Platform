'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useSearchParams } from 'next/navigation';

interface Module {
  _id: string;
  course_id: string;
  title: string;
  content: string;
  resources: string[];
  created_at: string;
}

interface Quiz {
  _id: string;
  module_id: string;
  created_at: string;
  questions: string[];
}

export default function Modules() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<{ [key: string]: Quiz[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuiz, setNewQuiz] = useState<{ module_id: string; questions: string[] }>({
    module_id: '',
    questions: [],
  });
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null); // Quiz being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) {
        setError('Course ID is missing in the URL.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/module/course/${courseId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }

        const data = await response.json();
        setModules(data);

        for (const module of data) {
          await fetchQuizzesByModule(module._id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [session, courseId]);

  const fetchQuizzesByModule = async (moduleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/quiz/module/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes for module');
      }

      const data = await response.json();
      setQuizzes((prev) => ({ ...prev, [moduleId]: data }));
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleCreateQuiz = async (moduleId: string) => {
    const quizData = {
      module_id: moduleId,
      questions: [],
    };

    try {
      const response = await fetch(`http://localhost:5000/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quiz');
      }

      const createdQuiz = await response.json();
      setQuizzes((prev) => ({
        ...prev,
        [moduleId]: [...(prev[moduleId] || []), createdQuiz],
      }));

      Swal.fire('Success', 'Quiz created successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleUpdateQuiz = async () => {
    if (!editingQuiz) return;

    try {
      const response = await fetch(`http://localhost:5000/quiz/${editingQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          module_id: editingQuiz.module_id,
          questions: newQuiz.questions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quiz');
      }

      const updatedQuiz = await response.json();
      setQuizzes((prev) => ({
        ...prev,
        [editingQuiz.module_id]: prev[editingQuiz.module_id].map((quiz) =>
          quiz._id === updatedQuiz._id ? updatedQuiz : quiz
        ),
      }));

      setIsModalOpen(false);
      setEditingQuiz(null);
      setNewQuiz({ module_id: '', questions: [] });

      Swal.fire('Success', 'Quiz updated successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteQuiz = async (quizId: string, moduleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quiz');
      }

      setQuizzes((prev) => ({
        ...prev,
        [moduleId]: prev[moduleId].filter((quiz) => quiz._id !== quizId),
      }));

      Swal.fire('Success', 'Quiz deleted successfully!', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Modules for Course</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {modules.map((module) => (
          <div key={module._id} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
            <p className="text-gray-700 mb-4">{module.content}</p>
            <p className="text-sm text-gray-500 mb-2">Created At: {new Date(module.created_at).toLocaleDateString()}</p>
            {session?.role === 'instructor' && (
              <div className="mb-4">
                <button
                  onClick={() => handleCreateQuiz(module._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Create Quiz
                </button>
              </div>
            )}
            <h3 className="text-lg font-semibold mt-4">Quizzes</h3>
            <ul>
              {quizzes[module._id]?.map((quiz) => (
                <li key={quiz._id} className="mb-2 p-2 border rounded shadow">
                  <p>Quiz ID: {quiz._id}</p>
                  <p>Created At: {new Date(quiz.created_at).toLocaleDateString()}</p>
                  {session?.role === 'instructor' && (
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setNewQuiz({ module_id: quiz.module_id, questions: quiz.questions });
                          setIsModalOpen(true);
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id, module._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Edit Quiz</h2>
            <textarea
              placeholder="Questions (comma separated)"
              value={newQuiz.questions.join(', ')}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, questions: e.target.value.split(',').map((q) => q.trim()) })
              }
              className="border p-2 mb-2 w-full"
            />
            <div className="flex justify-between mt-4">
              <button onClick={handleUpdateQuiz} className="bg-blue-500 text-white px-4 py-2 rounded">
                Update Quiz
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingQuiz(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
