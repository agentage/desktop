// Jest setup for Agentage Desktop
// Add any global test configuration here

// Mock Electron APIs for renderer tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'agentage', {
    value: {
      agents: {
        list: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue(''),
      },
      config: {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn().mockResolvedValue(undefined),
      },
      app: {
        getVersion: jest.fn().mockResolvedValue('0.1.0'),
        quit: jest.fn(),
      },
    },
    writable: true,
  });
}
