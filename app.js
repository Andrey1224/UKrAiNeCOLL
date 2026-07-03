/**
 * UA-CYBER Prank Website JS Logic
 * Core Components:
 * 1. Web Audio Synth Engine (Retro chiptunes, typing sounds, alarms)
 * 2. Cyrillic Blue-Yellow Matrix Rain Canvas
 * 3. Live Card Input Formatting & 3D Interactive Card Sync
 * 4. Terminal Log Typist (Funny patriotism diagnostic checks)
 * 5. Hacking Processing Simulator & Confetti/Prank Reveal
 */

// ==========================================================================
// 1. STATE & AUDIO ENGINE
// ==========================================================================
let audioEnabled = true;
let audioCtx = null;
let hackSoundInterval = null;

const bgMusic = document.getElementById('bg-music');
if (bgMusic) {
  bgMusic.volume = 0.45;
  bgMusic.addEventListener('error', () => {
    const code = bgMusic.error ? bgMusic.error.code : 'unknown';
    setTimeout(() => {
      if (typeof appendTerminalLog === 'function') {
        appendTerminalLog(`> [ПОМИЛКА АУДІО] Код: ${code}. Перевірте формат або шлях до файлу.`, 'error');
      } else {
        console.error("Audio error code:", code);
      }
    }, 1500);
  });
  bgMusic.play().catch(() => {});
}

// Initialize Audio Context on user interaction (browser policy)
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Sound Synthesizer Functions using Web Audio API
const Synth = {
  // Mechanical keyboard click sound
  playClick() {
    if (!audioEnabled || !audioCtx) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    // Randomize pitch slightly for organic mechanical feel
    osc.frequency.setValueAtTime(150 + Math.random() * 200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  },

  // Hacker error alert/alarm sound
  playAlarm() {
    if (!audioEnabled || !audioCtx) return;
    initAudio();

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc1.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.35);

    osc2.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc2.frequency.linearRampToValueAtTime(440, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.4);
  },

  // Quick random pitch beeps to simulate high-speed hacking data transfer
  startHackingBeeps() {
    if (!audioEnabled || !audioCtx) return;
    initAudio();
    
    if (hackSoundInterval) clearInterval(hackSoundInterval);

    hackSoundInterval = setInterval(() => {
      if (!audioEnabled) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      // Randomize waveform type
      osc.type = Math.random() > 0.5 ? 'sine' : 'square';
      
      const pitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // Pentatonic feel
      const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
      
      osc.frequency.setValueAtTime(randomPitch, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }, 150);
  },

  stopHackingBeeps() {
    if (hackSoundInterval) {
      clearInterval(hackSoundInterval);
      hackSoundInterval = null;
    }
  },

  // Patriotic/victorious chiptune melody played on success
  playVictoryTune() {
    if (!audioEnabled || !audioCtx) return;
    initAudio();

    // Notes: C5 (0.15s), D5 (0.15s), E5 (0.15s), G5 (0.3s), E5 (0.15s), G5 (0.5s)
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 587.33, d: 0.15 }, // D5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.30 }, // G5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.50 }  // G5 (High hold)
    ];

    let timeOffset = audioCtx.currentTime;

    melody.forEach(note => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, timeOffset);

      gain.gain.setValueAtTime(0.15, timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, timeOffset + note.d - 0.02);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(timeOffset);
      osc.stop(timeOffset + note.d);

      timeOffset += note.d;
    });
  }
};

// ==========================================================================
// 2. CYRILLIC MATRIX BACKGROUND ANIMATION
// ==========================================================================
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let columns = [];
let fontSize = 16;
let animationFrameId = null;

// Ukrainian matrix charset (words and classic letters)
const ukrainianChars = 'ЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЄЯЧСМИТЬБЮҐІЄЇ1234567890🇺🇦🔱СЛАВАГЕРОЯМВОЛЯСІЧБОРЩСАЛО';

function initMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const numColumns = Math.floor(canvas.width / fontSize) + 1;
  columns = [];
  
  for (let i = 0; i < numColumns; i++) {
    // Randomize initial starting Y coordinates
    columns.push({
      x: i * fontSize,
      y: Math.random() * -canvas.height,
      // Assign either Cyber Blue (1) or Cyber Yellow (2) to this stream
      colorType: Math.random() > 0.5 ? 'blue' : 'yellow',
      speed: 1 + Math.random() * 2.5
    });
  }
}

function drawMatrix() {
  // Semitransparent black background to produce fade trail
  ctx.fillStyle = 'rgba(4, 8, 18, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `700 ${fontSize}px 'Share Tech Mono', monospace`;

  columns.forEach(col => {
    // Choose patriotic glowing colors
    if (col.colorType === 'blue') {
      ctx.fillStyle = 'rgba(0, 210, 255, 0.85)';
      ctx.shadowColor = '#00d2ff';
    } else {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
      ctx.shadowColor = '#ffd700';
    }
    
    // Slight shadow glow for premium digital feel
    ctx.shadowBlur = 4;

    const char = ukrainianChars[Math.floor(Math.random() * ukrainianChars.length)];
    ctx.fillText(char, col.x, col.y);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Move drop down
    col.y += col.speed * fontSize * 0.45;

    // Reset to top when column goes off screen
    if (col.y > canvas.height && Math.random() > 0.98) {
      col.y = -fontSize;
    }
  });

  animationFrameId = requestAnimationFrame(drawMatrix);
}

// Handle resize smoothly
window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrameId);
  initMatrix();
  drawMatrix();
});

// Start Matrix loop
initMatrix();
drawMatrix();

// ==========================================================================
// 3. SOUND TOGGLE CONTROL
// ==========================================================================
let escapeCount = 0;
let autoClickTimeout = null;
const soundToggle = document.getElementById('sound-toggle');

function triggerConscription() {
  if (autoClickTimeout) clearTimeout(autoClickTimeout);
  
  // Get typed cardholder name, default to PETRO SAGAIDACHNYI
  const typedName = document.getElementById('card-holder').value.trim();
  document.getElementById('conscript-name').textContent = typedName || 'PETRO SAGAIDACHNYI';
  
  if (bgMusic) bgMusic.pause();
  Synth.playAlarm();
  
  // Hide sound-toggle button so it doesn't overlap the conscription form
  soundToggle.style.display = 'none';
  
  const conscriptionOverlay = document.getElementById('conscription-overlay');
  if (conscriptionOverlay) {
    conscriptionOverlay.classList.remove('hidden');
  }
}

function moveButton() {
  if (escapeCount >= 2) {
    // 3rd hover - do not escape! Stay static so they can click it.
    return;
  }

  escapeCount++;

  // Normal escaping
  soundToggle.style.position = 'fixed';
  soundToggle.style.transition = 'all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)';
  soundToggle.style.zIndex = '99999';
  
  const label = soundToggle.querySelector('.sound-label');
  if (label && label.textContent !== 'СПІЙМАЙ МЕНЕ!') {
    label.textContent = 'СПІЙМАЙ МЕНЕ!';
  }

  const maxX = window.innerWidth - soundToggle.offsetWidth - 45;
  const maxY = window.innerHeight - soundToggle.offsetHeight - 45;
  
  const randomX = Math.max(20, Math.floor(Math.random() * maxX));
  const randomY = Math.max(20, Math.floor(Math.random() * maxY));
  
  soundToggle.style.left = `${randomX}px`;
  soundToggle.style.top = `${randomY}px`;
  
  Synth.playClick();
}

soundToggle.addEventListener('mouseenter', moveButton);
soundToggle.addEventListener('focus', moveButton);
soundToggle.addEventListener('touchstart', (e) => {
  // Only prevent default on mobile if we actually escape (otherwise click event won't fire)
  if (escapeCount < 2) {
    e.preventDefault();
    moveButton();
  }
});

