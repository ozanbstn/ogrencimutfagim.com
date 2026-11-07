// =====================================================================
//  KULE SAVAŞLARI - OYUN AYARLARI
//  Bu dosyadaki sayıları değiştirerek oyunu yayınına göre ayarlayabilirsin.
//  Değişiklikten sonra oyun sayfasını yenilemen yeterli.
// =====================================================================
window.GAME_CONFIG = {
  // --- Tur ---
  TOWER_HP: 10000,            // Her kulenin canı
  ROUND_SECONDS: 180,         // Tur süresi (saniye). Süre bitince canı fazla olan kazanır
  RESULT_SECONDS: 10,         // Kazanan ekranı ne kadar kalsın
  COUNTDOWN_SECONDS: 3,       // Yeni tur öncesi geri sayım
  RESET_SCORES_EACH_ROUND: true,  // true: her turda komutanlık puanı sıfırlanır
  KEEP_TEAMS_BETWEEN_ROUNDS: true, // true: oyuncular takımlarında kalır

  // --- Takıma katılma (sohbete yazılan) ---
  // "katıl kırmızı", "katil kirmizi", "katıl a", "join red" veya sadece "kırmızı" yazmak yeter
  RED_WORDS: ['kırmızı', 'kirmizi', 'kırmızi', 'kirmızı', 'red', 'a', 'k'],
  BLUE_WORDS: ['mavi', 'blue', 'b', 'm'],
  JOIN_WORDS: ['katıl', 'katil', 'join', 'katılıyorum'],
  ALLOW_TEAM_SWITCH: false,   // true: oyuncu turun ortasında takım değiştirebilir
  AUTO_JOIN: true,            // true: takım seçmeden beğeni/hediye atanı az kişili takıma koyar
  INACTIVE_REMOVE_MINUTES: 10,// bu kadar dakika hiçbir şey yapmayan oyuncu kuleden iner

  // --- Beğeni = Ok ---
  LIKE_DAMAGE: 3,             // 1 beğeni kaç hasar verir
  MAX_ARROWS_PER_LIKE_EVENT: 3,

  // --- Hediyeler ---
  // TikTok hediye adı (İngilizce adı) hangi aksiyonu tetikler?
  // action: 'cannon' (top saldırısı), 'shield' (kalkan), 'repair' (tamir)
  GIFTS: [
    { match: ['Rose', 'Gül'], action: 'repair' },
    { match: ['Finger Heart', 'Parmak Kalp'], action: 'shield' },
    { match: ['Doughnut', 'Donut'], action: 'cannon' },
  ],
  // Listede olmayan hediyeler jeton değerine göre:
  FALLBACK_CANNON_MIN_COINS: 20, // bu ve üstü -> top saldırısı
  FALLBACK_SHIELD_MIN_COINS: 5,  // bu ve üstü -> kalkan, altı -> tamir

  CANNON_BASE_DAMAGE: 600,    // top atışı hasarı = taban + jeton * çarpan
  CANNON_DAMAGE_PER_COIN: 20,
  CANNON_MAX_DAMAGE: 3000,
  REPAIR_BASE_HP: 200,        // tamir = taban + jeton * çarpan
  REPAIR_HP_PER_COIN: 20,
  SHIELD_SECONDS: 5,          // bir kalkan kaç saniye korur (üst üste gelirse eklenir)
  SHIELD_MAX_SECONDS: 30,

  // Alttaki panelde yazacak hediye isimleri
  LABELS: {
    like: 'BEĞEN',
    cannon: 'Donut',
    shield: 'Parmak Kalp',
    repair: 'Gül',
  },

  // --- Komutanlık puanı ---
  SCORE_PER_LIKE: 1,
  SCORE_PER_COIN: 20,

  // --- Görünüm ---
  NAME_UPPERCASE: true,       // isimleri büyük harfle yaz
  USE_NICKNAME: false,        // false: @kullanıcıadı, true: profil adı
  FOOTER_TEXT: 'Takımını seç, kuleni savun!',
  SOUND: true,
  SOUND_VOLUME: 0.5,
};
