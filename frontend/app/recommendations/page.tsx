'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import axios from 'axios';

export default function Recommendations() {
    const { data: session } = useSession(); // Access session data
    const [recommendations, setRecommendations] = useState<any[]>([]); // Stores fetched recommendations
    const [error, setError] = useState<string | null>(null); // Error state

    const API_BASE_URL = 'http://localhost:5000/recommendation'; // Replace with your backend URL

    // Fetch recommendations based on userId
    const fetchRecommendations = async (userId: string) => {
        try {
            // Construct the URL with the userId path parameter
            const url = `${API_BASE_URL}/${userId}`;

            // Send the GET request
            const response = await axios.get(url);

            // Log the response for debugging
            console.log('Fetched courses:', response.data);

            // Set recommendations state
            setRecommendations(response.data);
            setError(null); // Clear any errors
        } catch (error) {
            console.error('Error fetching recommendations:', error.response?.data || error.message);
            setError('Failed to fetch recommendations. Please try again.');
        }
    };
    const GenerateRecommendations = async (userId: string) => {
        const url = `${API_BASE_URL}/`; // Endpoint for generating recommendations

        try {
            // Send a POST request with userId in the request body
            const response = await axios.post(url, { userId });

            // Log the response for debugging
            console.log('Generated recommendations:', response.data);

            // Return the response data

            setError(null); // Clear any errors
        } catch (error) {
            console.error('Error generating recommendations:', error.response?.data || error.message);
            throw new Error('Failed to generate recommendations.');
        }
    };
    const addRecommendedCourseToUser = async (title: string, userId: string) => {
        const url = `${API_BASE_URL}/${title}/${userId}`; // Replace `API_BASE_URL` with your backend URL

        try {
            // Send the POST request
            const response = await axios.post(url);

            // Log the response for debugging
            console.log('Course successfully added:', response.data);
            GenerateRecommendations(userId)
            fetchRecommendations(userId)
            // Return the response data
            return response.data;
        } catch (error) {
            console.error('Error adding recommended course:', error.response?.data || error.message);
            throw new Error('Failed to add recommended course.');
        }
    };
    // Automatically fetch recommendations when the page loads or session is updated
    useEffect(() => {
        if (session?.user_id) {
            console.log('Fetching recommendations for user:', session.user_id);
            GenerateRecommendations(session.user_id)
            fetchRecommendations(session.user_id);// Call fetchRecommendations when session exists
        }
    }, [session]); // Depend on session to handle dynamic updates

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Recommended Courses</h1>

            {session ? (
                <div>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map((rec, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition-shadow"
                                >
                                    <h3 className="text-lg font-semibold mb-2">{rec.title || 'Untitled Course'}</h3>
                                    <p className="text-gray-600 mb-4">{rec.difficulty_level || 'No description available.'}</p>
                                    <p className="text-gray-600 mb-4">{rec.created_by || 'No description available.'}</p>
                                    <p className="text-gray-600 mb-4">{rec.category || 'No category available.'}</p>
                                    <p className="text-gray-600 mb-4">
                                        <strong>Video URL:</strong>{' '}
                                        {rec.video_url ? (
                                            <a
                                                href={rec.video_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline hover:text-blue-600"
                                            >
                                                Watch Video
                                            </a>
                                        ) : (
                                            'No video URL available.'
                                        )}
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        <strong>PDF URL:</strong>{' '}
                                        {rec.pdf_url ? (
                                            <a
                                                href={rec.pdf_url}
                                                download
                                                className="text-blue-500 underline hover:text-blue-600"
                                            >
                                                Download PDF
                                            </a>) : ('No PDF URL available.')}
                                    </p>
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 transition"
                                        onClick={async () => {
                                            try {
                                                // Call the function to add the course
                                                await addRecommendedCourseToUser(rec.title, session?.user_id);
                                                Swal.fire('Course Selected', `You selected: ${rec.title}`, 'success');
                                            } catch (error) {
                                                Swal.fire('Error', 'Failed to select course. Please try again.', 'error');
                                                console.error(error);
                                            }
                                        }}
                                    >
                                        Select Course
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No recommendations found.</p>
                    )}
                </div>
            ) : (
                <div>
                    <p>You need to sign in to view recommendations.</p>
                </div>
            )}
        </div>
    );
}