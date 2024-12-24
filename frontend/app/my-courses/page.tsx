import Swal from 'sweetalert2';
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
}

const MyCourses = async () => {
  const session = await getServerSession(options);

  if (!session) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'You need to be logged in to view your courses.',
    });
    return <p className="text-red-500">You need to be logged in to view your courses.</p>;
  }

  try {
    const userId = session.user_id; // Assuming user ID is stored in the session

    const response = await fetch(`http://localhost:5000/users/${userId}/courses`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch courses');
    }

    const courses: Course[] = await response.json(); // Now the response includes _id, title, and description

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">My Enrolled Courses</h1>
        {courses.length === 0 ? (
          <p className="text-center">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="bg-white shadow-md rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <div className="flex justify-center space-x-4">
                  {/* Link to Modules */}
                  <Link
                    href={`../courses/modules?courseId=${course._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Modules
                  </Link>
                  {/* Link to Forums */}
                  <Link
                    href={`../forums?courseId=${course._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Forums
                  </Link>
                </div>
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
      text: err.message || 'Failed to fetch courses',
    });
    return <p className="text-red-500">{err.message || 'Failed to fetch courses'}</p>;
  }
};

export default MyCourses;