soundToggle.addEventListener('click', () => {
  if (escapeCount >= 2) {
    // Prank trigger! Button turns red, shows conscription draft title, plays alarm, and slams overlay
    soundToggle.removeEventListener('mouseenter', moveButton);
    soundToggle.removeEventListener('focus', moveButton);
    
    soundToggle.style.backgroundColor = 'var(--color-red)';
    soundToggle.style.borderColor = 'var(--color-red)';
    soundToggle.style.color = '#fff';
    soundToggle.style.boxShadow = '0 0 35px rgba(255, 56, 56, 0.8)';
    soundToggle.style.transform = 'scale(1.25)';
    soundToggle.style.transition = 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    const label = soundToggle.querySelector('.sound-label');
    if (label) label.textContent = 'ОТРИМАТИ ПОВІСТКУ!';
    
    Synth.playAlarm();
    
    setTimeout(() => {
      triggerConscription();
    }, 600);
    return;
  }
  
  audioEnabled = !audioEnabled;
  const label = soundToggle.querySelector('.sound-label');
  const icon = soundToggle.querySelector('.sound-icon');
  
  if (audioEnabled) {
    label.textContent = 'AUDIO: ON';
    icon.textContent = '🔊';
    soundToggle.classList.remove('sound-disabled');
    initAudio();
    if (bgMusic) bgMusic.play().catch(() => {});
  } else {
    label.textContent = 'AUDIO: OFF';
    icon.textContent = '🔇';
    soundToggle.classList.add('sound-disabled');
    Synth.stopHackingBeeps();
    if (bgMusic) bgMusic.pause();
  }
  Synth.playClick();
});

// Close Conscription Button listener
const closeConscriptionBtn = document.getElementById('close-conscription-btn');
if (closeConscriptionBtn) {
  closeConscriptionBtn.addEventListener('click', () => {
    Synth.playClick();
    document.getElementById('conscription-overlay').classList.add('hidden');
    
    // Reset sound-toggle button back to initial state
    escapeCount = 0;
    soundToggle.style.position = 'relative';
    soundToggle.style.left = 'auto';
    soundToggle.style.top = 'auto';
    soundToggle.style.transform = 'none';
    soundToggle.style.backgroundColor = 'rgba(0, 210, 255, 0.12)';
    soundToggle.style.borderColor = 'var(--color-blue)';
    soundToggle.style.color = '#fff';
    soundToggle.style.boxShadow = '0 0 10px rgba(0, 210, 255, 0.25)';
    soundToggle.style.transition = 'all var(--transition-fast)';
    soundToggle.style.display = 'flex'; // Restore button display style
    
    const label = soundToggle.querySelector('.sound-label');
    if (label) label.textContent = 'AUDIO: ON';
    
    // Re-bind mouseenter/focus listeners
    soundToggle.addEventListener('mouseenter', moveButton);
    soundToggle.addEventListener('focus', moveButton);
    
    // Play back music if sound is enabled
    if (bgMusic && audioEnabled) {
      bgMusic.play().catch(() => {});
    }
  });
}

// ==========================================================================
// 4. INTRO CONNECTOR SCREEN
// ==========================================================================
const introOverlay = document.getElementById('intro-overlay');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', () => {
  // Unlock audio context safely via user interaction
  initAudio();
  
  // Play enter/connect sounds
  Synth.playClick();
  setTimeout(() => Synth.playClick(), 120);

  // Play background music
  if (bgMusic && audioEnabled) {
    bgMusic.play().then(() => {
      if (typeof appendTerminalLog === 'function') {
        appendTerminalLog(`> [АУДІО] Музику активовано успішно!`, 'success');
      }
    }).catch((err) => {
      if (typeof appendTerminalLog === 'function') {
        appendTerminalLog(`> [АУДІО] Помилка відтворення: ${err.message}`, 'error');
      }
    });
  }

  // Transition UI
  introOverlay.classList.add('hidden');
  mainContent.classList.remove('hidden');

  // Trigger typewriter logs
  startTerminalDiagnostic();
});

// ==========================================================================
// 5. TERMINAL LOG DIAGNOSTICS ( патриотический троллинг )
// ==========================================================================
const terminalLog = document.getElementById('terminal-log');

