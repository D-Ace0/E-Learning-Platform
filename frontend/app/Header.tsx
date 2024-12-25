'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/signin' });
  };

  const isAdmin = session?.role === 'admin';
  const isInstructor = session?.role === 'instructor';
  const isStudent = session?.role === 'student';

  return (
    <header className="bg-indigo-600 text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors">
            E-Learning Platform
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-indigo-200 transition-colors">
              Home
            </Link>
            
            <Link href="/courses" className="hover:text-indigo-200 transition-colors">
              Courses
            </Link>

            {session && (
              <>
                {isAdmin && (
                  <>
                    <Link href="/admin" className="hover:text-indigo-200 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/admin/users" className="hover:text-indigo-200 transition-colors">
                      Users
                    </Link>
                    <Link href="/admin/auth-logs" className="hover:text-indigo-200 transition-colors">
                      Auth Logs
                    </Link>
                  </>
                )}

                {isInstructor && (
                  <Link href="/instructor-courses" className="hover:text-indigo-200 transition-colors">
                    My Courses
                  </Link>
                )}

                {isStudent && (
                  <>
                    <Link href="/my-courses" className="hover:text-indigo-200 transition-colors">
                      My Courses
                    </Link>
                    <Link href="/recommendations" className="hover:text-indigo-200 transition-colors">
                      Recommendations
                    </Link>
                  </>
                )}

                <Link href="/communications" className="hover:text-indigo-200 transition-colors">
                  Chats
                </Link>

                <Link href="/quiz" className="hover:text-indigo-200 transition-colors">
                  Quizzes
                </Link>

                <Link href="/notes" className="hover:text-indigo-200 transition-colors">
                  Notes
                </Link>

                <Link href="/profile" className="hover:text-indigo-200 transition-colors">
                  Profile
                </Link>
              </>
            )}

            {!session ? (
              <Link href="/signin" className="hover:text-indigo-200 transition-colors">
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="hover:text-indigo-200 transition-colors focus:outline-none"
              >
                Sign Out
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link href="/" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
              Home
            </Link>
            
            <Link href="/courses" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
              Courses
            </Link>

            {session && (
              <>
                {isAdmin && (
                  <>
                    <Link href="/admin" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                      Dashboard
                    </Link>
                    <Link href="/admin/users" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                      Users
                    </Link>
                    <Link href="/admin/auth-logs" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                      Auth Logs
                    </Link>
                  </>
                )}

                {isInstructor && (
                  <Link href="/instructor-courses" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                    My Courses
                  </Link>
                )}

                {isStudent && (
                  <>
                    <Link href="/my-courses" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                      My Courses
                    </Link>
                    <Link href="/recommendations" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                      Recommendations
                    </Link>
                  </>
                )}

                <Link href="/communications" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Chats
                </Link>

                <Link href="/quiz" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Quizzes
                </Link>

                <Link href="/notes" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Notes
                </Link>

                <Link href="/profile" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                  Profile
                </Link>
              </>
            )}

            {!session ? (
              <Link href="/signin" className="block hover:bg-indigo-700 px-3 py-2 rounded-md">
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="block w-full text-left hover:bg-indigo-700 px-3 py-2 rounded-md focus:outline-none"
              >
                Sign Out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
