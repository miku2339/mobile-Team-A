import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = (name) => path.join(root, 'node_modules', '.bin', name);

const proxy = spawn(bin('tsx'), ['server/web-provider-proxy.ts'], {
  cwd: root,
  env: process.env,
  stdio: 'inherit'
});
const expo = spawn(bin('expo'), ['start', '--web', ...process.argv.slice(2)], {
  cwd: root,
  env: process.env,
  stdio: 'inherit'
});

let stopping = false;
function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  if (!proxy.killed) proxy.kill(signal);
  if (!expo.killed) expo.kill(signal);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stop(signal);
  });
}

proxy.on('exit', (code, signal) => {
  if (!stopping) {
    stop();
    process.exitCode = code ?? (signal ? 1 : 0);
  }
});
expo.on('exit', (code, signal) => {
  if (!stopping) {
    stop();
    process.exitCode = code ?? (signal ? 1 : 0);
  }
});
