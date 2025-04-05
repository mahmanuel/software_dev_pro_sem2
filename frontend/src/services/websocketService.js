// WebSocket connection for notifications
export class NotificationSocket {
  constructor(token, onMessage, onOpen) {
    this.socket = null
    this.token = token
    this.onMessage = onMessage
    this.onOpen = onOpen
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = process.env.NODE_ENV === "production" ? window.location.host : "localhost:8000"

      this.socket = new WebSocket(`${protocol}//${host}/ws/notifications/?token=${this.token}`)

      this.socket.onopen = () => {
        console.log("Notification WebSocket connected")
        this.connected = true
        this.reconnectAttempts = 0
        if (this.onOpen) {
          this.onOpen()
        }
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("Notification WebSocket disconnected", event)
        this.connected = false
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error("Notification WebSocket error:", error)
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.connect()
      }, timeout)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.socket && this.connected) {
      this.socket.close()
    }
  }

  markAsRead(notificationId) {
    if (this.socket && this.connected) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "mark_as_read",
            id: notificationId,
          }),
        )
      } catch (error) {
        console.error("Error sending markAsRead message:", error)
      }
    }
  }

  markAllAsRead() {
    if (this.socket && this.connected) {
      try {
        this.socket.send(
          JSON.stringify({
            type: "mark_all_as_read",
          }),
        )
      } catch (error) {
        console.error("Error sending markAllAsRead message:", error)
      }
    }
  }
}

// WebSocket connection for issue updates
export class IssueSocket {
  constructor(token, issueId, onMessage, onOpen) {
    this.socket = null
    this.token = token
    this.issueId = issueId
    this.onMessage = onMessage
    this.onOpen = onOpen
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = process.env.NODE_ENV === "production" ? window.location.host : "localhost:8000"

      this.socket = new WebSocket(`${protocol}//${host}/ws/issues/${this.issueId}/?token=${this.token}`)

      this.socket.onopen = () => {
        console.log(`Issue ${this.issueId} WebSocket connected`)
        this.connected = true
        this.reconnectAttempts = 0
        if (this.onOpen) {
          this.onOpen()
        }
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log(`Issue ${this.issueId} WebSocket disconnected`, event)
        this.connected = false
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error(`Issue ${this.issueId} WebSocket error:`, error)
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.connect()
      }, timeout)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.socket && this.connected) {
      this.socket.close()
    }
  }
}

