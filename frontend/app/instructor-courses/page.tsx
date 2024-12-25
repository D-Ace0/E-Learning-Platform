'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
 const searchParams = useSearchParams();
 const courseId = searchParams.get('courseId');
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   setSearchTerm(event.target.value);
 };

 const isCourseOutdated = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  return createdDate < fiveDaysAgo;
 }

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
       // Sort courses by created_at in descending order (most recent first)
       const sortedCourses = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
       const coursesWithOutdatedStatus = sortedCourses.map(course => ({
         ...course,
         isOutdated: isCourseOutdated(course.created_at),
       }));
       setCourses(coursesWithOutdatedStatus);
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
 }, [session?.accessToken, session?.user_id]);
 const handleCreateCourse = async () => {
   const { value: formValues } = await Swal.fire({
     title: 'Create New Course',
     html:
       `<p>Title</p><input id="swal-input1" class="swal2-input" placeholder="Title" />` +
       `<p>Description</p><input id="swal-input2" class="swal2-input" placeholder="Description" />` +
       `<p>Category</p><input id="swal-input3" class="swal2-input" placeholder="Category" />` +
       `<p>Difficulty(beginner, intermediate, advanced)</p><input id="swal-input4" class="swal2-input" placeholder="Difficulty Level" />` +
       `<p>Video</p><input id="swal-input5" class="swal2-input" placeholder="Video URL" />` +
       `<p>PDF</p><input id="swal-input6" class="swal2-input" placeholder="PDF URL" />`,
     focusConfirm: false,
     preConfirm: () => {
       return [
         (document.getElementById('swal-input1') as HTMLInputElement).value,
         (document.getElementById('swal-input2') as HTMLInputElement).value,
         (document.getElementById('swal-input3') as HTMLInputElement).value,
         (document.getElementById('swal-input4') as HTMLInputElement).value,
         (document.getElementById('swal-input5') as HTMLInputElement).value,
         (document.getElementById('swal-input6') as HTMLInputElement).value,
       ];
     },
   });
   if (formValues) {
     const [title, description, category, difficulty_level, video, pdf] = formValues;
     try {
       const response = await fetch('http://localhost:5000/courses', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${session?.accessToken}`,
         },
         body: JSON.stringify({ title, description, category, difficulty_level, video, pdf }),
       });
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Failed to create course');
       }
       Swal.fire('Created!', 'Course has been created.', 'success');
       const newCourse = await response.json()
       setCourses([...courses, { ...newCourse, isOutdated: false }]);
     } catch (error) {
       console.error('Error creating course:', error);
       Swal.fire('Error!', 'Failed to create course.', 'error');
     }
   }
 };
    const handleUpdateCourse = async (course: Course) => {
        const { value: formValues } = await Swal.fire({
            title: 'Update Course',
            html:
                `<p>Title</p><input id="swal-input1" class="swal2-input" placeholder="Title" value="${course.title}" />` +
                `<p>Description</p><input id="swal-input2" class="swal2-input" placeholder="Description" value="${course.description}" />` +
                `<p>Category</p><input id="swal-input3" class="swal2-input" placeholder="Category" value="${course.category}" />` +
                `<p>Difficulty(beginner, intermediate, advanced)</p><input id="swal-input4" class="swal2-input" placeholder="Difficulty Level" value="${course.difficulty_level}" />` +
                `<p>Video</p><input id="swal-input5" class="swal2-input" placeholder="Video URL" value="${course.video}" />` +
                `<p>PDF</p><input id="swal-input6" class="swal2-input" placeholder="PDF URL" value="${course.pdf}" />`,
            focusConfirm: false,
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLInputElement).value,
                    (document.getElementById('swal-input3') as HTMLInputElement).value,
                    (document.getElementById('swal-input4') as HTMLInputElement).value,
                    (document.getElementById('swal-input5') as HTMLInputElement).value,
                    (document.getElementById('swal-input6') as HTMLInputElement).value,
                ];
            },
        });
        if (formValues) {
            const [title, description, category, difficulty_level, video, pdf] = formValues;
            const updatedCourse = {
                title,
                description,
                category,
                difficulty_level,
                video,
                pdf,
                created_at: new Date().toLocaleDateString('en-CA'), // Set created_at to today's date in YYYY-MM-DD format
            };
            try {
                const response = await fetch(`http://localhost:5000/courses/${course._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                    body: JSON.stringify(updatedCourse),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update course');
                }
                Swal.fire('Updated!', 'Course has been updated.', 'success');
                setCourses(courses.map(c => (c._id === course._id ? { ...c, ...updatedCourse, isOutdated: false } : c)));
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
     <button onClick={handleCreateCourse} style={{ marginBottom: '20px', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#5cb85c', color: 'white' }}>Create New Course</button>
     {loading && <p>Loading...</p>}
     {error && <p>{error}</p>}
     {courses.length === 0 && !loading && <p>No courses found.</p>}
      <ul style={{ listStyleType: 'none', padding: '0' }}>
       {courses.map(course => (
         <li key={course._id} style={{ backgroundColor: '#f9f9f9', marginBottom: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
           <h3 style={{ margin: '0 0 10px' }}>{course.title}</h3>
           <p style={{ margin: '0 0 5px', color: '#666' }}>Created at: {new Date(course.created_at).toLocaleDateString()}</p>
           <p style={{ margin: '0 0 5px', color: '#666' }}>Description: {course.description}</p>
           <p style={{ margin: '0 0 5px', color: '#666' }}>Category: {course.category}</p>
           <p style={{ margin: '0 0 5px', color: '#666' }}>Difficulty Level: {course.difficulty_level}</p>
           <p style={{ margin: '0 0 5px', color: '#666' }}>Video URL: {course.video}</p>
           <p style={{ margin: '0 0 10px', color: '#666' }}>PDF URL: {course.pdf}</p>
           <p style={{ margin: '0 0 10px', color: '#666' }}>Outdated: {course.isOutdated ? 'Yes' : 'No'}</p>
           <Link href={`../courses/modules?courseId=${course._id}`} className="text-blue-600 hover:underline">
                  View Module
            </Link>
            <br></br>
           <button onClick={() => handleUpdateCourse(course)} style={{ marginRight: '10px', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white' }}>Update</button>
           <button onClick={() => handleDeleteCourse(course._id)} style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white' }}>Delete</button>
         </li>
       ))}
     </ul>
   </div>
 );


}