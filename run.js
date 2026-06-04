const { spawn } = require('child_process');
const path = require('path');

console.log("=========================================");
console.log("   EXOA SAFETY CONSOLE UNIFIED STARTUP   ");
console.log("=========================================");

// 1. Start Backend FastAPI
console.log("\n[EXOA-SYS] Spawning Python FastAPI backend...");
const backendPath = path.join(__dirname, 'backend');
const venvPython = path.join(__dirname, 'venv', 'Scripts', 'python.exe');

const backend = spawn(venvPython, ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: backendPath,
  shell: true,
  stdio: 'inherit'
});

// 2. Start Frontend Vite
console.log("[EXOA-SYS] Spawning Vite React frontend...\n");
const frontendPath = path.join(__dirname, 'frontend');

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendPath,
  shell: true,
  stdio: 'inherit'
});

// Keep main process open
process.on('SIGINT', () => {
  console.log("\n[EXOA-SYS] Terminating active servers...");
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});
