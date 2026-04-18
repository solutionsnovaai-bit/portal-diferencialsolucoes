/* ═══════════════════════════════════════════════════════════
   DIFERENCIAL SOLUÇÕES · Portal Jurídico IA
   main.js — Interactions, Animations, API Logic
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── CUSTOM CURSOR ─── */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(tick);
  }

  tick();

  document.addEventListener('mousedown', () => dot.classList.add('click'));
  document.addEventListener('mouseup',   () => dot.classList.remove('click'));

  document.addEventListener('mouseover', e => {
    const el = e.target;
    if (el.matches('button, a, [onclick], input, select, textarea, label, .rb, .cb, .tab-btn, .toggle, .model-card, .dropzone, .hist-item, .insight-card')) {
      dot.classList.add('hover');
      ring.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', e => {
    const el = e.target;
    if (el.matches('button, a, [onclick], input, select, textarea, label, .rb, .cb, .tab-btn, .toggle, .model-card, .dropzone, .hist-item, .insight-card')) {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    }
  });
})();

/* ─── AMBIENT CANVAS ─── */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const PARTICLE_COUNT = 28;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(random = false) {
      this.x  = Math.random() * W;
      this.y  = random ? Math.random() * H : H + 20;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = -(Math.random() * 0.35 + 0.15);
      this.a  = Math.random() * 0.55 + 0.08;
      this.da = (Math.random() * 0.002 + 0.001) * (Math.random() < 0.5 ? 1 : -1);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.a += this.da;
      if (this.a > 0.65 || this.a < 0.06) this.da *= -1;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,94,46,${this.a})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawMesh() {
    const cx = W * 0.5, cy = H * 0.42;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
    grad.addColorStop(0,   'rgba(196,146,85,0.045)');
    grad.addColorStop(0.5, 'rgba(139,94,46,0.022)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  let frame = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawMesh();
    frame++;
    // slow orbit connections
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    // draw thin connections between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,94,46,${(1 - dist/140) * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();
  window.addEventListener('resize', () => { resize(); initParticles(); });
})();

/* ─── LOADER ─── */
(function initLoader() {
  const loader  = document.getElementById('loader');
  const ldBar   = document.getElementById('ldBar');
  const ldPct   = document.getElementById('ldPct');
  const ldSt    = document.getElementById('ldStatus');
  if (!loader) return;

  const steps = [
    { t: 18, s: 35 },
    { t: 42, s: 30 },
    { t: 66, s: 28 },
    { t: 84, s: 25 },
    { t: 96, s: 20 },
    { t: 100, s: 15 },
  ];

  const msgs = [
    'Iniciando sistema...',
    'Carregando módulos jurídicos...',
    'Conectando ao motor de IA...',
    'Calibrando análise trabalhista...',
    'Preparando interface...',
    'Pronto.',
  ];

  let p = 0, si = 0, msgI = 0;

  function run() {
    if (si >= steps.length) return;
    const { t, s } = steps[si];
    const tick = setInterval(() => {
      if (p >= t) {
        clearInterval(tick);
        si++;
        msgI = Math.min(msgI + 1, msgs.length - 1);
        if (ldSt) ldSt.textContent = msgs[msgI];
        if (si < steps.length) setTimeout(run, 180);
        else setTimeout(() => loader.classList.add('done'), 520);
        return;
      }
      p++;
      if (ldBar) ldBar.style.width = p + '%';
      if (ldPct) ldPct.textContent = p + '%';
    }, s);
  }

  window.addEventListener('load', () => setTimeout(run, 350));
})();

/* ─── HEADER SCROLL EFFECT ─── */
(function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();

/* ─── TABS ─── */
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tc = document.getElementById('tab-' + name);
  const tb = document.querySelector('[data-tab="' + name + '"]');
  if (tc) tc.classList.add('active');
  if (tb) tb.classList.add('active');
  if (name === 'insights')  updateInsights();
  if (name === 'historico') updateHistorico();
}

/* ─── FORM SECTION ACCORDION ─── */
function fToggle(header) {
  const body   = header.nextElementSibling;
  const hiding = !body.classList.contains('hidden');
  header.classList.toggle('collapsed', hiding);
  body.classList.toggle('hidden', hiding);
}

