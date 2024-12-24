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
  questionCount: number;
  questionType: string;
  questions: string[];
}

interface Question {
  _id: string;
  question: string;
  answer: string;
  options?: string[];
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function Modules() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<{ [key: string]: Quiz[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newQuizData, setNewQuizData] = useState({
    module_id: '',
    questionCount: 0,
    questionType: 'MCQ',
  });

  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    options: [''],
    type: 'MCQ',
    difficulty: 'easy',
  });

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
    if (!newQuizData.questionCount || !newQuizData.questionType) {
      Swal.fire('Error', 'Please specify question count and type.', 'error');
      return;
    }

    const quizData = {
      module_id: moduleId,
      questionCount: newQuizData.questionCount,
      questionType: newQuizData.questionType,
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

  const handleEditQuiz = async () => {
    if (!editingQuiz) return;

    const updatedQuizData = {
      questionCount: newQuizData.questionCount,
      questionType: newQuizData.questionType,
    };

    try {
      const response = await fetch(`http://localhost:5000/quiz/${editingQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(updatedQuizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to edit quiz');
      }

      const updatedQuiz = await response.json();

      setQuizzes((prev) => ({
        ...prev,
        [editingQuiz.module_id]: prev[editingQuiz.module_id].map((quiz) =>
          quiz._id === updatedQuiz._id ? updatedQuiz : quiz
        ),
      }));

      setEditingQuiz(null);
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

  const fetchQuestions = async (moduleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/question/module/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleCreateQuestion = async (moduleId: string) => {
    try {
      const response = await fetch('http://localhost:5000/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ ...newQuestion, module_id: moduleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      const createdQuestion = await response.json();
      setQuestions([...questions, createdQuestion]);
      setNewQuestion({
        question: '',
        answer: '',
        options: [''],
        type: 'MCQ',
        difficulty: 'easy',
      });
      Swal.fire('Success', 'Question created successfully!', 'success');
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/question/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter((q) => q._id !== questionId));
      Swal.fire('Success', 'Question deleted successfully!', 'success');
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Modules for Course</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {modules.map((module) => (
          <div
            key={module._id}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
            <p className="text-gray-700 mb-4">{module.content}</p>
            <p className="text-sm text-gray-500 mb-2">
              Created At: {new Date(module.created_at).toLocaleDateString()}
            </p>
            {session?.role === 'instructor' && (
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Question Count:</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full mb-4"
                  value={newQuizData.questionCount}
                  onChange={(e) =>
                    setNewQuizData({ ...newQuizData, questionCount: Number(e.target.value) })
                  }
                  placeholder="Enter the number of questions"
                />

                <label className="block mb-2 font-semibold">Question Type:</label>
                <select
                  className="border p-2 rounded w-full mb-4"
                  value={newQuizData.questionType}
                  onChange={(e) =>
                    setNewQuizData({ ...newQuizData, questionType: e.target.value })
                  }
                >
                  <option value="MCQ">MCQ</option>
                  <option value="True/False">True/False</option>
                </select>

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
                          setNewQuizData({
                            module_id: quiz.module_id,
                            questionCount: quiz.questionCount,
                            questionType: quiz.questionType,
                          });
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                      >
                        Edit Quiz
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

            {/* Question Bank Section */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">Question Bank</h3>
              
              {/* Question Creation Form */}
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <input
                  type="text"
                  placeholder="Question"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                />
                
                {newQuestion.type === 'MCQ' && (
                  <div className="mb-2">
                    {newQuestion.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        className="border p-2 rounded w-full mb-2"
                      />
                    ))}
                    <button
                      onClick={() => setNewQuestion({
                        ...newQuestion,
                        options: [...newQuestion.options, '']
                      })}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add Option
                    </button>
                  </div>
                )}
                
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="True/False">True/False</option>
                </select>
                
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="border p-2 rounded w-full mb-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                
                <button
                  onClick={() => handleCreateQuestion(module._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question._id} className="border p-4 rounded">
                    <p className="font-semibold">{question.question}</p>
                    <p className="text-gray-600">Answer: {question.answer}</p>
                    {question.options && (
                      <div className="mt-2">
                        <p className="font-medium">Options:</p>
                        <ul className="list-disc list-inside">
                          {question.options.map((option, index) => (
                            <li key={index}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Type: {question.type}</span>
                      <span className="text-sm text-gray-500 ml-4">Difficulty: {question.difficulty}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingQuiz && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Quiz</h2>
            <label className="block mb-2 font-semibold">Question Count:</label>
            <input
              type="number"
              className="border p-2 rounded w-full mb-4"
              value={newQuizData.questionCount}
              onChange={(e) =>
                setNewQuizData({ ...newQuizData, questionCount: Number(e.target.value) })
              }
              placeholder="Enter the number of questions"
            />

            <label className="block mb-2 font-semibold">Question Type:</label>
            <select
              className="border p-2 rounded w-full mb-4"
              value={newQuizData.questionType}
              onChange={(e) =>
                setNewQuizData({ ...newQuizData, questionType: e.target.value })
              }
            >
              <option value="MCQ">MCQ</option>
              <option value="True/False">True/False</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={handleEditQuiz}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingQuiz(null)}
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
