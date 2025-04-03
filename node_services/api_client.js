const axios = require("axios")
const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json())

// Configure default axios instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Route to make API requests
app.post("/make-request", async (req, res) => {
  try {
    const { method, url, data, headers } = req.body

    const response = await apiClient({
      method: method || "GET",
      url,
      data,
      headers,
    })

    res.json({
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    })
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: true,
      message: error.message,
      response: error.response?.data,
    })
  }
})

// Start server
const PORT = process.env.NODE_PORT || 3001
app.listen(PORT, () => {
  console.log(`API client service running on port ${PORT}`)
})

