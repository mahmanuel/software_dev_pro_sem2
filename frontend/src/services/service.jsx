import axios from "axios";
 
 const API = axios.create({ baseURL: "https://aits-backend-baker-b43b47caaf44.herokuapp.com/api" });
 
 export const loginUser = (data) => API.post("/auth/login/", data);
 export const registerUser = (data) => API.post("/auth/register/", data);
 export const getUserProfile = () =>
   API.get("/auth/profile/", {
     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
   });