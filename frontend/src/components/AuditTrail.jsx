"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

function AuditTrail() {
  const { issueId } = useParams();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/issues/${issueId}/audit/`);
        setLogs(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit trail.");
        toast.error("Failed to load audit trail. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [issueId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="audit-trail">
      <h2>Audit Trail for Issue #{issueId}</h2>
      {logs.length > 0 ? (
        <ul className="audit-list">
          {logs.map((log, index) => (
            <li key={index} className="audit-item">
              <div className="audit-header">
                <span className="audit-action">{log.action}</span>
                <span className="audit-date">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="audit-user">By: {log.user_email || "Unknown"}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No audit logs available.</p>
      )}
    </div>
  );
}

export default AuditTrail;