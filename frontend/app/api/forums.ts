import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/forums'; // Replace with your API base URL

// Get all forums
export const getAllForums = async (token: string) => {
  const response = await axios.get(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get a single forum by ID
export const getForumById = async (forumId: string, token: string) => {
  const response = await axios.get(`${API_BASE_URL}/${forumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Create a new forum
export const createForum = async (
  courseId: string,
  forumData: { title: string; description: string },
  token: string,
) => {
  const response = await axios.post(`${API_BASE_URL}/course/${courseId}`, forumData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update an existing forum
export const updateForum = async (
  forumId: string,
  forumData: { title?: string; description?: string },
  token: string,
) => {
  const response = await axios.patch(`${API_BASE_URL}/${forumId}`, forumData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete a forum
export const deleteForum = async (forumId: string, token: string) => {
  const response = await axios.delete(`${API_BASE_URL}/${forumId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
