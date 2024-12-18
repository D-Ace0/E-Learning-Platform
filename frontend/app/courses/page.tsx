// // pages/course.js
// 'use client';

// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// export default function Course() {
//     const { data: session, status } = useSession();
//     const router = useRouter();

//     useEffect(() => {
//         if (status === 'unauthenticated') {
//             router.push('/signin');
//         }
//     }, [status, router]);

//     if (status === 'loading') {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <div className="text-2xl font-semibold mb-2">Loading...</div>
//                     <div className="text-gray-500">Please wait while we verify your session</div>
//                 </div>
//             </div>
//         );
//     }

//     if (status === 'authenticated') {
//         return (
//             <div className="container mx-auto px-4 py-8">
//                 <h1 className="text-3xl font-bold mb-8">Welcome to the Course</h1>
//                 <div className="grid gap-8">
//                     <section className="bg-white p-6 rounded-lg shadow">
//                         <h2 className="text-2xl font-semibold mb-4">Course Modules</h2>
//                         <ul className="space-y-4">
//                             <li className="flex items-center space-x-2">
//                                 <span className="text-indigo-600">•</span>
//                                 <span>Module 1: Introduction</span>
//                             </li>
//                             <li className="flex items-center space-x-2">
//                                 <span className="text-indigo-600">•</span>
//                                 <span>Module 2: Advanced Topics</span>
//                             </li>
//                             <li className="flex items-center space-x-2">
//                                 <span className="text-indigo-600">•</span>
//                                 <span>Module 3: Practical Applications</span>
//                             </li>
//                         </ul>
//                     </section>

//                     <section className="bg-white p-6 rounded-lg shadow">
//                         <h2 className="text-2xl font-semibold mb-4">Instructor</h2>
//                         <div className="space-y-2">
//                             <p><span className="font-medium">Name:</span> John Doe</p>
//                             <p><span className="font-medium">Bio:</span> John is an expert in the field with over 10 years of experience.</p>
//                         </div>
//                     </section>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// }
// pages/course.js
import Head from 'next/head';

export default function Course() {
    return (
        <div>
            <Head>
                <title>Course Page</title>
            </Head>
            <main>
                <h1>Welcome to the Course</h1>
                <p>This is the course description. Here you can provide detailed information about the course.</p>
                <section>
                    <h2>Course Modules</h2>
                    <ul>
                        <li>Module 1: Introduction</li>
                        <li>Module 2: Advanced Topics</li>
                        <li>Module 3: Practical Applications</li>
                    </ul>
                </section>
                <section>
                    <h2>Instructor</h2>
                    <p>Instructor Name: John Doe</p>
                    <p>Instructor Bio: John is an expert in the field with over 10 years of experience.</p>
                </section>
            </main>
        </div>
    );
}
