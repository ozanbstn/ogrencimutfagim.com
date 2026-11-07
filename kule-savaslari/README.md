# ⚔️ Kule Savaşları — TikTok LIVE oyunu

İzleyiciler sohbete yazarak **Kırmızı** ya da **Mavi** takıma katılır, beğenileriyle ok atar,
hediyeleriyle top atışı, kalkan ve tamir kullanır. Karşı kulenin canını bitiren takım kazanır.

## Oyun kuralları

| İzleyici ne yapar | Oyunda ne olur |
|---|---|
| Sohbete `katıl kırmızı` / `katıl a` / `kırmızı` yazar | Kırmızı kuleye okçu olarak girer, altında TikTok kullanıcı adı yazar |
| Sohbete `katıl mavi` / `katıl b` / `mavi` yazar | Mavi kuleye okçu olarak girer |
| **Beğeni** atar | Okçusu karşı kuleye ok atar (1 beğeni = 3 hasar) |
| **Donut** (veya 20+ jetonluk hediye) | 💣 Top saldırısı: büyük hasar |
| **Parmak Kalp** (veya 5–19 jeton) | 🛡 Kalkan: kule 5 saniye hiçbir saldırıdan etkilenmez (üst üste eklenir) |
| **Gül** (veya 1–4 jeton) | 🔨 Tamir: kulenin canı artar |

- En çok beğeni + hediye atan oyuncu kulenin tepesinde **👑 Komutan** (kral / kraliçe) olarak görünür.
  Diğerleri puan sırasına göre pencerelere, sonra kulenin önüne dizilir (takım başına 22 asker görünür, fazlası `+N` olarak yazılır).
- Takım seçmeden beğeni/hediye atan izleyici, otomatik olarak az kişili takıma eklenir.
- Tur 3 dakika sürer. Kule yıkılırsa ya da süre biterse kazanan ilan edilir, 10 saniye sonra yeni tur başlar.
  Galibiyet sayısı logonun altında tutulur.

Bütün sayılar (can, hasar, süre, hangi hediyenin ne yaptığı) **`public/config.js`** dosyasından değiştirilebilir.

## Kurulum (bir kere)

1. [Node.js](https://nodejs.org) indir ve kur (LTS sürümü).
2. Bu `kule-savaslari` klasöründe bir terminal aç ve şunu çalıştır:
   ```
   npm install
   ```

## Yayında kullanma

1. TikTok'ta canlı yayını aç.
2. Klasörde terminalde çalıştır (kendi kullanıcı adınla):
   ```
   npm start -- kullaniciadin
   ```
   Kullanıcı adını yazmadan `npm start` dersen, oyun ekranında **H** tuşuna basıp panelden de bağlanabilirsin.
3. Tarayıcıda **http://localhost:3000** adresini aç. Paneldeki yeşil durum yazısı bağlantının kurulduğunu gösterir.
4. Oyun ekranını yayına ekle (dikey 1080×1920):
   - **OBS / Streamlabs:** Kaynak ekle → *Tarayıcı (Browser)* → adres `http://localhost:3000`, genişlik `1080`, yükseklik `1920`.
   - **TikTok LIVE Studio:** Oyunu ayrı bir pencerede aç ve *Pencere yakalama* ile ekle. Adres çubuğu olmayan temiz bir pencere için:
     ```
     chrome --app=http://localhost:3000 --window-size=540,960
     ```
     (LIVE Studio sürümünde web/link kaynağı varsa doğrudan `http://localhost:3000` adresini de verebilirsin.)

> Ses: OBS içinde kendiliğinden çalışır. Normal tarayıcıda sesin açılması için oyun ekranına bir kez tıklaman gerekir.
> Pencere yakalamada sesi ayrıca yayına vermen gerekebilir.

## Test etme (yayın açmadan)

- `http://localhost:3000/?demo=1` → sahte izleyiciler katılır, beğeni ve hediye atar.
- **H** tuşu: kontrol paneli (yayında görünmemesi için normalde gizli). Panelden tek tek oyuncu, beğeni, top, kalkan, tamir deneyebilirsin.
- Kısayollar: `D` demo aç/kapat · `M` ses · `R` turu yeniden başlat · `1`/`2` oyuncu ekle · `Q`/`W` beğeni.
- Sunucu olmadan da `public/index.html` dosyasına çift tıklayıp **D** tuşuyla demo modunu deneyebilirsin.

## TikFinity ile kullanma (isteğe bağlı)

TikFinity kullanıyorsan Node sunucusuna gerek kalmadan oyunu TikFinity'nin WebSocket'ine bağlayabilirsin:
```
public/index.html?ws=ws://localhost:21213/
```

## Notlar

- TikTok bağlantısı resmi olmayan [tiktok-live-connector](https://github.com/zerodytrash/TikTok-Live-Connector) kütüphanesiyle yapılır.
  Bağlantı koparsa ya da yayın henüz açılmadıysa sunucu kendiliğinden tekrar dener.
- Çok yoğun yayınlarda bağlantı limitlerine takılırsan [Euler Stream](https://www.eulerstream.com) anahtarı alıp
  `SIGN_API_KEY=anahtar npm start -- kullaniciadin` şeklinde çalıştırabilirsin.
- Hediye isimleri TikTok'un İngilizce adlarıyla eşleşir (`Rose`, `Finger Heart`, `Doughnut`…). Farklı bir hediye eklemek için
  `config.js` içindeki `GIFTS` listesine ekle. Terminal her gelen hediyenin adını yazar.
- Görseller: `public/assets/` (arka plan ve karakterler). Yazı tipi: Baloo 2 (OFL lisansı).
