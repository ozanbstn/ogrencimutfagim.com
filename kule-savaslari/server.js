// =====================================================================
//  KULE SAVAŞLARI - TikTok LIVE bağlantı sunucusu
//  Çalıştır:  npm start                 (kullanıcı adını panelden girersin)
//             npm start -- kullaniciadi (doğrudan bağlanır)
//  Sonra tarayıcıda / TikTok LIVE Studio'da:  http://localhost:3000
// =====================================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;
const SIGN_API_KEY = process.env.SIGN_API_KEY || undefined; // isteğe bağlı: eulerstream.com anahtarı

// ---------------- Statik dosyalar ----------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Bulunamadı'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------------- Oyun ekranlarına yayın ----------------
const wss = new WebSocketServer({ server, path: '/ws' });
const broadcast = obj => { const s = JSON.stringify(obj); wss.clients.forEach(c => c.readyState === 1 && c.send(s)); };
let status = { type: 'status', text: 'TikTok bağlı değil', live: false };
function setStatus(text, live = false) {
  status = { type: 'status', text, live };
  console.log(`[durum] ${text}`);
  broadcast(status);
}
wss.on('connection', ws => {
  ws.send(JSON.stringify(status));
  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === 'connect' && msg.username) startTikTok(String(msg.username));
    if (msg.type === 'disconnect') stopTikTok();
  });
});

// ---------------- TikTok bağlantısı ----------------
let conn = null, wantUser = null, retryTimer = null, retryDelay = 5000;
const streaks = new Map();

function user(d) {
  const u = d.user || {};
  return { id: String(u.uniqueId || u.userId || ''), name: u.uniqueId || '', nick: u.nickname || '' };
}

function scheduleRetry(reason) {
  if (!wantUser) return;
  clearTimeout(retryTimer);
  setStatus(`${reason} · ${Math.round(retryDelay / 1000)} sn sonra tekrar denenecek`);
  retryTimer = setTimeout(() => connectNow(wantUser), retryDelay);
  retryDelay = Math.min(retryDelay * 1.5, 60000);
}

async function stopTikTok() {
  wantUser = null;
  clearTimeout(retryTimer);
  if (conn) { const c = conn; conn = null; try { await c.disconnect(); } catch { /* yoksay */ } }
  setStatus('TikTok bağlantısı kapatıldı');
}

async function startTikTok(username) {
  username = username.trim().replace(/^@/, '');
  if (!username) return;
  if (conn) { const c = conn; conn = null; try { await c.disconnect(); } catch { /* yoksay */ } }
  wantUser = username; retryDelay = 5000;
  connectNow(username);
}

async function connectNow(username) {
  if (wantUser !== username) return;
  setStatus(`@${username} canlı yayınına bağlanılıyor…`);
  const c = new TikTokLiveConnection(username, { signApiKey: SIGN_API_KEY, processInitialData: false });
  conn = c;

  c.on(WebcastEvent.CHAT, d => broadcast({ type: 'chat', user: user(d), comment: d.comment || '' }));
  c.on(WebcastEvent.LIKE, d => broadcast({ type: 'like', user: user(d), count: Number(d.likeCount) || 1 }));
  c.on(WebcastEvent.GIFT, d => {
    const u = user(d);
    const details = d.giftDetails || {};
    const giftType = Number(details.giftType || 0);
    const repeat = Number(d.repeatCount) || 1;
    const key = `${u.id}:${d.giftId}`;
    let count = repeat;
    // seri (combo) hediyelerde her artışı anında işle, tekrar sayma
    if (giftType === 1) {
      const prev = streaks.get(key) || 0;
      count = repeat >= prev ? repeat - prev : repeat;
      if (d.repeatEnd) streaks.delete(key); else streaks.set(key, repeat);
      if (count <= 0) return;
    }
    const giftName = details.giftName || d.extendedGiftInfo?.name || '';
    const coins = Number(details.diamondCount || d.extendedGiftInfo?.diamond_count) || 1;
    console.log(`[hediye] ${u.name}: ${giftName} (${coins} jeton) x${count}`);
    broadcast({ type: 'gift', user: u, giftName, coins, count });
  });
  c.on(WebcastEvent.STREAM_END, () => { if (conn === c) { conn = null; scheduleRetry('Yayın bitti'); } });
  c.on(ControlEvent.DISCONNECTED, () => { if (conn === c) { conn = null; scheduleRetry('Bağlantı koptu'); } });
  c.on(ControlEvent.ERROR, e => console.error('[hata]', e?.info || '', e?.exception?.message || e?.exception || ''));

  try {
    const state = await c.connect();
    if (conn !== c) { c.disconnect().catch(() => {}); return; }
    retryDelay = 5000;
    setStatus(`✅ @${username} yayınına bağlandı (oda ${state.roomId})`, true);
  } catch (err) {
    if (conn === c) conn = null;
    const msg = String(err?.message || err);
    const offline = /offline|not live|isn't online|UserOffline/i.test(msg) || err?.constructor?.name === 'UserOfflineError';
    const noRoom = /Room ID/i.test(msg);
    scheduleRetry(offline ? `@${username} şu an canlı yayında değil`
      : noRoom ? `@${username} için canlı yayın bulunamadı (yayın açık mı, kullanıcı adı doğru mu?)`
      : `Bağlanamadı: ${msg.slice(0, 120)}`);
  }
}

server.listen(PORT, () => {
  console.log('\n  ⚔️  KULE SAVAŞLARI hazır');
  console.log(`  Oyun ekranı:   http://localhost:${PORT}`);
  console.log(`  Test (botlar): http://localhost:${PORT}/?demo=1`);
  console.log('  Kontrol paneli için oyun ekranında H tuşuna bas.\n');
  const cli = process.argv[2];
  if (cli) startTikTok(cli);
});
