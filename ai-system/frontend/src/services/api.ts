import axios from 'axios'

// API base URL - will be proxied through Vite dev server
const API_BASE_URL = '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Add any authentication headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const endpoints = {
  process: '/process',
  health: '/health',
  status: '/status',
  config: '/config',
  sessions: '/sessions',
  stream: '/stream'
}

// Type definitions
export interface SessionResponse {
  session_id: string
  title: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
export interface ProcessRequest {
  user_input: string
  request_id?: string
  metadata?: Record<string, any>
}

export interface ProcessResponse {
  result: {
    output: string
    workflow_details: {
      workflow_id: string
      steps_completed: number
      llm_provider: string
    }
  }
  processing_time: number
  request_id: string
  metadata?: Record<string, any>
}

export interface HealthResponse {
  status: string
  version: string
  timestamp: string
  services: Record<string, string>
  configuration: Record<string, any>
}

export interface SystemStatus {
  system_health: string
  active_agents: number
  total_agents: number
  agent_status: Array<{
    agent_id: string
    status: string
    last_activity: string
    error_count: number
    success_count: number
    metadata?: Record<string, any>
  }>
  llm_provider: string
  configuration_valid: boolean
}

// API methods
export const apiService = {
  // Process user input
  async processInput(request: ProcessRequest): Promise<ProcessResponse> {
    const response = await api.post<ProcessResponse>(endpoints.process, request)
    return response.data
  },

  // Get health status
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>(endpoints.health)
    return response.data
  },

  // Get system status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await api.get<SystemStatus>(endpoints.status)
    return response.data
  },

  // Get configuration
  async getConfig(): Promise<any> {
    const response = await api.get(endpoints.config)
    return response.data
  },

  // Update configuration
  async updateConfig(config: any): Promise<any> {
    const response = await api.post(endpoints.config, config)
    return response.data
  },

  // Create a new session
  async createSession(title: string): Promise<SessionResponse> {
    const response = await api.post<SessionResponse>(endpoints.sessions, { title })
    return response.data
  },

  // Get session history
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`${endpoints.sessions}/${sessionId}/history`)
    return response.data
  },
}