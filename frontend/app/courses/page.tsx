'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    video: string;
    pdf: string;
    created_at: string;
    created_by: string;
    Thread: string[];
    enrolledStudents: string[];
    parentVersion: string[];
    isOutdated: boolean;
}

export default function Courses() {
    const { data: session, status } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categories = ['History', 'Science', 'Engineering', 'Art', 'Computer Science', 'Mathematics', 'Literature'];

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prevSelectedCategories) =>
            prevSelectedCategories.includes(category)
                ? prevSelectedCategories.filter((c) => c !== category)
                : [...prevSelectedCategories, category]
        );
    };

    const isCourseOutdated = (createdAt: string): boolean => {
        const createdDate = new Date(createdAt);
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        return createdDate < fiveDaysAgo;
    };

    useEffect(() => {
        const fetchCourses = async () => {
            if (!session) return;
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                const response = await fetch('http://localhost:5000/courses', {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch courses');
                }
                const data = await response.json();
                const coursesWithOutdatedStatus = data.map((course: Course) => ({
                    ...course,
                    isOutdated: isCourseOutdated(course.created_at),
                }));
                setCourses(coursesWithOutdatedStatus);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch courses');
                setCourses([]);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [session]);

    const filteredCourses = courses.filter((course) => {
        const matchesSearchTerm =
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategories.length
            ? selectedCategories.includes(course.category)
            : true;
        return matchesSearchTerm && matchesCategory;
    });

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Course List</h1>
            <div className="mb-4">
                {categories.map((category) => (
                    <label key={category} className="mr-4">
                        <input
                            type="checkbox"
                            value={category}
                            checked={selectedCategories.includes(category)}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        />
                        {category}
                    </label>
                ))}
            </div>
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
            {filteredCourses.length === 0 && !loading && (
                <p className="text-gray-500 text-center mb-4">No courses found.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {session ? (
                    filteredCourses.map((course) => (
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
                                    onClick={() => Swal.fire('Instructor details to be implemented!')}
                                    className="mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    View Instructor Details
                                </button>
                                {session.role === 'student' && (
                                    <>
                                        <Link href={`/courses/modules?courseId=${course._id}`} className="text-blue-600 hover:underline">Modules</Link>
                                        <button
                                            onClick={() => Swal.fire('Enrollment to be implemented!')}
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
