import { spawn } from 'child_process';

const port = process.env.PORT || 4173;
const host = '0.0.0.0';

console.log(`Starting Vite preview server on ${host}:${port}...`);

const vite = spawn('vite', ['preview', '--host', host, '--port', port.toString()], {
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

vite.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
});

process.on('SIGINT', () => {
  vite.kill('SIGINT');
});
