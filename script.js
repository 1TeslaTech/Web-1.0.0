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

  if (username === 'admin' && password === 'admin') {
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

// تنظیمات Particles.js
particlesJS('particles-js', {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: '#ffffff'
    },
    shape: {
      type: 'circle'
    },
    opacity: {
      value: 0.5,
      random: true
    },
    size: {
      value: 3,
      random: true
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 5,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out'
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'repulse'
      },
      onclick: {
        enable: true,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4
      },
      push: {
        particles_nb: 4
      }
    }
  },
  retina_detect: true
}, function() {
  console.log('Particles.js loaded successfully!');
});

window.onload = checkLoginStatus;