const diagnosticSteps = [
  { text: '> Зв\'язок зі супутником Січ-2-30 встановлено... [ОК]', delay: 400, type: 'cyan' },
  { text: '> Сканування ДНК користувача на сумісність із борщем...', delay: 800 },
  { text: '> [АНАЛІЗ] Буряк: 84%, Сметана: 12%, Пампушки з часником: ПРИСУТНІ.', delay: 1300, type: 'success' },
  { text: '> Тестування мовленнєвого апарату на вимову слова "Паляниця"...', delay: 1800 },
  { text: '> [ВЕРДИКТ] Щелепа у нормі. Чистий козацький акцент.', delay: 2200, type: 'success' },
  { text: '> Перевірка рівня любові до кавунів з Херсону...', delay: 2800 },
  { text: '> [РЕЗУЛЬТАТ] 100/100 балів. Максимальний рівень.', delay: 3200, type: 'success' },
  { text: '> [УВАГА] Виявлено критичний дефіцит сала в системі браузера!', delay: 3800, type: 'error' },
  { text: '> [СИСТЕМА] Для відновлення балансу та розблокування інтернету потрібна термінова фінансова українізація.', delay: 4400, type: 'cyan' },
  { text: '> Очікування введення даних козацької карти...', delay: 4800, type: 'yellow' }
];

function formatTime() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
}

function appendTerminalLog(text, type = '') {
  const line = document.createElement('div');
  line.className = 'log-line';
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.textContent = formatTime();
  
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  
  if (type === 'success') textSpan.className = 'log-success';
  if (type === 'error') {
    textSpan.className = 'log-error';
    Synth.playAlarm();
  }
  if (type === 'cyan') textSpan.className = 'log-cyan';
  if (type === 'yellow') textSpan.className = 'text-yellow';
  
  line.appendChild(timeSpan);
  line.appendChild(textSpan);
  terminalLog.appendChild(line);
  
  // Auto scroll terminal
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

function startTerminalDiagnostic() {
  // Clear initial line
  terminalLog.innerHTML = '';
  
  diagnosticSteps.forEach(step => {
    setTimeout(() => {
      appendTerminalLog(step.text, step.type);
      if (step.type !== 'error') {
        Synth.playClick();
      }
    }, step.delay);
  });
}

// ==========================================================================
// 6. 3D CARD INTERACTIVES & FORM FORMATTING
// ==========================================================================
const cardForm = document.getElementById('citizenship-form');
const mockCard = document.getElementById('mock-card');

const inputHolder = document.getElementById('card-holder');
const inputNumber = document.getElementById('card-number');
const inputExpiry = document.getElementById('card-expiry');
const inputCVV = document.getElementById('card-cvv');

const displayBrand = document.getElementById('card-brand-display');
const displayNum = document.getElementById('card-num-display');
const displayHolder = document.getElementById('card-holder-display');
const displayExp = document.getElementById('card-exp-display');
const displayCVV = document.getElementById('card-cvv-display');
const logoType = document.getElementById('card-type-logo');

// Play keyboard sound on typing
document.querySelectorAll('form input').forEach(input => {
  input.addEventListener('input', () => Synth.playClick());
});

// Flip card when focusing CVV
inputCVV.addEventListener('focus', () => mockCard.classList.add('flipped'));
inputCVV.addEventListener('blur', () => mockCard.classList.remove('flipped'));

// Sync Cardholder Name
inputHolder.addEventListener('input', (e) => {
  // Replace non-alpha
  let val = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
  e.target.value = val;
  displayHolder.textContent = val || 'COSSACK COZAK';
});

// Sync Card Number with auto-spacing
inputNumber.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');
  
  // Format Card Brand Logo/Text
  if (val.startsWith('4')) {
    displayBrand.textContent = 'VISA COSSACK';
    logoType.textContent = '💳 (Visa)';
  } else if (val.startsWith('5')) {
    displayBrand.textContent = 'MC HETMAN';
    logoType.textContent = '💳 (MC)';
  } else {
    displayBrand.textContent = 'COSSACK PAY';
    logoType.textContent = '💳';
  }

  // Format spaces (16 digits max)
  val = val.substring(0, 16);
  let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
  e.target.value = formatted;
  
  // Update representation
  displayNum.textContent = formatted || '•••• •••• •••• ••••';
});

