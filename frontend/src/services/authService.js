import api from "./api"
 
 // Register a new user
 export const register = async (userData) => {
   try {
     const response = await api.post("users/register/", userData)
     return response.data
   } catch (error) {
     throw error.response ? error.response.data : error.message
   }
 }
 
 // Login user
 export const login = async (credentials) => {
   try {
     const response = await api.post("token/", credentials)
     // Store token in localStorage
     localStorage.setItem("token", response.data.access)
     if (response.data.refresh) {
       localStorage.setItem("refresh_token", response.data.refresh)
     }
     return response.data
   } catch (error) {
     throw error.response ? error.response.data : error.message
   }
 }
 
 // Get current user profile
 export const getCurrentUser = async () => {
   try {
     const response = await api.get("users/me/")
     return response.data
   } catch (error) {
     throw error.response ? error.response.data : error.message
   }
 }
 
 // Logout user
 export const logout = () => {
   localStorage.removeItem("token")
   localStorage.removeItem("refresh_token")
   localStorage.removeItem("user")
 }
 
 // Change password
 export const changePassword = async (userId, passwordData) => {
   try {
     const response = await api.put(`users/${userId}/change_password/`, passwordData)
     return response.data
   } catch (error) {
     throw error.response ? error.response.data : error.message
   }
 }
 