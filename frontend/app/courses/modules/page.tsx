"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

interface Module {
    module_id: string;
    title: string;
    content: string;
    resources: string[];
    created_at: string;
}

interface Note {
    _id: string;
    module_id: string;
    content: string;
    created_at: string;
    last_updated: string;
}

export default function Modules() {
    const { data: session } = useSession();
    const [modules, setModules] = useState<Module[]>([]);
    const [notes, setNotes] = useState<Record<string, Note[]>>({});
    const [newNoteContent, setNewNoteContent] = useState<Record<string, string>>(
        {}
    );
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");

    /**
     * Fetch modules
     */
    useEffect(() => {
        if (!session || !courseId) return;

        const fetchModules = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/module/course/${courseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch modules");
                }
                const data = await response.json();
                setModules(Array.isArray(data) ? data : [data]);
            } catch (err: any) {
                console.error("Error fetching modules:", err);
                setError(err.message);
            }
        };

        fetchModules();
    }, [session, courseId]);

    /**
     * Once modules are loaded, fetch notes for each module
     */
    useEffect(() => {
        if (!session || modules.length === 0) return;

        const fetchNotesForModule = async (moduleId: string) => {
            try {
                const response = await fetch(
                    `http://localhost:5000/notes/module/${moduleId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch notes");
                }
                const data = await response.json();
                setNotes((prev) => ({ ...prev, [moduleId]: data }));
            } catch (err: any) {
                console.error(`Error fetching notes for module ${moduleId}:`, err);
                setError(err.message);
            }
        };

        modules.forEach((m) => fetchNotesForModule(m.module_id));
    }, [session, modules]);

    /**
     * Create a new note
     */
    const createNote = async (moduleId: string) => {
        if (!session) return;
        if (!newNoteContent[moduleId]?.trim()) return;

        try {
            const response = await fetch("http://localhost:5000/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    module_id: moduleId,
                    content: newNoteContent[moduleId],
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create note");
            }
            const createdNote = await response.json();

            // Append new note to that module’s notes in state
            setNotes((prev) => ({
                ...prev,
                [moduleId]: [...(prev[moduleId] || []), createdNote],
            }));

            // Clear "new note" text area
            setNewNoteContent((prev) => ({ ...prev, [moduleId]: "" }));
        } catch (err: any) {
            console.error("Error creating note:", err);
            setError(err.message);
        }
    };

    /**
     * Delete an existing note
     */
    const deleteNote = async (noteId: string, moduleId: string) => {
        if (!session) return;
        try {
            const response = await fetch(`http://localhost:5000/notes/${noteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to delete note");
            }
            // Remove from local state
            setNotes((prev) => ({
                ...prev,
                [moduleId]: prev[moduleId]?.filter((n) => n._id !== noteId),
            }));
        } catch (err: any) {
            console.error("Error deleting note:", err);
            setError(err.message);
        }
    };

    if (!session) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Modules List</h1>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {modules.map((module) => (
                    <div
                        key={module.module_id}
                        className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200"
                    >
                        <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                        <p className="text-gray-700 mb-4">{module.content}</p>

                        <div className="text-left mb-4">
                            <p className="text-sm text-blue-500 mb-2">
                                <strong>Resources:</strong>
                            </p>
                            <ul className="list-disc list-inside text-gray-700">
                                {module.resources.map((resource, index) => (
                                    <li key={index}>
                                        <a
                                            href={resource}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {resource}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h3 className="text-lg font-bold mb-2">Notes</h3>

                        {/* Existing notes for this module */}
                        {notes[module.module_id]?.map((note) => (
                            <div key={note._id} className="mb-2 border p-2 rounded">
                                <p className="text-gray-800">{note.content}</p>
                                <button
                                    className="mt-1 px-4 py-1 bg-red-500 text-white text-sm rounded"
                                    onClick={() => deleteNote(note._id, module.module_id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}

                        {/* Single text area to create a new note for this module */}
                        <textarea
                            className="w-full p-2 border rounded mt-2"
                            placeholder={`Add a note to ${module.title}...`}
                            value={newNoteContent[module.module_id] || ""}
                            onChange={(e) =>
                                setNewNoteContent((prev) => ({
                                    ...prev,
                                    [module.module_id]: e.target.value,
                                }))
                            }
                        />
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => createNote(module.module_id)}
                        >
                            Add Note
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
