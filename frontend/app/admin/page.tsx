'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiBook, FiMessageSquare, FiActivity, FiTrendingUp, FiUserPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalForums: number;
  percentages: {
    users: number;
    courses: number;
    forums: number;
    quizzes: number;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalForums: 0,
    percentages: {
      users: 0,
      courses: 0,
      forums: 0,
      quizzes: 0
    }
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      router.push('/signin');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [usersResponse, coursesResponse, quizzesResponse, forumsResponse] = await Promise.all([
          fetch('http://localhost:5000/users/allUsers', {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
            },
          }),
          fetch('http://localhost:5000/courses', {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
            },
          }),
          fetch('http://localhost:5000/quiz', {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
            },
          }),
          fetch('http://localhost:5000/forum', {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
            },
          })
        ]);

        if (!usersResponse.ok || !coursesResponse.ok || !quizzesResponse.ok || !forumsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }

        // Parse all responses
        const [usersData, coursesData, quizzesData, forumsData] = await Promise.all([
          usersResponse.json(),
          coursesResponse.json(),
          quizzesResponse.json(),
          forumsResponse.json()
        ]);

        // Calculate current totals
        const totalUsers = Array.isArray(usersData) ? usersData.length : (usersData.users?.length || 0);
        const totalCourses = Array.isArray(coursesData) ? coursesData.length : (coursesData.courses?.length || 0);
        const totalQuizzes = Array.isArray(quizzesData) ? quizzesData.length : (quizzesData.quizzes?.length || 0);
        const totalForums = Array.isArray(forumsData) ? forumsData.length : (forumsData.forums?.length || 0);

        // Calculate mock growth percentages based on current data
        // In a real app, you would compare with historical data
        const mockGrowth = {
          users: totalUsers > 0 ? ((totalUsers - (totalUsers * 0.9)) / (totalUsers * 0.9)) * 100 : 0,
          courses: totalCourses > 0 ? ((totalCourses - (totalCourses * 0.95)) / (totalCourses * 0.95)) * 100 : 0,
          forums: totalForums > 0 ? ((totalForums - (totalForums * 0.92)) / (totalForums * 0.92)) * 100 : 0,
          quizzes: totalQuizzes > 0 ? ((totalQuizzes - (totalQuizzes * 0.85)) / (totalQuizzes * 0.85)) * 100 : 0
        };

        setStats({
          totalUsers,
          totalCourses,
          totalQuizzes,
          totalForums,
          percentages: mockGrowth
        });

        // Process recent activities
        const activities: RecentActivity[] = [];

        // Add course activities
        if (Array.isArray(coursesData)) {
          coursesData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach(course => {
              activities.push({
                type: 'course',
                message: `New course added: ${course.title}`,
                timestamp: new Date(course.created_at).toLocaleString()
              });
            });
        }

        // Add quiz activities
        if (Array.isArray(quizzesData)) {
          quizzesData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach(quiz => {
              activities.push({
                type: 'quiz',
                message: `New quiz created: ${quiz.title}`,
                timestamp: new Date(quiz.created_at).toLocaleString()
              });
            });
        }

        // Sort all activities by timestamp and take the most recent 3
        activities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setRecentActivities(activities.slice(0, 3));
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
        <div className="text-gray-600">Loading dashboard statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session?.user?.name}</span>
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-400 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className={`text-xs mt-2 flex items-center ${
                  stats.percentages.users >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <FiTrendingUp className="mr-1" />
                  {stats.percentages.users >= 0 ? '+' : ''}{stats.percentages.users.toFixed(1)}% from last month
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className={`text-xs mt-2 flex items-center ${
                  stats.percentages.courses >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <FiTrendingUp className="mr-1" />
                  {stats.percentages.courses >= 0 ? '+' : ''}{stats.percentages.courses.toFixed(1)}% from last month
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <FiBook className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Forums</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalForums}</p>
                <p className={`text-xs mt-2 flex items-center ${
                  stats.percentages.forums >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <FiTrendingUp className="mr-1" />
                  {stats.percentages.forums >= 0 ? '+' : ''}{stats.percentages.forums.toFixed(1)}% from last month
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <FiMessageSquare className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                <p className={`text-xs mt-2 flex items-center ${
                  stats.percentages.quizzes >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <FiTrendingUp className="mr-1" />
                  {stats.percentages.quizzes >= 0 ? '+' : ''}{stats.percentages.quizzes.toFixed(1)}% from last month
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <FiActivity className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="bg-blue-500 text-white p-3 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <FiUsers className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-600">View and manage user accounts</p>
                  </div>
                </Link>

                <Link
                  href="/admin/auth-logs"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="bg-green-500 text-white p-3 rounded-lg group-hover:bg-green-600 transition-colors">
                    <FiCheckCircle className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Auth Logs</h3>
                    <p className="text-sm text-gray-600">Monitor authentication activity</p>
                  </div>
                </Link>

                <Link
                  href="/admin/courses"
                  className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="bg-purple-500 text-white p-3 rounded-lg group-hover:bg-purple-600 transition-colors">
                    <FiBook className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Manage Courses</h3>
                    <p className="text-sm text-gray-600">Add and edit course content</p>
                  </div>
                </Link>

                <Link
                  href="/admin/quiz"
                  className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="bg-orange-500 text-white p-3 rounded-lg group-hover:bg-orange-600 transition-colors">
                    <FiActivity className="text-xl" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Manage Quizzes</h3>
                    <p className="text-sm text-gray-600">Create and edit quizzes</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
              </div>
              <div className="space-y-6">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'course' ? 'bg-green-100 text-green-600' :
                        activity.type === 'quiz' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'course' ? <FiBook className="text-lg" /> :
                         activity.type === 'quiz' ? <FiActivity className="text-lg" /> :
                         <FiUserPlus className="text-lg" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}