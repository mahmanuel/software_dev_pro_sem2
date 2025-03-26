import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [facultyId, setFacultyId] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/users/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setUsers(res.data.filter(user => user.role === "Faculty")));

    axios.get("http://127.0.0.1:8000/api/issues/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setIssues(res.data.filter(issue => issue.status === "Pending")));
  }, []);

  const assignIssue = async () => {
    if (!selectedIssue || !facultyId) return alert("Select an issue and a faculty member");
    try {
      await axios.post(`http://127.0.0.1:8000/api/issues/${selectedIssue}/assign/`, 
        { faculty_id: facultyId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Issue assigned successfully!");
    } catch (error) {
      alert("Failed to assign issue");
    }
  };

  return (
    <div>
      <h2>Admin Panel - Manage Issues</h2>
      <select onChange={(e) => setSelectedIssue(e.target.value)}>
        <option>Select Issue</option>
        {issues.map(issue => <option key={issue.id} value={issue.id}>{issue.title}</option>)}
      </select>
      
      <select onChange={(e) => setFacultyId(e.target.value)}>
        <option>Select Faculty</option>
        {users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
      </select>
      
      <button onClick={assignIssue}>Assign Issue</button>
    </div>
  );
};

export default AdminPanel;
