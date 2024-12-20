
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
