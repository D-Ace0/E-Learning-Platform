'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiFilter, FiBook, FiUsers, FiClock, FiStar, FiGrid, FiList, FiX } from 'react-icons/fi';
import { FaCode, FaLaptopCode, FaDatabase, FaCalculator, FaFlask, FaCogs, FaPalette, FaBook, FaLandmark } from 'react-icons/fa';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: string;
  enrolledStudents: string[];
  thumbnail?: string;
  duration?: string;
  rating?: number;
  instructor: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  created_at: string;
}

interface CategoryIcon {
  [key: string]: {
    icon: React.ElementType;
    color: string;
  };
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const categoryIcons: CategoryIcon = {
    'Programming': { icon: FaCode, color: 'text-blue-500' },
    'Web Development': { icon: FaLaptopCode, color: 'text-indigo-500' },
    'Data Science': { icon: FaDatabase, color: 'text-green-500' },
    'Mathematics': { icon: FaCalculator, color: 'text-red-500' },
    'Science': { icon: FaFlask, color: 'text-purple-500' },
    'Engineering': { icon: FaCogs, color: 'text-gray-500' },
    'Art': { icon: FaPalette, color: 'text-pink-500' },
    'Literature': { icon: FaBook, color: 'text-yellow-500' },
    'History': { icon: FaLandmark, color: 'text-brown-500' }
  };

  const categories = [
    'Programming', 'Web Development', 'Data Science', 'Mathematics',
    'Science', 'Engineering', 'Art', 'Literature', 'History'
  ];

  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/courses', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchCourses();
    }
  }, [session]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
    const matchesDifficulty = selectedDifficulty.length === 0 || selectedDifficulty.includes(course.difficultyLevel);
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete course');

      setCourses(courses.filter(course => course._id !== courseId));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const CourseDetailsModal = () => {
    if (!selectedCourse) return null;

    const CategoryIcon = categoryIcons[selectedCourse.category]?.icon || FiBook;
    const iconColor = categoryIcons[selectedCourse.category]?.color || 'text-gray-500';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <CategoryIcon className={`text-2xl ${iconColor}`} />
              <span className="text-sm text-gray-600">{selectedCourse.category}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedCourse.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                selectedCourse.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedCourse.difficultyLevel}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{selectedCourse.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selectedCourse.instructor && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Instructor</h3>
                  <div className="flex items-center space-x-2">
                    {selectedCourse.instructor.avatar ? (
                      <img
                        src={selectedCourse.instructor.avatar}
                        alt={selectedCourse.instructor.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                          {selectedCourse.instructor.name?.[0] || 'I'}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-600">{selectedCourse.instructor.name || 'Unknown Instructor'}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Course Stats</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiUsers className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {selectedCourse.enrolledStudents?.length || 0} students
                    </span>
                  </div>
                  {selectedCourse.rating && (
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {selectedCourse.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCourse.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))} 
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!courseToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <FiX className="text-2xl text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Course</h2>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "{courseToDelete.title}"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCourseToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteCourse(courseToDelete._id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Course List</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {viewMode === 'grid' ? <FiList className="text-xl" /> : <FiGrid className="text-xl" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {showFilters && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Difficulty Level</h3>
                  <div className="space-y-2">
                    {difficultyLevels.map(level => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedDifficulty.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDifficulty([...selectedDifficulty, level]);
                            } else {
                              setSelectedDifficulty(selectedDifficulty.filter(d => d !== level));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-600 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Course Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const CategoryIcon = categoryIcons[course.category]?.icon || FiBook;
              const iconColor = categoryIcons[course.category]?.color || 'text-gray-500';
              
              return (
                <div key={course._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                      <CategoryIcon className={`text-6xl ${iconColor}`} />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.difficultyLevel}
                      </span>
                      <span className="text-sm text-gray-500">{course.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FiUsers className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{course.enrolledStudents.length}</span>
                        </div>
                        {course.duration && (
                          <div className="flex items-center">
                            <FiClock className="text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{course.duration}</span>
                          </div>
                        )}
                        {course.rating && (
                          <div className="flex items-center">
                            <FiStar className="text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">{course.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <button
                        onClick={() => handleViewDetails(course)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setCourseToDelete(course);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map(course => {
              const CategoryIcon = categoryIcons[course.category]?.icon || FiBook;
              const iconColor = categoryIcons[course.category]?.color || 'text-gray-500';
              
              return (
                <div key={course._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                  <div className="flex items-start">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-32 h-32 object-cover rounded-lg mr-6" />
                    ) : (
                      <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center mr-6">
                        <CategoryIcon className={`text-5xl ${iconColor}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                            course.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.difficultyLevel}
                          </span>
                          <span className="text-sm text-gray-500">{course.category}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <FiUsers className="text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{course.enrolledStudents.length} students</span>
                          </div>
                          {course.duration && (
                            <div className="flex items-center">
                              <FiClock className="text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{course.duration}</span>
                            </div>
                          )}
                          {course.rating && (
                            <div className="flex items-center">
                              <FiStar className="text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">{course.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleViewDetails(course)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setCourseToDelete(course);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <FiBook className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {showModal && <CourseDetailsModal />}
        {showDeleteModal && <DeleteConfirmationModal />}
      </div>
    </div>
  );
}