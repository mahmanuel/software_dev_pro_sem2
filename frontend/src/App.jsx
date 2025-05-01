"use client"
 
 import { useState, useEffect } from "react"
 import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
 import { getCurrentUser } from "./services/authService"
 import Welcome from "./components/Welcome"
 import Login from "./components/Login"
 import Register from "./components/Register"
 import DashboardStudent from "./components/DashboardStudent"
 import DashboardRegistrar from "./components/DashboardRegistrar"
 import DashboardFaculty from "./components/DashboardFaculty"
 import IssueDetail from "./components/IssueDetail"
 import AuditLogDashboard from "./components/AuditLogDashboard"
 import AnalyticsDashboard from "./components/AnalyticsDashboard";
 import "./styles.css"
 
 function App() {
   const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null)
   const [isLoading, setIsLoading] = useState(true)
 
   useEffect(() => {
     // Check if user is authenticated on app load
     const verifyUser = async () => {
       const token = localStorage.getItem("token")
       if (token) {
         try {
           console.log("Verifying user token")
           const userProfile = await getCurrentUser()
           console.log("User verified:", userProfile)
 
           setUser({
             id: userProfile.id,
             email: userProfile.email,
             role: userProfile.role,
             first_name: userProfile.first_name,
             last_name: userProfile.last_name,
             department: userProfile.department,
           })
         } catch (error) {
           console.error("Token verification failed:", error)
           // If token is invalid, clear localStorage
           localStorage.removeItem("token")
           localStorage.removeItem("user")
           setUser(null)
         }
       }
       setIsLoading(false)
     }
 
     verifyUser()
   }, [])
 
   // Helper function to check if user is a student
   const isStudent = (user) => {
     return user && (user.role === "STUDENT" || user.role === "student")
   }
 
   // Helper function to check if user is faculty
   const isFaculty = (user) => {
     return user && (user.role === "FACULTY" || user.role === "faculty")
   }
 
   // Helper function to check if user is admin or registrar
   const isAdminOrRegistrar = (user) => {
     return (
       user && (user.role === "ADMIN" || user.role === "REGISTRAR" || user.role === "admin" || user.role === "registrar")
     )
   }
 
   if (isLoading) {
     return <div className="loading">Loading...</div>
   }
 
   return (
     <Router>
       <Routes>
         {/* Public routes */}
         <Route
           path="/"
           element={
             user ? (
               isStudent(user) ? (
                 <Navigate to="/student" />
               ) : isFaculty(user) ? (
                 <Navigate to="/faculty" />
               ) : isAdminOrRegistrar(user) ? (
                 <Navigate to="/registrar" />
               ) : (
                 <Welcome />
               )
             ) : (
               <Welcome />
             )
           }
         />
 
         <Route
           path="/login"
           element={
             user ? (
               isStudent(user) ? (
                 <Navigate to="/student" />
               ) : isFaculty(user) ? (
                 <Navigate to="/faculty" />
               ) : isAdminOrRegistrar(user) ? (
                 <Navigate to="/registrar" />
               ) : (
                 <Login setUser={setUser} />
               )
             ) : (
               <Login setUser={setUser} />
             )
           }
         />
 
         <Route
           path="/register"
           element={
             user ? (
               isStudent(user) ? (
                 <Navigate to="/student" />
               ) : isFaculty(user) ? (
                 <Navigate to="/faculty" />
               ) : isAdminOrRegistrar(user) ? (
                 <Navigate to="/registrar" />
               ) : (
                 <Register setUser={setUser} />
               )
             ) : (
               <Register setUser={setUser} />
             )
           }
         />
 
         {/* Protected student routes */}
         <Route
           path="/student"
           element={isStudent(user) ? <DashboardStudent setUser={setUser} /> : <Navigate to="/login" />}
         />
 
         {/* Protected faculty routes */}
         <Route
           path="/faculty"
           element={isFaculty(user) ? <DashboardFaculty setUser={setUser} /> : <Navigate to="/login" />}
         />
 
         {/* Protected admin/registrar routes */}
         <Route
           path="/registrar"
           element={isAdminOrRegistrar(user) ? <DashboardRegistrar setUser={setUser} /> : <Navigate to="/login" />}
         />
 
         {/* Audit Log Dashboard route - accessible only to admin/registrar */}
         <Route
           path="/audit-logs"
           element={isAdminOrRegistrar(user) ? <AuditLogDashboard /> : <Navigate to="/login" />}
         />
 
         <Route
           path="/analytics"
           element={isAdminOrRegistrar(user) ? <AnalyticsDashboard /> : <Navigate to="/login" />}
         />
 
         {/* Issue detail route - accessible to all authenticated users */}
         <Route path="/issues/:issueId" element={user ? <IssueDetail /> : <Navigate to="/login" />} />
 
         {/* Fallback route */}
         <Route path="*" element={<Navigate to="/" />} />
       </Routes>
     </Router>
   )
 }
 
 export default App