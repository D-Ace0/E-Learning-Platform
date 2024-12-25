'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {router} from "next/client";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="bg-indigo-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">E-Learning Platform</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            {session?.role === 'student' || session?.role === 'instructor' && (
            <li>
              <Link href="/users" className="hover:underline">
                Users
              </Link>
            </li>
            )}
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:underline">
                Courses
              </Link>
            </li>
            {session?.role === 'instructor' && (
              <li>
                <Link href="/instructor-courses" className="hover:underline">
                  Instructor Courses
                </Link>
              </li>
            )}
            {session?.role === 'instructor' && (
              <li>
                <Link href="/question" className="hover:underline">
                  QuestionBank
                </Link>
              </li>
            )}
            {session && (
                <>
                  <li>
                    <Link
                        href={
                          session.role === 'student'
                              ? '/studentDashboard'
                              : session.role === 'instructor'
                                  ? '/instructorDashboard'
                                  : session.role === 'admin'
                                      ? '/admin'
                                      : '/'
                        }
                        className="hover:underline"
                    >
                      Dashboard
                    </Link>
                  </li>
                 
                </>
            )}
                  <li>
                    <Link href="/profile" className="hover:underline">
                      Profile
                    </Link>
                  </li>
            {session?.role === 'student' && (
              <>
              <li>
                <Link href="/recommendations" className="hover:underline">
                  Recommendations
                </Link>
              </li>
              <li>
              <Link href="/my-courses" className="hover:underline">
                My Courses
              </Link>
              </li>
              </>
            )}
             {session? (
                <li>
                  <Link href="/communications" className="hover:underline">
                    Chats
                  </Link>
                </li>
            ) : ""}

            {session? (
                <li>
                  <Link href="/quiz" className="hover:underline">
                    Quizzes
                  </Link>
                </li>
            ) : ""}

            {!session ? (
                <li>
                  <Link href="/signin" className="hover:underline">
                    Sign In
                  </Link>
                </li>
            ) : (
                <li>
                  <button onClick={() => signOut()} className="hover:underline">
                    Sign Out
                  </button>
                </li>
            )}
            <li>
              <Link href="/notes" className="hover:underline">
                Notes
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
