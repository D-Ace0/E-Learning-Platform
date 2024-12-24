'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const Communication = () => {
    const { data: session } = useSession(); // Fetch the logged-in user's session
    const [socket, setSocket] = useState<Socket | null>(null);
    const [rooms, setRooms] = useState<
        { _id: string; name: string }[]
    >([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<
        { id: string; sender: { name: string; email: string; role: string }; content: string; timestamp: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Initialize WebSocket connection
        const socketIo = io('http://localhost:5000'); // WebSocket backend URL
        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    useEffect(() => {
        // Fetch all rooms from the backend
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:5000/rooms');
                setRooms(response.data);
            } catch (err) {
                console.error('Failed to fetch rooms:', err);
                setError('Failed to fetch rooms.');
            }
        };

        fetchRooms();
    }, []);

    const handleJoinRoom = (roomName: string) => {
        if (!socket) return;

        // Ensure the user is logged in and has a student ID
        const studentId = session?.user_id;
        if (!studentId) {
            setError('User is not authenticated. Cannot join room.');
            return;
        }

        setSelectedRoom(roomName);
        setError(null);

        // Emit "joinRoom" to WebSocket
        socket.emit('joinRoom', { roomName, studentId });

        // Listen for room events
        socket.on('roomJoined', (data) => {
            setMessages(data.messages);
            console.log(`Joined room ${data.room.name} with messages:`, data.messages);
        });

        socket.on('messageReceived', (data) => {
            setMessages((prevMessages) => [...prevMessages, data.message]);
        });

        socket.on('error', (errorMessage) => {
            setError(errorMessage);
        });
    };

    const handleSendMessage = () => {
        if (!socket || !selectedRoom) {
            setError('Please join a room before sending a message.');
            return;
        }

        const studentId = session?.user_id;
        if (!studentId) {
            setError('User is not authenticated. Cannot send message.');
            return;
        }

        // Emit the message to the WebSocket
        socket.emit('sendMessage', {
            roomName: selectedRoom,
            studentId,
            content: newMessage,
        });

        setNewMessage(''); // Clear the input field
    };

    const handleLeaveRoom = () => {
        if (!socket || !selectedRoom) return;

        // Emit "leaveRoom" to WebSocket
        socket.emit('leaveRoom', { roomName: selectedRoom });
        setSelectedRoom(null); // Clear the selected room
        setMessages([]); // Clear the chat messages
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Rooms and Chat</h1>

            {/* Room List */}
            <div className="mt-4">
                <h2 className="text-xl font-semibold">Available Rooms</h2>
                {rooms.length === 0 ? (
                    <p>No rooms available</p>
                ) : (
                    <ul className="mt-2">
                        {rooms.map((room) => (
                            <li key={room._id} className="flex justify-between items-center border p-2 rounded mb-2">
                                <span>{room.name}</span>
                                <button
                                    onClick={() => handleJoinRoom(room.name)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Join Room
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Chat Section */}
            {selectedRoom && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold">Chat in Room: {selectedRoom}</h2>
                    <button
                        onClick={handleLeaveRoom}
                        className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Leave Room
                    </button>
                    <div className="border rounded p-4 h-64 overflow-y-scroll bg-gray-100">
                        {messages.map((msg) => (
                            <div key={msg.id} className="mb-2">
                                <span className="font-bold">{msg.sender.name}:</span>{' '}
                                <span>{msg.content}</span>
                                <div className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex">
                        <input
                            type="text"
                            placeholder="Type a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="p-2 border rounded w-full mr-2"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
};

export default Communication;
