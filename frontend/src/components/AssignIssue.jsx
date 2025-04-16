import React, { useEffect, useState } from "react";
import { assignIssue } from "../services/issueService";
import { getLecturers } from "../services/userService";

const AssignIssue = ({ issueId }) => {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");

  useEffect(() => {
    const fetchLecturers = async () => {
      const data = await getLecturers();
      setLecturers(data);
    };
    fetchLecturers();
  }, []);

  const handleAssign = async () => {
    if (selectedLecturer) {
      await assignIssue(issueId, selectedLecturer);
      alert("Issue assigned!");
    }
  };

  return (
    <div>
      <select onChange={(e) => setSelectedLecturer(e.target.value)} value={selectedLecturer}>
        <option value="">Select Lecturer</option>
        {lecturers.map((lect) => (
          <option key={lect.id} value={lect.id}>{lect.username}</option>
        ))}
      </select>
      <button onClick={handleAssign}>Assign</button>
    </div>
  );
};

export default AssignIssue;
