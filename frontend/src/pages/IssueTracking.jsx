import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const IssueTracking = () => {
  const [issues, setIssues] = useState([]);
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/issues/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setIssues(res.data))
      .catch((err) => console.error("Error fetching issues:", err));
  }, [token]);

  return (
    <div>
      <h2>Issue Tracking</h2>
      <ul>
        {issues
          .filter(issue => user.role === "Student" ? issue.student === user.username : true)
          .map((issue) => (
            <li key={issue.id}>
              <strong>{issue.title}</strong> - {issue.status}  
              {user.role === "Faculty" && <button>Update Status</button>}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default IssueTracking;
