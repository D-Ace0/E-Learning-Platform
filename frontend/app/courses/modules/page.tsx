'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useSearchParams } from 'next/navigation';

interface Module {
    _id: string;
    course_id: string;
    title: string;
    content: string;
    resources: string[];
    created_at: string;
}

export default function Modules() {
    const { data: session } = useSession();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newModule, setNewModule] = useState({ title: '', content: '', resources: [], course_id: '' });
    const [editingModule, setEditingModule] = useState<Module | null>(null); // State for the module being edited
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/module/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch modules');
                }
                const data = await response.json();
                setModules(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [session]);

    const handleCreateModule = async () => {
        try {
            const response = await fetch(`http://localhost:5000/module`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(newModule),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create module');
            }

            const createdModule = await response.json();
            setModules((prev) => [...prev, createdModule]);
            setNewModule({ title: '', content: '', resources: [], course_id: '' }); // Reset form
            Swal.fire('Success', 'Module created successfully!', 'success');
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleUpdateModule = async () => {
        if (!editingModule) return;

        const updatedData = {
            title: newModule.title,
            content: newModule.content,
            resources: newModule.resources,
            course_id: newModule.course_id,
        };

        try {
            const response = await fetch(`http://localhost:5000/module/${editingModule._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update module');
            }

            const updatedModule = await response.json();
            setModules((prev) => prev.map((module) => (module._id === updatedModule._id ? updatedModule : module)));
            setIsModalOpen(false); // Close modal
            setEditingModule(null); // Reset editing state
            setNewModule({ title: '', content: '', resources: [], course_id: '' }); // Reset form
            Swal.fire('Success', 'Module updated successfully!', 'success');
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/module/${moduleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete module');
            }

            setModules((prev) => prev.filter((module) => module._id !== moduleId));
            Swal.fire('Success', 'Module deleted successfully!', 'success');
        } catch (error: any) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const startEditing = (module: Module) => {
        setEditingModule(module);
        setNewModule({ title: module.title, content: module.content, resources: module.resources, course_id: module.course_id });
        setIsModalOpen(true); // Open modal for editing
    };

    const cancelEditing = () => {
        setEditingModule(null);
        setNewModule({ title: '', content: '', resources: [], course_id: '' }); // Reset form
        setIsModalOpen(false); // Close modal
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Modules List</h1>
            {session?.role === 'instructor' && (
                <div className="mb-4">
                    <h2 className="text-2xl mb-2">Create New Module</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newModule.title}
                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        className="border p-2 mb-2 w-full"
                    />
                    <textarea
                        placeholder="Content"
                        value={newModule.content}
                        onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                        className="border p-2 mb-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Resources (comma separated)"
                        value={newModule.resources.join(', ')}
                        onChange={(e) => setNewModule({ ...newModule, resources: e.target.value.split(',').map(res => res.trim()) })}
                        className="border p-2 mb-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Course ID"
                        value={newModule.course_id}
                        onChange={(e) => setNewModule({ ...newModule, course_id: e.target.value })}
                        className="border p-2 mb-2 w-full"
                    />
                    <button onClick={handleCreateModule} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Create Module
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {modules.map((module) => (
                    <div key={module._id} className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                        <p className="text-gray-700 mb-4">{module.content}</p>
                        <p className="text-sm text-gray-500 mb-2">Created At: {new Date(module.created_at).toLocaleDateString()}</p>
                        {session?.role === 'instructor' && (
                            <div className="flex justify-between mt-4">
                                <button onClick={() => startEditing(module)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                                    Edit
                                </button>
                                <button onClick={() => handleDeleteModule(module._id)} className="bg-red-500 text-white px-2 py-1 rounded">
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal for Editing Module */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl mb-4">Edit Module</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newModule.title}
                            onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <textarea
                            placeholder="Content"
                            value={newModule.content}
                            onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Resources (comma separated)"
                            value={newModule.resources.join(', ')}
                            onChange={(e) => setNewModule({ ...newModule, resources: e.target.value.split(',').map(res => res.trim()) })}
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Course ID"
                            value={newModule.course_id}
                            onChange={(e) => setNewModule({ ...newModule, course_id: e.target.value })}
                            className="border p-2 mb-2 w-full"
                        />
                        <div className="flex justify-between mt-4">
                            <button onClick={handleUpdateModule} className="bg-yellow-500 text-white px-4 py-2 rounded">
                                Update Module
                            </button>
                            <button onClick={cancelEditing} className="bg-gray-500 text-white px-4 py-2 rounded">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
