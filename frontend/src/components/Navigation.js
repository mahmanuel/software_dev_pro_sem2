import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-blue-500 text-white py-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="font-bold text-lg">Issue Tracking</Link>
        <ul className="flex space-x-4">
          <li><Link to="/admin" className="hover:underline">Admin</Link></li>
          <li><Link to="/student" className="hover:underline">Student</Link></li>
          <li><Link to="/lecturer" className="hover:underline">Lecturer</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
