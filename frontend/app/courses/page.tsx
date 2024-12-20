'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Course {
    title: string;
    description: string;
    category: string;
    difficulty_level: string;
    video: string;
    pdf: string;
    created_at: string;
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
                    setCourses(data);
                    setNotFound(data.length === 0);
                } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    setCourses([data]);
                    setNotFound(false);
                } else {
                    setCourses([]);
                    setNotFound(true);
                    console.error('Expected an array or a single course object, but got:', data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch courses');
                setCourses([]);
                setNotFound(true);
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [session, searchTerm]);

    if (status === 'loading' || loading) {
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
            {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
            {notFound && <p className="text-gray-500 text-center mb-4">No courses found.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {session ? (
                    courses.map((course) => (
                        <div key={course.title} className="bg-white shadow-md rounded-lg p-6 text-center">
                            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                            <p className="text-gray-700 mb-4">{course.description}</p>
                            <p className="text-sm text-blue-500 mb-2"><strong>Category:</strong> {course.category}</p>
                            <p className="text-sm text-green-500 mb-2"><strong>Difficulty Level:</strong> {course.difficulty_level}</p>
                            <a href={course.video} className="text-blue-600 hover:underline mb-2 block">Watch Video</a>
                            <a href={course.pdf} className="text-blue-600 hover:underline">Download PDF</a>
                        </div>
                    ))
                ) : (
                    <h2 className="text-3xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
                )}
            </div>
        </div>
    );
}