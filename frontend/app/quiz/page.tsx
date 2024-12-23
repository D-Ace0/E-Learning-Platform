import Swal from 'sweetalert2';
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import Link from 'next/link';

interface Quiz {
  _id: string;
  module_id: string;
  questions?: string[]; // Array of ObjectIds as strings (optional)
  created_at: string;
}

interface Module {
  _id: string;
  course_id: string;
  title: string;
  content: string;
  resources: string[];
  created_at: string;
}

const MyQuizzes = async () => {
  const session = await getServerSession(options);

  if (!session) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'You need to be logged in to view quizzes.',
    });
    return <p className="text-red-500">You need to be logged in to view quizzes.</p>;
  }

  try {
    const response = await fetch(`http://localhost:5000/quiz`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch quizzes');
    }

    const quizzes: Quiz[] = await response.json();

    // Fetch module details for each quiz
    const quizzesWithModules = await Promise.all(
      quizzes.map(async (quiz) => {
        const moduleResponse = await fetch(`http://localhost:5000/module/${quiz.module_id}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        let module: Module | null = null;

        if (moduleResponse.ok) {
          module = await moduleResponse.json();
        } else {
          console.error(`Failed to fetch module for quiz ${quiz._id}`);
        }

        return {
          ...quiz,
          moduleTitle: module ? module.title : 'Unknown Module',
          courseId: module ? module.course_id : 'Unknown Course',
        };
      })
    );

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Available Quizzes</h1>
        {quizzesWithModules.length === 0 ? (
          <p className="text-center">No quizzes are available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {quizzesWithModules.map((quiz, index) => (
              <div key={quiz._id} className="bg-white shadow-md rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Quiz {index + 1}</h2>
                <h3 className="text-lg font-medium mb-2">Module: {quiz.moduleTitle}</h3>
                <Link href={`../courses/modules?courseId=${quiz.courseId}`} className="text-blue-600 hover:underline">
                  View Module
                </Link>
                <p className="text-gray-700 mb-2">Questions: {quiz.questions ? quiz.questions.length : 0}</p>
                <p className="text-gray-700">Created At: {new Date(quiz.created_at).toLocaleString()}</p>
                {/* Link to access the quiz questions */}
                {session?.role === "student" && (
                  <Link href={`/quiz/questions/${quiz._id}`} className="text-green-600 hover:underline mt-4 block">
                  Take Quiz
                </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Failed to fetch quizzes',
    });
    return <p className="text-red-500">{err.message || 'Failed to fetch quizzes'}</p>;
  }
};

export default MyQuizzes;
