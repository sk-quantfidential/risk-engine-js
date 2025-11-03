/**
 * Jest Setup File
 * Runs before each test suite
 */

// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom'

// Mock window.matchMedia (required for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver (required for some UI components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock URL.createObjectURL (required for file downloads)
global.URL.createObjectURL = jest.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = jest.fn()

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string') {
      // Suppress React warnings
      if (args[0].includes('Warning: ReactDOM.render')) {
        return
      }
      // Suppress expected error messages from infrastructure tests
      if (
        args[0].includes('Failed to save loan') ||
        args[0].includes('Failed to delete loan') ||
        args[0].includes('Failed to load portfolio') ||
        args[0].includes('URL.createObjectURL is not a function')
      ) {
        return
      }
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
