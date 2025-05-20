let ws = null;

function checkLoginStatus() {
  if (localStorage.getItem('isLoggedIn') === 'true') {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('control-page').style.display = 'block';
    connectWebSocket();
  }
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === 'ali' && password === '1234') {
    localStorage.setItem('isLoggedIn', 'true');
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('control-page').style.display = 'block';
    connectWebSocket();
  } else {
    alert('Invalid username or password');
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  document.getElementById('control-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  if (ws) {
    ws.close();
    ws = null;
  }
  updateConnectionStatus(false);
}

function connectWebSocket() {
  console.log('Attempting to connect to WebSocket...');
  ws = new WebSocket('ws://192.168.1.106:81');

  ws.onopen = () => {
    console.log('WebSocket connected successfully');
    updateConnectionStatus(true);
  };

  ws.onmessage = (event) => {
    console.log('Received:', event.data);
    const data = event.data;
    if (data.startsWith('STATUS')) {
      const parts = data.split(':');
      const relayNum = parseInt(parts[1]);
      const state = parseInt(parts[2]);
      updateRelayStatus(relayNum, state);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected. Reconnecting...');
    updateConnectionStatus(false);
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateConnectionStatus(false);
  };
}

function updateConnectionStatus(isConnected) {
  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('connection-text');
  if (isConnected) {
    dot.classList.add('connected');
    text.textContent = 'Online';
    text.classList.add('connected');
  } else {
    dot.classList.remove('connected');
    text.textContent = 'Offline';
    text.classList.remove('connected');
  }
}

function toggleRelay(relayNum) {
  const state = document.getElementById(`status${relayNum}`).textContent === 'ON' ? 0 : 1;
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log(`Sending: RELAY${relayNum}:${state}`);
    ws.send(`RELAY${relayNum}:${state}`);
  } else {
    console.error('WebSocket is not connected');
  }
}

function updateRelayStatus(relayNum, state) {
  const statusElement = document.getElementById(`status${relayNum}`);
  const buttonElement = document.getElementById(`relay${relayNum}`);
  statusElement.textContent = state ? 'ON' : 'OFF';
  statusElement.className = state ? '' : 'off';
  buttonElement.className = `relay-btn ${state ? 'on' : 'off'}`;
}

// فوکوس خودکار با Enter
document.getElementById('username').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    document.getElementById('password').focus();
  }
});

document.getElementById('password').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    login();
  }
});

// افکت موج‌های نرم
const canvas = document.getElementById('waves');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const waves = [
  { y: canvas.height * 0.3, amplitude: 20, frequency: 0.02, phase: 0 },
  { y: canvas.height * 0.5, amplitude: 25, frequency: 0.015, phase: Math.PI / 2 },
  { y: canvas.height * 0.7, amplitude: 15, frequency: 0.025, phase: Math.PI }
];

function drawWaves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  waves.forEach(wave => {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x++) {
      const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    wave.phase += 0.05; // سرعت حرکت موج
  });
}

function animateWaves() {
  drawWaves();
  requestAnimationFrame(animateWaves);
}

animateWaves();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

window.onload = checkLoginStatus;
