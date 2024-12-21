'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

interface Course {
    courseId: string;
    courseTitle: string;
    description: string;
    createdAt: string;
}

interface Analytics {
    courseId: string;
    downloadLink: string;
    averageQuizScore: number;
    allGrades: Array<{ id: string; score: number }>;
}

export default function InstructorDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchCourses = async () => {
            if (!session) return;
            try {
                if (session.role !== 'instructor') {
                    setError('Unauthorized: You must be an instructor to view this page.');
                    return;
                }

                const response = await fetch(`http://localhost:5000/dashboard/instructor/${session.user_id}`, {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                });
                if (!response.ok) throw new Error('Failed to fetch courses');
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError((err as Error).message);
            }
        };

        fetchCourses();
    }, [session]);

    const fetchCourseAnalytics = async (courseId: string) => {
        if (!session) return;
        try {
            const response = await fetch(`http://localhost:5000/dashboard/course/${courseId}`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();

            // Use the relative download link
            const link = document.createElement('a');
            link.href = data.downloadLink;
            link.download = `Course_Analytics_${courseId}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError((err as Error).message);
        }
    };




    if (status === 'loading') return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Instructor Dashboard</h1>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Courses Created</h2>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <div key={course.courseId} className="border p-4 rounded mb-4">
                                <h3 className="text-lg font-bold">{course.courseTitle}</h3>
                                <p>{course.description}</p>
                                <p>Created At: {new Date(course.createdAt).toLocaleDateString()}</p>
                                <button
                                    onClick={() => fetchCourseAnalytics(course.courseId)}
                                    className="mt-4 bg-blue-500 text-white p-2 rounded"
                                >
                                    View Analytics
                                </button>
                                {/* Inline analytics rendering */}
                                {analytics && analytics.courseId === course.courseId && (
                                    <div className="bg-gray-100 p-4 rounded mt-4">
                                        <a href={analytics.downloadLink} className="text-blue-500 underline" target="_blank">
                                            Download CSV
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No courses created yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