/* ─── RADIO SELECTION ─── */
function rSel(el, name) {
  const scope = el.closest('.radio-grp') || el.closest('.form-sec-body') || el.closest('.cond-block');
  if (scope) {
    scope.querySelectorAll('.rb').forEach(r => {
      const oc = r.getAttribute('onclick') || '';
      if (oc.includes("'" + name + "'")) r.classList.remove('active');
    });
  }
  el.classList.add('active');
}

/* ─── CHECKBOX TOGGLE (multiple select fixed) ─── */
function cTog(el) {
  el.classList.toggle('active');
}

/* ─── CONDITIONAL BLOCK ─── */
function cShow(id, show) {
  const e = document.getElementById(id);
  if (e) e.classList.toggle('visible', !!show);
}

/* ─── MODEL SELECTOR ─── */
function selectModel(card) {
  document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
}

/* ─── TOGGLE SWITCH ─── */
function togSwitch(el) {
  el.classList.toggle('on');
}

/* ─── CONFIG RANGE ─── */
function rangeVal(input, outId, suffix) {
  const out = document.getElementById(outId);
  if (out) out.textContent = input.value + (suffix || '');
}

/* ─── ENTREVISTA SUBMIT ─── */
let entCount = 0;
function submitEnt() {
  const form    = document.getElementById('entForm');
  const success = document.getElementById('entSuccess');
  if (!form || !success) return;
  form.style.display = 'none';
  success.classList.add('show');
  entCount++;
  saveHist('Entrevista #' + entCount, 'Online', 'medio', new Date().toLocaleString('pt-BR'));
}

/* ─── HISTORY ─── */
let histItems = [];
function saveHist(nome, tipo, pot, dt) {
  histItems.unshift({ nome, tipo, pot, dt });
}

function updateHistorico() {
  const empty = document.getElementById('histEmpty');
  const list  = document.getElementById('histList');
  if (!empty || !list) return;

  if (histItems.length === 0) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display  = 'flex';
  list.innerHTML = histItems.map((h, i) => `
    <div class="hist-item" style="animation-delay:${i * 0.06}s">
      <div class="hi-dot ${h.pot}"></div>
      <div class="hi-info">
        <div class="hi-name">${h.nome}</div>
        <div class="hi-meta">${h.tipo} · ${h.dt}</div>
      </div>
      <span class="hi-badge ${h.pot}">${h.pot === 'alto' ? 'Alto' : h.pot === 'medio' ? 'Médio' : 'Baixo'}</span>
    </div>
  `).join('');
}

/* ─── INSIGHTS ─── */
let totalAnal = 0, totalAlto = 0;

function updateInsights() {
  document.getElementById('icTotal').textContent = totalAnal;
  document.getElementById('icAlto').textContent  = totalAlto;
  document.getElementById('icEnt').textContent   = entCount;

  const pct  = totalAnal > 0 ? Math.round((totalAlto / totalAnal) * 100) : 0;
  const taxa = totalAnal > 0 ? pct + '%' : '—';
  document.getElementById('icTaxa').textContent = taxa;

  setTimeout(() => {
    document.getElementById('icBar1').style.width = Math.min(totalAnal * 20, 100) + '%';
    document.getElementById('icBar2').style.width = pct + '%';
    document.getElementById('icBar3').style.width = Math.min(entCount * 30, 100) + '%';
    document.getElementById('icBar4').style.width = pct + '%';
  }, 120);
}

/* ─── FILE UPLOAD ─── */
let fileData   = null;
let fileBase64 = null;

function initDropzone() {
  const dz = document.getElementById('dropzone');
  const fi = document.getElementById('fileInput');
  if (!dz || !fi) return;

  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('over');
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  fi.addEventListener('change', () => { if (fi.files[0]) setFile(fi.files[0]); });
}

function setFile(f) {
  if (f.type !== 'application/pdf') { showErro('Por favor, envie um arquivo PDF.'); return; }
  if (f.size > 4.5 * 1024 * 1024)  { showErro('Arquivo muito grande. Máximo: 4,5 MB.'); return; }
  hideErro();
  fileData = f;
  document.getElementById('fpName').textContent = f.name;
  document.getElementById('fpSize').textContent = (f.size / 1024 / 1024).toFixed(2) + ' MB';
  document.getElementById('filePill').classList.add('show');
  document.getElementById('btnSend').disabled = false;

  const reader = new FileReader();
  reader.onload = e => { fileBase64 = e.target.result.split(',')[1]; };
  reader.readAsDataURL(f);
}

