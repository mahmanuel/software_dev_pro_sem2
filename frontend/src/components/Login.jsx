import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login, getCurrentUser } from "../services/authService"

function Login({ setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First, get the token
      const tokenResponse = await login({ email, password })
      console.log("Login successful, token received")

      // Then, get the user profile
      const userProfile = await getCurrentUser()
      console.log("User profile retrieved:", userProfile)

      // Store user info in localStorage
      const userData = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        department: userProfile.department,
      }

      localStorage.setItem("user", JSON.stringify(userData))

      // Update app state
      setUser(userData)

      // Redirect based on role
      if (
        userProfile.role === "ADMIN" ||
        userProfile.role === "FACULTY" ||
        userProfile.role === "admin" ||
        userProfile.role === "faculty"
      ) {
        navigate("/registrar")
      } else {
        navigate("/student")
      }
    } catch (err) {
      console.error("Login error:", err)
      if (typeof err === "object") {
        // Format error messages from the API
        const errorMessages = Object.entries(err)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
        setError(errorMessages)
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <p className="register-prompt">
        Don't have an account?{" "}
        <span onClick={() => navigate("/register")} className="link-text">
          Register
        </span>
      </p>

      {/* Back to Welcome page button */}
      <button className="back-to-welcome-button" onClick={() => navigate("/")}>
        Back to Welcome Page
      </button>
    </div>
  )
}

export default Login
