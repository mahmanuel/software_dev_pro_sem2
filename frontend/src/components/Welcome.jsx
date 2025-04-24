"use client"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function Welcome() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="welcome-page min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="header bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="logo text-2xl font-bold text-blue-600">AITS</div>
          <nav className="hidden md:flex items-center space-x-4">
            <div className="auth-buttons flex space-x-2">
              <button 
                onClick={() => navigate("/login")} 
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition"
                aria-label="Login to your account"
              >
                Login
              </button>
              <button 
                onClick={() => navigate("/register")} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                aria-label="Register for a new account"
              >
                Register
              </button>
            </div>
          </nav>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              <button 
                onClick={() => { navigate("/login"); setIsMenuOpen(false); }} 
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition"
              >
                Login
              </button>
              <button 
                onClick={() => { navigate("/register"); setIsMenuOpen(false); }} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Section */}
      <section className="intro-section py-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Academic Issue Tracking System
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive solution for logging, tracking, and resolving academic record-related issues at Makerere University.
          </p>
        </div>
      </section>

      {/* Role Sections */}
      <section className="role-sections py-16 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="role-card border rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">For Students</h3>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              <li>Submit and track academic issues</li>
              <li>Log missing marks issues</li>
              <li>Submit grade appeals</li>
              <li>Request transcripts</li>
              <li>Track progress in real-time</li>
            </ul>
            <button 
              onClick={() => navigate("/register")} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              aria-label="Register as a student"
            >
              Register as Student
            </button>
          </div>
          <div className="role-card border rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">For Lecturers</h3>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              <li>Resolve student issues efficiently</li>
              <li>View assigned issues</li>
              <li>Update marks and records</li>
              <li>Respond to student appeals</li>
              <li>Track resolution history</li>
            </ul>
            <button 
              onClick={() => navigate("/register")} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              aria-label="Register as a lecturer"
            >
              Register as Lecturer
            </button>
          </div>
          <div className="role-card border rounded-lg p-6 shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">For Administrators</h3>
            <ul className="list-disc pl-5 text-gray-600 mb-6">
              <li>Manage the academic issue workflow</li>
              <li>Review all submitted issues</li>
              <li>Assign issues to appropriate staff</li>
              <li>Monitor resolution progress</li>
              <li>Generate reports and analytics</li>
            </ul>
            <button 
              onClick={() => navigate("/register")} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              aria-label="Register as an administrator"
            >
              Register as Admin
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">How It Works</h2>
          <div className="steps grid md:grid-cols-3 gap-8">
            <div className="step flex flex-col items-center text-center">
              <div className="step-number w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <p className="text-gray-600">Students submit academic issues with relevant details and supporting documents.</p>
            </div>
            <div className="step flex flex-col items-center text-center">
              <div className="step-number w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <p className="text-gray-600">Academic staff review & assign issues to appropriate departments.</p>
            </div>
            <div className="step flex flex-col items-center text-center">
              <div className="step-number w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <p className="text-gray-600">Lecturers resolve issues & update status with notifications to students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section py-16 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Academic Issue Resolution?</h2>
          <p className="text-lg mb-6">Join AITS today and experience a seamless issue tracking process.</p>
          <button 
            onClick={() => navigate("/register")} 
            className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition text-lg font-semibold"
            aria-label="Get started with AITS"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About AITS</h3>
              <p>© 2025 Academic Issue Tracking System - Makerere University</p>
              <p className="mt-2">Designed by CSC 1202 group 7</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/login")} className="hover:underline">Login</button></li>
                <li><button onClick={() => navigate("/register")} className="hover:underline">Register</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p>Email: support@aits.mak.ac.ug</p>
              <p>Phone: +256 123 456 789</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Welcome
