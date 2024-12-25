'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiMessageSquare, FiActivity, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import Link from 'next/link';

interface SiteStats {
  totalUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalForums: number;
  activeUsers: number;
  completionRate: number;
  averageScore: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SiteStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalForums: 0,
    activeUsers: 0,
    completionRate: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.accessToken) return;

      setLoading(true);
      try {
        // Fetch total users (admin only)
        const usersResponse = await fetch('http://localhost:5000/users/allUsers', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users data');
        }

        const usersData = await usersResponse.json();
        const totalUsers = Array.isArray(usersData) ? usersData.length : 
                         (usersData.users ? usersData.users.length : 0);

        // Fetch courses data
        const coursesResponse = await fetch('http://localhost:5000/courses', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        const coursesData = await coursesResponse.json();
        const totalCourses = Array.isArray(coursesData) ? coursesData.length : 
                           (coursesData.courses ? coursesData.courses.length : 0);

        // Fetch quizzes data
        const quizzesResponse = await fetch('http://localhost:5000/quiz', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        const quizzesData = await quizzesResponse.json();
        const totalQuizzes = Array.isArray(quizzesData) ? quizzesData.length : 
                           (quizzesData.quizzes ? quizzesData.quizzes.length : 0);

        // Fetch forums data
        const forumsResponse = await fetch('http://localhost:5000/forum', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        const forumsData = await forumsResponse.json();
        const totalForums = Array.isArray(forumsData) ? forumsData.length : 
                          (forumsData.forums ? forumsData.forums.length : 0);

        // Calculate active users based on enrolled students
        let activeUsers = 0;
        if (Array.isArray(coursesData)) {
          const enrolledStudents = new Set();
          coursesData.forEach(course => {
            if (course.enrolledStudents) {
              course.enrolledStudents.forEach(studentId => enrolledStudents.add(studentId));
            }
          });
          activeUsers = enrolledStudents.size;
        }

        // Calculate completion rate from progress data
        let completionRate = 0;
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          const totalEnrollments = coursesData.reduce((total, course) => 
            total + (course.enrolledStudents?.length || 0), 0);
          const completedCourses = coursesData.reduce((total, course) => 
            total + (course.completedStudents?.length || 0), 0);
          completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0;
        }

        // Calculate average quiz score
        let averageScore = 0;
        if (Array.isArray(quizzesData) && quizzesData.length > 0) {
          const totalScores = quizzesData.reduce((total, quiz) => 
            total + (quiz.averageScore || 0), 0);
          averageScore = totalScores / quizzesData.length;
        }

        setStats({
          totalUsers,
          totalCourses,
          totalQuizzes,
          totalForums,
          activeUsers,
          completionRate: Math.round(completionRate),
          averageScore: Math.round(averageScore)
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching site statistics:', err);
        setError('Failed to fetch site statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">Loading site statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome!</h1>
          <p className="text-xl text-gray-600">
            {session ? `Welcome back${session.user?.name ? ', ' + session.user.name : ''}!` : 'Welcome to our E-Learning Platform'}
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiUsers className="text-3xl text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiBook className="text-3xl text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiActivity className="text-3xl text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiMessageSquare className="text-3xl text-orange-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Active Forums</p>
                <p className="text-2xl font-bold">{stats.totalForums}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiTrendingUp className="text-3xl text-indigo-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-gray-500">Currently engaged users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiClock className="text-3xl text-pink-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Course Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-sm text-gray-500">Average completion rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FiAward className="text-3xl text-yellow-500 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Average Quiz Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-gray-500">Platform-wide average</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/courses"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-700">Browse Courses</h3>
              <p className="text-sm text-blue-600">Explore our available courses</p>
            </a>

            <a
              href="/quiz"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-700">Take a Quiz</h3>
              <p className="text-sm text-green-600">Test your knowledge</p>
            </a>

            <a
              href="/forums"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-semibold text-purple-700">Join Discussions</h3>
              <p className="text-sm text-purple-600">Engage with the community</p>
            </a>

            <a
              href="/profile"
              className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <h3 className="font-semibold text-orange-700">Your Profile</h3>
              <p className="text-sm text-orange-600">View your progress</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
