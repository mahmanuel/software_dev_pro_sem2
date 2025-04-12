// WebSocket service for real-time notifications and issue updates

export class NotificationSocket {
  constructor(token, onMessage, onOpen) {
    this.token = token
    this.onMessage = onMessage
    this.onOpen = onOpen
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect() {
    try {
      // Get the WebSocket URL from environment or use default
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsHost = process.env.REACT_APP_WS_HOST || window.location.host
      const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications/?token=${this.token}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("NotificationSocket: Connected")
        this.isConnected = true
        this.reconnectAttempts = 0
        if (this.onOpen) this.onOpen()
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (this.onMessage) this.onMessage(data)
        } catch (error) {
          console.error("NotificationSocket: Error parsing message", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log("NotificationSocket: Disconnected", event)
        this.isConnected = false
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error("NotificationSocket: Error", error)
      }
    } catch (error) {
      console.error("NotificationSocket: Failed to connect", error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `NotificationSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )

      // Exponential backoff for reconnect
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)

      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnected = false
  }

  markAsRead(notificationId) {
    if (this.isConnected) {
      this.socket.send(
        JSON.stringify({
          type: "mark_read",
          notification_id: notificationId,
        }),
      )
    }
  }

  markAllAsRead() {
    if (this.isConnected) {
      this.socket.send(
        JSON.stringify({
          type: "mark_all_read",
        }),
      )
    }
  }
}

export class IssueSocket {
  constructor(token, issueId, onMessage, onOpen) {
    this.token = token
    this.issueId = issueId
    this.onMessage = onMessage
    this.onOpen = onOpen
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect() {
    try {
      // Get the WebSocket URL from environment or use default
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsHost = process.env.REACT_APP_WS_HOST || window.location.host
      const wsUrl = `${wsProtocol}//${wsHost}/ws/issues/${this.issueId}/?token=${this.token}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log(`IssueSocket: Connected to issue ${this.issueId}`)
        this.isConnected = true
        this.reconnectAttempts = 0
        if (this.onOpen) this.onOpen()
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (this.onMessage) this.onMessage(data)
        } catch (error) {
          console.error("IssueSocket: Error parsing message", error)
        }
      }

      this.socket.onclose = (event) => {
        console.log(`IssueSocket: Disconnected from issue ${this.issueId}`, event)
        this.isConnected = false
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error(`IssueSocket: Error for issue ${this.issueId}`, error)
      }
    } catch (error) {
      console.error(`IssueSocket: Failed to connect to issue ${this.issueId}`, error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`IssueSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      // Exponential backoff for reconnect
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)

      this.reconnectTimeout = setTimeout(() => {
        this.connect()
      }, delay)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnected = false
  }
}
