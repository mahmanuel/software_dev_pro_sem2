"use client"
 
 import { useState, useEffect, useRef } from "react"
 import { useParams, useNavigate } from "react-router-dom"
 import { getIssueDetails, addComment, addIssueStatus, uploadAttachment } from "../services/issueService"
 import { IssueSocket } from "../services/websocketService"
 import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, STATUS_COLORS } from "../constants/issueConstants"
 
 function IssueDetail() {
   const { issueId } = useParams()
   const navigate = useNavigate()
   const [issue, setIssue] = useState(null)
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState("")
   const [comment, setComment] = useState("")
   const [newStatus, setNewStatus] = useState("")
   const [statusNote, setStatusNote] = useState("")
   const [file, setFile] = useState(null)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [wsConnected, setWsConnected] = useState(false)
   const issueSocketRef = useRef(null)
   const fileInputRef = useRef(null)
 
   useEffect(() => {
     const fetchIssueDetails = async () => {
       try {
         const data = await getIssueDetails(issueId)
         setIssue(data)
         setError("")
       } catch (err) {
         console.error("Error fetching issue details:", err)
         setError("Failed to load issue details. Please try again.")
       } finally {
         setIsLoading(false)
       }
     }
 
     fetchIssueDetails()
 
     // Set up WebSocket connection for real-time updates
     const token = localStorage.getItem("token")
     if (token && issueId) {
       const handleIssueMessage = (data) => {
         if (data.type === "comment_added") {
           // Update issue with new comment
           setIssue((prevIssue) => ({
             ...prevIssue,
             comments: [...prevIssue.comments, data.comment],
           }))
         } else if (data.type === "status_updated") {
           // Update issue with new status
           setIssue((prevIssue) => ({
             ...prevIssue,
             statuses: [data.status, ...prevIssue.statuses],
             current_status: data.status.status,
           }))
         }
       }
 
       const handleWsOpen = () => {
         setWsConnected(true)
       }
 
       try {
         issueSocketRef.current = new IssueSocket(token, issueId, handleIssueMessage, handleWsOpen)
         issueSocketRef.current.connect()
       } catch (error) {
         console.error("Failed to initialize WebSocket:", error)
       }
     }
 
     // Cleanup WebSocket connection on unmount
     return () => {
       if (issueSocketRef.current) {
         issueSocketRef.current.disconnect()
       }
     }
   }, [issueId])
 
   const handleCommentSubmit = async (e) => {
     e.preventDefault()
     if (!comment.trim()) return
 
     setIsSubmitting(true)
     try {
       const response = await addComment(issueId, comment)
       console.log("Comment added:", response)
 
       // If WebSocket is not connected, manually update the UI
       if (!wsConnected) {
         setIssue((prevIssue) => ({
           ...prevIssue,
           comments: [...(prevIssue.comments || []), response],
         }))
       }
 
       setComment("")
     } catch (err) {
       console.error("Error submitting comment:", err)
       alert("Failed to submit comment. Please try again.")
     } finally {
       setIsSubmitting(false)
     }
   }
 
   const handleStatusSubmit = async (e) => {
     e.preventDefault()
     if (!newStatus) return
 
     setIsSubmitting(true)
     try {
       const response = await addIssueStatus(issueId, {
         status: newStatus,
         notes: statusNote,
       })
       console.log("Status updated:", response)
 
       // If WebSocket is not connected, manually update the UI
       if (!wsConnected) {
         setIssue((prevIssue) => ({
           ...prevIssue,
           statuses: [response, ...(prevIssue.statuses || [])],
           current_status: response.status,
         }))
       }
 
       setNewStatus("")
       setStatusNote("")
     } catch (err) {
       console.error("Error updating status:", err)
       alert("Failed to update status. Please try again.")
     } finally {
       setIsSubmitting(false)
     }
   }
 
   const handleFileChange = (e) => {
     setFile(e.target.files[0])
   }
 
   const handleFileUpload = async (e) => {
     e.preventDefault()
     if (!file) return
 
     setIsSubmitting(true)
     try {
       await uploadAttachment(issueId, file)
       setFile(null)
       // Reset file input
       if (fileInputRef.current) {
         fileInputRef.current.value = ""
       }
 
       // Refresh issue details to show new attachment
       const updatedIssue = await getIssueDetails(issueId)
       setIssue(updatedIssue)
     } catch (err) {
       console.error("Error uploading file:", err)
       alert("Failed to upload file. Please try again.")
     } finally {
       setIsSubmitting(false)
     }
   }
 
   if (isLoading) {
     return <div className="loading">Loading issue details...</div>
   }
 
   if (error) {
     return <div className="error-message">{error}</div>
   }
 
   if (!issue) {
     return <div className="not-found">Issue not found.</div>
   }
 
   const userRole = JSON.parse(localStorage.getItem("user") || "{}").role
   const isAdmin = userRole === "ADMIN"
   const isFaculty = userRole === "FACULTY"
   const canUpdateStatus = isAdmin || isFaculty
 
   return (
     <div className="issue-detail">
       <button className="back-button" onClick={() => navigate(-1)}>
         &larr; Back
       </button>
 
       <div className="issue-header">
         <h2>{issue.title}</h2>
         <div className="issue-meta">
           <span className="issue-category">Category: {CATEGORY_LABELS[issue.category] || issue.category}</span>
           <span className="issue-priority">Priority: {PRIORITY_LABELS[issue.priority] || issue.priority}</span>
           {issue.current_status && (
             <span className="issue-status" style={{ backgroundColor: STATUS_COLORS[issue.current_status] || "#777" }}>
               Status: {STATUS_LABELS[issue.current_status] || issue.current_status}
             </span>
           )}
         </div>
       </div>
 
       <div className="issue-content">
         <h3>Description</h3>
         <p>{issue.description}</p>
 
         <div className="issue-info">
           <div>
             <strong>Submitted by:</strong> {issue.submitted_by_details?.email || "Unknown"}
           </div>
           <div>
             <strong>Date:</strong> {new Date(issue.created_at).toLocaleString()}
           </div>
           {issue.assigned_to && (
             <div>
               <strong>Assigned to:</strong> {issue.assigned_to_details?.email || "Unknown"}
             </div>
           )}
         </div>
       </div>
 
       {canUpdateStatus && (
         <div className="status-update-form">
           <h3>Update Status</h3>
           <form onSubmit={handleStatusSubmit}>
             <div className="form-row">
               <div className="form-group">
                 <label htmlFor="newStatus">New Status</label>
                 <select id="newStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                   <option value="">Select Status</option>
                   {Object.entries(STATUS_LABELS).map(([value, label]) => (
                     <option key={value} value={value}>
                       {label}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
 
             <textarea
               placeholder="Add notes about this status update..."
               value={statusNote}
               onChange={(e) => setStatusNote(e.target.value)}
               rows="2"
             />
 
             <button type="submit" disabled={isSubmitting || !newStatus}>
               {isSubmitting ? "Updating..." : "Update Status"}
             </button>
           </form>
         </div>
       )}
 
       <div className="status-history">
         <h3>Status History</h3>
         {issue.statuses && issue.statuses.length > 0 ? (
           <ul className="status-list">
             {issue.statuses.map((status, index) => (
               <li key={index} className="status-item">
                 <div className="status-header">
                   <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[status.status] || "#777" }}>
                     {STATUS_LABELS[status.status] || status.status}
                   </span>
                   <span className="status-date">{new Date(status.created_at).toLocaleString()}</span>
                 </div>
                 {status.notes && <p className="status-notes">{status.notes}</p>}
                 <div className="status-updater">Updated by: {status.updated_by_details?.email || "Unknown"}</div>
               </li>
             ))}
           </ul>
         ) : (
           <p>No status updates yet.</p>
         )}
       </div>
 
       <div className="attachments-section">
         <h3>Attachments</h3>
         <form onSubmit={handleFileUpload} className="attachment-form">
           <input type="file" onChange={handleFileChange} ref={fileInputRef} />
           <button type="submit" disabled={isSubmitting || !file}>
             {isSubmitting ? "Uploading..." : "Upload"}
           </button>
         </form>
 
         {issue.attachments && issue.attachments.length > 0 ? (
           <ul className="attachment-list">
             {issue.attachments.map((attachment, index) => (
               <li key={index} className="attachment-item">
                 <a href={attachment.file} target="_blank" rel="noopener noreferrer">
                   {attachment.filename}
                 </a>
                 <span className="attachment-size">{(attachment.size / 1024).toFixed(2)} KB</span>
                 <span className="attachment-date">{new Date(attachment.created_at).toLocaleDateString()}</span>
               </li>
             ))}
           </ul>
         ) : (
           <p>No attachments yet.</p>
         )}
       </div>
 
       <div className="comments-section">
         <h3>Comments</h3>
         <form onSubmit={handleCommentSubmit} className="comment-form">
           <textarea
             placeholder="Add a comment..."
             value={comment}
             onChange={(e) => setComment(e.target.value)}
             rows="3"
             required
           />
           <button type="submit" disabled={isSubmitting || !comment.trim()}>
             {isSubmitting ? "Posting..." : "Post Comment"}
           </button>
         </form>
 
         {issue.comments && issue.comments.length > 0 ? (
           <ul className="comment-list">
             {issue.comments.map((comment, index) => (
               <li key={index} className="comment-item">
                 <div className="comment-header">
                   <span className="comment-author">{comment.user_details?.email || "Unknown"}</span>
                   <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                 </div>
                 <p className="comment-content">{comment.content}</p>
               </li>
             ))}
           </ul>
         ) : (
           <p>No comments yet.</p>
         )}
       </div>
     </div>
   )
 }
 
 export default IssueDetail