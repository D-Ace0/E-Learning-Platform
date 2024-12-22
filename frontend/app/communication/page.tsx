'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const Communication = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [rooms, setRooms] = useState<
        { _id: string; name: string }[]
    >([]);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [studentId, setStudentId] = useState('');
    const [messages, setMessages] = useState<
        { id: string; sender: { name: string; email: string; role: string }; content: string; timestamp: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);

    // Initialize WebSocket connection
    useEffect(() => {
        const socketIo = io('http://localhost:5000'); // WebSocket backend URL
        setSocket(socketIo);

        // Cleanup
        return () => {
            socketIo.disconnect();
        };
    }, []);

    // Fetch all rooms from the backend
    useEffect(() => {
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

    // Join a room
    const handleJoinRoom = (roomName: string) => {
        if (!socket) return;
        if (!studentId) {
            setError('Please enter your student ID.');
            return;
        }

        setSelectedRoom(roomName);
        setError(null);

        // Emit "joinRoom" to WebSocket
        socket.emit('joinRoom', { roomName, studentId });

        // Listen for "roomJoined" and messages
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

    // Handle sending a message
    const handleSendMessage = (messageContent: string) => {
        if (!socket || !selectedRoom || !studentId) return;

        socket.emit('sendMessage', {
            roomName: selectedRoom,
            studentId,
            content: messageContent,
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Rooms and Chat</h1>

            {/* Student ID Input */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Your Student ID:</label>
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-2 p-2 border rounded w-full"
                />
            </div>

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
                            className="p-2 border rounded w-full mr-2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <button
                            onClick={() => handleSendMessage('Test Message')} // Replace with dynamic input
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
