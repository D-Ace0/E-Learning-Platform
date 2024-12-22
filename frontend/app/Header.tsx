'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

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
            {session && (
                <li>
                  <Link href="/my-courses" className="hover:underline">
                    My Courses
                  </Link>
                </li>
            )}
            {/* Show the recommendation link for "student" role only */}
            {session?.role === 'student' && (
                <li>
                  <Link href="/recommendations" className="hover:underline">
                    Recommendations
                  </Link>
                </li>
            )}
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
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
