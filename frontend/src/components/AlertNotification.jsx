
 "use client"
 
 import { useState, useEffect } from "react"
 import { X } from "lucide-react"
 
 export default function AlertNotification({ message, type = "info", duration = 5000, onClose }) {
   const [isVisible, setIsVisible] = useState(true)
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setIsVisible(false)
       if (onClose) onClose()
     }, duration)
 
     return () => clearTimeout(timer)
   }, [duration, onClose])
 
   if (!isVisible) return null
 
   const bgColors = {
     success: "bg-green-100 border-green-500 text-green-700",
     error: "bg-red-100 border-red-500 text-red-700",
     info: "bg-blue-100 border-blue-500 text-blue-700",
     warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
   }
 
   return (
     <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border-l-4 shadow-md ${bgColors[type]}`}>
       <div className="flex items-center justify-between">
         <div className="flex-1 mr-3">{message}</div>
         <button
           onClick={() => {
             setIsVisible(false)
             if (onClose) onClose()
           }}
           className="text-gray-500 hover:text-gray-700"
         >
           <X size={18} />
         </button>
       </div>
     </div>
   )
 }