function removeFile() {
  fileData = null;
  fileBase64 = null;
  document.getElementById('filePill').classList.remove('show');
  document.getElementById('btnSend').disabled = true;
  const fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
  hideErro();
}

function showErro(msg) {
  const e = document.getElementById('erroBox');
  if (e) { e.textContent = msg; e.style.display = 'block'; }
}

function hideErro() {
  const e = document.getElementById('erroBox');
  if (e) e.style.display = 'none';
}

/* ─── LOADING ANALYSIS STEPS ─── */
const ldStepsData = [
  [15, 'Lendo o documento...'],
  [35, 'Identificando dados do caso...'],
  [55, 'Analisando oportunidades jurídicas...'],
  [72, 'Calculando estimativas de verbas...'],
  [88, 'Gerando recomendações estratégicas...'],
  [95, 'Finalizando análise...'],
];

let ldStep2 = 0, ldTimer;

function startLoadingAnim() {
  ldStep2 = 0;
  const fill = document.getElementById('slFill');
  if (fill) fill.style.width = '0%';
  document.querySelectorAll('.sl-step').forEach(s => s.className = 'sl-step');

  function next() {
    if (ldStep2 < ldStepsData.length) {
      const [w] = ldStepsData[ldStep2];
      if (fill) fill.style.width = w + '%';
      const stepEl = document.getElementById('step' + ldStep2);
      if (stepEl) {
        stepEl.classList.add('active');
        if (ldStep2 > 0) {
          const prev = document.getElementById('step' + (ldStep2 - 1));
          if (prev) prev.classList.add('done');
        }
      }
      ldStep2++;
      ldTimer = setTimeout(next, 950 + Math.random() * 650);
    }
  }
  next();
}

function stopLoadingAnim() {
  clearTimeout(ldTimer);
  const fill = document.getElementById('slFill');
  if (fill) fill.style.width = '100%';
  document.querySelectorAll('.sl-step').forEach(s => s.classList.add('done'));
}

/* ─── API CALL ─── */
const SYSTEM_PROMPT = `Você é um assistente jurídico especializado em direito trabalhista brasileiro, auxiliando advogados do escritório Diferencial Soluções.
Analise a entrevista trabalhista fornecida e retorne SOMENTE um JSON válido sem markdown:
{"potencial":"ALTO"|"MEDIO"|"BAIXO","resumo":"Análise objetiva do caso","teses":[{"tese":"Nome","justificativa":"Por que cabível"}],"pontos_atencao":[{"tipo":"FORTE"|"ATENCAO","texto":"Descrição"}],"verbas":[{"verba":"Nome","base":"Base de cálculo","estimativa":"R$ X.XXX a R$ X.XXX"}],"total_estimado":"R$ XX.XXX a R$ XX.XXX","recomendacoes":"Orientações práticas e estratégia processual."}
Retorne APENAS o JSON.`;

async function enviar() {
  if (!fileBase64) return;
  hideErro();

  const btn = document.getElementById('btnSend');
  const sp  = document.getElementById('spinnerRing');
  const ic  = document.getElementById('btnIcon');

  btn.disabled = true;
  if (sp) sp.style.display = 'block';
  if (ic) ic.style.display = 'none';

  setTimeout(() => {
    const upload  = document.getElementById('screenUpload');
    const loading = document.getElementById('screenLoading');
    if (upload)  upload.style.display = 'none';
    if (loading) loading.classList.add('show');
    startLoadingAnim();
  }, 200);

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
            { type: 'text', text: 'Analise esta entrevista trabalhista.' }
          ]
        }]
      })
    });

    const data  = await resp.json();
    const txt   = (data.content || []).map(i => i.text || '').join('');
    const clean = txt.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    stopLoadingAnim();
    await new Promise(r => setTimeout(r, 700));
    mostrarResultado(result);

  } catch (err) {
    stopLoadingAnim();
    const loading = document.getElementById('screenLoading');
    const upload  = document.getElementById('screenUpload');
    if (loading) loading.classList.remove('show');
    if (upload)  upload.style.display = '';
    if (btn) btn.disabled = false;
    if (sp)  sp.style.display = 'none';
    if (ic)  ic.style.display = '';
    showErro('Erro ao processar. Verifique o arquivo e tente novamente.');
    console.error('API error:', err);
  }
}

