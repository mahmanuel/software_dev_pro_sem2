// src/mockData.js
// Initialize issues and users from localStorage or use defaults
const initialIssues = JSON.parse(localStorage.getItem('issues')) || [
    { title: 'Room Issue', description: 'AC broken', submittedBy: 'student@test.com', date: '2025-03-29' },
  ];
  const initialUsers = JSON.parse(localStorage.getItem('users')) || [];
  
  const issues = initialIssues;
  const users = initialUsers;
  
  // Save to localStorage whenever issues or users change
  const saveIssues = () => localStorage.setItem('issues', JSON.stringify(issues));
  const saveUsers = () => localStorage.setItem('users', JSON.stringify(users));
  
  export const getIssues = () => {
    return JSON.parse(localStorage.getItem('issues')) || issues;
  };
  
  export const addIssue = (issue) => {
    issues.push(issue);
    saveIssues();
  };
  
  export const addUser = (user) => {
    users.push(user);
    saveUsers();
  };
  
  export const getUser = (email) => {
    const currentUsers = JSON.parse(localStorage.getItem('users')) || users;
    return currentUsers.find(user => user.email === email);
  };