import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-100">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-10 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to AITS</h1>
                <p className="text-lg text-gray-700 mb-8">Select an option below to get started:</p>

                <div className="space-y-6">
                    {/* Button to Log In */}
                    <Link
                        to="/login"
                        className="w-full bg-blue-500 text-white py-4 rounded-md text-xl font-semibold hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                    >
                        Log In
                    </Link>

                    {/* Button to Sign Up */}
                    <Link
                        to="/signup"
                        className="w-full bg-green-500 text-white py-4 rounded-md text-xl font-semibold hover:bg-green-600 transition duration-300 transform hover:scale-105"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
