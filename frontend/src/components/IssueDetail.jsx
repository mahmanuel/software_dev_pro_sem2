"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getIssueDetails, addComment, addIssueStatus, uploadAttachment } from "../services/issueService";
import { IssueSocket } from "../services/websocketService";
import LoadingSpinner from "./LoadingSpinner";
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, STATUS_COLORS } from "../constants/issueConstants";

function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const issueSocketRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const data = await getIssueDetails(issueId);
        setIssue(data);
        setError("");
      } catch (err) {
        console.error("Error fetching issue details:", err);
        setError("Failed to load issue details.");
        toast.error("Failed to load issue details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueDetails();

    const token = localStorage.getItem("token");
    if (token && issueId) {
      const handleIssueMessage = (data) => {
        if (data.type === "comment_added") {
          setIssue((prev) => ({ ...prev, comments: [...prev.comments, data.comment] }));
          toast.info("New comment added!");
        } else if (data.type === "status_updated") {
          setIssue((prev) => ({
            ...prev,
            statuses: [data.status, ...prev.statuses],
            current_status: data.status.status,
          }));
          toast.info("Status updated!");
        }
      };

      const handleWsOpen = () => setWsConnected(true);

      try {
        issueSocketRef.current = new IssueSocket(token, issueId, handleIssueMessage, handleWsOpen);
        issueSocketRef.current.connect();
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
      }
    }

    return () => {
      if (issueSocketRef.current) issueSocketRef.current.disconnect();
    };
  }, [issueId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await addComment(issueId, comment);
      if (!wsConnected) {
        setIssue((prev) => ({ ...prev, comments: [...(prev.comments || []), response] }));
      }
      setComment("");
      toast.success("Comment posted!");
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setIsSubmitting(true);
    try {
      const response = await addIssueStatus(issueId, { status: newStatus, notes: statusNote });
      if (!wsConnected) {
        setIssue((prev) => ({
          ...prev,
          statuses: [response, ...(prev.statuses || [])],
          current_status: response.status,
        }));
      }
      setNewStatus("");
      setStatusNote("");
      toast.success("Status updated!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    try {
      await uploadAttachment(issueId, file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const updatedIssue = await getIssueDetails(issueId);
      setIssue(updatedIssue);
      toast.success("File uploaded!");
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("Failed to upload file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!issue) return <div className="not-found">Issue not found.</div>;

  // Your existing JSX remains largely unchanged
  return (
    <div className="issue-detail">
      {/* Your existing JSX */}
    </div>
  );
}

export default IssueDetail;