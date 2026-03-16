module.exports = {
  apps: [
    {
      name: 'staff',
      script: '.next/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '62.77.156.58',
        PORT: '8739',
      },
      env_file: '.env',
    },
  ],
};
