module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  // Option to prevent prolonged test runs due to open handles:
  // forceExit: true, // Uncomment if tests hang, but try to fix open handles first
  // detectOpenHandles: true, // Already added to npm script, but can be here too
};
