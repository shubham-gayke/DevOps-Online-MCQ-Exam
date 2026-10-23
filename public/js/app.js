/**
 * DevOps Exam Hub — Main Application Logic
 * Pure vanilla JavaScript (ES6+), no frameworks.
 * Uses localStorage for progress persistence.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // SELF-CHECK: validate question bank on load
  // ═══════════════════════════════════════════════════════════════════════════
  const EXPECTED_COUNTS = {
    Git: 25, GitHub: 10, Terraform: 15, Ansible: 15, Docker: 20, Kubernetes: 15
  };

  function selfCheck() {
    const bank = window.QUESTION_BANK || [];
    const errors = [];

    // Total count
    if (bank.length !== 100) {
      errors.push(`Total questions: ${bank.length}, expected 100`);
    }

    // Duplicate IDs
    const ids = new Set();
    bank.forEach(q => {
      if (ids.has(q.id)) errors.push(`Duplicate ID: ${q.id}`);
      ids.add(q.id);
    });

    // Per-topic counts
    const topicCounts = {};
    bank.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });
    Object.entries(EXPECTED_COUNTS).forEach(([topic, count]) => {
      if ((topicCounts[topic] || 0) !== count) {
        errors.push(`${topic}: ${topicCounts[topic] || 0} questions, expected ${count}`);
      }
    });

    // Validate each question
    bank.forEach(q => {
      // Correct answer exists in options
      const optionIds = q.options.map(o => o.id);
      if (!optionIds.includes(q.correct)) {
        errors.push(`${q.id}: correct answer "${q.correct}" not in options [${optionIds}]`);
      }
      // Explanation exists
      if (!q.explanation || q.explanation.trim().length < 20) {
        errors.push(`${q.id}: missing or too-short explanation`);
      }
      // Exactly 4 options
      if (q.options.length !== 4) {
        errors.push(`${q.id}: has ${q.options.length} options, expected 4`);
      }
    });

    if (errors.length > 0) {
      console.error('═══ QUESTION BANK SELF-CHECK FAILED ═══');
      errors.forEach(e => console.error('  ✗ ' + e));
    } else {
      console.log('✓ Question bank self-check passed (100 questions, all valid)');
    }
    return errors.length === 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKEND / DATABASE API INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════
  const API_BASE = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api'
    : '/api';

  let isDbConnected = false;

  async function checkDbStatus() {
    const dot = document.getElementById('db-status-dot');
    const text = document.getElementById('db-status-text');
    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data && data.status === 'connected') {
        isDbConnected = true;
        if (dot) dot.className = 'db-dot connected';
        if (text) text.textContent = 'MongoDB Atlas: Connected';
        return true;
      }
    } catch (e) {
      // Offline / standalone file://
    }
    isDbConnected = false;
    if (dot) dot.className = 'db-dot offline';
    if (text) text.textContent = 'Offline Mode (Local Storage)';
    return false;
  }

  async function registerStudentInDb(name, email) {
    if (!isDbConnected) return null;
    try {
      const res = await fetch(`${API_BASE}/students/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
        signal: AbortSignal.timeout(6000)
      });
      return await res.json();
    } catch (e) {
      console.warn('Student DB registration fallback:', e.message);
      return null;
    }
  }

  async function saveSubmissionToDb(payload) {
    if (!isDbConnected) return null;
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });
      return await res.json();
    } catch (e) {
      console.warn('Submission DB save fallback:', e.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const STORAGE_KEY = 'devops_exam_hub_state';

  let state = {
    screen: 'start',        // start | exam | result
    studentName: '',
    studentEmail: '',
    questions: [],           // shuffled array of question objects (with shuffled options)
    currentIndex: 0,
    answers: {},             // { questionId: selectedOptionId }
    marked: {},              // { questionId: true }
    startTime: null,
    endTime: null,
    submitted: false,
    violations: [],          // array of recorded violations: { type, description, timestamp, strikeNumber }
    isTerminated: false,
    terminationReason: ''
  };

  let timerInterval = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // ANTI-CHEATING & PROCTORING ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  let activeMediaStream = null;
  let cocoModel = null;
  let isModelLoading = false;
  let detectionInterval = null;
  let lastPhoneViolationTime = 0;
  let lastWindowViolationTime = 0;
  let cheatToastTimeout = null;

  // Synthesize warning beep using Web Audio API
  function playBeep(isFinal = false) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (isFinal) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio might be muted or blocked until interaction
    }
  }

  function showCheatToast(msg) {
    const toast = document.getElementById('cheat-toast');
    const msgEl = document.getElementById('cheat-toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.classList.add('show');
    if (cheatToastTimeout) clearTimeout(cheatToastTimeout);
    cheatToastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Request camera access
  async function getCameraStream() {
    if (activeMediaStream && activeMediaStream.active) {
      return activeMediaStream;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        activeMediaStream = stream;
        return stream;
      }
    } catch (e) {
      console.warn('Real webcam not accessible:', e.message);
    }
    // Fallback: create simulated canvas stream if no hardware webcam exists
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    function drawMock() {
      ctx.fillStyle = '#0B1020';
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.arc(160, 95, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(160, 205, 60, 0, Math.PI, true);
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROCTOR FEED ACTIVE', 160, 225);
    }
    drawMock();
    setInterval(drawMock, 1000);
    try {
      activeMediaStream = canvas.captureStream(15);
      return activeMediaStream;
    } catch (e) {
      return null;
    }
  }

  function stopCamera() {
    if (activeMediaStream) {
      try {
        activeMediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      activeMediaStream = null;
    }
    if (detectionInterval) {
      clearInterval(detectionInterval);
      detectionInterval = null;
    }
  }

  // Load COCO-SSD object detection model
  async function loadCocoModel() {
    if (cocoModel) return cocoModel;
    if (typeof cocoSsd === 'undefined') {
      console.warn('cocoSsd library not found on page.');
      return null;
    }
    try {
      isModelLoading = true;
      const statusText = document.getElementById('ai-model-status');
      if (statusText) statusText.innerHTML = '<i class="bi bi-hourglass-split"></i> Loading AI model...';
      cocoModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      isModelLoading = false;
      if (statusText) statusText.innerHTML = '<i class="bi bi-eye-fill"></i> AI Model Active &amp; Scanning';
      return cocoModel;
    } catch (err) {
      console.warn('Failed to load COCO-SSD:', err.message);
      isModelLoading = false;
      return null;
    }
  }

  // Real-time phone detection loop
  function startProctorDetection() {
    if (detectionInterval) clearInterval(detectionInterval);

    loadCocoModel();

    detectionInterval = setInterval(async () => {
      if (state.screen !== 'exam' || state.submitted || state.isTerminated) return;
      const video = document.getElementById('exam-video');
      const canvas = document.getElementById('exam-canvas');
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (cocoModel) {
        try {
          const predictions = await cocoModel.detect(video);
          let phoneFound = false;

          predictions.forEach(pred => {
            const cls = pred.class.toLowerCase();
            // Check if class is cell phone or telephone or remote
            if ((cls.includes('phone') || cls === 'remote') && pred.score >= 0.45) {
              phoneFound = true;
              // Draw detection bounding box on camera canvas
              ctx.strokeStyle = '#EF4444';
              ctx.lineWidth = 3;
              ctx.strokeRect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);
              ctx.fillStyle = '#EF4444';
              ctx.font = 'bold 12px monospace';
              ctx.fillText(`PHONE DETECTED (${Math.round(pred.score * 100)}%)`, pred.bbox[0], Math.max(14, pred.bbox[1] - 4));
            }
          });

          const phoneBanner = document.getElementById('phone-detected-banner');
          if (phoneFound) {
            if (phoneBanner) phoneBanner.classList.remove('hidden');
            const now = Date.now();
            // 4-second cooldown between consecutive phone detection warnings
            if (now - lastPhoneViolationTime >= 4000) {
              lastPhoneViolationTime = now;
              recordViolation('PHONE_DETECTED', 'Mobile phone detected in webcam view by AI Proctor');
            }
          } else {
            if (phoneBanner) phoneBanner.classList.add('hidden');
          }
        } catch (err) {
          // Frame error, skip
        }
      }
    }, 600);
  }

  // Fullscreen management
  function requestExamFullscreen() {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } catch (e) {}
  }

  // Update strike badges
  function updateViolationUI() {
    const strikes = (state.violations || []).length;
    const topbarCount = document.getElementById('topbar-warning-count');
    const topbarBadge = document.getElementById('topbar-warning-badge');
    const proctorPill = document.getElementById('proctor-warning-pill');
    const modalCount = document.getElementById('violation-current-count');

    if (topbarCount) topbarCount.textContent = strikes;
    if (modalCount) modalCount.textContent = strikes;
    if (proctorPill) {
      proctorPill.textContent = `${strikes} / 3 Strikes`;
      proctorPill.className = `proctor-warning-pill${strikes === 1 ? ' warning-1' : strikes >= 2 ? ' warning-2' : ''}`;
    }

    if (topbarBadge) {
      topbarBadge.className = 'topbar-warning-badge';
      if (strikes >= 2) {
        topbarBadge.classList.add('critical');
      } else if (strikes >= 1) {
        topbarBadge.classList.add('has-warnings');
      }
    }
  }

  // Record a violation strike
  function recordViolation(type, description) {
    if (state.screen !== 'exam' || state.submitted || state.isTerminated) return;

    const violation = {
      type,
      description,
      timestamp: new Date().toISOString(),
      strikeNumber: (state.violations || []).length + 1
    };
    state.violations = state.violations || [];
    state.violations.push(violation);
    saveState();

    updateViolationUI();
    const isFinal = state.violations.length >= 3;
    playBeep(isFinal);

    if (isFinal) {
      // 3 strikes: terminate exam!
      terminateExam(`3 Anti-Cheating Violations Exceeded (Final Strike: ${description})`);
    } else {
      // Show warning modal
      showViolationModal(violation);
    }
  }

  function showViolationModal(violation) {
    const modalEl = document.getElementById('violation-modal');
    if (!modalEl) return;

    const countEl = document.getElementById('violation-current-count');
    const titleEl = document.getElementById('violation-reason-title');
    const descEl = document.getElementById('violation-reason-desc');

    if (countEl) countEl.textContent = violation.strikeNumber;
    if (titleEl) {
      if (violation.type === 'PHONE_DETECTED') {
        titleEl.textContent = 'Mobile Phone Detected!';
      } else if (violation.type === 'WINDOW_SWITCH') {
        titleEl.textContent = 'Window / Tab Changed!';
      } else if (violation.type === 'FULLSCREEN_EXIT') {
        titleEl.textContent = 'Fullscreen Mode Exited!';
      } else {
        titleEl.textContent = 'Anti-Cheating Policy Warning!';
      }
    }
    if (descEl) {
      descEl.textContent = violation.description;
    }

    const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    modal.show();
  }

  // Terminate exam due to 3 strikes
  function terminateExam(reason) {
    if (state.isTerminated) return;
    state.isTerminated = true;
    state.terminationReason = reason;

    stopCamera();

    // Close violation modal if open
    const violModalEl = document.getElementById('violation-modal');
    if (violModalEl) {
      const vModal = bootstrap.Modal.getInstance(violModalEl);
      if (vModal) vModal.hide();
    }

    // Submit exam
    submitExam(true);

    // Populate and show termination modal
    const termModalEl = document.getElementById('termination-modal');
    const listEl = document.getElementById('termination-modal-list');
    if (listEl) {
      listEl.innerHTML = '';
      (state.violations || []).forEach((v, i) => {
        const item = document.createElement('div');
        item.className = 'violation-log-item';
        item.innerHTML = `
          <span class="strike-badge">Strike ${i + 1}</span>
          <span>${escapeHtml(v.description)}</span>
        `;
        listEl.appendChild(item);
      });
    }

    const termModal = new bootstrap.Modal(termModalEl, { backdrop: 'static', keyboard: false });
    termModal.show();
  }

  // Anti-cheating window & focus tracking
  function initAntiCheatWindowTracking() {
    // Tab visibility change
    document.addEventListener('visibilitychange', () => {
      if (state.screen === 'exam' && !state.submitted && !state.isTerminated) {
        if (document.hidden) {
          const now = Date.now();
          if (now - lastWindowViolationTime >= 3500) {
            lastWindowViolationTime = now;
            recordViolation('WINDOW_SWITCH', 'Switched browser tab or minimized examination window');
          }
        }
      }
    });

    // Window blur (clicked other application, alt-tab)
    window.addEventListener('blur', () => {
      if (state.screen === 'exam' && !state.submitted && !state.isTerminated) {
        const now = Date.now();
        if (now - lastWindowViolationTime >= 3500) {
          lastWindowViolationTime = now;
          recordViolation('WINDOW_SWITCH', 'Lost window focus: application switch detected');
        }
      }
    });

    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
      if (state.screen === 'exam' && !state.submitted && !state.isTerminated) {
        if (!document.fullscreenElement) {
          const now = Date.now();
          if (now - lastWindowViolationTime >= 3500) {
            lastWindowViolationTime = now;
            recordViolation('FULLSCREEN_EXIT', 'Exited fullscreen examination mode');
          }
        }
      }
    });
  }

  // Anti-copy & text-selection blocking
  function initAntiCopyProtection() {
    // Disable right click on exam screen
    document.addEventListener('contextmenu', (e) => {
      if (state.screen === 'exam' && !state.submitted) {
        e.preventDefault();
        showCheatToast('Right-click context menu is disabled during examination');
      }
    });

    // Disable copy / cut / paste
    ['copy', 'cut', 'paste'].forEach(evt => {
      document.addEventListener(evt, (e) => {
        if (state.screen === 'exam' && !state.submitted) {
          e.preventDefault();
          showCheatToast(`Action '${evt}' is blocked during examination`);
        }
      });
    });

    // Disable text selection dragging
    document.addEventListener('selectstart', (e) => {
      if (state.screen === 'exam' && !state.submitted) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    });

    // Intercept keyboard cheat shortcuts
    document.addEventListener('keydown', (e) => {
      if (state.screen === 'exam' && !state.submitted) {
        const key = e.key.toLowerCase();
        const isCtrl = e.ctrlKey || e.metaKey;

        // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+U, Ctrl+P, Ctrl+S
        if (isCtrl && ['c', 'v', 'a', 'u', 'p', 's'].includes(key)) {
          e.preventDefault();
          showCheatToast(`Shortcut Ctrl+${key.toUpperCase()} is disabled`);
          return;
        }

        // Block F12, DevTools
        if (e.key === 'F12' || (isCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
          e.preventDefault();
          showCheatToast('Developer inspection tools are disabled');
          return;
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage might be full or unavailable
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.screen && parsed.questions && parsed.questions.length === 100) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remSec = s % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUESTION PREPARATION
  // ═══════════════════════════════════════════════════════════════════════════
  function prepareQuestions() {
    const bank = window.QUESTION_BANK || [];
    const topicOrder = ['Git', 'GitHub', 'Terraform', 'Ansible', 'Docker', 'Kubernetes'];
    const grouped = {};

    topicOrder.forEach(t => grouped[t] = []);
    bank.forEach(q => {
      if (grouped[q.topic]) grouped[q.topic].push(q);
    });

    // Shuffle within each topic, keep topic order
    const prepared = [];
    topicOrder.forEach(topic => {
      const shuffled = shuffleArray(grouped[topic]);
      // Shuffle options for each question
      shuffled.forEach(q => {
        const shuffledOptions = shuffleArray(q.options);
        // Assign new letters A-D after shuffling
        const letters = ['A', 'B', 'C', 'D'];
        const mappedOptions = shuffledOptions.map((opt, i) => ({
          ...opt,
          letter: letters[i]
        }));
        prepared.push({
          ...q,
          options: mappedOptions
        });
      });
    });

    return prepared;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // THEME MANAGEMENT (Dark Theme Exclusive)
  // ═══════════════════════════════════════════════════════════════════════════
  function initTheme() {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    localStorage.setItem('devops_exam_theme', 'dark');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  function showScreen(screen) {
    document.getElementById('start-screen').classList.toggle('hidden', screen !== 'start');
    document.getElementById('exam-screen').classList.toggle('hidden', screen !== 'exam');
    document.getElementById('result-screen').style.display = screen === 'result' ? 'block' : 'none';
    state.screen = screen;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // START SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  function initStartScreen() {
    const nameInput = document.getElementById('student-name');
    const emailInput = document.getElementById('student-email');
    const startBtn = document.getElementById('start-btn');
    const statusMsg = document.getElementById('account-status-msg');

    function checkInputs() {
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      startBtn.disabled = !(name.length > 0 && emailValid);
    }

    if (nameInput) nameInput.addEventListener('input', checkInputs);
    if (emailInput) emailInput.addEventListener('input', checkInputs);

    // Camera test button on start screen
    const enableCameraBtn = document.getElementById('enable-camera-btn');
    if (enableCameraBtn) {
      enableCameraBtn.addEventListener('click', async () => {
        enableCameraBtn.disabled = true;
        enableCameraBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Testing Camera...';
        const stream = await getCameraStream();
        const setupVideo = document.getElementById('setup-video');
        const overlay = document.getElementById('camera-status-overlay');
        if (setupVideo && stream) {
          setupVideo.srcObject = stream;
          setupVideo.play().catch(() => {});
          if (overlay) overlay.classList.add('active');
          enableCameraBtn.innerHTML = '<i class="bi bi-check2-circle text-success"></i> Camera Ready';
        } else {
          enableCameraBtn.disabled = false;
          enableCameraBtn.innerHTML = '<i class="bi bi-camera"></i> Retry Camera';
        }
      });
    }

    startBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (!name || !email) return;

      startBtn.disabled = true;
      startBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Initializing AI Proctor...';

      if (statusMsg) {
        statusMsg.className = 'account-status-msg info';
        statusMsg.textContent = 'Authenticating student account & initializing camera proctor...';
        statusMsg.classList.remove('hidden');
      }

      // Pre-warm camera
      await getCameraStream();

      // Register student in MongoDB Atlas
      const regResult = await registerStudentInDb(name, email);
      if (regResult && regResult.success) {
        if (statusMsg) {
          statusMsg.className = 'account-status-msg success';
          statusMsg.textContent = `✓ Account verified in MongoDB Atlas (${regResult.student.isNew ? 'New Student Created' : 'Welcome back'})! Starting exam...`;
        }
      }

      setTimeout(() => {
        state.studentName = name;
        state.studentEmail = email;
        state.questions = prepareQuestions();
        state.currentIndex = 0;
        state.answers = {};
        state.marked = {};
        state.startTime = Date.now();
        state.endTime = null;
        state.submitted = false;
        state.violations = [];
        state.isTerminated = false;
        state.terminationReason = '';
        saveState();
        startExam();
      }, 450);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXAM SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  async function startExam() {
    showScreen('exam');
    buildPalette();
    renderQuestion();
    startTimer();

    // Lock Fullscreen
    requestExamFullscreen();

    // Start Webcam Proctoring
    const stream = await getCameraStream();
    const examVideo = document.getElementById('exam-video');
    if (examVideo && stream) {
      examVideo.srcObject = stream;
      examVideo.play().catch(() => {});
    }

    // Start Phone Detection Loop
    startProctorDetection();
    updateViolationUI();
  }

  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    const idx = state.currentIndex;

    // Update number
    document.getElementById('q-number').textContent = `Q ${idx + 1} / 100`;

    // Update badges
    const topicBadge = document.getElementById('q-topic-badge');
    topicBadge.textContent = q.topic;
    topicBadge.className = `badge-topic ${q.topic.toLowerCase()}`;

    const diffBadge = document.getElementById('q-diff-badge');
    diffBadge.textContent = q.difficulty;
    diffBadge.className = `badge-difficulty ${q.difficulty.toLowerCase()}`;

    // Question text
    document.getElementById('q-text').textContent = q.question;

    // Code block
    const codeWrapper = document.getElementById('q-code-wrapper');
    if (q.code) {
      codeWrapper.classList.remove('hidden');
      document.getElementById('q-code-lang').textContent = q.code.language;
      document.getElementById('q-code-content').textContent = q.code.content;
    } else {
      codeWrapper.classList.add('hidden');
    }

    // Options
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    q.options.forEach((opt, i) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.setAttribute('role', 'radio');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-checked', state.answers[q.id] === opt.id ? 'true' : 'false');
      card.setAttribute('aria-label', `Option ${opt.letter}: ${opt.text}`);
      card.dataset.optionId = opt.id;

      if (state.answers[q.id] === opt.id) {
        card.classList.add('selected');
      }

      card.innerHTML = `
        <span class="option-letter">${opt.letter}</span>
        <span class="option-text">${escapeHtml(opt.text)}</span>
      `;

      card.addEventListener('click', () => selectOption(opt.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(opt.id);
        }
      });

      grid.appendChild(card);
    });

    // Update nav buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    prevBtn.disabled = idx === 0;

    if (idx === 99) {
      nextBtn.innerHTML = '<i class="bi bi-send-fill"></i> Submit Exam';
      nextBtn.classList.remove('btn-accent');
      nextBtn.classList.add('btn-accent');
    } else {
      nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right"></i> <span class="kbd-hint">&#8594;</span>';
    }

    // Mark button state
    const markBtn = document.getElementById('mark-btn');
    if (state.marked[q.id]) {
      markBtn.classList.add('marked');
      markBtn.innerHTML = '<i class="bi bi-flag-fill"></i> Marked <span class="kbd-hint">M</span>';
    } else {
      markBtn.classList.remove('marked');
      markBtn.innerHTML = '<i class="bi bi-flag"></i> Mark <span class="kbd-hint">M</span>';
    }

    // Update answered count
    updateAnsweredCount();

    // Update palette highlights
    updatePalette();

    // Animate in
    const qCard = document.getElementById('question-card');
    qCard.style.animation = 'none';
    qCard.offsetHeight; // Force reflow
    qCard.style.animation = '';
  }

  function selectOption(optionId) {
    const q = state.questions[state.currentIndex];
    state.answers[q.id] = optionId;
    saveState();
    renderQuestion();
  }

  function clearAnswer() {
    const q = state.questions[state.currentIndex];
    delete state.answers[q.id];
    saveState();
    renderQuestion();
  }

  function toggleMark() {
    const q = state.questions[state.currentIndex];
    if (state.marked[q.id]) {
      delete state.marked[q.id];
    } else {
      state.marked[q.id] = true;
    }
    saveState();
    renderQuestion();
  }

  function goToQuestion(index) {
    if (index < 0 || index > 99) return;
    state.currentIndex = index;
    saveState();
    renderQuestion();
  }

  function updateAnsweredCount() {
    document.getElementById('answered-count').textContent = Object.keys(state.answers).length;
  }

  // ── Palette (Sidebar Compact Grid) ─────────────────────────────────────────
  function buildPalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 100; i++) {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      btn.textContent = i + 1;
      btn.setAttribute('aria-label', `Go to question ${i + 1}`);
      btn.addEventListener('click', () => goToQuestion(i));
      grid.appendChild(btn);
    }
  }

  function updatePalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid) return;
    const btns = grid.querySelectorAll('.palette-btn');
    btns.forEach((btn, i) => {
      const q = state.questions[i];
      if (!q) return;
      btn.className = 'palette-btn';

      if (state.answers[q.id]) btn.classList.add('answered');
      if (state.marked[q.id]) btn.classList.add('marked');
      if (i === state.currentIndex) btn.classList.add('current');
    });
  }

  // ── Timer (Elapsed Time Tracking — No Time Limit) ──────────────────────────
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(() => {
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> ${formatTime(elapsed)}`;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function showConfirmModal() {
    const answered = Object.keys(state.answers).length;
    const unanswered = 100 - answered;
    const markedCount = Object.keys(state.marked).length;

    const msg = `You have answered ${answered} out of 100 questions.`
      + (unanswered > 0 ? `\n${unanswered} question${unanswered > 1 ? 's are' : ' is'} unanswered.` : '')
      + (markedCount > 0 ? `\n${markedCount} question${markedCount > 1 ? 's are' : ' is'} marked for review.` : '')
      + '\n\nAre you sure you want to submit?';

    document.getElementById('modal-message').textContent = msg;
    document.getElementById('modal-message').style.whiteSpace = 'pre-line';
    const modal = new bootstrap.Modal(document.getElementById('confirm-modal'));
    modal.show();
  }

  function submitExam(autoSubmitted) {
    if (state.submitted) return;
    state.submitted = true;
    state.endTime = Date.now();

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Stop proctoring camera
    stopCamera();

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      try { document.exitFullscreen().catch(() => {}); } catch (e) {}
    }

    // Close modal if open
    const modalEl = document.getElementById('confirm-modal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    saveState();
    showResults();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  function showResults() {
    showScreen('result');

    const questions = state.questions;
    let correct = 0, wrong = 0, skipped = 0;
    const topicResults = {};

    // Initialize topic results
    Object.keys(EXPECTED_COUNTS).forEach(topic => {
      topicResults[topic] = { correct: 0, total: EXPECTED_COUNTS[topic] };
    });

    // Calculate results
    const questionResults = [];
    questions.forEach(q => {
      const answer = state.answers[q.id];
      let status;
      if (!answer) {
        skipped++;
        status = 'skipped';
      } else if (answer === q.correct) {
        correct++;
        status = 'correct';
        topicResults[q.topic].correct++;
      } else {
        wrong++;
        status = 'wrong';
      }
      questionResults.push({ ...q, userAnswer: answer, status });
    });

    // Student info
    document.getElementById('result-student-name').textContent = state.studentName;
    const emailEl = document.getElementById('result-student-email');
    if (emailEl) emailEl.textContent = state.studentEmail || '';

    // Score ring
    const circumference = 2 * Math.PI * 90; // ~565.48
    const progress = (correct / 100) * circumference;
    const offset = circumference - progress;
    const ring = document.getElementById('score-ring-progress');
    // Reset to full offset first
    ring.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = offset;
      });
    });

    document.getElementById('score-value').textContent = `${correct} / 100`;
    document.getElementById('score-percentage').textContent = `${correct}%`;

    // Stats
    document.getElementById('stat-correct').textContent = correct;
    document.getElementById('stat-wrong').textContent = wrong;
    document.getElementById('stat-skipped').textContent = skipped;

    // Time taken
    const timeTaken = Math.floor((state.endTime - state.startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('time-taken').textContent = `Time taken: ${minutes}m ${seconds}s`;

    // Topic table
    const topicTableEl = document.getElementById('topic-table');
    topicTableEl.innerHTML = '';
    Object.entries(topicResults).forEach(([topic, data]) => {
      const pct = Math.round((data.correct / data.total) * 100);
      const row = document.createElement('div');
      row.className = 'topic-row';
      row.innerHTML = `
        <div class="topic-name">
          <span class="badge-topic ${topic.toLowerCase()}" style="font-size:0.7rem;">${topic}</span>
        </div>
        <div class="topic-bar-wrapper">
          <div class="progress">
            <div class="progress-bar" role="progressbar" style="width:${pct}%"
                 aria-valuenow="${data.correct}" aria-valuemin="0" aria-valuemax="${data.total}">
            </div>
          </div>
        </div>
        <div class="topic-score">${data.correct}/${data.total}</div>
      `;
      topicTableEl.appendChild(row);
    });

    // Filters
    const markedCount = questionResults.filter(q => state.marked[q.id]).length;
    buildReviewFilters(correct, wrong, skipped, markedCount);

    // Review cards
    buildReviewCards(questionResults);

    // Scroll to top
    window.scrollTo(0, 0);

    // Check if exam was terminated due to cheating
    const termCard = document.getElementById('termination-result-card');
    const termSub = document.getElementById('termination-result-subtitle');
    const termList = document.getElementById('termination-violations-list');
    if (termCard && state.isTerminated) {
      termCard.classList.remove('hidden');
      if (termSub) {
        termSub.textContent = state.terminationReason || 'Terminated after reaching 3 anti-cheating strikes.';
      }
      if (termList) {
        termList.innerHTML = '';
        (state.violations || []).forEach((v, i) => {
          const item = document.createElement('div');
          item.className = 'violation-log-item';
          const time = new Date(v.timestamp).toLocaleTimeString();
          item.innerHTML = `
            <span class="strike-badge">Strike ${i + 1}</span>
            <strong>${escapeHtml(v.type.replace(/_/g, ' '))}:</strong>
            <span>${escapeHtml(v.description)}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--text-muted);">${time}</span>
          `;
          termList.appendChild(item);
        });
      }
    } else if (termCard) {
      termCard.classList.add('hidden');
    }

    // Save submission to MongoDB Atlas
    const dbBadge = document.getElementById('result-db-badge');
    const submissionPayload = {
      studentName: state.studentName,
      studentEmail: state.studentEmail,
      score: correct,
      total: 100,
      percentage: correct,
      stats: {
        correct,
        wrong,
        skipped,
        timeTaken: `${minutes}m ${seconds}s`
      },
      topicScores: topicResults,
      answers: state.answers,
      terminated: !!state.isTerminated,
      terminationReason: state.terminationReason || null,
      violations: state.violations || []
    };

    saveSubmissionToDb(submissionPayload).then(res => {
      if (dbBadge) {
        if (res && res.success) {
          dbBadge.innerHTML = '<i class="bi bi-cloud-check-fill"></i> Saved to MongoDB Atlas (Submissions)';
          dbBadge.style.display = 'inline-flex';
        } else if (isDbConnected) {
          dbBadge.innerHTML = '<i class="bi bi-exclamation-circle"></i> Error saving to database';
        } else {
          dbBadge.innerHTML = '<i class="bi bi-hdd-fill"></i> Saved locally';
          dbBadge.style.display = 'inline-flex';
        }
      }
    });

    // Clear saved state since exam is done
    clearState();
  }

  function buildReviewFilters(correct, wrong, skipped, marked) {
    const container = document.getElementById('review-filters');
    container.innerHTML = '';

    const filters = [
      { id: 'all', label: 'All', count: 100 },
      { id: 'correct', label: 'Correct', count: correct },
      { id: 'wrong', label: 'Wrong', count: wrong },
      { id: 'skipped', label: 'Skipped', count: skipped },
      { id: 'marked', label: 'Marked', count: marked }
    ];

    filters.forEach((f, i) => {
      const btn = document.createElement('button');
      btn.className = `filter-btn${i === 0 ? ' active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.innerHTML = `${f.label} <span class="count">${f.count}</span>`;
      btn.dataset.filter = f.id;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        filterReview(f.id);
      });
      container.appendChild(btn);
    });
  }

  function filterReview(filter) {
    const cards = document.querySelectorAll('.review-card');
    cards.forEach(card => {
      const status = card.dataset.status;
      const isMarked = card.dataset.marked === 'true';
      let show = false;

      switch (filter) {
        case 'all': show = true; break;
        case 'correct': show = status === 'correct'; break;
        case 'wrong': show = status === 'wrong'; break;
        case 'skipped': show = status === 'skipped'; break;
        case 'marked': show = isMarked; break;
      }

      card.style.display = show ? '' : 'none';
    });
  }

  function buildReviewCards(questionResults) {
    const container = document.getElementById('review-list');
    container.innerHTML = '';

    questionResults.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'review-card surface';
      card.dataset.status = q.status;
      card.dataset.marked = state.marked[q.id] ? 'true' : 'false';

      // Status badge
      let statusBadgeClass, statusText;
      switch (q.status) {
        case 'correct':
          statusBadgeClass = 'correct-badge';
          statusText = 'Correct';
          break;
        case 'wrong':
          statusBadgeClass = 'wrong-badge';
          statusText = 'Wrong';
          break;
        case 'skipped':
          statusBadgeClass = 'skipped-badge';
          statusText = 'Not Attempted';
          break;
      }

      // Build header
      const header = document.createElement('div');
      header.className = 'review-card-header';
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');
      header.innerHTML = `
        <div class="review-header-left">
          <span class="review-q-num">Q${idx + 1}</span>
          <span class="badge-topic ${q.topic.toLowerCase()}" style="font-size:0.65rem;">${q.topic}</span>
          <span class="review-q-text-preview">${escapeHtml(q.question.substring(0, 80))}${q.question.length > 80 ? '...' : ''}</span>
        </div>
        <span class="review-status-badge ${statusBadgeClass}">${statusText}</span>
        <i class="bi bi-chevron-down chevron-icon"></i>
      `;

      // Toggle card
      header.addEventListener('click', () => {
        card.classList.toggle('open');
        header.setAttribute('aria-expanded', card.classList.contains('open') ? 'true' : 'false');
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('open');
          header.setAttribute('aria-expanded', card.classList.contains('open') ? 'true' : 'false');
        }
      });

      // Build body
      const body = document.createElement('div');
      body.className = 'review-card-body';

      // Full question text
      let bodyHTML = `<p class="review-question-text">${escapeHtml(q.question)}</p>`;

      // Code block
      if (q.code) {
        bodyHTML += `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-block-lang">${escapeHtml(q.code.language)}</span>
            </div>
            <pre class="code-block-content">${escapeHtml(q.code.content)}</pre>
          </div>
        `;
      }

      // Options
      bodyHTML += '<div style="margin-top:16px;">';
      q.options.forEach(opt => {
        let optClass = 'review-option';
        let tagText = '';

        const isCorrect = opt.id === q.correct;
        const isUserChoice = opt.id === q.userAnswer;

        if (isCorrect && isUserChoice) {
          optClass += ' correct-option';
          tagText = 'Your Answer &middot; Correct';
        } else if (isCorrect) {
          optClass += ' correct-option';
          tagText = 'Correct Answer';
        } else if (isUserChoice) {
          optClass += ' wrong-option';
          tagText = 'Your Answer';
        }

        bodyHTML += `
          <div class="${optClass}">
            <span class="option-letter">${opt.letter}</span>
            <span class="review-option-text">${escapeHtml(opt.text)}</span>
            ${tagText ? `<span class="review-option-tag">${tagText}</span>` : ''}
          </div>
        `;
      });
      bodyHTML += '</div>';

      // Explanation
      bodyHTML += `
        <div class="explanation-block">
          <div class="explanation-title">Explanation</div>
          <p class="explanation-text">${escapeHtml(q.explanation)}</p>
        </div>
      `;

      body.innerHTML = bodyHTML;

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════
  function initEventListeners() {
    // Navigation
    document.getElementById('prev-btn').addEventListener('click', () => {
      if (state.currentIndex > 0) goToQuestion(state.currentIndex - 1);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      if (state.currentIndex === 99) {
        showConfirmModal();
      } else {
        goToQuestion(state.currentIndex + 1);
      }
    });

    document.getElementById('clear-btn').addEventListener('click', clearAnswer);
    document.getElementById('mark-btn').addEventListener('click', toggleMark);

    // Submit button
    document.getElementById('submit-btn').addEventListener('click', showConfirmModal);
    document.getElementById('confirm-submit-btn').addEventListener('click', () => submitExam(false));

    // Retake
    document.getElementById('retake-btn').addEventListener('click', () => {
      stopCamera();
      clearState();
      state = {
        screen: 'start',
        studentName: '',
        studentEmail: '',
        questions: [],
        currentIndex: 0,
        answers: {},
        marked: {},
        startTime: null,
        endTime: null,
        submitted: false,
        violations: [],
        isTerminated: false,
        terminationReason: ''
      };
      showScreen('start');
      // Reset inputs
      const nameInput = document.getElementById('student-name');
      const emailInput = document.getElementById('student-email');
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      const startBtn = document.getElementById('start-btn');
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="bi bi-play-fill"></i> Start Exam';
      }
      const statusMsg = document.getElementById('account-status-msg');
      if (statusMsg) statusMsg.classList.add('hidden');
      const termCard = document.getElementById('termination-result-card');
      if (termCard) termCard.classList.add('hidden');
    });

    // Print
    document.getElementById('print-btn').addEventListener('click', () => {
      // Expand all review cards for print
      document.querySelectorAll('.review-card').forEach(c => c.classList.add('open'));
      window.print();
    });

    // Code copy
    document.getElementById('code-copy-btn').addEventListener('click', () => {
      if (state.screen === 'exam') {
        showCheatToast('Copying code blocks is disabled during examination');
        return;
      }
      const code = document.getElementById('q-code-content').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('code-copy-btn');
        btn.innerHTML = '<i class="bi bi-check2"></i> Copied!';
        setTimeout(() => {
          btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
        }, 1500);
      }).catch(() => {});
    });

    // Anti-cheat modal buttons
    const ackBtn = document.getElementById('acknowledge-violation-btn');
    if (ackBtn) {
      ackBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('violation-modal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
        requestExamFullscreen();
      });
    }

    const termBtn = document.getElementById('view-terminated-result-btn');
    if (termBtn) {
      termBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('termination-modal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (state.screen !== 'exam' || state.submitted) return;

      // Don't handle shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Don't handle shortcuts when modal is open
      const modalEl = document.getElementById('confirm-modal');
      if (modalEl.classList.contains('show')) return;

      const q = state.questions[state.currentIndex];

      switch (e.key.toLowerCase()) {
        case 'a':
        case '1':
          e.preventDefault();
          if (q.options[0]) selectOption(q.options[0].id);
          break;
        case 'b':
        case '2':
          e.preventDefault();
          if (q.options[1]) selectOption(q.options[1].id);
          break;
        case 'c':
        case '3':
          e.preventDefault();
          if (q.options[2]) selectOption(q.options[2].id);
          break;
        case 'd':
        case '4':
          e.preventDefault();
          if (q.options[3]) selectOption(q.options[3].id);
          break;
        case 'arrowleft':
          e.preventDefault();
          if (state.currentIndex > 0) goToQuestion(state.currentIndex - 1);
          break;
        case 'arrowright':
          e.preventDefault();
          if (state.currentIndex < 99) goToQuestion(state.currentIndex + 1);
          break;
        case 'm':
          e.preventDefault();
          toggleMark();
          break;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  function init() {
    // Run self check
    selfCheck();

    // Check MongoDB Atlas status
    checkDbStatus();

    // Init theme
    initTheme();

    // Init event listeners
    initEventListeners();
    initStartScreen();

    // Init anti-cheating protections
    initAntiCopyProtection();
    initAntiCheatWindowTracking();

    // Check for saved state
    const saved = loadState();
    if (saved && saved.screen === 'exam' && !saved.submitted) {
      // Resume exam
      state = saved;
      startExam();
    } else if (saved && saved.submitted) {
      // Show results from completed exam
      state = saved;
      showResults();
    } else {
      showScreen('start');
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
