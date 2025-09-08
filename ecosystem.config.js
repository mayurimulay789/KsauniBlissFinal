module.exports = {
  apps: [
    {
      name: 'ksaunibliss-server',
      script: './server/src/index.js',
      cwd: '/var/www/ksaunibliss',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: './server/.env.production',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/mayurimulay789/KsauniBlissFinal.git',
      path: '/var/www/ksaunibliss',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && cd server && npm install && cd ../client && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
