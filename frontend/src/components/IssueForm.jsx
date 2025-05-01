"use client"
 
 import { useState } from "react"
 import { createIssue } from "../services/issueService"
 import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, PRIORITY_LABELS } from "../constants/issueConstants"
 
 function IssueForm({ onIssueSubmit }) {
   const [formData, setFormData] = useState({
     title: "",
     description: "",
     category: CATEGORIES.OTHER,
     priority: PRIORITIES.MEDIUM,
     course_code: "",
     semester: "",
   })
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState("")
   const [successMessage, setSuccessMessage] = useState("")
 
   const handleChange = (e) => {
     const { name, value } = e.target
     setFormData({
       ...formData,
       [name]: value,
     })
   }
 
   const handleSubmit = async (e) => {
     e.preventDefault()
     setIsLoading(true)
     setError("")
     setSuccessMessage("")
 
     // Prepare the data for submission
     // Include course_code and semester in the description if provided
     let enhancedDescription = formData.description
 
     if (formData.course_code) {
       enhancedDescription = `Course Code: ${formData.course_code}\n\n${enhancedDescription}`
     }
 
     if (formData.semester) {
       enhancedDescription = `Semester: ${formData.semester}\n\n${enhancedDescription}`
     }
 
     const issueData = {
       title: formData.title,
       description: enhancedDescription,
       category: formData.category,
       priority: formData.priority,
     }
 
     try {
       console.log("Submitting issue:", issueData)
       const newIssue = await createIssue(issueData)
       console.log("Issue created successfully:", newIssue)
 
       // Clear form
       setFormData({
         title: "",
         description: "",
         category: CATEGORIES.OTHER,
         priority: PRIORITIES.MEDIUM,
         course_code: "",
         semester: "",
       })
 
       // Show success message
       setSuccessMessage("Your academic issue has been submitted successfully! The registrar will review it shortly.")
 
       // Notify parent component
       if (onIssueSubmit) {
         onIssueSubmit(newIssue)
       }
     } catch (err) {
       console.error("Submission error:", err)
       if (typeof err === "object") {
         // Format error messages from the API
         const errorMessages = Object.entries(err)
           .map(([key, value]) => `${key}: ${value}`)
           .join(", ")
         setError(errorMessages)
       } else {
         setError("Failed to submit issue. Please try again.")
       }
     } finally {
       setIsLoading(false)
     }
   }
 
   return (
     <div className="issue-form">
       {successMessage && <div className="success-message">{successMessage}</div>}
       {error && <div className="error-message">{error}</div>}
 
       <form onSubmit={handleSubmit}>
         <div className="form-group">
           <label htmlFor="issue-title">Issue Title</label>
           <input
             id="issue-title"
             type="text"
             name="title"
             placeholder="E.g., Missing Marks for Midterm Exam"
             value={formData.title}
             onChange={handleChange}
             required
           />
         </div>
 
         <div className="form-row">
           <div className="form-group">
             <label htmlFor="course-code">Course Code</label>
             <input
               id="course-code"
               type="text"
               name="course_code"
               placeholder="E.g., CSC1200"
               value={formData.course_code}
               onChange={handleChange}
             />
           </div>
 
           <div className="form-group">
             <label htmlFor="semester">Semester</label>
             <input
               id="semester"
               type="text"
               name="semester"
               placeholder="E.g., Fall 2024"
               value={formData.semester}
               onChange={handleChange}
             />
           </div>
         </div>
 
         <div className="form-group">
           <label htmlFor="issue-description">Description</label>
           <textarea
             id="issue-description"
             name="description"
             placeholder="Please provide detailed information about your academic issue..."
             value={formData.description}
             onChange={handleChange}
             rows="4"
             required
           />
         </div>
 
         <div className="form-row">
           <div className="form-group">
             <label htmlFor="category">Category</label>
             <select id="category" name="category" value={formData.category} onChange={handleChange} required>
               {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                 <option key={value} value={value}>
                   {label}
                 </option>
               ))}
             </select>
           </div>
 
           <div className="form-group">
             <label htmlFor="priority">Priority</label>
             <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required>
               {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                 <option key={value} value={value}>
                   {label}
                 </option>
               ))}
             </select>
           </div>
         </div>
 
         <button type="submit" className="submit-button" disabled={isLoading}>
           {isLoading ? "Submitting..." : "Submit Academic Issue"}
         </button>
       </form>
     </div>
   )
 }
 
 export default IssueForm