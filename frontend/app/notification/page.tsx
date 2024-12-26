'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const Notifications = () => {
    const { data: session } = useSession(); // Get the current user's session
    const [notifications, setNotifications] = useState<
        { id: string; message: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch notifications for the current user
        const fetchNotifications = async () => {
            if (!session?.user_id) {
                setError('User is not authenticated.');
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:5000/notifications/${session.user_id}`
                );
                setNotifications(response.data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError('Failed to fetch notifications.');
            }
        };

        fetchNotifications();
    }, [session]);

    const deleteNotification = async (notificationId: string) => {
        if (!session?.user_id) {
            setError('User is not authenticated.');
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/notifications/${notificationId}`);
            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== notificationId)
            );
        } catch (err) {
            console.error('Failed to delete notification:', err);
            setError('Failed to delete notification.');
        }
    };

    const deleteAllNotifications = async () => {
        if (!session?.user_id) {
            setError('User is not authenticated.');
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/notifications/user/${session.user_id}`);
            setNotifications([]);
        } catch (err) {
            console.error('Failed to delete all notifications:', err);
            setError('Failed to delete all notifications.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Notifications</h1>

            {/* Error Handling */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <p>No notifications available.</p>
            ) : (
                <>
                    <button
                        onClick={deleteAllNotifications}
                        className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete All Notifications
                    </button>
                    <ul className="mt-4 space-y-4">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className="p-4 border rounded shadow hover:bg-gray-100 flex justify-between items-center"
                            >
                                <p>{notification.message}</p>
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default Notifications;
