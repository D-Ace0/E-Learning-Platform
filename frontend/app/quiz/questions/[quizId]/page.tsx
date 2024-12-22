'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useParams } from 'next/navigation';

interface Question {
  questionId: string;
  questionText: string;
}

interface Feedback {
  questionId: string;
  submittedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const QuizQuestionsPage = () => {
  const { data: session, status } = useSession();
  const params = useParams(); // To get the `quizId`
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!session) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'You need to be logged in to view quiz questions!',
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/quiz/${params.quizId}/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`, // Authorization token added
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorData.message || 'Failed to fetch quiz questions.',
          });
          throw new Error(errorData.message || 'Failed to fetch quiz questions.');
        }

        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An error occurred while fetching questions.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [params.quizId, session]);

  const handleSubmit = async () => {
    const submittedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      const response = await fetch(`http://localhost:5000/quiz/submit/${params.quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`, // Authorization token added
        },
        body: JSON.stringify({ answers: submittedAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.message || 'Failed to submit quiz.',
        });
        throw new Error(errorData.message || 'Failed to submit quiz.');
      }

      const result = await response.json();

      // Displaying results in SweetAlert2
      Swal.fire({
        title: `<h2 style="font-size: 1.8rem; font-weight: bold;">Quiz Results</h2>`,
        html: `
          <div style="text-align: left; font-size: 1.1rem; padding: 10px;">
            <p style="margin-bottom: 1.5rem;">
              <strong>Your Score:</strong> <span style="font-size: 1.5rem; color: ${
                result.scorePercentage >= 75
                  ? "green"
                  : result.scorePercentage >= 50
                  ? "orange"
                  : "red"
              };">${result.scorePercentage}%</span>
            </p>
            <ul style="max-height: 300px; overflow-y: auto; list-style: none; padding: 0;">
              ${result.feedback
                .map(
                  (f: Feedback, index: number) => `
                  <li style="margin-bottom: 1rem; padding: 10px; border: 1px solid ${
                    f.isCorrect ? "green" : "red"
                  }; border-radius: 5px; background-color: ${
                    f.isCorrect ? "#e8f5e9" : "#ffebee"
                  };">
                    <strong>${index + 1}. ${
                    questions.find((q) => q.questionId === f.questionId)?.questionText || ""
                  }</strong>
                    <br />
                    Your Answer: <span style="color: ${
                      f.isCorrect ? "green" : "red"
                    };">${f.submittedAnswer}</span><br />
                    Correct Answer: <span style="color: green;">${f.correctAnswer}</span>
                  </li>
                `
                )
                .join("")}
            </ul>
          </div>
        `,
        width: "80%",
        padding: "2rem",
        color: "#333",
        background: "#f9f9f9 url(/images/learning-bg.png) no-repeat center center",
        backdrop: `
          rgba(0,0,0,0.4)
          url("/images/motivation.gif")
          left top
          no-repeat
        `,
        showCloseButton: true,
        confirmButtonText: "Close",
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to submit quiz.',
      });
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Quiz Questions</h1>
      <ul>
        {questions.map((q, index) => (
          <li key={q.questionId} className="mb-4">
            <p>
              {index + 1}. {q.questionText}
            </p>
            <input
              type="text"
              placeholder="Your answer"
              className="border rounded p-2 mt-2 w-full"
              onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
            />
          </li>
        ))}
      </ul>
      <button
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded"
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizQuestionsPage;