// Sync Expiry with MM/YY format
inputExpiry.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');
  val = val.substring(0, 4);
  
  if (val.length > 2) {
    val = val.substring(0, 2) + '/' + val.substring(2);
  }
  
  e.target.value = val;
  displayExp.textContent = val || 'MM/YY';
});

// Sync CVV code
inputCVV.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');
  val = val.substring(0, 3);
  e.target.value = val;
  
  displayCVV.textContent = '•'.repeat(val.length) || '•••';
});

// ==========================================================================
// 7. FORM SUBMISSION & HACK PROCESSING SEQUENCER
// ==========================================================================
const processingOverlay = document.getElementById('processing-overlay');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const processingLog = document.getElementById('processing-log');
const resultOverlay = document.getElementById('result-overlay');
const restartBtn = document.getElementById('restart-btn');

const hackLogs = [
  { p: 5, t: 'Встановлення зашифрованого тунелю з Січчю...' },
  { p: 12, t: 'Шифрування даних за допомогою подвійного шару кропу...' },
  { p: 25, t: 'Аналіз платоспроможності козацької казни...' },
  { p: 38, t: 'Перевірка балансу на наявність золотих дукатів...' },
  { p: 50, t: 'Зв\'язок з Міністерством Кропу та Часнику... ОК' },
  { p: 62, t: 'Вилучення гривневої маси та пакування в мішки...' },
  { p: 78, t: 'Конвертація гривень у FPV-дрони "Камікадзе"...' },
  { p: 88, t: 'Завантаження засобів ураження на пускові платформи...' },
  { p: 95, t: 'Отримання фінального благословення від Отамана...' },
  { p: 100, t: 'Операція завершена успішно. Слава Україні!' }
];

cardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Double-check validations
  if (!cardForm.checkValidity()) return;

  initAudio();
  Synth.playAlarm(); // Heavy start buzzer/siren
  
  // Show processing loader
  processingOverlay.classList.remove('hidden');
  processingLog.innerHTML = '';
  
  // Start synthesiser hacking sound loop
  Synth.startHackingBeeps();

  let currentLogIdx = 0;
  let percent = 0;
  
  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 3) + 1;
    if (percent > 100) percent = 100;
    
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;

    // Check if we need to print a log line
    if (currentLogIdx < hackLogs.length && percent >= hackLogs[currentLogIdx].p) {
      const logLine = document.createElement('div');
      logLine.className = 'processing-line';
      logLine.textContent = `[${percent}%] ${hackLogs[currentLogIdx].t}`;
      processingLog.appendChild(logLine);
      processingLog.scrollTop = processingLog.scrollHeight;
      currentLogIdx++;
      
      // Play sound alert for new line
      Synth.playClick();
    }

    if (percent === 100) {
      clearInterval(interval);
      setTimeout(finishHackingProgress, 800);
    }
  }, 60);
});

function finishHackingProgress() {
  Synth.stopHackingBeeps();
  Synth.playVictoryTune();
  
  // Swap screens
  processingOverlay.classList.add('hidden');
  resultOverlay.classList.remove('hidden');
}

// Restart button
restartBtn.addEventListener('click', () => {
  Synth.playClick();
  
  // Reset Form
  cardForm.reset();
  displayNum.textContent = '•••• •••• •••• ••••';
  displayHolder.textContent = 'COSSACK COZAK';
  displayExp.textContent = 'MM/YY';
  displayCVV.textContent = '•••';
  logoType.textContent = '💳';
  displayBrand.textContent = 'COSSACK PAY';
  
  // Hide results
  resultOverlay.classList.add('hidden');
  
  // Re-run diagnostics log
  startTerminalDiagnostic();
});
