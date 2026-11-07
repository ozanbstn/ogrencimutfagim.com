/* =====================================================================
   KULE SAVAŞLARI - TikTok canlı yayın kule savaşı oyunu
   Çizim: tek bir 1080x1920 canvas. Dünya koordinatları 1024 x 1820.
   ===================================================================== */
(() => {
  'use strict';
  const C = window.GAME_CONFIG;
  const W = 1024, H = 1820;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = 1080; canvas.height = 1920;
  const SCALE = canvas.width / W;
  const FONT = '"Oyun", "Arial Black", Impact, sans-serif';
  const params = new URLSearchParams(location.search);

  // ------------------------------------------------------------------
  // Görseller
  // ------------------------------------------------------------------
  const IMG = {};
  const imageList = ['bg.jpg', 'archer_red.png', 'archer_red2.png', 'archer_blue.png',
    'archer_blue2.png', 'king_red.png', 'queen_blue.png'];
  const imagesReady = Promise.all(imageList.map(src => new Promise(res => {
    const im = new Image();
    im.onload = () => res();
    im.onerror = () => { console.warn('Görsel yüklenemedi', src); res(); };
    im.src = 'assets/' + src;
    IMG[src.split('.')[0]] = im;
  })));

  // ------------------------------------------------------------------
  // Yardımcılar
  // ------------------------------------------------------------------
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const fmt = n => Math.round(n).toLocaleString('tr-TR');
  const nowS = () => performance.now() / 1000;
  const upper = s => C.NAME_UPPERCASE ? s.toLocaleUpperCase('tr-TR') : s;
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const hash = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
  const norm = s => (s || '').toLocaleLowerCase('tr-TR').normalize('NFC');

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function text(str, x, y, o = {}) {
    ctx.font = `${o.italic ? 'italic ' : ''}${o.size || 24}px ${FONT}`;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.base || 'middle';
    if (o.maxW) {
      const w = ctx.measureText(str).width;
      if (w > o.maxW) ctx.font = `${o.italic ? 'italic ' : ''}${(o.size || 24) * o.maxW / w}px ${FONT}`;
    }
    if (o.stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = o.strokeW || 6;
      ctx.strokeStyle = o.stroke;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
  }
  function vGrad(y0, y1, stops) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    return g;
  }
  const GOLD = ['#fff3b0', '#ffd34d', '#e59a12', '#b86a08'];

  // ------------------------------------------------------------------
  // Ses (WebAudio ile sentezlenir, dosya gerekmez)
  // ------------------------------------------------------------------
  const Sound = (() => {
    let ac = null, master = null, noise = null, enabled = C.SOUND;
    const last = {};
    function init() {
      if (ac) return;
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = C.SOUND_VOLUME; master.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; }
    }
    function throttle(name, ms) {
      const t = performance.now();
      if (last[name] && t - last[name] < ms) return true;
      last[name] = t; return false;
    }
    function tone(freq, dur, type = 'sine', vol = 0.3, slideTo = null, delay = 0) {
      const t0 = ac.currentTime + delay;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
    }
    function burst(dur, filterType, freq, vol, q = 1, delay = 0) {
      const t0 = ac.currentTime + delay;
      const s = ac.createBufferSource(); s.buffer = noise;
      const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
      const g = ac.createGain();
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
    }
    const fx = {
      arrow() { if (throttle('arrow', 70)) return; burst(0.18, 'bandpass', rand(2500, 4000), 0.12, 2); },
      hit() { if (throttle('hit', 60)) return; tone(rand(140, 180), 0.08, 'triangle', 0.15, 80); },
      block() { if (throttle('block', 80)) return; tone(rand(1400, 1800), 0.12, 'sine', 0.08, 2400); },
      cannon() { burst(0.6, 'lowpass', 600, 0.7); tone(120, 0.5, 'sine', 0.6, 40); },
      boom() { burst(0.9, 'lowpass', 400, 0.8); tone(80, 0.7, 'sine', 0.6, 30); },
      shield() { tone(400, 0.5, 'sine', 0.25, 1200); tone(800, 0.6, 'triangle', 0.12, 1600, 0.08); },
      repair() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, null, i * 0.07)); },
      join() { if (throttle('join', 90)) return; tone(660, 0.1, 'square', 0.06, 990); },
      crown() { [392, 523, 659].forEach((f, i) => tone(f, 0.25, 'triangle', 0.2, null, i * 0.1)); },
      win() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.3, 'square', 0.12, null, i * 0.14)); },
      count() { tone(880, 0.15, 'square', 0.1); },
      go() { tone(660, 0.4, 'square', 0.15, 1320); },
    };
    return {
      init,
      resume() { init(); if (ac && ac.state !== 'running') ac.resume().catch(() => {}); },
      // tarayıcı sesi ilk tıklama/tuş ile açar; OBS / LIVE Studio içinde kendiliğinden çalışır
      play(name) { if (!enabled) return; init(); if (!ac || ac.state !== 'running') return; fx[name] && fx[name](); },
      toggle() { enabled = !enabled; if (enabled) init(); return enabled; },
      get enabled() { return enabled; },
    };
  })();
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { Sound.resume(); }));

  // ------------------------------------------------------------------
  // Takımlar ve kule yerleşimi (koordinatlar arka plan görseline göre)
  // ------------------------------------------------------------------
  const ROWS = [555, 658, 763, 868, 973, 1078];
  function makeTeam(key) {
    const red = key === 'red';
    const cx = red ? 175 : 849;
    const cols = red ? [101, 185, 267] : [759, 841, 925];
    const windows = [];
    ROWS.forEach(y => cols.forEach(x => windows.push({ x, y })));
    const groundX = red ? [92, 182, 272, 362] : [932, 842, 752, 662];
    return {
      key, red,
      name: red ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM',
      short: red ? 'KIRMIZI' : 'MAVİ',
      color: red ? '#e0262b' : '#1f63e0',
      dark: red ? '#7d0c10' : '#0c2a78',
      light: red ? '#ff8a7a' : '#8ac4ff',
      glow: red ? 'rgba(255,90,60,' : 'rgba(80,170,255,',
      dir: red ? 1 : -1,
      hp: C.TOWER_HP, shownHp: C.TOWER_HP, maxHp: C.TOWER_HP,
      shieldUntil: 0,
      members: [], order: [], overflow: 0, commanderId: null,
      windows, ground: groundX.map(x => ({ x, y: 1300 })),
      cx, topY: 478,
      body: { x0: red ? 55 : 729, x1: red ? 295 : 969, y0: 500, y1: 1130 },
      bubble: { cx, cy: 790, rx: 205, ry: 495 },
      muzzle: red ? { x: 352, y: 1136 } : { x: 672, y: 1136 },
      hitFlash: 0, wins: 0,
    };
  }
  const T = { red: makeTeam('red'), blue: makeTeam('blue') };
  const other = t => (t.key === 'red' ? T.blue : T.red);
  try {
    const w = JSON.parse(localStorage.getItem('ks_wins') || '{}');
    T.red.wins = w.red || 0; T.blue.wins = w.blue || 0;
  } catch (e) { /* yoksay */ }
  function saveWins() {
    try { localStorage.setItem('ks_wins', JSON.stringify({ red: T.red.wins, blue: T.blue.wins })); } catch (e) { /* yoksay */ }
  }

  // ------------------------------------------------------------------
  // Oyuncular
  // ------------------------------------------------------------------
  const players = new Map();   // id -> oyuncu
  function userName(u) {
    const raw = (C.USE_NICKNAME ? (u.nick || u.name) : (u.name || u.nick)) || 'misafir';
    return trunc(upper(String(raw).replace(/^@/, '')), 11);
  }
  function addPlayer(user, team) {
    const id = String(user.id || user.name);
    let p = players.get(id);
    const t = nowS();
    if (p && p.team === team.key) { p.lastActive = t; return p; }
    if (p) { // takım değişimi
      const old = T[p.team];
      old.members = old.members.filter(m => m !== p);
      p.score = 0;
    } else {
      p = { id, name: userName(user), score: 0, likes: 0, coins: 0, joinedAt: t, variant: hash(id) % 2, popAt: t };
      players.set(id, p);
    }
    p.team = team.key; p.lastActive = t; p.popAt = t;
    team.members.push(p);
    feed(`${p.name} ${team.short} takıma katıldı`, team);
    Sound.play('join');
    spawnText(team.cx, 1180, '+1 ASKER', team.light, 26);
    relayout(true);
    return p;
  }
  function weakerTeam() {
    const r = T.red.members.length, b = T.blue.members.length;
    if (r !== b) return r < b ? T.red : T.blue;
    return T.red.hp <= T.blue.hp ? T.red : T.blue;
  }
  // Oyuncuyu bul; yoksa AUTO_JOIN açıksa az kişili takıma ekle
  function playerFor(user) {
    const id = String(user.id || user.name);
    const p = players.get(id);
    if (p) { p.lastActive = nowS(); if (user.name || user.nick) p.name = userName(user); return p; }
    if (!C.AUTO_JOIN) return null;
    return addPlayer(user, weakerTeam());
  }

  // Sohbet mesajından takım seçimini çıkar
  function parseJoin(msg) {
    const m = norm(msg).replace(/[!.,?]/g, ' ').trim();
    if (!m) return null;
    const words = m.split(/\s+/);
    const redW = C.RED_WORDS.map(norm), blueW = C.BLUE_WORDS.map(norm), joinW = C.JOIN_WORDS.map(norm);
    const hasJoin = words.some(w => joinW.includes(w));
    if (hasJoin) {
      for (const w of words) {
        if (redW.includes(w)) return 'red';
        if (blueW.includes(w)) return 'blue';
      }
      return null;
    }
    // sadece "kırmızı" / "mavi" yazılırsa (tek harfler hariç)
    if (words.length <= 2) {
      if (words.some(w => w.length > 2 && redW.includes(w))) return 'red';
      if (words.some(w => w.length > 2 && blueW.includes(w))) return 'blue';
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Olay işleyiciler (TikTok'tan gelen veriler)
  // ------------------------------------------------------------------
  function onChat(user, comment) {
    const teamKey = parseJoin(comment);
    if (!teamKey) { const p = players.get(String(user.id || user.name)); if (p) p.lastActive = nowS(); return; }
    const id = String(user.id || user.name);
    const p = players.get(id);
    if (p && p.team !== teamKey && !C.ALLOW_TEAM_SWITCH) return;
    addPlayer(user, T[teamKey]);
  }

  function onLike(user, count) {
    count = Math.max(1, count | 0);
    const p = playerFor(user);
    if (!p) return;
    p.likes += count;
    p.score += count * C.SCORE_PER_LIKE;
    if (state !== 'playing') return;
    const team = T[p.team];
    const arrows = Math.min(count, C.MAX_ARROWS_PER_LIKE_EVENT);
    const dmg = count * C.LIKE_DAMAGE;
    for (let i = 0; i < arrows; i++) {
      setTimeout(() => fireArrow(team, p, dmg / arrows), i * 110);
    }
  }

  function giftAction(giftName, coins) {
    const n = norm(giftName);
    for (const rule of C.GIFTS) {
      if (rule.match.some(m => norm(m) === n)) return rule.action;
    }
    if (coins >= C.FALLBACK_CANNON_MIN_COINS) return 'cannon';
    if (coins >= C.FALLBACK_SHIELD_MIN_COINS) return 'shield';
    return 'repair';
  }

  function onGift(user, giftName, coins, count) {
    coins = Math.max(1, coins | 0); count = Math.max(1, count | 0);
    const p = playerFor(user);
    if (!p) return;
    p.coins += coins * count;
    p.score += coins * count * C.SCORE_PER_COIN;
    if (state !== 'playing') return;
    const team = T[p.team];
    const action = giftAction(giftName, coins);
    const reps = Math.min(count, 20);
    if (action === 'cannon') {
      const dmg = Math.min(C.CANNON_MAX_DAMAGE, C.CANNON_BASE_DAMAGE + coins * C.CANNON_DAMAGE_PER_COIN);
      banner(`${p.name}`, reps > 1 ? `TOP SALDIRISI x${reps}!` : 'TOP SALDIRISI!', team, 'cannon');
      feed(`${p.name} top ateşledi!`, team);
      for (let i = 0; i < reps; i++) setTimeout(() => fireCannon(team, p, dmg), i * 450);
    } else if (action === 'shield') {
      const add = C.SHIELD_SECONDS * reps;
      const t = nowS();
      team.shieldUntil = Math.min(Math.max(team.shieldUntil, t) + add, t + C.SHIELD_MAX_SECONDS);
      banner(`${p.name}`, `KALKAN +${add} SN`, team, 'shield');
      feed(`${p.name} kalkan açtı (${add} sn)`, team);
      Sound.play('shield');
      for (let i = 0; i < 30; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({ type: 'spark', x: team.bubble.cx + Math.cos(a) * team.bubble.rx, y: team.bubble.cy + Math.sin(a) * team.bubble.ry,
          vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, life: 0.8, max: 0.8, size: 5, color: '#bff4ff', g: 0 });
      }
    } else {
      const heal = (C.REPAIR_BASE_HP + coins * C.REPAIR_HP_PER_COIN) * reps;
      const before = team.hp;
      team.hp = Math.min(team.maxHp, team.hp + heal);
      const got = team.hp - before;
      banner(`${p.name}`, got > 0 ? `KULE TAMİR +${fmt(got)}` : 'KULE TAMİR (TAM CAN)', team, 'repair');
      feed(got > 0 ? `${p.name} kuleyi tamir etti +${fmt(got)}` : `${p.name} kuleyi tamir etti`, team);
      Sound.play('repair');
      spawnText(team.cx, 700, got > 0 ? `+${fmt(got)}` : 'TAM CAN', '#6dff7a', 54);
      for (let i = 0; i < 26; i++) {
        particles.push({ type: 'plus', x: rand(team.body.x0, team.body.x1), y: rand(600, 1150), vx: rand(-15, 15), vy: rand(-140, -60),
          life: rand(0.9, 1.6), max: 1.6, size: rand(14, 26), color: '#4dff6a', g: 0 });
      }
    }
  }

  // ------------------------------------------------------------------
  // Saldırılar
  // ------------------------------------------------------------------
  const arrows = [], balls = [], particles = [], floats = [];
  let shake = 0;

  function slotPos(team, p) {
    // oyuncunun kuledeki yeri (ok çıkış noktası)
    const idx = team.order.indexOf(p);
    if (idx === 0) return { x: team.cx + team.dir * 85, y: team.topY - 125 };
    if (idx >= 1 && idx <= team.windows.length) {
      const w = team.windows[idx - 1];
      return { x: w.x + team.dir * 34, y: w.y - 6 };
    }
    const g = idx - 1 - team.windows.length;
    if (g >= 0 && g < team.ground.length) {
      const s = team.ground[g];
      return { x: s.x + team.dir * 44, y: s.y - 72 };
    }
    // görünmeyen oyuncu: rastgele bir pencereden atsın
    const vis = Math.min(team.order.length - 1, team.windows.length);
    if (vis > 0) { const w = team.windows[randi(0, vis - 1)]; return { x: w.x + team.dir * 34, y: w.y - 6 }; }
    return { x: team.cx + team.dir * 85, y: team.topY - 125 };
  }

  function fireArrow(team, p, dmg) {
    if (state !== 'playing') return;
    const enemy = other(team);
    const o = slotPos(team, p);
    if (arrows.length > 160) { applyDamage(enemy, dmg, rand(enemy.body.x0, enemy.body.x1), rand(enemy.body.y0, enemy.body.y1), 'arrow', p); return; }
    const tx = rand(enemy.body.x0 + 20, enemy.body.x1 - 20), ty = rand(enemy.body.y0, enemy.body.y1);
    arrows.push({ team, p, dmg, x0: o.x, y0: o.y, x1: tx, y1: ty, t: 0, dur: rand(0.75, 1.05), h: rand(60, 170), x: o.x, y: o.y, ang: 0 });
    Sound.play('arrow');
  }

  function fireCannon(team, p, dmg) {
    if (state !== 'playing') return;
    const enemy = other(team);
    const m = team.muzzle;
    const tx = rand(enemy.body.x0 + 50, enemy.body.x1 - 50), ty = rand(620, 1000);
    balls.push({ team, p, dmg, x0: m.x, y0: m.y, x1: tx, y1: ty, t: 0, dur: 1.25, h: 330, x: m.x, y: m.y });
    Sound.play('cannon');
    shake = Math.max(shake, 6);
    for (let i = 0; i < 18; i++) {
      particles.push({ type: 'smoke', x: m.x + team.dir * 10, y: m.y, vx: team.dir * rand(40, 160), vy: rand(-80, 10), life: rand(0.6, 1.1), max: 1.1, size: rand(14, 28), color: '200,200,200', g: -20 });
      particles.push({ type: 'fire', x: m.x, y: m.y, vx: team.dir * rand(80, 260), vy: rand(-90, 40), life: rand(0.2, 0.45), max: 0.45, size: rand(8, 16), g: 0 });
    }
  }

  function shielded(team) { return team.shieldUntil > nowS(); }
  function insideBubble(team, x, y) {
    const b = team.bubble;
    const dx = (x - b.cx) / b.rx, dy = (y - b.cy) / b.ry;
    return dx * dx + dy * dy <= 1;
  }

  function applyDamage(team, dmg, x, y, kind, by) {
    if (state !== 'playing') return;
    team.hp = Math.max(0, team.hp - dmg);
    team.hitFlash = Math.min(1, team.hitFlash + (kind === 'cannon' ? 1 : 0.25));
    if (kind === 'arrow') {
      spawnText(x, y - 10, `-${fmt(dmg)}`, '#ffe14d', 24);
      Sound.play('hit');
      for (let i = 0; i < 5; i++) particles.push({ type: 'spark', x, y, vx: rand(-120, 120), vy: rand(-160, 20), life: 0.35, max: 0.35, size: 3, color: '#ffe9a0', g: 400 });
      for (let i = 0; i < 3; i++) particles.push({ type: 'debris', x, y, vx: rand(-90, 90), vy: rand(-120, 0), life: 0.7, max: 0.7, size: rand(3, 6), color: '#b9a690', g: 700 });
    } else {
      spawnText(x, y - 30, `-${fmt(dmg)}`, '#ff5a3c', 62);
      Sound.play('boom');
      shake = Math.max(shake, 18);
      explosion(x, y, 1);
    }
    if (team.hp <= 0) endRound(other(team), `${team.short} KULE YIKILDI!`);
  }

  function explosion(x, y, s) {
    particles.push({ type: 'ring', x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 140 * s, g: 0 });
    for (let i = 0; i < 40 * s; i++) {
      const a = Math.random() * Math.PI * 2, v = rand(80, 420) * s;
      particles.push({ type: 'fire', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.7), max: 0.7, size: rand(10, 26) * s, g: 100 });
    }
    for (let i = 0; i < 22 * s; i++) {
      const a = Math.random() * Math.PI * 2, v = rand(30, 150);
      particles.push({ type: 'smoke', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rand(0.9, 1.8), max: 1.8, size: rand(20, 46) * s, color: '90,80,75', g: -30 });
    }
    for (let i = 0; i < 18 * s; i++) {
      particles.push({ type: 'debris', x, y, vx: rand(-300, 300), vy: rand(-420, -60), life: rand(0.8, 1.4), max: 1.4, size: rand(5, 11), color: pick(['#b9a690', '#8f7e6a', '#d4c4ac']), g: 900 });
    }
  }

  function spawnText(x, y, str, color, size) {
    if (floats.length > 70) floats.shift();
    floats.push({ x: x + rand(-14, 14), y, str, color, size, life: 1.1, max: 1.1 });
  }

  // ------------------------------------------------------------------
  // Banner ve akış
  // ------------------------------------------------------------------
  const banners = [];
  let currentBanner = null;
  function banner(title, sub, team, icon) {
    if (banners.length >= 4) banners.shift();
    banners.push({ title, sub, team, icon, life: 1.9, max: 1.9 });
  }
  const feedItems = [];
  function feed(str, team) {
    feedItems.unshift({ str, team, t: nowS() });
    if (feedItems.length > 5) feedItems.pop();
  }

  // ------------------------------------------------------------------
  // Sıralama: en çok puan alan komutan, sonra pencereler, sonra yer
  // ------------------------------------------------------------------
  let lastLayout = 0;
  function relayout(force) {
    const t = nowS();
    if (!force && t - lastLayout < 1) return;
    lastLayout = t;
    for (const team of Object.values(T)) {
      // uzun süre pasif kalanları çıkar
      const limit = C.INACTIVE_REMOVE_MINUTES * 60;
      if (limit > 0) {
        team.members = team.members.filter(p => {
          if (t - p.lastActive > limit) { players.delete(p.id); return false; }
          return true;
        });
      }
      const prev = team.order.slice(0, 1 + team.windows.length + team.ground.length);
      team.order = team.members.slice().sort((a, b) => b.score - a.score || b.lastActive - a.lastActive);
      const visible = 1 + team.windows.length + team.ground.length;
      team.overflow = Math.max(0, team.order.length - visible);
      team.order.slice(0, visible).forEach((p, i) => { if (prev[i] !== p) p.popAt = t; });
      const cmd = team.order[0];
      if (cmd && cmd.id !== team.commanderId) {
        if (team.commanderId !== null && cmd.score > 0 && state === 'playing') {
          banner(cmd.name, '👑 YENİ KOMUTAN', team, 'crown');
          Sound.play('crown');
        }
        team.commanderId = cmd.id;
      }
      if (!cmd) team.commanderId = null;
    }
  }

  // ------------------------------------------------------------------
  // Tur akışı
  // ------------------------------------------------------------------
  let state = 'countdown';
  let stateT = C.COUNTDOWN_SECONDS;
  let timeLeft = C.ROUND_SECONDS;
  let result = null;
  let lastCount = -1;

  function resetRound() {
    for (const team of Object.values(T)) {
      team.hp = team.shownHp = team.maxHp = C.TOWER_HP;
      team.shieldUntil = 0;
      if (!C.KEEP_TEAMS_BETWEEN_ROUNDS) team.members = [];
      if (C.RESET_SCORES_EACH_ROUND) team.members.forEach(p => { p.score = 0; p.likes = 0; p.coins = 0; });
    }
    if (!C.KEEP_TEAMS_BETWEEN_ROUNDS) players.clear();
    arrows.length = 0; balls.length = 0;
    timeLeft = C.ROUND_SECONDS;
    state = 'countdown'; stateT = C.COUNTDOWN_SECONDS; lastCount = -1;
    result = null;
    relayout(true);
  }

  function endRound(winner, reason) {
    if (state !== 'playing') return;
    state = 'ended'; stateT = C.RESULT_SECONDS;
    if (winner) { winner.wins++; saveWins(); }
    relayout(true);
    const mvp = winner ? winner.order.slice(0, 3) : [];
    result = { winner, reason, mvp };
    banners.length = 0; currentBanner = null;
    Sound.play('win');
    if (winner) {
      const loser = other(winner);
      for (let i = 0; i < 6; i++) setTimeout(() => explosion(rand(loser.body.x0, loser.body.x1), rand(500, 1100), 0.9), i * 220);
    }
  }

  function update(dt) {
    const t = nowS();
    if (state === 'countdown') {
      stateT -= dt;
      const c = Math.ceil(stateT);
      if (c !== lastCount) { lastCount = c; if (c > 0) Sound.play('count'); else Sound.play('go'); }
      if (stateT <= -0.6) { state = 'playing'; }
    } else if (state === 'playing') {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        const r = T.red.hp, b = T.blue.hp;
        if (r === b) endRound(null, 'SÜRE BİTTİ - BERABERE');
        else endRound(r > b ? T.red : T.blue, 'SÜRE BİTTİ!');
      }
    } else if (state === 'ended') {
      stateT -= dt;
      if (stateT <= 0) resetRound();
    }

    relayout(false);

    for (const team of Object.values(T)) {
      team.shownHp += (team.hp - team.shownHp) * Math.min(1, dt * 6);
      team.hitFlash = Math.max(0, team.hitFlash - dt * 2.5);
      // hasarlı kuleden duman / ateş
      const ratio = team.hp / team.maxHp;
      if (ratio < 0.6 && Math.random() < dt * (ratio < 0.3 ? 14 : 5)) {
        const x = rand(team.body.x0 + 10, team.body.x1 - 10), y = rand(500, 1050);
        particles.push({ type: 'smoke', x, y, vx: rand(-10, 10), vy: rand(-60, -30), life: 1.6, max: 1.6, size: rand(16, 30), color: '60,55,55', g: -10 });
        if (ratio < 0.3) particles.push({ type: 'fire', x, y, vx: rand(-15, 15), vy: rand(-90, -40), life: 0.6, max: 0.6, size: rand(10, 20), g: -20 });
      }
    }

    // oklar
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];
      a.t += dt / a.dur;
      const u = Math.min(1, a.t);
      const nx = a.x0 + (a.x1 - a.x0) * u;
      const ny = a.y0 + (a.y1 - a.y0) * u - a.h * 4 * u * (1 - u);
      a.ang = Math.atan2(ny - a.y, nx - a.x);
      a.x = nx; a.y = ny;
      const enemy = other(a.team);
      if (shielded(enemy) && insideBubble(enemy, nx, ny)) {
        Sound.play('block');
        for (let k = 0; k < 6; k++) particles.push({ type: 'spark', x: nx, y: ny, vx: rand(-150, 150), vy: rand(-150, 150), life: 0.4, max: 0.4, size: 4, color: '#aef3ff', g: 0 });
        if (Math.random() < 0.3) spawnText(nx, ny - 20, 'ENGEL!', '#aef3ff', 22);
        arrows.splice(i, 1); continue;
      }
      if (u >= 1) {
        applyDamage(enemy, a.dmg, nx, ny, 'arrow', a.p);
        arrows.splice(i, 1);
      }
    }
    // top gülleleri
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.t += dt / b.dur;
      const u = Math.min(1, b.t);
      b.x = b.x0 + (b.x1 - b.x0) * u;
      b.y = b.y0 + (b.y1 - b.y0) * u - b.h * 4 * u * (1 - u);
      particles.push({ type: 'fire', x: b.x, y: b.y, vx: rand(-20, 20), vy: rand(-20, 20), life: 0.35, max: 0.35, size: rand(10, 18), g: 0 });
      if (Math.random() < 0.5) particles.push({ type: 'smoke', x: b.x, y: b.y, vx: 0, vy: -10, life: 0.8, max: 0.8, size: rand(10, 18), color: '120,110,100', g: -10 });
      const enemy = other(b.team);
      if (shielded(enemy) && insideBubble(enemy, b.x, b.y)) {
        explosion(b.x, b.y, 0.6);
        spawnText(b.x, b.y - 30, 'KALKAN ENGELLEDİ!', '#aef3ff', 34);
        Sound.play('boom'); shake = Math.max(shake, 8);
        balls.splice(i, 1); continue;
      }
      if (u >= 1) { applyDamage(enemy, b.dmg, b.x, b.y, 'cannon', b.p); balls.splice(i, 1); }
    }
    // parçacıklar
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vy += (p.g || 0) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    if (particles.length > 900) particles.splice(0, particles.length - 900);
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.life -= dt; f.y -= 50 * dt;
      if (f.life <= 0) floats.splice(i, 1);
    }
    // banner kuyruğu
    if (!currentBanner && banners.length) currentBanner = banners.shift();
    if (currentBanner) {
      currentBanner.life -= dt * (banners.length > 1 ? 1.6 : 1);
      if (currentBanner.life <= 0) currentBanner = null;
    }
    shake = Math.max(0, shake - dt * 40);
    if (demo) demoTick(dt);
  }

  // ------------------------------------------------------------------
  // ÇİZİM
  // ------------------------------------------------------------------
  // Kalkan için altıgen desen
  const hexCanvas = document.createElement('canvas');
  (() => {
    hexCanvas.width = 420; hexCanvas.height = 1000;
    const h = hexCanvas.getContext('2d');
    const r = 22, w = Math.sqrt(3) * r;
    h.strokeStyle = 'rgba(200,245,255,0.9)'; h.lineWidth = 2;
    for (let row = 0; row * r * 1.5 < 1000 + r; row++) {
      for (let col = 0; col * w < 420 + w; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * r * 1.5;
        h.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + k * Math.PI / 3;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          k ? h.lineTo(x, y) : h.moveTo(x, y);
        }
        h.closePath(); h.stroke();
      }
    }
  })();

  function drawBackground() {
    const bg = IMG.bg;
    if (bg && bg.complete && bg.naturalWidth) {
      ctx.drawImage(bg, 0, 0, W, 1536);
      // alt kısım: çimen şeridini aynalayarak uzat
      ctx.save();
      ctx.translate(0, 1536 * 2);
      ctx.scale(1, -1);
      ctx.drawImage(bg, 0, 1536 - 290, 1024, 290, 0, 1536 - 290, W, 290);
      ctx.restore();
    } else {
      ctx.fillStyle = vGrad(0, H, ['#5aa0f0', '#bfe0ff', '#5aa040']);
      ctx.fillRect(0, 0, W, H);
    }
  }

  function namePill(name, x, y, size = 13, active = true) {
    ctx.font = `${size}px ${FONT}`;
    const tw = Math.min(ctx.measureText(name).width, 74);
    const w = tw + 24, h = size + 9;
    roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    ctx.fillStyle = 'rgba(25,18,12,0.85)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,210,120,0.55)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x - w / 2 + 9, y, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#3dff5a' : '#888'; ctx.fill();
    text(name, x + 6, y + 1, { size, maxW: 74 });
  }

  function archerImg(team, p) {
    if (team.red) return p.variant ? IMG.archer_red2 : IMG.archer_red;
    return p.variant ? IMG.archer_blue2 : IMG.archer_blue;
  }

  function popScale(p) {
    const k = clamp((nowS() - p.popAt) / 0.3, 0, 1);
    return 0.6 + 0.4 * (1 - Math.pow(1 - k, 3)) + Math.sin(k * Math.PI) * 0.12;
  }

  function drawWindowArcher(team, p, w, t) {
    const img = archerImg(team, p);
    if (!img || !img.naturalWidth) return;
    const s = popScale(p);
    const h = 122 * s, iw = img.naturalWidth * h / img.naturalHeight;
    const anchor = team.red ? 0.40 : 0.60;
    const bob = Math.sin(t * 2.4 + hash(p.id)) * 1.5;
    ctx.save();
    // pencerenin içi + düşmana bakan tarafta yay için biraz pay
    const extra = 34;
    const x0 = team.red ? w.x - 31 : w.x - 31 - extra;
    ctx.beginPath();
    ctx.rect(x0, w.y - 42, 62 + extra, 76);
    ctx.clip();
    ctx.drawImage(img, w.x - iw * anchor, w.y - 36 + bob + (1 - s) * 40, iw, h);
    ctx.restore();
    namePill(p.name, w.x, w.y + 33);
  }

  function drawEmptyWindow(w, t, i) {
    const a = 0.55 + Math.sin(t * 2 + i) * 0.2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(w.x, w.y + 4, 15, 0, Math.PI * 2);
    ctx.fillStyle = vGrad(w.y - 12, w.y + 20, ['#ffe27a', '#d48a10']); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#7a4a05'; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(w.x - 8, w.y + 2, 16, 4); ctx.fillRect(w.x - 2, w.y - 4, 4, 16);
    ctx.restore();
  }

  function drawGroundArcher(team, p, g, t) {
    const img = archerImg(team, p);
    if (!img || !img.naturalWidth) return;
    const s = popScale(p);
    const h = 118 * s, iw = img.naturalWidth * h / img.naturalHeight;
    const anchor = team.red ? 0.40 : 0.60;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(g.x, g.y - 2, 34, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    ctx.drawImage(img, g.x - iw * anchor, g.y - h + Math.sin(t * 2 + hash(p.id)) * 1.2, iw, h);
    ctx.restore();
    namePill(p.name, g.x, g.y + 6);
  }

  function drawCommander(team, t) {
    const p = team.order[0];
    const img = team.red ? IMG.king_red : IMG.queen_blue;
    const anchor = team.red ? 0.42 : 0.58;
    if (img && img.naturalWidth) {
      const s = p ? popScale(p) : 1;
      const h = 215 * s, iw = img.naturalWidth * h / img.naturalHeight;
      ctx.save();
      if (!p) ctx.globalAlpha = 0.45;
      // altın parıltı
      const glow = ctx.createRadialGradient(team.cx, team.topY - 100, 10, team.cx, team.topY - 100, 140);
      glow.addColorStop(0, 'rgba(255,220,120,0.35)'); glow.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = glow; ctx.fillRect(team.cx - 150, team.topY - 250, 300, 300);
      ctx.drawImage(img, team.cx - iw * anchor, team.topY - h + 8 + Math.sin(t * 1.6) * 2, iw, h);
      ctx.restore();
    }
    // isim plakası
    const name = p ? p.name : 'KOMUTAN OL!';
    const y = team.topY - 26;
    ctx.save();
    ctx.font = `24px ${FONT}`;
    const w = Math.max(130, Math.min(ctx.measureText(name).width, 170) + 40);
    roundRect(team.cx - w / 2, y - 20, w, 40, 12);
    ctx.fillStyle = vGrad(y - 20, y + 20, [team.light, team.color, team.dark]); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#f5c242'; ctx.stroke();
    text(name, team.cx, y + 1, { size: 24, stroke: 'rgba(0,0,0,0.6)', strokeW: 5, maxW: 170 });
    roundRect(team.cx - 52, y + 18, 104, 22, 8);
    ctx.fillStyle = vGrad(y + 18, y + 40, ['#ffe58a', '#d89614']); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#7a4a05'; ctx.stroke();
    text(p ? '👑 KOMUTAN' : 'EN ÇOK DESTEK', team.cx, y + 30, { size: 14, color: '#4a2a00' });
    ctx.restore();
  }

  function drawShield(team, t) {
    const left = team.shieldUntil - nowS();
    if (left <= 0) return;
    const b = team.bubble;
    const fade = Math.min(1, left / 0.6);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.beginPath(); ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(b.cx, b.cy, 50, b.cx, b.cy, b.ry);
    g.addColorStop(0, 'rgba(90,200,255,0.06)'); g.addColorStop(0.75, 'rgba(90,200,255,0.16)'); g.addColorStop(1, 'rgba(150,235,255,0.45)');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.globalAlpha = fade * (0.22 + Math.sin(t * 4) * 0.06);
    ctx.drawImage(hexCanvas, b.cx - b.rx, b.cy - b.ry + ((t * 30) % 66) - 66, b.rx * 2, b.ry * 2 + 66);
    ctx.restore();
    ctx.shadowColor = '#5fe0ff'; ctx.shadowBlur = 24;
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(170,240,255,0.9)';
    ctx.beginPath(); ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    // süre
    const y = b.cy - b.ry + 26;
    roundRect(b.cx - 62, y - 17, 124, 34, 17);
    ctx.fillStyle = 'rgba(10,60,120,0.85)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#aef3ff'; ctx.stroke();
    text(`🛡 ${left.toFixed(1)} sn`, b.cx, y + 1, { size: 20, color: '#dffaff' });
    ctx.restore();
  }

  function drawTower(team, t) {
    // pencereler
    team.windows.forEach((w, i) => {
      const p = team.order[i + 1];
      if (p) drawWindowArcher(team, p, w, t); else drawEmptyWindow(w, t, i);
    });
    // hasar parlaması
    if (team.hitFlash > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(team.cx, 820, 40, team.cx, 820, 380);
      g.addColorStop(0, `rgba(255,80,40,${0.35 * team.hitFlash})`); g.addColorStop(1, 'rgba(255,80,40,0)');
      ctx.fillStyle = g; ctx.fillRect(team.cx - 400, 400, 800, 850);
      ctx.restore();
    }
    drawCommander(team, t);
    // yerdeki askerler
    team.ground.forEach((g, i) => {
      const p = team.order[1 + team.windows.length + i];
      if (p) drawGroundArcher(team, p, g, t);
    });
    if (team.overflow > 0) {
      const x = team.red ? 30 : W - 30, y = 1215;
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fillStyle = team.color; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#f5c242'; ctx.stroke();
      text(`+${team.overflow}`, x, y + 1, { size: team.overflow > 99 ? 15 : 20, stroke: 'rgba(0,0,0,0.5)', strokeW: 4 });
    }
  }

  function drawArrow(a) {
    ctx.save();
    ctx.translate(a.x, a.y); ctx.rotate(a.ang);
    const g = ctx.createLinearGradient(-70, 0, 0, 0);
    g.addColorStop(0, a.team.glow + '0)'); g.addColorStop(1, a.team.glow + '0.75)');
    ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-10, 0); ctx.stroke();
    ctx.strokeStyle = '#6b4220'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.fillStyle = '#d9dde2';
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(8, -5); ctx.lineTo(8, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = a.team.color;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-30, -6); ctx.lineTo(-26, 0); ctx.lineTo(-30, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawBall(b) {
    ctx.save();
    const g = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, 16);
    g.addColorStop(0, '#777'); g.addColorStop(1, '#111');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, 15, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const k = p.life / p.max;
      if (p.type === 'smoke') {
        ctx.fillStyle = `rgba(${p.color},${0.45 * k})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.6 - k * 0.6), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const k = p.life / p.max;
      if (p.type === 'fire') {
        const r = p.size * (0.5 + k * 0.6);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(255,240,180,${k})`); g.addColorStop(0.4, `rgba(255,150,30,${0.8 * k})`); g.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color; ctx.globalAlpha = k;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.type === 'ring') {
        ctx.strokeStyle = `rgba(255,220,150,${k})`; ctx.lineWidth = 10 * k;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - k) + 10, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
    for (const p of particles) {
      const k = p.life / p.max;
      if (p.type === 'debris') {
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, k * 2);
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.type === 'plus') {
        ctx.globalAlpha = Math.min(1, k * 1.5);
        ctx.fillStyle = p.color; ctx.strokeStyle = '#0a5a14'; ctx.lineWidth = 2;
        const s = p.size, q = s / 3;
        ctx.beginPath();
        ctx.rect(p.x - s / 2, p.y - q / 2, s, q); ctx.rect(p.x - q / 2, p.y - s / 2, q, s);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawFloats() {
    for (const f of floats) {
      const k = f.life / f.max;
      ctx.globalAlpha = Math.min(1, k * 2);
      const s = f.size * (1 + (1 - k) * 0.15);
      text(f.str, f.x, f.y, { size: s, color: f.color, stroke: 'rgba(40,10,0,0.85)', strokeW: Math.max(4, s / 6) });
    }
    ctx.globalAlpha = 1;
  }

  // ---------------- Arayüz (HUD) ----------------
  function castleIcon(x, y, s, color) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - s * 0.5, y - s * 0.1, s, s * 0.6);
    for (let i = 0; i < 3; i++) ctx.fillRect(x - s * 0.5 + i * s * 0.4, y - s * 0.35, s * 0.2, s * 0.3);
    ctx.fillStyle = color;
    roundRect(x - s * 0.13, y + s * 0.15, s * 0.26, s * 0.35, s * 0.12); ctx.fill();
    ctx.restore();
  }
  function peopleIcon(x, y, s, color = '#fff') {
    ctx.save(); ctx.fillStyle = color;
    [[-0.45, 0.8], [0.45, 0.8], [0, 1]].forEach(([dx, k]) => {
      ctx.beginPath(); ctx.arc(x + dx * s, y - s * 0.3 * k, s * 0.26 * k, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + dx * s, y + s * 0.35, s * 0.42 * k, s * 0.3 * k, 0, Math.PI, 0); ctx.fill();
    });
    ctx.restore();
  }

  function drawTeamPanel(team) {
    const x = team.red ? 20 : W - 20 - 342, y = 84, w = 342, h = 120;
    ctx.save();
    // gövde
    roundRect(x, y, w, h, 18);
    ctx.fillStyle = vGrad(y, y + h, [team.light, team.color, team.dark]);
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 5; ctx.strokeStyle = vGrad(y, y + h, GOLD); ctx.stroke();
    // kale ikonu
    const ix = team.red ? x + 42 : x + w - 42;
    roundRect(ix - 26, y + 12, 52, 52, 10);
    ctx.fillStyle = team.dark; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#f5c242'; ctx.stroke();
    castleIcon(ix, y + 38, 30, team.dark);
    const tx = team.red ? x + 198 : x + w - 198;
    text(team.name, tx, y + 32, { size: 32, stroke: 'rgba(0,0,0,0.55)', strokeW: 6, maxW: 250 });
    text(`${fmt(team.hp)} / ${fmt(team.maxHp)}`, tx, y + 66, { size: 26, stroke: 'rgba(0,0,0,0.55)', strokeW: 5 });
    // can barı
    const bx = x + 20, by = y + 86, bw = w - 40, bh = 22;
    roundRect(bx, by, bw, bh, 11); ctx.fillStyle = 'rgba(20,10,10,0.75)'; ctx.fill();
    const ratio = clamp(team.shownHp / team.maxHp, 0, 1);
    const real = clamp(team.hp / team.maxHp, 0, 1);
    if (ratio > real) { // geciken hasar izi
      ctx.save(); roundRect(bx + 3, by + 3, (bw - 6) * ratio, bh - 6, 8); ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.fill(); ctx.restore();
    }
    if (real > 0) {
      roundRect(bx + 3, by + 3, Math.max(14, (bw - 6) * real), bh - 6, 8);
      ctx.fillStyle = team.red ? vGrad(by, by + bh, ['#ff9a8a', '#ff2d2d', '#a3070b']) : vGrad(by, by + bh, ['#a8e4ff', '#2f9bff', '#0b48b3']);
      ctx.fill();
      roundRect(bx + 8, by + 5, Math.max(6, (bw - 16) * real), 5, 3); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    }
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,215,120,0.7)'; roundRect(bx, by, bw, bh, 11); ctx.stroke();
    // oyuncu sayısı
    const px = x + w / 2, py = y + h + 18;
    roundRect(px - 100, py - 18, 200, 38, 14);
    ctx.fillStyle = vGrad(py - 18, py + 20, [team.color, team.dark]); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#f5c242'; ctx.stroke();
    peopleIcon(px - 72, py + 1, 20);
    text(`${team.members.length} OYUNCU`, px + 14, py + 2, { size: 24, stroke: 'rgba(0,0,0,0.45)', strokeW: 4, maxW: 140 });
    // kalkan rozeti
    if (shielded(team)) shieldIcon(team.red ? px + 126 : px - 126, py + 1, 20);
    ctx.restore();
  }

  function drawLogo() {
    const cx = W / 2;
    ctx.save();
    // kurdele
    const ry = 84, rw = 232;
    ctx.fillStyle = '#7d0c10';
    ctx.beginPath(); ctx.moveTo(cx - rw / 2 - 30, ry - 6); ctx.lineTo(cx - rw / 2, ry - 6); ctx.lineTo(cx - rw / 2, ry + 44); ctx.lineTo(cx - rw / 2 - 30, ry + 44); ctx.lineTo(cx - rw / 2 - 16, ry + 19); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + rw / 2 + 30, ry - 6); ctx.lineTo(cx + rw / 2, ry - 6); ctx.lineTo(cx + rw / 2, ry + 44); ctx.lineTo(cx + rw / 2 + 30, ry + 44); ctx.lineTo(cx + rw / 2 + 16, ry + 19); ctx.closePath(); ctx.fill();
    roundRect(cx - rw / 2, ry - 12, rw, 62, 10);
    ctx.fillStyle = vGrad(ry - 12, ry + 50, ['#ff5148', '#c8141b', '#7d0c10']); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#f5c242'; ctx.stroke();
    const goldText = (s, y, size) => {
      ctx.font = `${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12; ctx.strokeStyle = '#4a1d00'; ctx.strokeText(s, cx, y);
      ctx.fillStyle = vGrad(y - size / 2, y + size / 2, ['#fff7c0', '#ffd23c', '#f09a10', '#c06a00']);
      ctx.fillText(s, cx, y);
    };
    goldText('KULE', 46, 62);
    ctx.save(); ctx.translate(cx, 113); ctx.scale(0.86, 1); ctx.translate(-cx, -113);
    goldText('SAVAŞLARI', 113, 48);
    ctx.restore();
    ctx.restore();
  }

  function drawTimer() {
    const cx = W / 2, y = 150;
    ctx.save();
    roundRect(cx - 100, y, 200, 64, 16);
    ctx.fillStyle = vGrad(y, y + 64, ['#3a3a52', '#1b1b2a']); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = vGrad(y, y + 64, GOLD); ctx.stroke();
    // saat ikonu
    ctx.beginPath(); ctx.arc(cx - 58, y + 32, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c242'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - 58, y + 32, 12, 0, Math.PI * 2); ctx.fillStyle = '#1b1b2a'; ctx.fill();
    ctx.strokeStyle = '#f5c242'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 58, y + 32); ctx.lineTo(cx - 58, y + 24); ctx.moveTo(cx - 58, y + 32); ctx.lineTo(cx - 52, y + 35); ctx.stroke();
    const s = Math.ceil(timeLeft);
    const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
    const urgent = state === 'playing' && s <= 10;
    text(`${mm}:${ss}`, cx + 18, y + 34, { size: 42, color: urgent ? (Math.floor(timeLeft * 2) % 2 ? '#ff5a4a' : '#fff') : '#fff' });
    // galibiyet sayacı
    const wy = y + 84;
    roundRect(cx - 62, wy - 15, 124, 30, 12); ctx.fillStyle = 'rgba(20,20,35,0.75)'; ctx.fill();
    text(`${T.red.wins}`, cx - 30, wy + 1, { size: 22, color: '#ff7a6a' });
    text('-', cx, wy + 1, { size: 22, color: '#ffd34d' });
    text(`${T.blue.wins}`, cx + 30, wy + 1, { size: 22, color: '#7ab8ff' });
    ctx.restore();
  }

  function drawFeed() {
    const t = nowS();
    let y = 276;
    for (const f of feedItems) {
      const age = t - f.t;
      if (age > 7) continue;
      const a = Math.min(1, (7 - age) / 1);
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `16px ${FONT}`;
      const tw = Math.min(ctx.measureText(f.str).width, 250);
      roundRect(W / 2 - tw / 2 - 12, y - 14, tw + 24, 28, 14);
      ctx.fillStyle = f.team.red ? 'rgba(150,15,20,0.75)' : 'rgba(15,50,150,0.75)'; ctx.fill();
      text(f.str, W / 2, y + 1, { size: 16, maxW: 250 });
      ctx.restore();
      y += 34;
    }
  }

  // ---------------- İkonlar ----------------
  function heartIcon(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    // ok
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * 0.95, s * 0.15); ctx.lineTo(s * 0.95, -s * 0.15); ctx.stroke();
    ctx.fillStyle = '#e8e8ee';
    ctx.beginPath(); ctx.moveTo(s * 1.08, -s * 0.17); ctx.lineTo(s * 0.86, -s * 0.28); ctx.lineTo(s * 0.9, -s * 0.04); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e0262b';
    ctx.beginPath(); ctx.moveTo(-s * 0.8, s * 0.12); ctx.lineTo(-s * 1.0, s * 0.02); ctx.lineTo(-s * 0.95, s * 0.16); ctx.lineTo(-s * 1.02, s * 0.3); ctx.closePath(); ctx.fill();
    // kalp
    ctx.beginPath();
    const k = s * 0.62;
    ctx.moveTo(0, k * 0.85);
    ctx.bezierCurveTo(-k * 1.3, 0, -k * 0.75, -k * 1.05, 0, -k * 0.45);
    ctx.bezierCurveTo(k * 0.75, -k * 1.05, k * 1.3, 0, 0, k * 0.85);
    ctx.fillStyle = vGrad(-k, k, ['#ff9ad0', '#ff3d8b', '#c0145a']); ctx.fill();
    ctx.lineWidth = s * 0.06; ctx.strokeStyle = '#7a0a35'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-k * 0.38, -k * 0.38, k * 0.18, k * 0.1, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
    ctx.restore();
  }
  function cannonIcon(x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.rotate(-0.35);
    roundRect(-s * 0.7, -s * 0.22, s * 1.35, s * 0.44, s * 0.2);
    ctx.fillStyle = vGrad(-s * 0.22, s * 0.22, ['#6a6a72', '#24242a', '#101014']); ctx.fill();
    ctx.fillStyle = '#e8a71c';
    ctx.fillRect(-s * 0.2, -s * 0.24, s * 0.1, s * 0.48);
    ctx.fillRect(s * 0.5, -s * 0.26, s * 0.12, s * 0.52);
    ctx.restore();
    ctx.fillStyle = '#b8452a';
    roundRect(-s * 0.55, s * 0.05, s * 0.8, s * 0.32, s * 0.08); ctx.fill();
    ctx.beginPath(); ctx.arc(-s * 0.15, s * 0.38, s * 0.26, 0, Math.PI * 2);
    ctx.fillStyle = '#f2b93b'; ctx.fill(); ctx.lineWidth = s * 0.06; ctx.strokeStyle = '#7a4a05'; ctx.stroke();
    // alev
    const g = ctx.createRadialGradient(s * 0.75, -s * 0.3, 0, s * 0.75, -s * 0.3, s * 0.45);
    g.addColorStop(0, 'rgba(255,250,200,1)'); g.addColorStop(0.4, 'rgba(255,170,40,0.9)'); g.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s * 0.75, -s * 0.3, s * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function shieldIcon(x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.quadraticCurveTo(s * 0.45, -s * 0.6, s * 0.75, -s * 0.62);
    ctx.quadraticCurveTo(s * 0.8, s * 0.35, 0, s * 0.9);
    ctx.quadraticCurveTo(-s * 0.8, s * 0.35, -s * 0.75, -s * 0.62);
    ctx.quadraticCurveTo(-s * 0.45, -s * 0.6, 0, -s * 0.85);
    ctx.closePath();
    ctx.fillStyle = vGrad(-s, s, ['#9fe0ff', '#2f8cff', '#0a3fa8']); ctx.fill();
    ctx.lineWidth = s * 0.12; ctx.strokeStyle = vGrad(-s, s, GOLD); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -s * 0.6); ctx.lineTo(0, s * 0.6);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = s * 0.08; ctx.stroke();
    ctx.restore();
  }
  function hammerIcon(x, y, s) {
    ctx.save(); ctx.translate(x - s * 0.1, y);
    ctx.save(); ctx.rotate(-0.7);
    roundRect(-s * 0.08, -s * 0.2, s * 0.16, s * 1.1, s * 0.06);
    ctx.fillStyle = vGrad(0, s, ['#c98a4b', '#7a4a1e']); ctx.fill();
    roundRect(-s * 0.42, -s * 0.5, s * 0.84, s * 0.34, s * 0.06);
    ctx.fillStyle = vGrad(-s * 0.5, -s * 0.16, ['#f2f4f8', '#a9b0bb', '#6d7480']); ctx.fill();
    ctx.lineWidth = s * 0.04; ctx.strokeStyle = '#3d424a'; ctx.stroke();
    ctx.restore();
    // yeşil artı
    const px = s * 0.55, py = s * 0.3, a = s * 0.42, b = s * 0.15;
    ctx.fillStyle = '#3ddc4a'; ctx.strokeStyle = '#0c5a14'; ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(px - b, py - a); ctx.lineTo(px + b, py - a); ctx.lineTo(px + b, py - b); ctx.lineTo(px + a, py - b); ctx.lineTo(px + a, py + b);
    ctx.lineTo(px + b, py + b); ctx.lineTo(px + b, py + a); ctx.lineTo(px - b, py + a); ctx.lineTo(px - b, py + b); ctx.lineTo(px - a, py + b);
    ctx.lineTo(px - a, py - b); ctx.lineTo(px - b, py - b); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function crownIcon(x, y, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.5); ctx.lineTo(-s, -s * 0.3); ctx.lineTo(-s * 0.5, s * 0.1); ctx.lineTo(0, -s * 0.6);
    ctx.lineTo(s * 0.5, s * 0.1); ctx.lineTo(s, -s * 0.3); ctx.lineTo(s, s * 0.5); ctx.closePath();
    ctx.fillStyle = vGrad(-s, s, GOLD); ctx.fill();
    ctx.lineWidth = s * 0.1; ctx.strokeStyle = '#6a3a00'; ctx.stroke();
    ctx.restore();
  }
  const ICONS = { like: heartIcon, cannon: cannonIcon, shield: shieldIcon, repair: hammerIcon, crown: crownIcon };

  function drawJoinPills(t) {
    const pulse = 1 + Math.sin(t * 3) * 0.025;
    [[T.red, 300, 'katıl kırmızı'], [T.blue, 724, 'katıl mavi']].forEach(([team, x, label]) => {
      const y = 1352, w = 320 * pulse, h = 60 * pulse;
      ctx.save();
      roundRect(x - w / 2, y - h / 2, w, h, h / 2);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.fillStyle = vGrad(y - h / 2, y + h / 2, [team.light, team.color, team.dark]); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
      peopleIcon(x - 116, y + 2, 24);
      text(label, x + 20, y + 2, { size: 36, stroke: 'rgba(0,0,0,0.4)', strokeW: 5, maxW: 205 });
      ctx.restore();
    });
  }

  function drawActionPanel() {
    const x = 18, y = 1392, w = W - 36, h = 172;
    ctx.save();
    roundRect(x, y, w, h, 24);
    ctx.fillStyle = vGrad(y, y + h, ['rgba(22,40,105,0.95)', 'rgba(10,18,55,0.95)']); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = vGrad(y, y + h, GOLD); ctx.stroke();
    const cards = [
      ['like', 'BEĞEN · OK', `${C.LIKE_DAMAGE} hasar / beğeni`],
      ['cannon', 'TOP SALDIRISI', `🎁 ${C.LABELS.cannon}`],
      ['shield', 'KALKAN', `🎁 ${C.LABELS.shield} · ${C.SHIELD_SECONDS} sn`],
      ['repair', 'TAMİR', `🎁 ${C.LABELS.repair}`],
    ];
    const cw = (w - 20 - 3 * 10) / 4;
    cards.forEach(([key, label, sub], i) => {
      const cx = x + 10 + i * (cw + 10), cy = y + 10, ch = h - 20;
      roundRect(cx, cy, cw, ch, 16);
      ctx.fillStyle = vGrad(cy, cy + ch, ['#2b4fb5', '#152a6e']); ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(255,215,110,0.8)'; ctx.stroke();
      ICONS[key](cx + cw / 2, cy + 50, 42);
      text(sub, cx + cw / 2, cy + 100, { size: 16, color: '#ffe48a', maxW: cw - 12 });
      roundRect(cx + 10, cy + ch - 40, cw - 20, 32, 12);
      ctx.fillStyle = vGrad(cy + ch - 40, cy + ch - 8, ['#2a2f3f', '#0e1018']); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#f5c242'; ctx.stroke();
      text(label, cx + cw / 2, cy + ch - 23, { size: 20, maxW: cw - 30 });
    });
    ctx.restore();
    text(C.FOOTER_TEXT, W / 2, 1592, { size: 34, italic: true, stroke: 'rgba(10,15,50,0.9)', strokeW: 7 });
  }

  function drawLeaderboard() {
    const y = 1622, h = 186;
    [T.red, T.blue].forEach((team, idx) => {
      const x = idx === 0 ? 18 : W / 2 + 6, w = W / 2 - 24;
      ctx.save();
      roundRect(x, y, w, h, 18);
      ctx.fillStyle = team.red ? 'rgba(90,8,12,0.82)' : 'rgba(8,30,95,0.82)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(245,194,66,0.85)'; ctx.stroke();
      text(`🏆 EN İYİ ${team.short}`, x + w / 2, y + 22, { size: 22, color: '#ffd34d', stroke: 'rgba(0,0,0,0.5)', strokeW: 4 });
      const top = team.order.slice(0, 5);
      if (!top.length) text(`"${team.red ? 'katıl kırmızı' : 'katıl mavi'}" yaz!`, x + w / 2, y + 100, { size: 22, color: 'rgba(255,255,255,0.75)' });
      top.forEach((p, i) => {
        const ly = y + 54 + i * 27;
        text(`${i + 1}.`, x + 26, ly, { size: 19, color: i === 0 ? '#ffd34d' : '#fff' });
        text(p.name, x + 46, ly, { size: 19, align: 'left', maxW: w - 150 });
        text(fmt(p.score), x + w - 18, ly, { size: 19, align: 'right', color: '#ffe48a' });
      });
      ctx.restore();
    });
  }

  function drawBanner() {
    const b = currentBanner;
    if (!b) return;
    const k = b.life / b.max;
    const inK = clamp((1 - k) / 0.15, 0, 1), outK = clamp(k / 0.15, 0, 1);
    const s = (0.6 + 0.4 * inK) * (0.9 + 0.1 * outK);
    const cy = 640;
    ctx.save();
    ctx.globalAlpha = outK;
    ctx.translate(W / 2, cy); ctx.scale(s, s);
    roundRect(-250, -62, 500, 124, 26);
    ctx.fillStyle = vGrad(-62, 62, [b.team.light, b.team.color, b.team.dark]);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 6; ctx.strokeStyle = vGrad(-62, 62, GOLD); ctx.stroke();
    if (ICONS[b.icon]) ICONS[b.icon](-185, 0, 44);
    text(b.title, 40, -22, { size: 40, stroke: 'rgba(0,0,0,0.55)', strokeW: 7, maxW: 330 });
    text(b.sub, 40, 28, { size: 34, color: '#ffe14d', stroke: 'rgba(0,0,0,0.6)', strokeW: 6, maxW: 340 });
    ctx.restore();
  }

  function drawCountdown() {
    if (state !== 'countdown') return;
    const c = Math.ceil(stateT);
    const str = c > 0 ? String(c) : 'SAVAŞ!';
    const frac = c > 0 ? stateT - Math.floor(stateT) : (stateT + 0.6) / 0.6;
    const s = 0.8 + frac * 0.5;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, 760); ctx.scale(s, s);
    text(str, 0, 0, { size: c > 0 ? 200 : 130, color: '#ffd34d', stroke: '#4a1d00', strokeW: 16 });
    ctx.restore();
    text('Takımını seç: "katıl kırmızı" / "katıl mavi"', W / 2, 920, { size: 34, stroke: 'rgba(0,0,0,0.7)', strokeW: 7 });
  }

  function drawResult(t) {
    if (state !== 'ended' || !result) return;
    const wnr = result.winner;
    ctx.save();
    ctx.fillStyle = 'rgba(5,8,25,0.62)'; ctx.fillRect(0, 0, W, H);
    // ışınlar
    ctx.translate(W / 2, 640);
    ctx.save(); ctx.rotate(t * 0.3);
    for (let i = 0; i < 16; i++) {
      ctx.rotate(Math.PI / 8);
      ctx.fillStyle = wnr ? (wnr.red ? 'rgba(255,90,60,0.12)' : 'rgba(80,160,255,0.12)') : 'rgba(255,220,120,0.1)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -700); ctx.lineTo(60, -700); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const cmd = wnr && wnr.order[0];
    const img = wnr ? (wnr.red ? IMG.king_red : IMG.queen_blue) : null;
    if (img && img.naturalWidth) {
      const h = 380, iw = img.naturalWidth * h / img.naturalHeight;
      ctx.drawImage(img, -iw / 2, -300 + Math.sin(t * 2) * 6, iw, h);
    }
    ctx.restore();
    text(result.reason, W / 2, 330, { size: 40, color: '#fff', stroke: 'rgba(0,0,0,0.7)', strokeW: 7 });
    const title = wnr ? `${wnr.name} KAZANDI!` : 'BERABERE!';
    text(title, W / 2, 870, { size: 80, color: wnr ? (wnr.red ? '#ff6a5a' : '#6ab0ff') : '#ffd34d', stroke: '#fff', strokeW: 10, maxW: 960 });
    if (cmd) {
      text(`👑 KOMUTAN: ${cmd.name}`, W / 2, 960, { size: 44, color: '#ffd34d', stroke: '#3a1800', strokeW: 8 });
      result.mvp.slice(1).forEach((p, i) => text(`${i + 2}. ${p.name}  ·  ${fmt(p.score)} puan`, W / 2, 1030 + i * 50, { size: 32, stroke: 'rgba(0,0,0,0.7)', strokeW: 6 }));
    }
    text(`Yeni tur ${Math.ceil(stateT)} sn sonra başlıyor`, W / 2, 1180, { size: 30, color: '#cfe3ff', stroke: 'rgba(0,0,0,0.7)', strokeW: 6 });
  }

  function draw(t) {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));
    drawBackground();
    drawTower(T.red, t);
    drawTower(T.blue, t);
    for (const b of balls) drawBall(b);
    for (const a of arrows) drawArrow(a);
    drawParticles();
    drawShield(T.red, t);
    drawShield(T.blue, t);
    drawFloats();
    ctx.restore();
    // arayüz sallanmaz
    drawTeamPanel(T.red);
    drawTeamPanel(T.blue);
    drawLogo();
    drawTimer();
    drawFeed();
    drawJoinPills(t);
    drawActionPanel();
    drawLeaderboard();
    drawBanner();
    drawCountdown();
    drawResult(t);
  }

  // ------------------------------------------------------------------
  // Demo / test botları
  // ------------------------------------------------------------------
  let demo = params.get('demo') === '1';
  const BOT_NAMES = ['melis', 'kaan', 'elif', 'burak', 'mert', 'can', 'selin', 'yagiz', 'cem', 'eda', 'talha', 'zeynep',
    'arda', 'ayse', 'selina', 'emre', 'ege', 'deniz', 'ipek', 'hilal', 'kerem', 'simge', 'ozan', 'berk', 'irem', 'umut',
    'derya', 'tuna', 'efe', 'asli', 'baris', 'naz', 'onur', 'gizem', 'kerim', 'sude', 'alp', 'buse', 'emir', 'damla',
    'yusuf', 'ceren', 'eren', 'melek', 'batu', 'nil', 'koray', 'duru', 'sarp', 'lara'];
  let demoAcc = 0;
  function demoUser() { const n = pick(BOT_NAMES) + randi(1, 99); return { id: n, name: n }; }
  function demoTick(dt) {
    demoAcc += dt;
    while (demoAcc > 0.12) {
      demoAcc -= 0.12;
      const all = [...players.values()];
      const r = Math.random();
      if (all.length < 50 && (r < 0.12 || all.length < 6)) {
        const u = demoUser();
        onChat(u, pick(['katıl kırmızı', 'katıl mavi', 'katil a', 'katıl b', 'mavi', 'kırmızı']));
      } else if (all.length && r < 0.93) {
        const p = pick(all);
        onLike({ id: p.id, name: p.id }, randi(1, 8));
      } else if (all.length) {
        const p = pick(all);
        const g = pick([['Rose', 1], ['Rose', 1], ['Finger Heart', 5], ['Doughnut', 30], ['Perfume', 20], ['GG', 1]]);
        onGift({ id: p.id, name: p.id }, g[0], g[1], 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Ana döngü
  // ------------------------------------------------------------------
  let lastT = performance.now();
  function loop(ts) {
    const dt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;
    update(dt);
    draw(ts / 1000);
    requestAnimationFrame(loop);
  }
  Promise.all([imagesReady, document.fonts ? Promise.all([
    document.fonts.load('40px "Oyun"', 'ABC abc 123'),
    document.fonts.load('40px "Oyun"', 'İŞĞÜÖÇışğüöç'),
  ]).catch(() => {}) : null])
    .then(() => { relayout(true); requestAnimationFrame(loop); });

  // ------------------------------------------------------------------
  // Dış dünyaya açılan API (bağlantı ve test paneli kullanır)
  // ------------------------------------------------------------------
  window.KS = {
    handle(evt) {
      if (!evt || !evt.user) return;
      if (evt.type === 'chat') onChat(evt.user, evt.comment || '');
      else if (evt.type === 'like') onLike(evt.user, evt.count || 1);
      else if (evt.type === 'gift') onGift(evt.user, evt.giftName || '', evt.coins || 1, evt.count || 1);
    },
    setDemo(v) { demo = !!v; return demo; },
    get demo() { return demo; },
    toggleSound() { return Sound.toggle(); },
    resetRound() { resetRound(); },
    resetWins() { T.red.wins = 0; T.blue.wins = 0; saveWins(); },
    clearPlayers() { players.clear(); T.red.members = []; T.blue.members = []; relayout(true); },
    testUser: demoUser,
    stats() { return { state, red: T.red.hp, blue: T.blue.hp, players: players.size, arrows: arrows.length }; },
  };
})();
