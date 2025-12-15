import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// Error categorization types
export interface CategorizedError {
  type: 'network' | 'timeout' | 'cors' | 'server' | 'validation' | 'auth' | 'unknown'
  message: string
  details?: string
  statusCode?: number
  originalError: unknown
}

// Categorize errors for better debugging
export const categorizeError = (error: unknown): CategorizedError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>

    // Network error (no response received)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return {
          type: 'timeout',
          message: 'Request timed out. Please check your connection.',
          details: `URL: ${axiosError.config?.url}`,
          originalError: error,
        }
      }
      if (axiosError.message.includes('Network Error')) {
        return {
          type: 'network',
          message: 'Cannot connect to server.',
          details: `Attempted URL: ${axiosError.config?.baseURL}${axiosError.config?.url}`,
          originalError: error,
        }
      }
      return {
        type: 'cors',
        message: 'Connection blocked. This may be a CORS issue.',
        details: 'Check browser console for CORS errors',
        originalError: error,
      }
    }

    // Server responded with error
    const status = axiosError.response.status
    const responseData = axiosError.response.data

    if (status >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again.',
        statusCode: status,
        details: responseData?.detail || JSON.stringify(responseData),
        originalError: error,
      }
    }
    if (status === 401 || status === 403) {
      return {
        type: 'auth',
        message: 'Authentication required.',
        statusCode: status,
        originalError: error,
      }
    }
    if (status === 400 || status === 422) {
      return {
        type: 'validation',
        message: 'Validation error',
        statusCode: status,
        details: responseData?.detail || JSON.stringify(responseData),
        originalError: error,
      }
    }
  }
  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    originalError: error,
  }
}

// Debug info for troubleshooting
export const getApiDebugInfo = () => ({
  baseURL: API_BASE_URL,
  envValue: process.env.NEXT_PUBLIC_API_URL,
  usingDefault: !process.env.NEXT_PUBLIC_API_URL,
})

// Log API configuration in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Configuration:', getApiDebugInfo())
}

// Create axios instance with timeout
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Extend config type for retry tracking
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Handle 401 - token refresh
    if (error.response?.status === 401 && !originalRequest._retryCount) {
      originalRequest._retryCount = 0

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
              refresh: refreshToken,
            })
            const { access } = response.data
            localStorage.setItem('access_token', access)
            originalRequest.headers.Authorization = `Bearer ${access}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    // Retry logic for network errors only (no response = network issue)
    if (!error.response && originalRequest) {
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1
        const delay = RETRY_DELAY * originalRequest._retryCount

        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[API] Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}): ${originalRequest.url}`
          )
        }

        await new Promise((resolve) => setTimeout(resolve, delay))
        return api(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

export default api
