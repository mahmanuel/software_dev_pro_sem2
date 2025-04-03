import React, { useState, useEffect } from "react";

const LecturerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch assigned tasks
    setTimeout(() => {
      const mockIssues = [
        { id: 1, title: "Student Inquiry", description: "Respond to student A's query about grading criteria." },
        { id: 2, title: "Lecture Notes Update", description: "Upload revised materials for Mathematics 202." },
      ];
      setIssues(mockIssues);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Lecturer Dashboard</h1>

      <section className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Pending Tasks</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : issues.length > 0 ? (
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li key={issue.id} className="p-3 border rounded-md bg-gray-50 shadow-sm">
                <strong className="text-gray-900">{issue.title}:</strong> {issue.description}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tasks assigned.</p>
        )}
      </section>
    </div>
  );
};

export default LecturerDashboard;
