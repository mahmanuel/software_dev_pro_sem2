import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Simulate fetching student assignments
    const mockAssignments = [
      { id: 101, courseName: "Chemistry", task: "Lab Report 2", dueDate: "2025-04-01" },
      { id: 102, courseName: "Mathematics", task: "Calculus Assignment 3", dueDate: "2025-04-05" },
      { id: 103, courseName: "Physics", task: "Project Submission", dueDate: "2025-04-10" },
    ];
    setAssignments(mockAssignments);
  }, []);

  const handleReportIssue = () => {
    // Navigate to the issue reporting page
    navigate("/report-issue");
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Student Dashboard</h1>
      <h2 className="text-xl font-semibold mb-4 text-center">Your Upcoming Assignments</h2>
      
      {/* Assignments List */}
      <div className="overflow-x-auto">
        {assignments.length > 0 ? (
          <ul className="space-y-4">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition duration-300">
                <strong>{assignment.courseName}:</strong> {assignment.task} <span className="text-gray-500">(Due: {assignment.dueDate})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No upcoming assignments.</p>
        )}
      </div>

      {/* Report Issue Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleReportIssue}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Report an Issue
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
