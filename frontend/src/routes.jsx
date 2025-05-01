import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
 import AuditLogDashboard from "./components/AuditLogDashboard"
 import DashboardRegistrar from "./components/DashboardRegistrar"
 // Import other components
 
 function AppRoutes() {
   return (
     <Router>
       <Routes>
         {/* Existing routes */}
         <Route path="/registrar" element={<DashboardRegistrar />} />
         <Route path="/audit-logs" element={<AuditLogDashboard />} />
         {/* Other routes */}
       </Routes>
     </Router>
   )
 }
 
 export default AppRoutes