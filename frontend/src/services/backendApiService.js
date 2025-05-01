// This service handles API calls from the backend to the frontend
import { toast } from "react-toastify"
 
// Define the endpoint for backend-to-frontend communication
const API_ENDPOINT = "/api/frontend-endpoint"

// Create a class to handle backend API calls
class BackendApiService {
  // Initialize the service
  constructor() {
    this.setupEndpoint()
  }

  // Set up the endpoint to receive backend API calls
  setupEndpoint() {
    // Create a route handler for the endpoint
    if (typeof window !== "undefined") {
      // Register the endpoint with the service worker if available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "REGISTER_ENDPOINT",
          endpoint: API_ENDPOINT,
        })
      } else {
        console.log("Service worker not available, using polling for backend API calls")
        // Fall back to polling if service worker is not available
        this.startPolling()
      }
    }
  }

  // Start polling for backend API calls
  startPolling() {
    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.checkForBackendCalls()
    }, 10000)
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
  }

  // Check for backend API calls
  async checkForBackendCalls() {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/backend-api/api-calls/pending/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          data.results.forEach((call) => {
            this.handleBackendCall(call)
          })
        }
      }
    } catch (error) {
      console.error("Error checking for backend API calls:", error)
    }
  }

  // Handle a backend API call
  handleBackendCall(call) {
    console.log("Received backend API call:", call)

    switch (call.call_type) {
      case "NOTIFICATION":
        this.handleNotification(call.payload)
        break
      case "DATA_UPDATE":
        this.handleDataUpdate(call.payload)
        break
      case "USER_ACTION":
        this.handleUserAction(call.payload)
        break
      case "SYSTEM_EVENT":
        this.handleSystemEvent(call.payload)
        break
      default:
        console.warn("Unknown backend API call type:", call.call_type)
    }

    // Mark the call as processed
    this.markCallAsProcessed(call.id)
  }

  // Mark a call as processed
  async markCallAsProcessed(callId) {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await fetch(`/api/backend-api/api-calls/${callId}/mark-processed/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Error marking call as processed:", error)
    }
  }

  // Handle a notification from the backend
  handleNotification(payload) {
    const { title, message, type } = payload

    // Show a toast notification
    if (toast) {
      switch (type) {
        case "success":
          toast.success(message, { autoClose: 5000 })
          break
        case "error":
          toast.error(message, { autoClose: 5000 })
          break
        case "warning":
          toast.warning(message, { autoClose: 5000 })
          break
        case "info":
        default:
          toast.info(message, { autoClose: 5000 })
          break
      }
    } else {
      // Fall back to alert if toast is not available
      alert(`${title}: ${message}`)
    }

    // Dispatch an event for components to listen to
    const event = new CustomEvent("backend-notification", { detail: payload })
    window.dispatchEvent(event)
  }

  // Handle a data update from the backend
  handleDataUpdate(payload) {
    const { entity, action, data } = payload

    // Dispatch an event for components to listen to
    const event = new CustomEvent("backend-data-update", { detail: payload })
    window.dispatchEvent(event)

    // Refresh data in components that are listening
    console.log(`Data update: ${action} ${entity}`, data)
  }

  // Handle a user action from the backend
  handleUserAction(payload) {
    const { action, target } = payload

    // Dispatch an event for components to listen to
    const event = new CustomEvent("backend-user-action", { detail: payload })
    window.dispatchEvent(event)

    console.log(`User action: ${action} on ${target}`)
  }

  // Handle a system event from the backend
  handleSystemEvent(payload) {
    const { event, data } = payload

    // Dispatch an event for components to listen to
    const systemEvent = new CustomEvent("backend-system-event", { detail: payload })
    window.dispatchEvent(systemEvent)

    console.log(`System event: ${event}`, data)
  }
}

// Create a singleton instance
const backendApiService = new BackendApiService()

export default backendApiService