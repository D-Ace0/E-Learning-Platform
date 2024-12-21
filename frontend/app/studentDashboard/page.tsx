'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface studentDashBoard {
    AverageQuizScores: number;
    AllGrades: Array<{ id: string; score: number }>;
    ProgressPercent: Array<{ completionPercentage: number; course_id: string }>;
    interaction: Array<{ _id: string; user_id: string; course_id: string; response_id: string; time_spent_minutes: number; last_accessed: string }>;
    courseTitles: { [key: string]: string };
}

export default function DashboardPage() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<studentDashBoard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
        if (!session) return;

        if (!session?.user_id) {
            console.error('No user ID found in session');
            return;
        }

        const fetchDashboard = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:5000/dashboard/student/${session.user_id}`, {
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseText = await response.text();
                const data = JSON.parse(responseText);

                // Check for missing course titles
                if (data.ProgressPercent) {
                    data.ProgressPercent.forEach((progress: any) => {
                        if (!data.courseTitles[progress.course_id]) {
                            console.warn(`Missing title for course ID: ${progress.course_id}`);
                        }
                    });
                }

                setDashboardData([data]);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [session, status, router]);

    if (status === 'loading' || loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (notFound) return <p>No data found for the student dashboard.</p>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            {dashboardData.map((data, index) => (
                <div key={index} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Overall Performance</h2>
                        <p className="text-lg">Average Quiz Score: {data.AverageQuizScores.toFixed(2)}%</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Individual Grades</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data.AllGrades}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="id" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.ProgressPercent.map((progress, idx) => {
                                const courseTitle = data.courseTitles[progress.course_id] || `Course ID: ${progress.course_id}`;
                                return (
                                    <div key={idx} className="border p-4 rounded">
                                        <div className="mb-4">
                                            <p className="text-lg font-bold">{courseTitle}</p>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${progress.completionPercentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="mt-2 text-sm">Completion: {progress.completionPercentage}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Course Interactions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.interaction.map((interaction) => (
                                <div key={interaction._id} className="border p-4 rounded">
                                    <p>Course Title: {data.courseTitles[interaction.course_id] || `Course ID: ${interaction.course_id}`}</p>
                                    <p>Time Spent: {interaction.time_spent_minutes} minutes</p>
                                    <p>Last Accessed: {new Date(interaction.last_accessed).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
