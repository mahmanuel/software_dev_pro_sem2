import React, { useState } from 'react';
import Login from './components/Login';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Tracks login state

  const mockIssues = [
    { id: 1, title: 'Test Issue 1', description: 'This is the first test issue.' },
    { id: 2, title: 'Test Issue 2', description: 'This is the second test issue.' },
  ];

  const handleCreateIssue = (newIssue) => {
    console.log('New Issue Submitted:', newIssue);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Update state on successful login
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Header */}
          <header className="bg-blue-500 text-white py-4">
            <div className="container mx-auto text-center">
              <h1 className="text-3xl font-bold">Academic Issue Tracking System</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto py-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Form Section */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-blue-600">Submit an Issue</h2>
                <IssueForm onSubmit={handleCreateIssue} />
              </section>

              {/* Issue List Section */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-blue-600">All Issues</h2>
                <IssueList issues={mockIssues} />
              </section>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
