'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';

interface Question {
  _id: string;
  question: string;
  type: string;
  options?: string[];
  answer: string;
  difficulty: string;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/question', {
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEdit = async (question: Question) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Question',
      html: `
        <input id="swal-input-question" class="swal2-input" placeholder="Question" value="${question.question}" />
        <input id="swal-input-answer" class="swal2-input" placeholder="Answer" value="${question.answer}" />
        <select id="swal-input-difficulty" class="swal2-select">
          <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
          <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const updatedQuestion = (document.getElementById('swal-input-question') as HTMLInputElement).value;
        const updatedAnswer = (document.getElementById('swal-input-answer') as HTMLInputElement).value.trim();
        const updatedDifficulty = (document.getElementById('swal-input-difficulty') as HTMLSelectElement).value;

        if (!updatedQuestion || !updatedAnswer) {
          Swal.showValidationMessage('Both Question and Answer are required');
          return null;
        }

        if (question.type === 'True/False') {
          // Ensure capitalization for True/False answers
          const normalizedAnswer = updatedAnswer.toLowerCase();
          if (normalizedAnswer !== 'true' && normalizedAnswer !== 'false') {
            Swal.showValidationMessage('Answer for True/False must be "True" or "False"');
            return null;
          }
          return {
            question: updatedQuestion,
            answer: normalizedAnswer.charAt(0).toUpperCase() + normalizedAnswer.slice(1),
            difficulty: updatedDifficulty,
          };
        }

        return { question: updatedQuestion, answer: updatedAnswer, difficulty: updatedDifficulty };
      },
    });

    if (formValues) {
      try {
        const response = await fetch(`http://localhost:5000/question/${question._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(formValues),
        });

        if (!response.ok) {
          throw new Error('Failed to update question');
        }

        await fetchQuestions(); // Refresh the list of questions
        Swal.fire('Updated!', 'The question has been updated.', 'success');
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const handleDelete = async (questionId: string) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
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

        await fetchQuestions(); // Refresh the list of questions
        Swal.fire('Deleted!', 'The question has been deleted.', 'success');
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Question Bank</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => (
          <div key={question._id} className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-bold">{question.question}</h2>
            <p className="text-gray-700">Answer: {question.answer}</p>
            <p className="text-gray-500">Difficulty: {question.difficulty}</p>
            {question.options && question.options.length > 0 && (
              <ul className="text-gray-700 mt-2">
                {question.options.map((option, index) => (
                  <li key={index}>&#8226; {option}</li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleEdit(question)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(question._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