/* ─── SHOW RESULTADO ─── */
function mostrarResultado(r) {
  const loading    = document.getElementById('screenLoading');
  const resultado  = document.getElementById('screenResultado');
  if (loading)  loading.classList.remove('show');
  if (resultado) resultado.classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  totalAnal++;

  // Badge
  const badge = document.getElementById('badgePotencial');
  if (badge) {
    badge.className = 'badge-pot';
    if (r.potencial === 'ALTO')  { badge.classList.add('pot-alto');  badge.textContent = '✦ Alto Potencial'; totalAlto++; }
    else if (r.potencial === 'MEDIO') { badge.classList.add('pot-medio'); badge.textContent = '◆ Médio Potencial'; }
    else { badge.classList.add('pot-baixo'); badge.textContent = '◇ Baixo Potencial'; }
  }

  // Resumo
  const resumoEl = document.getElementById('resResumo');
  if (resumoEl) resumoEl.textContent = r.resumo || '';

  // Teses
  const tb = document.getElementById('resTesesBody');
  if (tb) {
    tb.innerHTML = '';
    (r.teses || []).forEach(t => {
      const d = document.createElement('div');
      d.className = 'tese-item';
      d.innerHTML = `<div class="tese-nome">${t.tese}</div><div class="tese-just">${t.justificativa}</div>`;
      tb.appendChild(d);
    });
  }

  // Pontos
  const pb = document.getElementById('resPontosBody');
  if (pb) {
    pb.innerHTML = '';
    (r.pontos_atencao || []).forEach(p => {
      const d = document.createElement('div');
      d.className = 'ponto-item ' + (p.tipo === 'FORTE' ? 'p-forte' : 'p-atencao');
      d.textContent = p.texto;
      pb.appendChild(d);
    });
  }

  // Verbas
  const vb = document.getElementById('resVerbasBody');
  if (vb) {
    vb.innerHTML = '';
    (r.verbas || []).forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="v-nome">${v.verba}</td>
        <td style="font-size:11px;color:rgba(44,24,16,0.30)">${v.base}</td>
        <td class="v-val">${v.estimativa}</td>
      `;
      vb.appendChild(tr);
    });
    if (r.total_estimado) {
      const tr = document.createElement('tr');
      tr.className = 'total-row';
      tr.innerHTML = `
        <td class="v-nome" colspan="2" style="color:rgba(44,24,16,0.72);font-weight:500">Total Estimado</td>
        <td class="v-val">${r.total_estimado}</td>
      `;
      vb.appendChild(tr);
    }
  }

  // Recomendações
  const recEl = document.getElementById('resRec');
  if (recEl) recEl.textContent = r.recomendacoes || '';

  const pot = r.potencial === 'ALTO' ? 'alto' : r.potencial === 'MEDIO' ? 'medio' : 'baixo';
  saveHist('Análise PDF', 'Automática', pot, new Date().toLocaleString('pt-BR'));
}

/* ─── VOLTAR INICIO ─── */
function voltarInicio() {
  const resultado = document.getElementById('screenResultado');
  const upload    = document.getElementById('screenUpload');
  const sp        = document.getElementById('spinnerRing');
  const ic        = document.getElementById('btnIcon');
  const btn       = document.getElementById('btnSend');

  if (resultado) resultado.classList.remove('show');
  if (upload)    upload.style.display = '';
  removeFile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (btn) btn.disabled = false;
  if (sp)  sp.style.display = 'none';
  if (ic)  ic.style.display = '';
}

/* ─── ENTRANCE ANIMATIONS (Intersection Observer) ─── */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.insight-card, .form-section, .config-section');
  if (!cards.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.animationPlayState = 'paused';
    io.observe(c);
  });
})();

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initDropzone();
});
