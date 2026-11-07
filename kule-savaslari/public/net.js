/* =====================================================================
   Bağlantı katmanı
   1) Kendi sunucumuz (server.js) -> ws://<bu sayfanın adresi>/ws
   2) TikFinity / TikTok-Live-Connector biçiminde yayın yapan başka bir
      WebSocket -> sayfayı ?ws=ws://localhost:21213/ ile aç
   ===================================================================== */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const listeners = [];
  const Net = {
    status: 'bağlantı yok', live: false, ws: null,
    onStatus(fn) { listeners.push(fn); fn(Net.status, Net.live); },
    send(obj) { if (Net.ws && Net.ws.readyState === 1) Net.ws.send(JSON.stringify(obj)); },
  };
  function setStatus(s, live) {
    Net.status = s; Net.live = !!live;
    listeners.forEach(fn => fn(s, Net.live));
  }

  // TikTok-Live-Connector (eski v1 / TikFinity) biçimini oyunun biçimine çevir
  const streaks = new Map();
  function legacyUser(d) {
    return { id: String(d.uniqueId || d.userId || d.user?.uniqueId || ''), name: d.uniqueId || d.user?.uniqueId || '', nick: d.nickname || d.user?.nickname || '' };
  }
  function fromLegacy(event, d) {
    if (!d) return null;
    const user = legacyUser(d);
    if (!user.id) return null;
    if (event === 'chat') return { type: 'chat', user, comment: d.comment || '' };
    if (event === 'like') return { type: 'like', user, count: Number(d.likeCount) || 1 };
    if (event === 'gift') {
      const giftType = Number(d.giftType ?? d.giftDetails?.giftType ?? 0);
      const repeat = Number(d.repeatCount) || 1;
      const key = user.id + ':' + (d.giftId || d.giftName);
      let count = repeat;
      if (giftType === 1) {
        const prev = streaks.get(key) || 0;
        count = repeat >= prev ? repeat - prev : repeat;
        if (d.repeatEnd) streaks.delete(key); else streaks.set(key, repeat);
        if (count <= 0) return null;
      }
      return { type: 'gift', user, giftName: d.giftName || d.giftDetails?.giftName || '', coins: Number(d.diamondCount ?? d.giftDetails?.diamondCount) || 1, count };
    }
    return null;
  }

  function connect(url, mode) {
    let retry = 1000;
    const open = () => {
      let ws;
      try { ws = new WebSocket(url); } catch (e) { setStatus('adres hatalı: ' + url); return; }
      Net.ws = ws;
      ws.onopen = () => { retry = 1000; setStatus(mode === 'server' ? 'sunucuya bağlandı' : 'TikFinity bağlı', mode !== 'server'); };
      ws.onmessage = ev => {
        let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
        if (mode === 'server') {
          if (msg.type === 'status') setStatus(msg.text, msg.live);
          else window.KS && window.KS.handle(msg);
        } else {
          const evt = fromLegacy(msg.event, msg.data);
          if (evt) window.KS && window.KS.handle(evt);
        }
      };
      ws.onclose = () => {
        setStatus('bağlantı koptu, yeniden deneniyor…');
        setTimeout(open, retry); retry = Math.min(retry * 2, 15000);
      };
    };
    open();
  }

  const external = params.get('ws');
  if (external) connect(external, 'external');
  else if (location.protocol.startsWith('http')) connect(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`, 'server');
  else setStatus('dosyadan açıldı: sadece demo/test modu');

  // ?user=kullaniciadi ile sayfa açılınca otomatik bağlan
  const autoUser = params.get('user');
  if (autoUser) {
    const tryConnect = () => { if (Net.ws && Net.ws.readyState === 1) Net.send({ type: 'connect', username: autoUser }); else setTimeout(tryConnect, 500); };
    tryConnect();
  }
  window.Net = Net;
})();
