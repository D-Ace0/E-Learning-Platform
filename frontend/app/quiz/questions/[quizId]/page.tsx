'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useParams } from 'next/navigation';

interface Question {
  questionId: string;
  questionText: string;
  type: string; // "MCQ" or "True/False"
  options?: string[]; // Only for MCQ
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

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Quiz Questions</h1>
      <div className="space-y-8">
        {questions.map((q, index) => (
          <div
            key={q.questionId}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <p className="font-semibold text-lg mb-4">
              {index + 1}. {q.questionText}
            </p>
            {q.type === "MCQ" && q.options ? (
              <div className="space-y-2">
                {q.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="block cursor-pointer hover:bg-gray-100 p-2 rounded transition"
                  >
                    <input
                      type="radio"
                      name={q.questionId}
                      value={option}
                      checked={answers[q.questionId] === option}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.questionId]: e.target.value })
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : q.type === "True/False" ? (
              <div className="space-y-2">
                <label className="block cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                  <input
                    type="radio"
                    name={q.questionId}
                    value="True"
                    checked={answers[q.questionId] === "True"}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.questionId]: e.target.value })
                    }
                    className="mr-2"
                  />
                  True
                </label>
                <label className="block cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                  <input
                    type="radio"
                    name={q.questionId}
                    value="False"
                    checked={answers[q.questionId] === "False"}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.questionId]: e.target.value })
                    }
                    className="mr-2"
                  />
                  False
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizQuestionsPage;
