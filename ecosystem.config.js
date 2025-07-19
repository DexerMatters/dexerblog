export const apps = [
  {
    name: 'frontend',
    script: 'server.js',
    cwd: '/app/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  },
  {
    name: 'backend',
    script: 'dist/server.js',
    cwd: '/app/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }
];
