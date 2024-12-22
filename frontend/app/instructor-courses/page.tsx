'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useSearchParams } from 'next/navigation';

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
}

export default function Courses() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!session?.user) {
        setError('User session not found');
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/users/${session.user_id}/instructor/courses`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch instructor courses');
        }
        const data = await response.json();
        setCourses(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch instructor courses');
        console.error('Error fetching instructor courses:', err);
      } finally {
        setLoading(false);
      }
    };
    if (session?.accessToken) {
      fetchInstructorCourses();
    }
  }, [session?.accessToken]);

  const handleUpdateCourse = async (course: Course) => {
    const { value: formValues } = await Swal.fire({
      title: 'Update Course',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Title" value="${course.title}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Description" value="${course.description}">`,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ];
      }
    });

    if (formValues) {
      const [title, description] = formValues;
      try {
        console.log('Updating course:', course._id, { title, description });
        const response = await fetch(`http://localhost:5000/courses/${course._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ title, description }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update course');
        }
        Swal.fire('Updated!', 'Course has been updated.', 'success');
        setCourses(courses.map(c => (c._id === course._id ? { ...c, title, description } : c)));
      } catch (error) {
        console.error('Error updating course:', error);
        Swal.fire('Error!', 'Failed to update course.', 'error');
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting course:', courseId);
        const response = await fetch(`http://localhost:5000/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete course');
        }
        Swal.fire('Deleted!', 'Course has been deleted.', 'success');
        setCourses(courses.filter(course => course._id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
        Swal.fire('Error!', 'Failed to delete course.', 'error');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <input
        type="text"
        placeholder="Search courses"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }}
      />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {courses.length === 0 && !loading && <p>No courses found.</p>}
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {courses.map(course => (
          <li key={course._id} style={{ backgroundColor: '#f9f9f9', marginBottom: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 10px' }}>{course.title}</h3>
            <p style={{ margin: '0 0 10px', color: '#666' }}>Created at: {new Date(course.created_at).toLocaleDateString()}</p>
            <button onClick={() => handleUpdateCourse(course)} style={{ marginRight: '10px', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>Update</button>
            <button onClick={() => handleDeleteCourse(course._id)} style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}