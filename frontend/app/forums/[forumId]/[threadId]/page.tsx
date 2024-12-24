"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Post {
  _id: string;
  content: string;
  user?: User;
  type: string;
}

interface Thread {
  _id: string;
  title: string;
  course_id: string;
}

export default function ThreadPostsPage() {
  const { threadId, forumId } = useParams(); // Extract threadId and forumId from URL
  const { data: session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"reply" | "question" | "announcement">("reply");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchThreadDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/threads/${threadId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch thread details");
      }

      const data = await response.json();
      setThread(data);
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const fetchPosts = async () => {
    if (!thread || !thread.course_id) {
      Swal.fire("Error", "Course ID or thread details are missing", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/posts/thread/${threadId}/course/${thread.course_id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.map((post: any) => ({ ...post, user: post.user_id })));
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!thread || !thread.course_id) {
      Swal.fire("Error", "Course ID or thread details are missing", "error");
      return;
    }

    if (!newPostContent.trim()) {
      Swal.fire("Error", "Post content cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/posts/thread/${threadId}/course/${thread.course_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ content: newPostContent, type: newPostType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const createdPost = await response.json();
      setPosts([...posts, { ...createdPost, user: createdPost.user_id }]);
      setNewPostContent("");
      setNewPostType("reply");
      Swal.fire("Success", "Post created successfully!", "success");
      fetchPosts(); // Refresh the posts
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !editingPost.content.trim()) {
      Swal.fire("Error", "Post content cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/posts/${editingPost._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ content: editingPost.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update post");
      }

      Swal.fire("Success", "Post updated successfully!", "success");
      fetchPosts(); // Refresh the posts
      setEditingPost(null); // Close edit modal
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      Swal.fire("Success", "Post deleted successfully!", "success");
      fetchPosts(); // Refresh the posts
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchThreadDetails();
    }
  }, [session, threadId]);

  useEffect(() => {
    if (thread) {
      fetchPosts();
    }
  }, [thread]);

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">{thread?.title || "Posts"}</h1>

      {/* Create Post */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create a New Post</h2>
        <select
          value={newPostType}
          onChange={(e) => setNewPostType(e.target.value as "reply" | "question" | "announcement")}
          className="border p-2 rounded mb-4"
        >
          <option value="reply">Reply</option>
          <option value="question">Question</option>
          <option value="announcement">Announcement</option>
        </select>
        <textarea
          placeholder="Write your post content here..."
          className="w-full border p-2 rounded mb-4"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
        />
        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Create
        </button>
      </div>

      {/* Display Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">
              <strong>{post.user?.name || "Unknown User"}</strong> ({post.user?.email || "No Email"})
            </p>
            <p className="text-sm text-gray-500">Type: {post.type}</p>
            <p className="mt-2">{post.content}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setEditingPost(post)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePost(post._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
            <textarea
              className="border p-2 rounded w-full mb-4"
              value={editingPost.content}
              onChange={(e) =>
                setEditingPost((prev) => (prev ? { ...prev, content: e.target.value } : null))
              }
            />
            <div className="flex justify-between">
              <button
                onClick={handleUpdatePost}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPost(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
