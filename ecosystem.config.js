export const apps = [
  {
    name: 'frontend',
    script: 'server.js',
    cwd: '/app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  },
  {
    name: 'backend',
    script: 'server.js',
    cwd: '/app/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }
];
