'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Swal from 'sweetalert2'; // Import SweetAlert2

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    video: string;
    pdf: string;
    created_at: string;
    created_by: string; // Add created_by field
    Thread: string[];
    enrolledStudents: string[];
    parentVersion: string[];
    isOutdated: boolean; // Add isOutdated field
}

export default function Courses() {
    const { data: session, status } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const isCourseOutdated = (createdAt: string): boolean => {
        const createdDate = new Date(createdAt);
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        return createdDate < fiveDaysAgo;
       }

    const viewInstructorDetails = async (instructorId: string) => {
        if (!session) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You need to be logged in to view instructor details!',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/courses/instructors/${instructorId}`, {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.message || 'Failed to fetch instructor details',
                });
                throw new Error(errorData.message || 'Failed to fetch instructor details');
            }

            const instructor = await response.json();
            const instructorDetails = `
                <strong>Name:</strong> ${instructor.name}<br>
                <strong>Email:</strong> ${instructor.email}<br>
                <strong>Phone:</strong> ${instructor.phone || 'N/A'}<br>
                <strong>Bio:</strong> ${instructor.bio || 'N/A'}
            `;

            Swal.fire({
                icon: 'info',
                title: 'Instructor Details',
                html: instructorDetails,
            });
        } catch (error: any) {
            console.error('Error fetching instructor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const enrollCourse = async (courseId: string) => {
        if (!session) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You need to be logged in to enroll!',
            });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/courses/students/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Enrollment Failed',
                    text: errorData.message || 'Failed to enroll',
                });
                throw new Error(errorData.message || 'Failed to enroll');
            }

            const updatedCourses = courses.map((course) =>
                course._id === courseId
                    ? { ...course, enrolledStudents: [...course.enrolledStudents, session.user_id].filter((student): student is string => !!student) }
                    : course
            );
            setCourses(updatedCourses); // Update the local state with the new enrollment

            Swal.fire({
                icon: 'success',
                title: 'Congratulations!',
                text: 'You have successfully enrolled in the course!',
            });
        } catch (error: any) {
            setError(error.message || 'Failed to enroll in course');
            console.error('Error enrolling in course:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            if (!session) return;
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                let url = 'http://localhost:5000/courses';
                if (searchTerm) {
                    url = `http://localhost:5000/courses/${searchTerm}`;
                }
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch courses');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    const coursesWithOutdatedStatus = data.map(course => ({
                        ...course,
                        isOutdated: isCourseOutdated(course.created_at)
                    }));
                    setCourses(coursesWithOutdatedStatus);
                    setNotFound(coursesWithOutdatedStatus.length === 0);
                } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    const courseWithOutdatedStatus = {
                        ...data,
                        isOutdated: isCourseOutdated(data.created_at)
                    };
                    setCourses([courseWithOutdatedStatus]);
                    setNotFound(false);
                } else {
                    setCourses([]);
                    setNotFound(true);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch courses');
                setCourses([]);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
         fetchCourses();
    }, [session, searchTerm]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Course List</h1>
            <input
                type="text"
                placeholder="Search courses..."
                className="border p-2 mb-4 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            {loading && (
                <div className="flex justify-center items-center">
                    <div className="spinner"></div>
                </div>
            )}
            {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
            {notFound && <p className="text-gray-500 text-center mb-4">No courses found.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {session ? (
                      courses.map((course) => (
                        (session.role !== 'student' || !course.isOutdated) && (
                            <div key={course._id} className="bg-white shadow-md rounded-lg p-6 text-center">
                                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                                <p className="text-gray-700 mb-4">{course.description}</p>
                                <p className="text-sm text-blue-500 mb-2"><strong>Category:</strong> {course.category}</p>
                                <p className="text-sm text-green-500 mb-2"><strong>Difficulty Level:</strong> {course.difficulty_level}</p>
                               
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Enrolled Students:</strong> {course.enrolledStudents.length}
                                </p>
                                <button
                                    onClick={() => viewInstructorDetails(course.created_by)}
                                    className="mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    View Instructor Details
                                </button>
                                {session.role === 'student' && (
                                    <>
                                     <Link href={`/courses/modules?courseId=${course._id}`} className="text-blue-600 hover:underline">Modules</Link>
                                    <button
                                        onClick={() => enrollCourse(course._id)}
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Enroll Course
                                    </button>
                                    </>
                                )}
                            </div>
                        )
                    ))
                ) : (
                    <h2 className="text-3xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
                )}
            </div>
        </div>
    );
}
