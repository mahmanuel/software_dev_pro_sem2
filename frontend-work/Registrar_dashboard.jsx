import React, { useState, useEffect } from "react";

const RegistrarDashboard = () => {
  const [statistics, setStatistics] = useState({ totalStudents: 0, loggedIssues: 0, solvedIssues: 0 });
  const [loggedIssues, setLoggedIssues] = useState([]);
  const [solvedIssues, setSolvedIssues] = useState([]);
  const [sortOptionLogged, setSortOptionLogged] = useState("title");
  const [sortOptionSolved, setSortOptionSolved] = useState("title");

  useEffect(() => {
    // Mock statistics data
    setStatistics({ totalStudents: 1200, loggedIssues: 10, solvedIssues: 5 });

    // Mock logged issues data
    setLoggedIssues([
      { id: 1, title: "Grade Discrepancy", description: "Resolve grade issue for student A." },
      { id: 2, title: "Course Material Missing", description: "Provide missing materials for Physics 101." },
      { id: 3, title: "Exam Schedule Conflict", description: "Resolve scheduling conflict for exams." },
    ]);

    // Mock solved issues data
    setSolvedIssues([
      { id: 1, title: "Exam Schedule Conflict", description: "Resolved scheduling conflict for exams." },
      { id: 2, title: "Library Access Issue", description: "Fixed library access for student B." },
    ]);
  }, []);

  // Generic sorting function
  const sortIssues = (issues, option) => {
    return [...issues].sort((a, b) => a[option].localeCompare(b[option]));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Registrar Dashboard</h1>
        <p className="text-gray-600">Overview of current statistics and issues.</p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {Object.entries(statistics).map(([key, value]) => (
          <div key={key} className="p-4 bg-blue-100 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Issues Section */}
      {[{ title: "Logged Issues", issues: loggedIssues, sortOption: sortOptionLogged, setSortOption: setSortOptionLogged },
        { title: "Solved Issues", issues: solvedIssues, sortOption: sortOptionSolved, setSortOption: setSortOptionSolved }]
        .map(({ title, issues, sortOption, setSortOption }) => (
          <div key={title} className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            {/* Sorting Options */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Sort By:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Title</option>
                <option value="description">Description</option>
              </select>
            </div>
            {issues.length > 0 ? (
              <ul>
                {sortIssues(issues, sortOption).map((issue) => (
                  <li key={issue.id} className="mb-4">
                    <div className="mb-2">
                      <strong>{issue.title}:</strong>
                    </div>
                    <p className="text-gray-600">{issue.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No issues found.</p>
            )}
          </div>
        ))}
    </div>
  );
};

export default RegistrarDashboard;
