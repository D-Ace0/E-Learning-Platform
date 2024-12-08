import React from 'react';
import Cookies from 'js-cookie';


const Header = () => {
  return (
    <header className="bg-indigo-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">E-Learning Platform</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="/courses" className="hover:underline">
                Courses
              </a>
            </li>
            <li>
              <a href="/signin" className="hover:underline">
                Sign In
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;