import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, getCurrentUser } from "../services/authService";
import LoadingSpinner from "./LoadingSpinner";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
      const userProfile = await getCurrentUser();
      const userData = {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        department: userProfile.department,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfully!");
      navigate(
        userProfile.role.toLowerCase() === "faculty"
          ? "/lecturer"
          : userProfile.role.toLowerCase() === "student"
          ? "/student"
          : "/registrar"
      );
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        typeof err === "object"
          ? Object.entries(err)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
          : "Invalid credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-800">Login to Your Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register here
            </button>
          </p>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6" noValidate>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                aria-describedby="email-error"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <p className="error-message text-sm text-red-600" id="form-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Login to your account"
          >
            {isLoading ? <LoadingSpinner /> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
