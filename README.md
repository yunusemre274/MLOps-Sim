# 🎮 MLOps Engineer Simulator

> **Tarayıcı tabanlı yaşam simülasyonu + kariyer simülasyonu oyunu.**
> Gerçekçi Docker/Compose/Kubernetes sözdizimi simülasyonu üzerinden MLOps mühendisliği öğreten, aynı zamanda bir karakterin günlük yaşamını yönettiğiniz "cozy life sim" deneyimi.

---

## İçindekiler

1. [Proje Özeti ve Vizyon](#1-proje-özeti-ve-vizyon)
2. [Oynanış Döngüsü (Game Loop)](#2-oynanış-döngüsü-game-loop)
3. [Ekran / Sahne Envanteri](#3-ekran--sahne-envanteri)
4. [Bar Sistemi](#4-bar-sistemi)
5. [NPC ve Sosyal Sistem](#5-npc-ve-sosyal-sistem)
6. [Kariyer ve İş Sistemi](#6-kariyer-ve-iş-sistemi)
7. [Görev Katmanları ve Rütbe Sistemi](#7-görev-katmanları-ve-rütbe-sistemi)
8. [Repo / Görev İçeriği Üretim Mimarisi](#8-repo--görev-i̇çeriği-üretim-mimarisi)
9. [Docker / Terminal Simülasyon Mimarisi](#9-docker--terminal-simülasyon-mimarisi)
10. [Veri Modelleri](#10-veri-modelleri)
11. [Teknik Yığın ve Mimari Notlar](#11-teknik-yığın-ve-mimari-notlar)
12. [Yol Haritası / Faz Planı](#12-yol-haritası--faz-planı)

---

## 1. Proje Özeti ve Vizyon

### 1.1 Nedir?

**MLOps Engineer Simulator**, tarayıcı tabanlı bir **1D yaşam simülasyonu + kariyer simülasyonu** oyunudur. "1D" ifadesi oyunun WASD hareketi veya 2D/3D dünya içermediği, sahne + buton + bar arayüzüne dayandığı anlamına gelir. Oyuncu:

- Bir karakterin **günlük ihtiyaçlarını** (uyku, açlık, stres, sağlık, para, sosyal ilişkiler) yönetir.
- **Gerçekçi Docker/Compose/Kubernetes sözdizimi simülasyonu** üzerinden MLOps/Backend/Cloud mühendisliğini öğrenir.
- NPC'lerle **sosyal ilişkiler** kurar; bu ilişkiler kariyer yolunu da etkiler.

### 1.2 Vizyon

Oyunun iki temel direği vardır:

| Direk | Açıklama |
|-------|----------|
| **Cozy Life Sim** | Oyuncunun rahatça keşfedebileceği, zorlama hissi vermeyen bir yaşam simülasyonu. Kariyer yapmak zorunlu değildir — istersen sıradan bir hayat da yaşayabilirsin. |
| **Endüstri Standardı Eğitim** | Dockerfile yazma, multi-stage build, Docker Compose, Kubernetes manifest'leri, CI/CD pipeline, incident response gibi gerçek dünya becerilerini adım adım öğretme. |

### 1.3 Giriş Tonu

Oyun açılışında oyuncuya şu tonda bir giriş metni gösterilir:

> *"Junior bir Backend & Cloud Engineer'sın. Yeteneğini paraya dönüştürebilirsin — ya da evinin yakınındaki Burger King'de yiyip içip keyfine bakabilirsin. Kariyer yapmak zorunlu değil, ama ödülü büyük. Tercih senin."*

Hafif ironik, teşvik edici ama zorlayıcı olmayan bir ton hedeflenir. Oyuncuya hem "acemilik" hissini yaşatır hem de ilerleme motivasyonu verir.

### 1.4 Zaman Sistemi

| Parametre | Değer |
|-----------|-------|
| Zaman hızı | Gerçek hayattaki 1 gün (24 saat) = Oyun içinde **16× hızlı** |
| Uyku ihtiyacını artıran faktörler | Yüksek kortizol (stres), fazla çalışma saatleri, düzensiz uyku programı |
| Eylem süresi | Her eylem (yemek, dışarı çıkma, çalışma, sosyalleşme) belirli miktarda oyun-içi zaman tüketir |
| Gün sonu | Yatağa gidildiğinde gün sonu özet ekranı tetiklenir |

**Zaman tüketim örnekleri:**

```
Yemek pişirme:        ~30 dakika oyun-içi
Market (fiziksel):     ~60 dakika oyun-içi
Park gezintisi:        ~90 dakika oyun-içi
Pub'da vakit geçirme:  ~120 dakika oyun-içi
Terminal'de görev:     değişken (görevin karmaşıklığına göre)
Uyku:                  ~360-480 dakika oyun-içi (uyku kalitesine göre)
```

---

## 2. Oynanış Döngüsü (Game Loop)

Oyuncunun tipik bir günü aşağıdaki döngüyü takip eder:

```
┌──────────────────────────────────────────────────────┐
│                    GÜN BAŞLANGICI                    │
│            (Uyandıktan sonra Ev İçi sahne)           │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              1. İHTİYAÇ KONTROLÜ                     │
│  - Barları kontrol et (uyku, açlık, stres, sağlık)   │
│  - Buzdolabına bak → yemek ye veya market planla     │
│  - Telefonu kontrol et → mesajlar, iş teklifleri     │
└──────────────────────┬───────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌─────────────────────┐  ┌─────────────────────────────┐
│  2A. İŞ / KARİYER   │  │  2B. SOSYAL / KEŞİF         │
│ - Bilgisayar aç     │  │ - Kapıdan dışarı çık        │
│ - Terminale gir     │  │ - Mekan seç (market, pub..) │
│ - Görev al / çöz    │  │ - NPC karşılaşmaları        │
│ - Push & Check      │  │ - Stres azalt / sosyalleş   │
└─────────┬───────────┘  └──────────────┬──────────────┘
          │                             │
          └─────────────┬───────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│              3. AKŞAM / DENGE                        │
│  - Kalan barları dengele                             │
│  - İkinci bir dış mekan ziyareti veya evde vakit     │
│  - Telefon: sosyal medya, mesajlaşma                 │
└──────────────────────┬───────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│              4. YATAĞA GİT                           │
│  - Uyku barını doldur                                │
│  - Zamanı ilerlet                                    │
│  - GÜN SONU ÖZET EKRANI tetiklenir:                 │
│    • Kazanılan/harcanan para                         │
│    • Stres & sağlık değişimi                         │
│    • Önemli sosyal/iş olayları                       │
│    • Kariyer puanı değişimi                          │
│    • Aylık gelir tahmini                             │
└──────────────────────────────────────────────────────┘
```

### Kritik Döngü Kuralları

- **Her eylem zaman tüketir** — oyuncu gün içinde sınırlı sayıda eylem yapabilir.
- **Barlar sürekli akar** — işlem yapmasanız bile uyku ve açlık barı zamanla düşer.
- **İhmal birikmeli sonuç doğurur** — bir günlük ihmal hafif, ama üst üste gelen ihmal kaskatlanır (stres → uyku bozukluğu → sağlık düşüşü → performans kaybı).
- **Kariyer opsiyoneldir** — oyuncu hiç görev almadan da hayatını sürdürebilir, ama maddi zorluk çeker.

---

## 3. Ekran / Sahne Envanteri

### 3.1 Ana Ekran (Ev İçi)

Ev içi ekran, oyuncunun "hub"ıdır. Her tıklanabilir kutucuk farklı bir alt sisteme geçiş sağlar.

| Kutucuk | Tıklandığında | Etkilenen Barlar / Sistemler |
|---------|---------------|-------------------------------|
| 💻 **Bilgisayar** | İş/görev sistemine, terminale ve oyun içi tarayıcı simülasyonuna giriş. Monaco editör + xterm.js terminal açılır. | Stres (↑ çalışırken), Para (↑ görev tamamlayınca), Kariyer puanı |
| 📱 **Telefon** | Sosyal medya, mesajlaşma, LinkedIn benzeri iş platformu, online market siparişi. | Sosyal bar, Para (market siparişi), İş teklifleri |
| 👔 **Dolap** | Giyim/görünüm değiştirme. Kozmetik etkiler + sosyal etkileşimlerde bonus/malus. | Sosyal algı, NPC izlenim puanları |
| 🛒 **Market (Online)** | Telefon üzerinden online sipariş. Ürünler kapıya gelir. | Açlık (dolaylı — buzdolabı dolar), Para (↓ daha pahalı), Zaman (az tüketir) |
| 🧊 **Buzdolabı** | Yemek yeme → açlık barını azaltır. İçi boşsa oyuncuyu markete yönlendirir. | Açlık (↑ yemek yendiğinde), Sağlık (yemek kalitesine göre) |
| 🛏️ **Yatak** | Uyuma → uyku barını doldurur, zamanı ilerletir, gün sonu özet ekranını tetikler. | Uyku (↑), Stres (↓ iyi uyunursa), Sağlık (↑ düzenli uykuda) |
| 🚪 **Kapı** | Dış mekan seçim menüsüne geçiş. | — (geçiş noktası) |

**Önemli Notlar:**
- Online market siparişi, fiziksel markete göre **daha pahalıdır** ama zaman kazandırır.
- Online market **sağlık ve sosyalleşme katkısı sağlamaz** (yürüyüş yok, NPC karşılaşma yok).
- Buzdolabı boşken yemek yemeye çalışmak, market yönlendirme pop-up'ı tetikler.

### 3.2 Kapı → Dış Mekan Menüsü

Kapı tıklandığında açılan menüdeki her mekan farklı maliyet, zaman ve bar etkilerine sahiptir.

| Mekan | Maliyet | Zaman Tüketimi | Stres Etkisi | Sağlık Etkisi | Sosyal İhtimal | Özel Not |
|-------|---------|----------------|--------------|----------------|----------------|----------|
| 🏪 **Market (Fiziksel)** | Düşük | Orta | — | ↑ Küçük (yürüyüş) | Düşük | Daha ucuz ürünler, hafif sağlık bonusu |
| 🎨 **Galeri** | Orta | Orta | ↓ Orta | — | Düşük | Sanat/kültür puanı kazanımı |
| 🍺 **Pub** | Yüksek | Yüksek | ↓ Yüksek | ↓ Hafif (alkol) | Yüksek | Riskli NPC olayları, alkol mekaniği aktif |
| 🎬 **Sinema** | Orta | Orta-Yüksek | ↓ İyi | — | Düşük | İyi stres azaltma, düşük sosyal |
| 🌳 **Park** | Ücretsiz | Düşük-Orta | ↓ Az | ↑ Küçük | Düşük | Hafif tanışma olayları, ücretsiz |
| 🏠 **Emlakçı** | Değişken | Düşük | — | — | — | Ev/ofis yükseltme. Daha iyi ev → daha hızlı bar toparlanması. Plaza/ofis kiralama → şirket kurma ön koşulu |
| 🏢 **Şirket** | — | Değişken | — | — | — | **Başlangıçta kilitli.** Belirli görev sayısı + rütbe + para eşiği sağlanınca açılır |
| 🏙️ **Plaza** | — | Değişken | — | — | — | **Başlangıçta kilitli.** Kendi şirketini kurma / ekip toplama aşamasında açılır |

**Dışarı Çıkma Genel Kuralları:**
- Dışarı çıkmak **her zaman** sosyalleşme ihtimalini artırır.
- Her mekanın kendine özgü bir **NPC karşılaşma havuzu** vardır.
- Park: hafif, düşük riskli tanışma olayları.
- Pub: yoğun, yüksek riskli/yüksek ödüllü olaylar.
- Galeri/Sinema: orta seviye, kültürel NPC'ler.
- Market: gündelik, kısa süreli karşılaşmalar.

### 3.3 Bilgisayar Ekranı (Alt Sahneler)

Bilgisayar tıklandığında açılan iç ekranlar:

| Alt Sahne | İçerik |
|-----------|--------|
| **Terminal** | xterm.js tabanlı simüle terminal. `git clone`, `git pull`, `docker build`, `docker compose up` vb. komutlar çalıştırılır. Gerçek bir shell'e bağlanmaz. |
| **Kod Editörü** | Monaco Editor tabanlı. Dockerfile, docker-compose.yml, YAML manifest dosyaları yazılır. Sözdizimi vurgulama aktif. |
| **Oyun İçi Tarayıcı** | `localhost:PORT` ziyareti simüle edilir. Görev doğru çözüldüyse başarı sayfası, yanlışsa bağlantı hatası gösterilir. |
| **GitHub Simülasyonu** | Repo listesi, README görev talimatları, commit geçmişi görüntüleme. |
| **Tutorial Hub** | Önceden hazırlanmış eğitim dosyaları: Linux komutları, Dockerfile temelleri, Multi-stage build, Docker Compose, Kubernetes, CI/CD. |

### 3.4 Telefon Ekranı (Alt Sahneler)

| Alt Sahne | İçerik |
|-----------|--------|
| **Sosyal Medya** | NPC paylaşımları, karakter durumu güncellemeleri. Stres ve sosyal barı hafifçe etkiler. |
| **Mesajlaşma** | NPC'lerle birebir mesajlaşma. İlişki barını etkiler, etkinlik davetleri ve iş teklifleri buradan gelir. |
| **LinkedIn Benzeri Platform** | Şirket ilanları, CV bırakma, mülakat diyalogları. Kariyer sisteminin giriş noktası. |
| **Online Market** | Ürün seçme ve sipariş verme. Kapıya teslimat, daha pahalı. |

---

## 4. Bar Sistemi

### 4.1 Temel Felsefe

Tüm barlar birbirini etkileyen bir **ağ** oluşturur. Hiçbir bar bağımsız değildir. Bir bardaki düşüş zincirleme olarak diğerlerini etkiler.

```
          ┌──────────┐
     ┌───▶│  STRES   │◀───┐
     │    └─────┬────┘    │
     │          │         │
     │          ▼         │
┌────┴───┐  ┌──────┐  ┌──┴──────┐
│  UYKU  │─▶│SAĞLIK│◀─│  AÇLIK  │
└────────┘  └──┬───┘  └─────────┘
               │
               ▼
          ┌──────────┐     ┌──────────────┐
          │PERFORMANS│────▶│ PARA (GELİR) │
          └──────────┘     └──────────────┘
```

### 4.2 Bar Detay Tablosu

| Bar | Tür | Azaltan Faktörler | Artıran Faktörler | Etkilediği Barlar/Sistemler |
|-----|-----|-------------------|--------------------|-----------------------------|
| 😴 **Uyku** | 0–100 | Zaman geçtikçe doğal azalma, yüksek stres (hızlı azalma), fazla çalışma, düzensiz uyku saatleri | Yatakta uyuma (kalitesi uyku düzenine bağlı) | Düşükse: Stres ↑, Performans ↓, Sağlık ↓ |
| 🍔 **Açlık** | 0–100 | Zaman geçtikçe doğal azalma | Buzdolabından yemek yeme (kalitesi malzeme türüne bağlı) | Kritik düşerse: Sağlık ↓↓, Stres ↑, Konsantrasyon ↓ |
| ❤️ **Sağlık** | 0–100 | Yüksek stres, kötü beslenme, alkol/sigara kullanımı, düzensiz uyku, ihmal | Düzenli uyku, sağlıklı beslenme, park yürüyüşü, düşük stres seviyesi | Düşükse: TÜM performans metrikleri bozulur, görev süresi uzar, incident riski artar |
| 😰 **Stres** | 0–100 (yüksek = kötü) | Pub, sinema, galeri, park, düzenli uyku, sosyalleşme, partner ilişkisi | İş yoğunluğu, uyku bozukluğu, para sıkıntısı, ilişki problemleri, incident'lar, teknik borç birikimi | Yüksekse: Uyku kalitesi ↓, Sağlık ↓, Performans ↓, NPC etkileşimlerinde negatif seçenekler |
| 💰 **Para** | Sayısal (₺) | Market harcamaları, kira, sosyal aktiviteler, sunucu maliyetleri (kendi şirketi varsa), alkol/sigara, online sipariş primi | Görev ücretleri (tek seferlik), aylık bakım gelirleri (tekrarlayan), NPC iş bağlantıları | Düşükse: Stres ↑, Aktivite seçenekleri kısıtlanır, Kira ödeyememe riski |
| 👥 **İlişki (NPC bazlı)** | NPC başına ayrı seviye | İhmal, olumsuz diyalog seçimleri, kavga, borç ödememe, kıskançlık | Vakit geçirme, olumlu diyalog seçimleri, hediye, yardım, mesajlaşma | Yüksekse: İş referansları, ortak projeler, partner bonusları. Düşükse: İlişki kopması, olumsuz dedikodu |

### 4.3 İlişki Seviyeleri

Her NPC ile ayrı bir tanışıklık seviyesi tutulur:

```
Yabancı (0-19) → Tanıdık (20-39) → Arkadaş (40-59) → Yakın Arkadaş (60-79) → Partner (80-100)
```

**Partner ilişkisi** özel bir bar olarak işler:
- İlgiye ve ayrılan zamana göre yükselir.
- İhmalde düşer.
- Kritik eşiğin altına düşerse partner **küsebilir** veya **ayrılabilir**.
- Partner ilişkisi stres azaltmada en güçlü faktörlerden biridir (karşılıklı).

### 4.4 Sigara / Alkol Mekaniği

Sigara ve alkol için ayrı bir bar **yoktur**. Bunun yerine diğer barları etkileyen bir mekanik olarak çalışır:

| Özellik | Sigara | Alkol |
|---------|--------|-------|
| Stres etkisi | Anlık ↓ (küçük) | Anlık ↓ (büyük) |
| Sağlık etkisi | Kalıcı küçük zarar (kümülatif) | Kalıcı küçük zarar (kümülatif) |
| Geri tepme | Stres bir süre sonra geri yükselir | Stres bir süre sonra geri yükselir, uyku kalitesi ↓ |
| Özel bonus | Kullanım sonrası terminalde kısa süreli "odak ipucu paneli" aktifleşir | Kullanım sonrası terminalde kısa süreli "odak ipucu paneli" aktifleşir |
| Uzun vadeli maliyet | Sağlık barı tavanı zamanla düşer | Sağlık barı tavanı zamanla düşer, para kaybı |

> **Tasarım Notu:** "Odak ipucu paneli" kısa vadeli bir fayda olarak tasarlanmıştır — terminal/editör ekranında bağlamsal ipuçları gösterir. Ancak uzun vadeli kullanım sağlık barını kalıcı olarak aşındırır. Oyuncuya "kısa vadeli fayda vs uzun vadeli maliyet" denge kararını yaşatır.

---

## 5. NPC ve Sosyal Sistem

### 5.1 Popülasyon

Oyun dünyasında **20 kişilik** sabit bir NPC popülasyonu bulunur: **10 kadın, 10 erkek**. Her NPC benzersiz özelliklere sahiptir.

### 5.2 NPC Veri Modeli

Her NPC şu niteliklere sahiptir:

| Nitelik | Açıklama |
|---------|----------|
| `id` | Benzersiz tanımlayıcı |
| `name` | İsim |
| `gender` | Cinsiyet |
| `personality` | Kişilik tipi (örn: dışa dönük, içe dönük, maceracı, sakin, hırslı, rahat) |
| `interests` | İlgi alanları dizisi (teknoloji, sanat, spor, müzik, yemek, vb.) |
| `frequentLocations` | Hangi mekanlarda daha sık bulunduğu (pub, park, galeri vb.) + ağırlık değerleri |
| `profession` | Meslek (bazıları teknoloji sektöründe — kariyer kesişimi için) |
| `initialRelationship` | Başlangıç ilişki durumu (genelde "yabancı") |
| `eventPool` | Bağlı olay havuzu referansları |
| `visualTraits` | Görsel tanımlayıcılar (avatar bilgisi) |
| `dialogueStyle` | Diyalog üslubu (resmi, samimi, espritüel, ciddi) |

### 5.3 NPC JSON Şeması

```json
{
  "id": "npc_anna_01",
  "name": "Anna",
  "gender": "female",
  "age": 27,
  "personality": "extrovert_adventurous",
  "interests": ["technology", "travel", "music"],
  "frequentLocations": {
    "pub": 0.6,
    "park": 0.3,
    "cinema": 0.4,
    "gallery": 0.2,
    "market": 0.1
  },
  "profession": "ux_designer",
  "initialRelationship": {
    "level": 0,
    "status": "stranger"
  },
  "eventPool": ["evt_borrow_money", "evt_casual_greeting", "evt_date_invite", "evt_job_referral"],
  "dialogueStyle": "friendly_witty",
  "visualTraits": {
    "avatar": "anna_default.png",
    "style": "casual_modern"
  }
}
```

### 5.4 Olay Zinciri Yapısı

NPC olayları **zincirlenebilir** yapıdadır. Her olay bir veya daha fazla seçeneğe bölünür, her seçenek farklı bir sonraki olaya veya sonuç durumuna yönlendirir.

```
[Tetikleyici Olay]
    ├── [Seçenek A] → [Sonuç Olayı A1] → [Dallanma A1a / A1b]
    └── [Seçenek B] → [Sonuç Olayı B1]
```

#### Olay Türleri

| Kategori | Örnek Olaylar |
|----------|---------------|
| **Tanışma** | İlk selamlaşma, isim sorma, ortak ilgi alanı keşfetme |
| **Arkadaşlık** | Kahve daveti, birlikte park gezintisi, film önerisi |
| **Flört** | Buluşmaya davet, iltifat, hediye verme |
| **İlişki** | Partner olma, birlikte vakit geçirme, kıskançlık, tartışma |
| **Çatışma** | Kavga, borç anlaşmazlığı, dedikodu, ihanet |
| **Ekonomik** | Borç isteme/verme, ortak harcama, hediye |
| **Kariyer** | İş bağlantısı, referans verme/alma, ortak proje önerisi, iş teklifi getirme |
| **Barışma** | Özür dileme, arabuluculuk, ilişki onarımı |

### 5.5 Örnek Olay Akışı

```
┌─────────────────────────────────────────┐
│  [Pub'a gidildi — rastgele NPC seçimi]  │
│  Pop-up: "Anna sana selam verdi."       │
│  ┌──────────┐  ┌──────────────┐         │
│  │ Selam ver │  │ Görmezden gel│         │
│  └─────┬────┘  └──────┬───────┘         │
│        │               │                │
│        ▼               ▼                │
│  "Senden borç    İlişki puanı -5        │
│   para istedi"   (Olay sona erer)       │
│  ┌──────┐ ┌───────┐                     │
│  │ Ver  │ │Reddet │                     │
│  └──┬───┘ └───┬───┘                     │
│     │         │                         │
│     ▼         ▼                         │
│  Para -50₺  İlişki puanı -3            │
│  İlişki +10 (Olay sona erer)           │
│  (İleride iş                           │
│   referansı                             │
│   ihtimali ↑)                           │
└─────────────────────────────────────────┘
```

### 5.6 Olay JSON Şeması

```json
{
  "id": "evt_anna_borrow_money",
  "triggerLocation": ["pub", "park"],
  "triggerNpc": "npc_anna_01",
  "minRelationshipLevel": 20,
  "probability": 0.3,
  "chain": [
    {
      "step": 1,
      "message": "Anna sana selam verdi.",
      "choices": [
        {
          "text": "Selam ver",
          "effects": { "relationship": +2 },
          "nextStep": 2
        },
        {
          "text": "Görmezden gel",
          "effects": { "relationship": -5 },
          "nextStep": null
        }
      ]
    },
    {
      "step": 2,
      "message": "Anna: 'Ay çok sıkıldım, bir de cüzdanımı unutmuşum. 50 lira borç verir misin?'",
      "choices": [
        {
          "text": "Tabii, al.",
          "effects": { "money": -50, "relationship": +10 },
          "flags": { "anna_owes_money": true },
          "nextStep": null
        },
        {
          "text": "Şu an bende de yok, kusura bakma.",
          "effects": { "relationship": -3 },
          "nextStep": null
        }
      ]
    }
  ]
}
```

### 5.7 Mekan Bazlı Olay Havuzları

| Mekan | Olay Yoğunluğu | Olay Tipi | Örnek |
|-------|-----------------|-----------|-------|
| 🌳 **Park** | Düşük | Hafif tanışma, yürüyüş arkadaşlığı | "Birisi yanındaki bankta oturuyor, kitap okuyor." |
| 🍺 **Pub** | Yüksek | Yoğun sosyal, riskli kararlar, flört | "Mehmet sana bir içki ısmarlamak istiyor." |
| 🎨 **Galeri** | Düşük-Orta | Kültürel sohbet, entelektüel tanışma | "Bir tablo önünde duran biri seninle göz göze geldi." |
| 🎬 **Sinema** | Düşük | Tesadüfi karşılaşma | "Sinem aynı filme gelmiş, yanına oturabilirsin." |
| 🏪 **Market** | Çok Düşük | Gündelik, kısa | "Kasada önündeki kişi sana gülümsedi." |

### 5.8 NPC-Kariyer Kesişimi

NPC ilişkileri kariyer sistemiyle doğrudan kesişir:

- **Referans:** Yüksek ilişki seviyesindeki bir NPC (özellikle tech sektöründeyse) iş başvurularında referans verebilir → mülakat başarı oranı ↑.
- **İş Teklifi:** Bazı NPC'ler doğrudan iş teklifi getirebilir (ilişki seviyesi + NPC mesleğine bağlı).
- **Ortak Proje:** İleri aşamalarda NPC'lerle ortak proje kurma imkânı.
- **Olumsuz Etki:** Kavga edilen bir NPC, potansiyel bir iş bağlantısını engelleyebilir.

---

## 6. Kariyer ve İş Sistemi

### 6.1 İş Bulma Akışı

```
┌────────────────────┐
│  Telefon / Bilgisayar  │
│  "LinkedIn" platformu  │
└──────────┬─────────┘
           │
           ▼
┌─────────────────────────┐
│  Şirket İlanlarını Gör  │
│  (Rütbeye uygun ilanlar │
│   filtrelenir)          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  CV Bırak / Başvur      │
│  (NPC referansı varsa   │
│   başarı oranı ↑)       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Mülakat Diyaloğu       │
│  (Teknik sorular +      │
│   kişilik uyumu)         │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
  ✅ Kabul    ❌ Red
     │           │
     ▼           ▼
  Repo Erişimi  "Daha fazla deneyim
  verilir       kazanmanız gerekiyor"
```

### 6.2 Görev Teslim Akışı

1. **Repo Çekme:** Şirket, oyun içi GitHub simülasyonunda repo erişimi verir. Oyuncu terminalde `git clone` ile repo'yu çeker.
2. **README Okuma:** Repo'daki `README.md` dosyası görev talimatını içerir — senaryo, teknik kısıtlamalar, hedefler.
3. **Kod Yazma:** Monaco editörde Dockerfile, docker-compose.yml veya ilgili konfigürasyon dosyalarını yazar.
4. **Build & Test:** Terminalde `docker build` / `docker compose up` komutlarını çalıştırır. Simüle build log'ları görüntülenir.
5. **Tarayıcı Kontrolü:** Oyun içi tarayıcıda `localhost:PORT` adresini ziyaret ederek sonucu görsel olarak doğrular.
6. **Push:** `git push` ile teslim eder.
7. **Check Mission:** "Check Mission" butonu ile AI değerlendirme katmanı tetiklenir → pedagojik feedback döner.

### 6.3 Aylık Gelir Mekaniği

Görev tamamlandığında bir tek seferlik ödeme alınır. Ancak asıl gelir modeli **aylık tekrarlayan bakım geliridir:**

```
Aylık Pasif Gelir = Σ (Tamamlanmış Görev[i].bakımÜcreti)
```

| Görev Seviyesi | Tek Seferlik Ödeme | Aylık Bakım Geliri |
|----------------|--------------------|--------------------|
| Junior | 200₺ – 500₺ | 50₺ – 100₺ |
| Junior+ | 500₺ – 1.000₺ | 100₺ – 200₺ |
| Mid | 1.000₺ – 2.500₺ | 200₺ – 500₺ |
| Mid-Senior | 2.500₺ – 5.000₺ | 500₺ – 1.000₺ |
| Senior | 5.000₺ – 10.000₺ | 1.000₺ – 2.500₺ |
| Lead/Principal | 10.000₺+ | 2.500₺+ |

- **Aktif görev sayısı** arttıkça aylık pasif gelir birikir.
- Kendi şirketi olan oyuncu **sunucu maliyetlerini kendi cebinden öder** — bu maliyet gelirden düşülür.
- Müşteri şirketlerde sunucu maliyeti **şirkete yüklenir**, oyuncuya yansımaz.
- Teknik borç biriktiren görevler ileride **incident riski** taşır — incident maliyeti bakım gelirinden kesilir.

### 6.4 Şirket Kurma

Belirli koşullar sağlandığında oyuncu kendi şirketini kurabilir:

| Ön Koşul | Eşik |
|----------|------|
| Tamamlanmış görev sayısı | ≥ 15 |
| Rütbe | ≥ Mid-Senior |
| Birikim | ≥ 25.000₺ |
| Emlakçıdan ofis/plaza kiralama | Zorunlu |

**Şirket sahibi olunca:**
- NPC çalışan işe alınabilir.
- Ekibe görev delege edilebilir.
- Çalışanların hata log'ları okunur ve düzeltilir.
- Sunucu maliyetleri, çalışan maaşları ve ofis kirası cebinden ödenir.
- Müşteri portföyü yönetilir.

---

## 7. Görev Katmanları ve Rütbe Sistemi

> **Bu bölüm oyunun eğitim omurgasıdır.** Görevler küçük adımlarla, gerçek bir MLOps/Cloud mühendisinin kariyer yolculuğunu taklit edecek şekilde kademelendirilmiştir.

---

### 7.1 AŞAMA 1 — Junior (Entry Level)

**🎯 Hedef Beceriler:**
- Tek katmanlı, basit Dockerfile yazma
- Tek bir dil (Python) ile çalışma
- Temel Linux terminal komutları

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| `FROM` | Base image seçimi |
| `WORKDIR` | Çalışma dizini belirleme |
| `COPY` | Dosya kopyalama |
| `RUN` | Komut çalıştırma (pip install) |
| `EXPOSE` | Port açma |
| `CMD` | Container başlatma komutu |
| `ls`, `cd`, `cat`, `mkdir` | Temel Linux komutları |
| `git clone`, `git pull`, `git push` | Temel Git iş akışı |

**📝 Örnek Görev Senaryosu:**

> **Şirket:** TechStart Yazılım A.Ş.
>
> **Görev Özeti:** Şirket sana hazır bir Python uygulaması verdi (`main.py` + `requirements.txt`). Bu uygulama basit bir FastAPI REST API'dir. Görevin, bu uygulamayı çalıştıran bir Dockerfile yazmak.
>
> **Teknik Kısıtlamalar:**
> - Base image: `python:3.11-slim`
> - Çalışma dizini: `/app`
> - Bağımlılıklar `requirements.txt` ile yüklenecek
> - Port `8000`'den dışarı açılacak
> - Container `uvicorn main:app --host 0.0.0.0 --port 8000` komutuyla başlayacak
>
> **Beklenen Çıktı:** `localhost:8000/docs` adresinde Swagger UI görüntülenmesi.

**Beklenen Dockerfile:**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**🔓 Açılış Koşulu:** Yok — oyunun başlangıç seviyesi.

**📊 Rütbe İlerlemesi:** 3–5 görev tamamlandığında Junior+ seviyesine geçiş.

---

### 7.2 AŞAMA 2 — Junior+ (Güvenlik Odaklı)

**🎯 Hedef Beceriler:**
- İki aşamalı (multi-stage) Dockerfile yazma
- Builder ve runner aşaması ayrımı
- Non-root kullanıcı oluşturma ve `USER` komutu
- Image boyutu optimizasyonu
- Güvenlik en iyi uygulamaları

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| Multi-stage build | `FROM ... AS builder` / `FROM ... AS runner` |
| `USER` | Non-root kullanıcıyla container çalıştırma |
| `--no-cache-dir` | Pip cache temizleme |
| `--no-install-recommends` | Gereksiz paket yüklememek |
| Derleyici izolasyonu | Build araçlarının final image'da bulunmaması |
| Farklı diller | Python, JavaScript (Node.js), Go |

**📝 Örnek Görev Senaryosu (Python):**

> **Şirket:** SecureCloud Teknoloji
>
> **Görev Özeti:** Güvenlik denetiminden geçmesi gereken bir Python API uygulaması. Multi-stage build kullanarak image boyutunu minimize et ve güvenlik standartlarına uy.
>
> **Teknik Kısıtlamalar:**
> - Builder aşamasında bağımlılıkları derle
> - Final image'da derleyici araçları bulunmamalı (`gcc`, `make` vb.)
> - Non-root kullanıcı (`appuser`) oluştur ve `USER` komutuyla geç
> - Final image boyutu 150MB'ın altında olmalı
> - Port 8000
>
> **Güvenlik Kontrol Listesi:**
> - [ ] Root kullanıcı olarak çalışmıyor
> - [ ] Derleyici araçları final image'da yok
> - [ ] Gereksiz cache dosyaları temizlenmiş
> - [ ] Minimum base image kullanılmış

**📝 Örnek Görev Senaryosu (Go):**

> **Şirket:** GoMicro Sistemler
>
> **Görev Özeti:** Go ile yazılmış bir mikroservis. Go'nun derlenen yapısı sayesinde final image'da yalnızca binary bulunmalı.
>
> **Teknik Kısıtlamalar:**
> - Builder aşaması: `golang:1.21` ile derleme
> - Runner aşaması: `scratch` veya `alpine:3.18` (çok küçük image)
> - Statik binary derleme (`CGO_ENABLED=0`)
> - Final image boyutu 20MB'ın altında olmalı

**📝 Örnek Görev Senaryosu (Node.js):**

> **Şirket:** FrontEdge Dijital
>
> **Görev Özeti:** React tabanlı bir frontend uygulamasını multi-stage build ile derleyip Nginx üzerinden sun.
>
> **Teknik Kısıtlamalar:**
> - Builder: `node:18-alpine` ile `npm run build`
> - Runner: `nginx:alpine` ile statik dosyaları sun
> - `node_modules` final image'da bulunmamalı

**🔓 Açılış Koşulu:** Aşama 1'de 3–5 görev başarıyla tamamlanmış olması.

**📊 Rütbe İlerlemesi:** 4–6 görev tamamlandığında Aşama 3'e geçiş.

---

### 7.3 AŞAMA 3 — Junior → Mid Geçiş

**🎯 Hedef Beceriler:**
- Hem Dockerfile hem Docker Compose yazma
- Tek servisli Compose dosyası
- Ortam değişkenleri (`.env` dosyasından çekme)
- Basit volume tanımı
- İki servisli Compose (API + Veritabanı)
- Servisler arası bağımlılık (`depends_on`)

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| `docker-compose.yml` | Compose dosya yapısı, `version`, `services` |
| `build` vs `image` | Dockerfile'dan build etme vs hazır image kullanma |
| `ports` | Port mapping |
| `environment` / `env_file` | Ortam değişkenleri yönetimi |
| `volumes` | Veri kalıcılığı |
| `depends_on` | Servis başlatma sırası |
| `.env` dosyası | Hassas bilgilerin ayrı dosyada tutulması |

**📝 Örnek Görev Senaryosu (Tek Servis):**

> **Şirket:** DataFlow Analitik
>
> **Görev Özeti:** Mevcut Python API uygulamasını Docker Compose ile çalıştırılabilir hale getir. Ortam değişkenlerini `.env` dosyasından çek.
>
> **Teknik Kısıtlamalar:**
> - `docker-compose.yml` oluştur
> - `API_KEY`, `DEBUG_MODE` gibi değişkenleri `.env` dosyasından al
> - Port 8000 dışarı açılacak
> - Log dosyaları için bir volume tanımla

**📝 Örnek Görev Senaryosu (İki Servis):**

> **Şirket:** DataFlow Analitik (devam görevi)
>
> **Görev Özeti:** API'ye PostgreSQL veritabanı ekle. İki servisi Compose ile birlikte yönet.
>
> **Teknik Kısıtlamalar:**
> - `api` servisi: Python FastAPI (Dockerfile ile build)
> - `db` servisi: `postgres:15-alpine` (hazır image)
> - API, veritabanına bağlanmak için `DATABASE_URL` ortam değişkenini kullanır
> - `depends_on` ile `db`'nin `api`'den önce başlamasını sağla
> - Veritabanı verileri için named volume tanımla
> - Veritabanı şifresi `.env` dosyasında tutulacak

**🔓 Açılış Koşulu:** Aşama 2'de en az 4 görev başarıyla tamamlanmış olması.

**📊 Rütbe İlerlemesi:** 4–6 görev tamamlandığında Aşama 4'e geçiş. Bu aşamadan itibaren resmi rütbe "Mid Level" olur.

---

### 7.4 AŞAMA 4 — Mid Level

**🎯 Hedef Beceriler:**
- Üç ve dört servisli Compose dosyaları
- Özel Docker network tanımı (servisler arası izolasyon)
- CPU ve memory limitleri (`deploy.resources`)
- Named volume'lar
- Birden fazla dil/teknoloji aynı anda
- `.env` dosyası zorunlu kullanımı

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| `networks` | Özel bridge network tanımı, servis izolasyonu |
| `deploy.resources.limits` | CPU ve memory kısıtlamaları |
| `deploy.resources.reservations` | Kaynak rezervasyonu |
| Named volumes | Kalıcı veri depolama stratejileri |
| Multi-language stacks | Python API + Node.js frontend + Redis cache |
| Servis iletişimi | Container'lar arası network üzerinden iletişim |

**📝 Örnek Görev Senaryosu:**

> **Şirket:** ScaleUp Bulut Çözümleri
>
> **Görev Özeti:** E-ticaret platformunun backend altyapısını kur. Dört servis: API, veritabanı, cache ve arka plan işçisi (worker).
>
> **Teknik Kısıtlamalar:**
> - `api` servisi: Python FastAPI — `backend` network'üne bağlı
> - `db` servisi: PostgreSQL — yalnızca `backend` network'ünde, dışarıdan erişilemez
> - `cache` servisi: Redis — `backend` network'ünde
> - `worker` servisi: Python Celery — `backend` network'ünde, `api` ve `cache` ile iletişim kurar
> - Tüm servisler için CPU ve memory limitleri belirle:
>   - API: 0.5 CPU, 512MB RAM
>   - DB: 1.0 CPU, 1GB RAM
>   - Cache: 0.25 CPU, 256MB RAM
>   - Worker: 0.5 CPU, 512MB RAM
> - Veritabanı ve cache için named volume tanımla
> - Tüm ortam değişkenleri `.env` dosyasından çekilecek
>
> **Bonus Görev:** Aynı Compose'a Node.js tabanlı bir admin panel frontend'i ekle. Bu servis yalnızca `frontend` network'ünde olacak ve API'ye `backend` network'ü üzerinden proxy ile erişecek.

**🔓 Açılış Koşulu:** Aşama 3'te en az 4 görev başarıyla tamamlanmış olması.

**📊 Rütbe İlerlemesi:** 5–8 görev tamamlandığında Aşama 5'e geçiş.

---

### 7.5 AŞAMA 5 — Mid-Senior

**🎯 Hedef Beceriler:**
- Sıfırdan Dockerfile ve Compose yazma (şirketten yalnızca README gelir)
- CI/CD pipeline kurma simülasyonu (GitHub Actions benzeri YAML)
- Temel Kubernetes manifest dosyaları
- Health check direktifleri
- Multi-environment yapılandırma (dev/prod)

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| Bağımsız tasarım | Proje dosyalarını inceleyip kendi konfigürasyonunu sıfırdan yazma |
| GitHub Actions YAML | Workflow dosyası: trigger, job, step yapısı |
| CI pipeline | Lint → Test → Build → Push akışı |
| CD pipeline | Deploy → Verify → Rollback stratejisi |
| Kubernetes `Deployment` | Pod replikasyonu, container spec |
| Kubernetes `Service` | ClusterIP, NodePort, LoadBalancer |
| Kubernetes `ConfigMap` | Konfigürasyon verisi yönetimi |
| `HEALTHCHECK` | Container sağlık kontrolü direktifi |
| Multi-env | `.env.dev`, `.env.prod` ayrımı, override dosyaları |

**📝 Örnek Görev Senaryosu:**

> **Şirket:** InfraCore Mühendislik
>
> **Görev Özeti:** Şirketin yeni mikroservisini üretime hazırla. Dockerfile, Compose, CI/CD pipeline ve temel Kubernetes manifest'lerini sıfırdan yaz. Şirketten yalnızca README ve kaynak kodu gelir — mimari kararlar sana ait.
>
> **Teknik Kısıtlamalar:**
> - Dockerfile: Multi-stage build, non-root user, health check
> - docker-compose.yml: Dev ve prod ortamları için ayrı override dosyaları (`docker-compose.override.yml`, `docker-compose.prod.yml`)
> - CI/CD: `.github/workflows/ci.yml` — push event'inde lint, test, build, push adımları
> - Kubernetes: `deployment.yml` (2 replika), `service.yml` (ClusterIP), `configmap.yml`
> - Health check endpoint: `/health` — 30 saniyede bir kontrol, 3 başarısızlıkta restart
>
> **Değerlendirme Kriterleri:**
> - [ ] Dockerfile best practice'lere uygun
> - [ ] Dev ve prod ortamları ayrı yapılandırılmış
> - [ ] CI pipeline tüm adımları içeriyor
> - [ ] Kubernetes manifest'leri geçerli ve uygulanabilir
> - [ ] Health check doğru yapılandırılmış

**🔓 Açılış Koşulu:** Aşama 4'te en az 5 görev başarıyla tamamlanmış olması + toplam kariyer puanı ≥ 500.

**📊 Rütbe İlerlemesi:** 5–8 görev tamamlandığında Aşama 6'ya geçiş.

---

### 7.6 AŞAMA 6 — Senior

**🎯 Hedef Beceriler:**
- Tam Kubernetes stack yönetimi
- Monitoring ve logging entegrasyonu
- Incident response (olay müdahalesi)
- Teknik borç yönetimi

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| Kubernetes `Ingress` | Dış trafiğin yönlendirilmesi |
| Kubernetes `Secret` | Hassas verilerin güvenli yönetimi |
| `PersistentVolumeClaim` | Kalıcı depolama talepleri |
| `HorizontalPodAutoscaler` | Yük bazlı otomatik ölçeklendirme |
| Prometheus | Metrik toplama ve uyarı kuralları |
| Grafana | Dashboard oluşturma ve görselleştirme |
| Incident response | Canlı ortam sorunlarını teşhis ve çözme |
| Teknik borç | Hızlı/kirli çözümlerin uzun vadeli maliyeti |

**📝 Örnek Görev Senaryosu (Tam Stack):**

> **Şirket:** MegaScale Altyapı
>
> **Görev Özeti:** Şirketin ana ürününü Kubernetes'e taşı. Tam production-ready manifest seti hazırla.
>
> **Teknik Kısıtlamalar:**
> - `Deployment`: 3 replika, rolling update stratejisi, liveness/readiness probe'lar
> - `Service`: ClusterIP + LoadBalancer
> - `Ingress`: TLS terminasyonu, path-based routing
> - `ConfigMap`: Uygulama konfigürasyonu
> - `Secret`: Veritabanı şifresi, API anahtarları
> - `PersistentVolumeClaim`: Veritabanı depolama (10Gi)
> - `HorizontalPodAutoscaler`: CPU %70 eşiğinde, min 2 max 10 replika
> - Monitoring: Prometheus ServiceMonitor + Grafana dashboard JSON

**📝 Örnek Görev Senaryosu (Incident Response):**

> **Durum:** Gece 03:00'te telefonun çalar. Production ortamında bir pod CrashLoopBackOff durumunda.
>
> **Oyuncu Eylemleri:**
> 1. Terminale gir
> 2. `kubectl get pods` → sorunlu pod'u tespit et
> 3. `kubectl logs <pod>` → hata loglarını oku
> 4. `kubectl describe pod <pod>` → olay geçmişini incele
> 5. Sorunu teşhis et (OOM, config hatası, bağımlılık sorunu vb.)
> 6. Çözüm uygula (resource limit artırma, config düzeltme, rollback)
>
> **Sonuç Etkileri:**
> - Hızlı çözüm: Kariyer puanı ↑↑, şirket güveni ↑
> - Yavaş çözüm: Stres ↑, şirket güveni ↓
> - Hızlı ama kirli çözüm: Anlık başarı, ama teknik borç birikir → ileride yeni incident riski ↑

**⚠️ Teknik Borç Mekaniği:**

Hızlı/kirli çözümler bir **teknik borç sayacı** biriktirir. Bu sayaç belirli eşikleri aştığında:
- Rastgele incident olasılığı artar
- Yeni görevlerde ek kısıtlamalar ortaya çıkar ("eski sistemi refactor etmen gerekiyor")
- Şirket memnuniyeti düşer

**🔓 Açılış Koşulu:** Aşama 5'te en az 5 görev başarıyla tamamlanmış olması + toplam kariyer puanı ≥ 1500.

**📊 Rütbe İlerlemesi:** 6–10 görev tamamlandığında Aşama 7'ye geçiş.

---

### 7.7 AŞAMA 7 — Lead / Principal

**🎯 Hedef Beceriler:**
- Birden fazla müşteri projesini aynı anda yönetme
- Mimari kararlar (monolith vs microservice)
- Ekip yönetimi ve delegasyon
- Maliyet optimizasyonu
- Altyapı faturası yönetimi

**📚 Öğretilen Konseptler:**
| Konsept | Açıklama |
|---------|----------|
| Proje portföy yönetimi | Paralel projeler arası önceliklendirme |
| Mimari karar verme | Servis ayrımı kararları, trade-off analizi |
| Delegasyon | NPC çalışanlara görev atama, sonuçları denetleme |
| Kod review | NPC çalışanların hata log'larını okuma ve düzeltme |
| Maliyet optimizasyonu | Sunucu seçimi, kaynak verimliliği, over-provisioning tespiti |
| Fatura yönetimi | Aylık sunucu maliyeti vs gelir dengesi |
| Ekip yapılandırma | Doğru kişiyi doğru göreve atama |

**📝 Örnek Görev Senaryosu:**

> **Durum:** Kendi şirketini kurdun. 3 müşteri projen var, 2 NPC çalışanın var. Bu ay:
>
> **Proje A:** E-ticaret platformu — Kubernetes'e geçiş (Senior seviye görev)
> **Proje B:** Startup API'si — Docker Compose kurulumu (Mid seviye görev)
> **Proje C:** Veri pipeline — Monitoring entegrasyonu (Mid-Senior seviye görev)
>
> **Kararlar:**
> - Proje A'yı kendin mi yapacaksın, yoksa senior NPC çalışana mı delege edeceksin?
> - Proje B'yi junior NPC çalışana verebilir misin? Hata riski nedir?
> - Proje C'nin deadline'ı yaklaşıyor — öncelik sıralaması ne olmalı?
> - Bu ayın sunucu faturası 3.200₺ — gelir 8.500₺ — kâr marjı yeterli mi?
> - NPC çalışanın gönderdiği Dockerfile'da `USER root` kalmış — düzeltmezsen güvenlik açığı oluşur.

**NPC Çalışan Yönetimi:**
```
NPC Çalışan Gönderisi:
  "Proje B'nin Dockerfile'ını yazdım, review eder misin?"

Oyuncu:
  → NPC'nin yazdığı Dockerfile'ı incele
  → Hataları tespit et (örn: root user, gereksiz layer, eksik health check)
  → Geri bildirim ver veya kendin düzelt
  → Kabul et ve müşteriye gönder
```

**🔓 Açılış Koşulu:** Aşama 6'da en az 6 görev başarıyla tamamlanmış olması + kendi şirketi kurulmuş + en az 1 NPC çalışan işe alınmış + toplam kariyer puanı ≥ 3000.

---

### 7.8 Rütbe Sistemi Özet Tablosu

| Aşama | Rütbe | Ana Odak | Min. Görev (geçiş için) | Kariyer Puanı Eşiği | Dil/Teknoloji |
|-------|-------|----------|--------------------------|----------------------|---------------|
| 1 | Junior | Basit Dockerfile | 3–5 | — | Python |
| 2 | Junior+ | Multi-stage, güvenlik | 4–6 | — | Python, JS, Go |
| 3 | Junior→Mid | Dockerfile + Compose | 4–6 | — | Python + PostgreSQL |
| 4 | Mid | Çoklu servis, network, resource limit | 5–8 | 500 | Python, Node.js, Redis, PostgreSQL |
| 5 | Mid-Senior | CI/CD, K8s temelleri, sıfırdan tasarım | 5–8 | 1500 | Çoklu dil + GitHub Actions + K8s |
| 6 | Senior | Tam K8s stack, monitoring, incident response | 6–10 | 3000 | Tam DevOps/MLOps yığını |
| 7 | Lead/Principal | Yönetim, mimari, maliyet, ekip | ∞ (sandbox) | 5000 | — (yönetim odaklı) |

---

## 8. Repo / Görev İçeriği Üretim Mimarisi

### 8.1 Hibrit Şablon Sistemi

Görev içeriklerinin üretimi **hibrit bir yaklaşım** kullanır. Bu yaklaşım iki katmandan oluşur:

```
┌─────────────────────────────────────────────────────┐
│                   GÖREV İÇERİĞİ                     │
│                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │   STATİK KATMAN      │  │   DİNAMİK KATMAN     │ │
│  │   (Kod Dosyaları)     │  │   (Senaryo Metni)     │ │
│  │                      │  │                      │ │
│  │  • main.py           │  │  • README.md          │ │
│  │  • app.js            │  │  • Şirket arka planı  │ │
│  │  • main.go           │  │  • Teknik kısıtlamalar│ │
│  │  • requirements.txt  │  │  • Beklentiler        │ │
│  │  • package.json      │  │  • Senaryo bağlamı    │ │
│  │  • go.mod            │  │                      │ │
│  │                      │  │  AI tarafından        │ │
│  │  Önceden test        │  │  şablon + seed ile    │ │
│  │  edilmiş, statik     │  │  dinamik üretilir     │ │
│  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 8.2 Statik Katman — Kod Dosyaları

| Özellik | Detay |
|---------|-------|
| **İçerik** | `main.py`, `app.js`, `main.go`, `requirements.txt`, `package.json`, `go.mod` vb. |
| **Üretim şekli** | Tamamen **önceden yazılmış ve test edilmiş** |
| **Depolama** | Oyuna **asset** olarak gömülü |
| **AI müdahalesi** | **Hiçbir zaman** anlık üretilmez |
| **Güncelleme** | Sadece geliştirici ekip tarafından, yeni versiyon ile |

**Neden statik?**

> AI tarafından anlık üretilen kodun bozuk olma riski vardır. Eğitim deneyiminde oyuncunun yazdığı Dockerfile/Compose hatalıyken, altındaki uygulama kodunun da hatalı olması **eğitim deneyimini mahveder**. Oyuncu kendi hatasını mı yoksa uygulamanın hatasını mı debug ettiğini ayırt edemez. Bu nedenle uygulama kodu **her zaman çalışır durumda** olmalıdır.

### 8.3 Dinamik Katman — Senaryo Metni

| Özellik | Detay |
|---------|-------|
| **İçerik** | README görev talimatı, şirket hikâyesi, teknik kısıtlamalar listesi, beklentiler |
| **Üretim şekli** | Bir **şablon** üzerine **AI tarafından dinamik** olarak üretilir |
| **Girdi** | Şablon + zorluk seviyesi + rastgele seed |
| **AI çağrısı** | Her görev başlangıcında kısa bir prompt gönderilir |
| **Çıktı** | Yalnızca **metin** (kod üretimi yapılmaz) |

**Neden dinamik?**

> Oyuncu aynı zorluk seviyesini tekrar oynadığında **farklı bir senaryo metniyle** karşılaşır. Bu, ezberlemeyi engeller ve her oynanışı taze tutar. Aynı zamanda API maliyetini minimumda tutar — çünkü yalnızca kısa metin üretimi yapılır, kod üretimi yapılmaz.

### 8.4 Üretim Akışı

```
1. Oyuncu yeni görev alır
2. Sistem, görev seviyesine uygun bir şablon seçer
3. Şablon + zorluk parametreleri + rastgele seed → AI'ya gönderilir
4. AI, şablon üzerine benzersiz senaryo metni üretir (şirket adı, bağlam, motivasyon)
5. Statik kod dosyaları şablondan çekilir (önceden test edilmiş)
6. Senaryo metni + statik dosyalar birleştirilir → oyun içi repo oluşturulur
```

### 8.5 Şablon Örneği

```json
{
  "templateId": "t_junior_basic_dockerfile",
  "stage": 1,
  "difficulty": "easy",
  "staticAssets": {
    "main.py": "assets/stage1/fastapi_basic/main.py",
    "requirements.txt": "assets/stage1/fastapi_basic/requirements.txt"
  },
  "aiPromptTemplate": "Bir {{industryType}} şirketi için çalışan junior bir backend mühendisine görev ver. Şirketin adı {{companyName}} olsun. Görev: verilen Python FastAPI uygulamasını Docker container'ına paketlemek. Ton: profesyonel ama samimi. Teknik kısıtlamalar: base image python:3.11-slim, port {{port}}, WORKDIR /app. README formatında yaz.",
  "variables": {
    "industryType": ["fintech", "e-ticaret", "sağlık-teknoloji", "eğitim-teknoloji", "lojistik"],
    "companyName": "AI_GENERATED",
    "port": 8000
  },
  "expectedCriteria": {
    "hasFrom": true,
    "baseImage": "python:*-slim",
    "hasWorkdir": true,
    "hasCopy": true,
    "hasExpose": true,
    "exposePort": 8000,
    "hasCmd": true
  }
}
```

### 8.6 Kod Editörü Yazım Kolaylıkları (IDE QoL)

Kod Editörü bileşeni (`EditorTab.jsx`), geliştirici deneyimini modern IDE seviyesine taşıyan reaktif yazım kolaylıklarına sahiptir:

- **Otomatik Kapanan Parantez ve Tırnaklar:** `(`, `[`, `{`, `"`, `'`, `` ` `` tuşlarına basıldığında otomatik olarak çift oluşturulur ve imleç karakterlerin tam arasına yerleşir.
- **Otomatik Metin Sarma (autoSurround):** Editörde herhangi bir kod bloğu veya metin seçiliyken tırnak veya parantez tuşuna basıldığında, seçili metin silinmez; otomatik olarak o tırnak/parantez çiftiyle sarılır (`(selectedCode)` veya `[selectedCode]`).
- **Type-Over Mekanizması:** İmleç zaten kapanmış bir parantez veya tırnağın önündeyse ve kullanıcı aynı kapanış karakterini yazarsa, yinelenen karakter eklenmez; imleç bir karakter sağa atlar.
- **Çift Karakter Backspace Silme:** İmleç boş bir `()`, `[]`, `{}`, `""`, `''` veya ```` `` ```` çiftinin ortasındayken Backspace tuşuna basıldığında her iki karakter tek hamlede silinir.
- **Akıllı Girinti (Tab Indentation):** Tab tuşuna basıldığında 2 boşlukluk kod girintisi eklenir ve imleç pozisyonu senkronize edilir.

### 8.7 Masaüstü, Dosya Gezgini ve Klasör Özellikleri (Properties)

Masaüstü ve Dosya Gezgini (File Explorer) bileşenleri, Windows XP tarzı bağlam menüsü (Context Menu) ve özellikler penceresiyle donatılmıştır:

- **Sağ Tık Bağlam Menüsü:**
  - **Klasörler İçin:** `▶ Aç`, `💻 Terminal ile Aç`, `📝 IDE ile Aç`, `🗑️ Sil`, `⚙️ Özellikler`.
  - **Dosyalar İçin:** `▶ Aç`, `🗑️ Sil`, `⚙️ Özellikler`.
  - **Masaüstü/Boş Alan İçin:** `↻ Yenile`, `📁 Yeni Klasör`, `📝 Yeni Metin Belgesi`, `⚙️ Özellikler`.
- **Özellikler (Properties) Modalı:** VFS ağacından dinamik ve recursive olarak:
  - **Dosya/Klasör Türü:** `Dosya Klasörü`, `Python Dosyası`, `Docker İmaj Tanım Dosyası` vb.
  - **Konum (Path):** Tam VFS mutlak yolu (`/home/user/...`).
  - **Boyut (Size):** Okunabilir ve bayt cinsinden recursive toplam boyut (`45.2 KB (46.280 bayt)`).
  - **İçerik:** Klasör içindeki toplam dosya ve alt klasör sayısı (`X dosya, Y klasör`).
  - **Sahiplik:** Kullanıcı izinleri (`user`).
  - **Değiştirilme Tarihi:** Son düzenleme zaman damgası.
- **Terminal ve IDE ile Klasör Açma:** "💻 Terminal ile Aç" seçildiğinde Terminal doğrudan o klasörün `currentPath` değerinde açılır (`vfs.cd(path)`). "📝 IDE ile Aç" seçildiğinde editör ve entegre terminal ilgili dizin bağlamında başlatılır.

---

## 9. Docker / Terminal Simülasyon Mimarisi

> **Bu, oyunun en kritik teknik modülüdür.** Gerçek bir Docker daemon çalıştırılmaz. Her şey simüle edilir. Oyuncunun kendi gerçek bilgisayarında `localhost` yazması hiçbir sonuç doğurmaz; sistem tamamen oyun içi izole bir state'tir.

### 9.1 Genel Mimari

```
┌──────────────────────────────────────────────────────────────┐
│                      OYUNCU ARAYÜZÜ                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  xterm.js     │  │ Monaco Editor │  │ Oyun İçi Tarayıcı │  │
│  │  (Terminal)   │  │ (Kod Editörü) │  │ (localhost sim.)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │              │
└─────────┼─────────────────┼────────────────────┼──────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    KOMUT YORUMLAYICI                          │
│                                                              │
│  Desteklenen komutlar:                                       │
│  • ls, cd, cat, mkdir, pwd, echo, touch, rm                  │
│  • git clone, git pull, git push, git status, git add,       │
│    git commit                                                │
│  • docker build, docker run, docker ps, docker images,       │
│    docker stop, docker rm                                    │
│  • docker compose up, docker compose down,                   │
│    docker compose ps, docker compose logs                    │
│  • kubectl get, kubectl apply, kubectl describe,             │
│    kubectl logs, kubectl delete                              │
│  • cat, nano/vim (basitleştirilmiş), code (Monaco'ya geç)   │
│                                                              │
│  Tanınmayan komut → "command not found" hatası               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              DOCKERFILE / COMPOSE PARSER                     │
│                                                              │
│  Desteklenen direktifler:                                    │
│  Dockerfile: FROM, RUN, COPY, ADD, WORKDIR, EXPOSE, ENV,    │
│              USER, CMD, ENTRYPOINT, ARG, LABEL,              │
│              HEALTHCHECK, VOLUME, multi-stage (AS)           │
│  Compose: version, services, build, image, ports, volumes,   │
│           environment, env_file, networks, depends_on,       │
│           deploy.resources, command, healthcheck,            │
│           restart                                            │
│  K8s: apiVersion, kind, metadata, spec, containers,         │
│       resources, ports, volumeMounts, env, configMapRef,     │
│       secretRef, replicas, selector, template,               │
│       ingress rules, HPA spec                                │
│                                                              │
│  Çıktı: Yapılandırılmış AST (Abstract Syntax Tree)          │
└──────────────────────────┬───────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
┌──────────────────┐ ┌───────────┐ ┌────────────────┐
│  BUILD LOG       │ │  HATA     │ │  KRITER        │
│  ÜRETİCİ        │ │  SİMÜLATÖRÜ│ │  KONTROL       │
│                  │ │           │ │                │
│ Gerçek Docker    │ │ Gerçek    │ │ Görev beklenti │
│ çıktısına benzer │ │ Docker    │ │ listesiyle     │
│ satır satır log  │ │ hatalarına│ │ karşılaştırma  │
│ üretimi          │ │ benzer    │ │                │
│                  │ │ mesajlar  │ │                │
└────────┬─────────┘ └─────┬─────┘ └───────┬────────┘
         │                 │               │
         └─────────────────┼───────────────┘
                           ▼
                ┌─────────────────────┐
                │  SONUÇ BELİRLEME    │
                │                     │
                │  Build başarılı mı? │
                │  Kriterler sağlandı │
                │  mı?                │
                │                     │
                │  ┌───────┐ ┌──────┐ │
                │  │Başarı │ │Hata  │ │
                │  └───┬───┘ └──┬───┘ │
                └──────┼────────┼─────┘
                       ▼        ▼
              ┌──────────────────────┐
              │  TARAYICI SONUCU     │
              │                      │
              │  ✅ Başarı sayfası   │
              │  (Swagger UI,        │
              │   web app sayfası)   │
              │                      │
              │  ❌ Bağlantı hatası  │
              │  ("Bu siteye         │
              │   ulaşılamıyor")     │
              └──────────────────────┘
```

### 9.2 Dockerfile Parser Detayları

Parser, yazılan Dockerfile'ı satır satır analiz eder ve bir **AST (Abstract Syntax Tree)** oluşturur.

**Parser Kuralları:**

| Durum | Parser Davranışı |
|-------|------------------|
| Geçerli `FROM` satırı | Base image kaydedilir, yeni stage başlar |
| `FROM ... AS <name>` | Multi-stage build tespit edilir |
| `RUN pip install` | Bağımlılık kurulumu olarak işaretlenir |
| `COPY . .` | Dosya kopyalama kaydedilir |
| `EXPOSE <port>` | Açılan port kaydedilir |
| `USER <username>` | Non-root kullanıcı kontrolü |
| `CMD` veya `ENTRYPOINT` | Başlatma komutu kaydedilir |
| `HEALTHCHECK` | Sağlık kontrolü konfigürasyonu |
| Sözdizimi hatası | Hata satırı ve tipi kaydedilir |
| Bilinmeyen direktif | Uyarı üretilir |
| Boş `FROM` | "No base image specified" hatası |
| `FROM` olmadan `RUN` | "No FROM directive found" hatası |

**Parser Çıktı Örneği (İç Yapı):**

```json
{
  "stages": [
    {
      "name": null,
      "baseImage": "python:3.11-slim",
      "directives": [
        { "type": "WORKDIR", "args": ["/app"] },
        { "type": "COPY", "src": "requirements.txt", "dst": "." },
        { "type": "RUN", "command": "pip install --no-cache-dir -r requirements.txt" },
        { "type": "COPY", "src": ".", "dst": "." },
        { "type": "EXPOSE", "port": 8000 },
        { "type": "CMD", "command": ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] }
      ]
    }
  ],
  "errors": [],
  "warnings": [],
  "metadata": {
    "isMultiStage": false,
    "hasNonRootUser": false,
    "exposedPorts": [8000],
    "hasHealthcheck": false,
    "estimatedImageSize": "~180MB"
  }
}
```

### 9.3 Sahte Build Log Üretimi

Parser çıktısına göre **gerçek Docker build çıktısına birebir benzer** bir log üretilir:

**Başarılı Build Örneği:**
```
$ docker build -t myapp .
[+] Building 12.3s (9/9) FINISHED
 => [internal] load build definition from Dockerfile              0.0s
 => => transferring dockerfile: 267B                              0.0s
 => [internal] load .dockerignore                                 0.0s
 => [internal] load metadata for docker.io/library/python:3.11-slim  1.2s
 => [1/5] FROM docker.io/library/python:3.11-slim@sha256:abc123   2.1s
 => [2/5] WORKDIR /app                                            0.1s
 => [3/5] COPY requirements.txt .                                 0.1s
 => [4/5] RUN pip install --no-cache-dir -r requirements.txt      7.8s
 => [5/5] COPY . .                                                0.1s
 => exporting to image                                            0.8s
 => => naming to docker.io/library/myapp:latest                   0.0s

Successfully built a1b2c3d4e5f6
Successfully tagged myapp:latest
```

**Hatalı Build Örneği (Eksik FROM):**
```
$ docker build -t myapp .
ERROR: failed to solve: dockerfile parse error on line 1:
  unknown instruction: WORKDR (did you mean WORKDIR?)
```

**Hatalı Build Örneği (Yanlış Base Image):**
```
$ docker build -t myapp .
[+] Building 3.2s (2/2) FINISHED
 => [internal] load build definition from Dockerfile              0.0s
 => ERROR [1/5] FROM docker.io/library/pythn:3.11-slim            3.1s
------
 > [1/5] FROM docker.io/library/pythn:3.11-slim:
------
ERROR: failed to solve: pythn:3.11-slim: docker.io/library/pythn:3.11-slim:
  not found: manifest unknown
```

### 9.4 Hata Simülasyonu Kataloğu

| Hata Tipi | Tetikleyen Durum | Simüle Edilen Mesaj |
|-----------|------------------|---------------------|
| Sözdizimi hatası | Yanlış yazılmış direktif | `unknown instruction: WORKDR (did you mean WORKDIR?)` |
| Base image bulunamadı | Geçersiz image adı | `manifest unknown: not found` |
| Port çakışması | Aynı portun iki kez açılması | `port is already allocated` |
| COPY kaynak bulunamadı | Olmayan dosya referansı | `COPY failed: file not found in build context` |
| Non-root uyarısı | `USER` direktifi yokken güvenlik kontrolü | `WARNING: Running as root. Consider using USER directive` |
| Derleyici kalıntısı | Multi-stage'de build araçları final'de | `SECURITY WARNING: Build tools detected in final image` |
| Compose servis hatası | Yanlış servis referansı | `service "xyz" depends on undefined service "abc"` |
| Network hatası | Tanımlanmamış network | `network "mynet" is declared but not defined` |
| Volume hatası | Geçersiz volume path | `invalid volume specification` |
| OOMKilled (K8s) | Düşük memory limit | `OOMKilled: Container exceeded memory limit` |
| CrashLoopBackOff (K8s) | Başarısız health check | `CrashLoopBackOff: Back-off restarting failed container` |

### 9.5 Check Mission Akışı

"Check Mission" butonu tıklandığında çalışan değerlendirme süreci:

```
┌────────────────────┐
│  CHECK MISSION     │
│  butonu tıklandı   │
└────────┬───────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  1. DOSYA TOPLAMA                      │
│  - Dockerfile içeriği                  │
│  - docker-compose.yml içeriği          │
│  - Varsa K8s manifest'leri             │
│  - Varsa CI/CD YAML'ları               │
│  - Build log sonucu (başarı/hata)      │
└────────────────────┬───────────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│  2. KRİTER KARŞILAŞTIRMA (yerel)      │
│  - Görevin expectedCriteria listesiyle │
│    oyuncunun dosyaları karşılaştırılır │
│  - Mekanik kontroller:                 │
│    ✓ Base image doğru mu?              │
│    ✓ Port doğru açılmış mı?            │
│    ✓ Non-root user var mı?             │
│    ✓ Volume tanımlanmış mı?            │
│    ✓ depends_on doğru mu?              │
│    ✓ Resource limit var mı?            │
└────────────────────┬───────────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│  3. AI DEĞERLENDİRME KATMANI          │
│  - Yerel kriter sonuçları +            │
│    oyuncu dosyaları AI'ya gönderilir   │
│  - AI, pedagojik feedback üretir:      │
│    • Neyin yanlış olduğu               │
│    • Neden yanlış olduğu               │
│    • Nasıl düzeltileceği               │
│    • Best practice önerileri            │
│    • Puan (0-100)                      │
└────────────────────┬───────────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│  4. SONUÇ EKRANI                       │
│                                        │
│  ✅ Başarılı (puan ≥ 70):             │
│  - Görev tamamlandı olarak işaretlenir │
│  - Para ödülü verilir                  │
│  - Aylık bakım geliri başlar           │
│  - Kariyer puanı eklenir               │
│  - AI feedback gösterilir (iyileştirme │
│    önerileriyle)                        │
│                                        │
│  ❌ Başarısız (puan < 70):            │
│  - Görev açık kalır                    │
│  - AI feedback detaylı olarak          │
│    gösterilir (adım adım rehberlik)    │
│  - Oyuncu düzeltip tekrar deneyebilir  │
└────────────────────────────────────────┘
```

**AI Feedback Örneği:**

```
╔══════════════════════════════════════════════════════════╗
║  📝 GÖREV DEĞERLENDİRME — Puan: 62/100                 ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ✅ Doğru Yapılanlar:                                    ║
║  • Base image doğru seçilmiş (python:3.11-slim)          ║
║  • WORKDIR doğru ayarlanmış (/app)                       ║
║  • requirements.txt önce kopyalanmış (layer cache ✓)     ║
║                                                          ║
║  ❌ Düzeltilmesi Gerekenler:                             ║
║                                                          ║
║  1. EXPOSE direktifi eksik                               ║
║     Neden: Container dışından erişim için port            ║
║     belirtilmeli.                                        ║
║     Düzeltme: Dockerfile'a `EXPOSE 8000` ekle.           ║
║                                                          ║
║  2. Root kullanıcı olarak çalışıyor                      ║
║     Neden: Güvenlik riski — container root yetkileriyle   ║
║     çalışmamalı.                                         ║
║     Düzeltme:                                            ║
║       RUN adduser --disabled-password appuser             ║
║       USER appuser                                       ║
║                                                          ║
║  💡 İpucu: `--no-cache-dir` flag'ını pip install'a       ║
║     ekleyerek image boyutunu küçültebilirsin.            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

### 9.6 Oyun İçi Tarayıcı Simülasyonu

Oyun içi tarayıcıda `localhost:PORT` ziyaret edildiğinde:

| Durum | Gösterim |
|-------|----------|
| Görev doğru çözüldü + build başarılı | Önceden hazırlanmış **başarı sayfası** (Swagger UI, web app ana sayfası, API response ekranı) |
| Görev çözülmedi / build başarısız | Gerçekçi bir **bağlantı hatası sayfası** ("Bu siteye ulaşılamıyor — localhost yanıt vermedi") |
| Port yanlış | "Bağlantı reddedildi" sayfası |

### 9.7 Tutorial Hub

Oyun içi bilgisayarda erişilebilir, önceden hazırlanmış eğitim dosyaları:

| Dosya | İçerik |
|-------|--------|
| `linux_basics.md` | Temel Linux komutları (ls, cd, cat, mkdir, rm, grep, pipe) |
| `dockerfile_basics.md` | Dockerfile direktifleri, layer mantığı, best practice |
| `multistage_build.md` | Multi-stage build konsepti, neden kullanılır, örnekler |
| `docker_compose.md` | Compose dosya yapısı, servisler, network, volume |
| `kubernetes_basics.md` | Pod, Deployment, Service, ConfigMap, Secret konseptleri |
| `github_actions.md` | Workflow YAML yapısı, trigger, job, step |
| `cicd_concepts.md` | CI/CD felsefesi, pipeline tasarımı, best practice |
| `security_best_practices.md` | Non-root user, secret yönetimi, image scanning |

### 9.8 Sahte İmaj Boyutu Hesaplama ve Optimizasyon Doğrulama Motoru (Katman 3)

Docker simülatörü, endüstri standardı imaj boyutu optimizasyonu ve multi-stage build prensiplerini öğretmek için gerçekçi bir boyut hesaplama motoruna sahiptir:

#### Taban İmaj Boyutları Tablosu:
| Taban İmaj (Base Image) | Taban Boyut |
|-------------------------|-------------|
| `python:3.11` / `python:latest` | ~950MB |
| `python:3.11-slim` / `python:3.10-slim` | ~150MB |
| `python:3.11-alpine` | ~55MB |
| `node:20` / `node:latest` | ~1.10GB (1100MB) |
| `node:20-slim` | ~200MB |
| `node:20-alpine` | ~180MB |
| `golang:1.22` | ~850MB |
| `golang:alpine` | ~300MB |
| `ubuntu:latest` / `22.04` | ~78MB |
| `debian:bookworm` | ~110MB |
| `debian:bookworm-slim` | ~80MB |
| `alpine:latest` | ~7.5MB |
| `nginx:alpine` | ~40MB |
| `nginx:latest` | ~190MB |
| `postgres:alpine` | ~90MB |
| `postgres:15` | ~450MB |

#### Katman ve Multi-Stage Hesaplama Kuralları:
- **RUN Komutları:**
  - `apt-get install gcc build-essential ...`: +280MB
  - `apt-get install git curl wget ...`: +35MB
  - `pip install torch / tensorflow`: +750MB
  - `pip install numpy pandas scikit-learn`: +220MB-240MB
  - `pip install fastapi uvicorn`: +35MB
  - `npm install / npm ci`: +85MB
  - `go build`: +25MB
- **COPY / ADD Komutları:**
  - `COPY . .` (.dockerignore varsa): +45MB
  - `COPY . .` (.dockerignore yoksa): +110MB
  - Seçici dosya kopyalama (`COPY app.py .`): +2MB
- **Multi-Stage Build Prensibi:** Yalnızca **son (final) stage** içerisindeki taban imaj ve katmanlar nihai imaj boyutuna dahil edilir. Builder aşamasındaki derleme araçları (`gcc`, `make`, `python3-dev`) nihai imajı şişirmez.

#### Check Mission Boyut Doğrulaması ve AI Geri Bildirimi:
Görev kriterlerinde `expectedCriteria.maxImageSizeMB` tanımlandığında, oyuncunun oluşturduğu imaj boyutu değerlendirilir:
- Limit aşıldığında görev reddedilir (`passed: false`) ve somut ipuçları üretilir:
  - *"Multi-stage build kullanılmadığı için derleyici araçları final image'da kalmış, bu ~300MB gereksiz yer kaplıyor."*
  - *"python:3.11 yerine python:3.11-slim veya alpine kullanılsaydı ~800MB tasarruf sağlanırdı."*
  - *".dockerignore kullanılmadığı veya seçici COPY yapılmadığı için gereksiz dosyalar image'a dahil olmuş."*
- `docker images` ve `docker image ls` komutları terminalde hesaplanan bu boyutu gerçekçi `SIZE` sütununda (`154MB`, `1.25GB`) listeler.

---

## 10. Veri Modelleri

### 10.1 GameState

Oyuncunun anlık durumunu tutan ana veri modeli:

```json
{
  "gameState": {
    "version": "1.0.0",
    "timestamp": "2024-01-15T14:30:00Z",
    "dayCount": 12,
    "currentTime": "14:30",
    "currentScene": "home",

    "character": {
      "name": "Oyuncu",
      "rank": "junior_plus",
      "careerPoints": 245,
      "totalCompletedMissions": 7
    },

    "bars": {
      "sleep": { "current": 72, "max": 100, "decayRate": 0.8 },
      "hunger": { "current": 55, "max": 100, "decayRate": 1.2 },
      "health": { "current": 88, "max": 100, "decayRate": 0.1 },
      "stress": { "current": 35, "max": 100, "decayRate": -0.3 }
    },

    "finance": {
      "balance": 4250,
      "monthlyPassiveIncome": 450,
      "monthlyExpenses": {
        "rent": 800,
        "serverCosts": 0,
        "employeeSalaries": 0
      },
      "incomeHistory": []
    },

    "relationships": {
      "npc_anna_01": {
        "level": 32,
        "status": "acquaintance",
        "isPartner": false,
        "flags": { "anna_owes_money": true },
        "lastInteraction": "2024-01-14T18:00:00Z"
      },
      "npc_mehmet_03": {
        "level": 15,
        "status": "stranger",
        "isPartner": false,
        "flags": {},
        "lastInteraction": null
      }
    },

    "career": {
      "currentEmployer": "company_techstart",
      "activeMissions": ["mission_005"],
      "completedMissions": ["mission_001", "mission_002", "mission_003", "mission_004"],
      "ownCompany": null,
      "employees": []
    },

    "inventory": {
      "fridge": [
        { "item": "bread", "quantity": 2, "healthValue": 10, "hungerValue": 15 },
        { "item": "eggs", "quantity": 6, "healthValue": 15, "hungerValue": 20 }
      ],
      "wardrobe": ["casual_outfit_1", "formal_suit_1"]
    },

    "housing": {
      "currentHome": "starter_apartment",
      "barRecoveryMultiplier": 1.0,
      "monthlyRent": 800
    },

    "substanceUse": {
      "cigaretteUseCount": 3,
      "alcoholUseCount": 1,
      "healthPenaltyAccumulated": 2.5,
      "focusBonusActive": false,
      "focusBonusExpiresAt": null
    },

    "technicalDebt": {
      "totalDebt": 12,
      "incidentRiskMultiplier": 1.1
    },

    "todayEvents": [
      { "type": "npc_encounter", "npcId": "npc_anna_01", "location": "park", "outcome": "positive" },
      { "type": "mission_progress", "missionId": "mission_005", "action": "docker_build_success" }
    ]
  }
}
```

### 10.2 NPC

```json
{
  "npc": {
    "id": "npc_anna_01",
    "name": "Anna Yılmaz",
    "gender": "female",
    "age": 27,
    "personality": {
      "type": "extrovert_adventurous",
      "traits": ["curious", "generous", "impulsive"],
      "conflictStyle": "confrontational"
    },
    "interests": ["technology", "travel", "music", "photography"],
    "profession": {
      "title": "UX Designer",
      "company": "company_designhub",
      "canProvideJobReferral": true,
      "referralMinRelationship": 50
    },
    "frequentLocations": {
      "pub": 0.6,
      "park": 0.3,
      "cinema": 0.4,
      "gallery": 0.2,
      "market": 0.1
    },
    "initialRelationship": {
      "level": 0,
      "status": "stranger"
    },
    "eventPool": [
      "evt_casual_greeting",
      "evt_borrow_money",
      "evt_coffee_invite",
      "evt_date_invite",
      "evt_job_referral",
      "evt_fight_argument",
      "evt_gift_exchange",
      "evt_jealousy",
      "evt_collaboration_offer"
    ],
    "dialogueStyle": "friendly_witty",
    "visualTraits": {
      "avatar": "anna_default.png",
      "outfits": ["casual", "formal", "sporty"]
    },
    "schedule": {
      "weekday": { "morning": "work", "afternoon": "work", "evening": "social" },
      "weekend": { "morning": "home", "afternoon": "explore", "evening": "social" }
    }
  }
}
```

### 10.3 Event (Olay)

```json
{
  "event": {
    "id": "evt_anna_borrow_money",
    "type": "social_economic",
    "category": "money_request",
    "triggerConditions": {
      "locations": ["pub", "park", "cinema"],
      "npcId": "npc_anna_01",
      "minRelationshipLevel": 20,
      "maxRelationshipLevel": 80,
      "probability": 0.3,
      "cooldownDays": 7,
      "requiredFlags": [],
      "excludedFlags": ["anna_already_borrowed_twice"]
    },
    "chain": [
      {
        "step": 1,
        "type": "message",
        "speaker": "narrator",
        "message": "Anna sana selam verdi ve yanına geldi.",
        "choices": [
          {
            "id": "greet",
            "text": "Selam Anna! Nasılsın?",
            "effects": { "relationship": 2, "time": 5 },
            "nextStep": 2
          },
          {
            "id": "ignore",
            "text": "Görmezden gel, yoluna devam et.",
            "effects": { "relationship": -5 },
            "nextStep": null,
            "endMessage": "Anna hafifçe omuz silkip uzaklaştı."
          }
        ]
      },
      {
        "step": 2,
        "type": "dialogue",
        "speaker": "npc_anna_01",
        "message": "İyiyim ama biraz sıkıştım açıkçası. Cüzdanımı evde unutmuşum, 50 lira borç verir misin? Yarın kesin öderim.",
        "choices": [
          {
            "id": "lend",
            "text": "Tabii, al. Acele etme ödemeye.",
            "effects": {
              "money": -50,
              "relationship": 10,
              "stress": -2
            },
            "setFlags": { "anna_owes_money": true },
            "nextStep": null,
            "endMessage": "Anna teşekkür edip gülümsedi. Borç not edildi.",
            "futureEvent": "evt_anna_repay_money"
          },
          {
            "id": "decline",
            "text": "Kusura bakma, şu an bende de yok.",
            "effects": {
              "relationship": -3,
              "stress": 1
            },
            "nextStep": null,
            "endMessage": "Anna anlayışla başını salladı ama hafif bir hayal kırıklığı yüzünden okunuyordu."
          }
        ]
      }
    ],
    "metadata": {
      "estimatedDuration": 5,
      "toneTag": "casual_friendly",
      "impactLevel": "medium"
    }
  }
}
```

### 10.4 Mission (Görev)

```json
{
  "mission": {
    "id": "mission_005",
    "stage": 2,
    "rank": "junior_plus",
    "title": "Güvenli Python API Container",
    "company": "company_securecloud",

    "staticAssets": {
      "main.py": "assets/stage2/secure_api/main.py",
      "requirements.txt": "assets/stage2/secure_api/requirements.txt",
      "tests/test_main.py": "assets/stage2/secure_api/tests/test_main.py"
    },

    "scenarioTemplate": {
      "templateId": "t_junior_plus_multistage",
      "aiPrompt": "SecureCloud Teknoloji şirketi için güvenlik odaklı bir Python API containerization görevi yaz. Multi-stage build, non-root user ve image optimizasyonu gereksinimlerini vurgula.",
      "generatedScenario": null
    },

    "expectedCriteria": {
      "dockerfile": {
        "isMultiStage": true,
        "hasNonRootUser": true,
        "baseImagePattern": "python:*-slim",
        "noCompilerInFinal": true,
        "exposedPort": 8000,
        "hasCmd": true,
        "maxEstimatedSize": "150MB"
      },
      "compose": null,
      "kubernetes": null,
      "cicd": null
    },

    "rewards": {
      "money": 750,
      "monthlyMaintenance": 150,
      "careerPoints": 35,
      "xpBreakdown": {
        "dockerfile": 20,
        "security": 10,
        "optimization": 5
      }
    },

    "status": "in_progress",
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": null,
    "attempts": 2,
    "bestScore": 62,
    "feedbackHistory": []
  }
}
```

### 10.5 CompanyContract

```json
{
  "companyContract": {
    "id": "company_techstart",
    "name": "TechStart Yazılım A.Ş.",
    "industry": "fintech",
    "size": "startup",
    "logo": "techstart_logo.png",

    "availableRanks": ["junior", "junior_plus"],
    "reputationWithPlayer": 75,

    "missionPool": [
      "mission_001",
      "mission_002",
      "mission_003"
    ],

    "payScale": {
      "junior": { "oneTime": 300, "monthly": 75 },
      "junior_plus": { "oneTime": 600, "monthly": 125 }
    },

    "hiringRequirements": {
      "minRank": "junior",
      "minCareerPoints": 0,
      "interviewDifficulty": "easy",
      "npcReferralBonus": 20
    },

    "serverCostPolicy": "company_pays",
    "techDebtTolerance": 30,

    "contacts": [
      {
        "npcId": "npc_kemal_07",
        "role": "CTO",
        "canHire": true
      }
    ]
  }
}
```

### 10.6 PlayerCompany (Kendi Şirketi)

```json
{
  "playerCompany": {
    "id": "player_company_01",
    "name": "CloudForge Mühendislik",
    "foundedAt": "2024-03-15",

    "office": {
      "type": "small_office",
      "monthlyRent": 2000,
      "capacity": 5,
      "barRecoveryBonus": 0.15
    },

    "employees": [
      {
        "npcId": "npc_berk_05",
        "role": "junior_developer",
        "salary": 1500,
        "skillLevel": 0.6,
        "errorRate": 0.15,
        "assignedMissions": ["mission_020"]
      }
    ],

    "clients": ["company_megascale", "company_dataflow"],
    "activeMissions": ["mission_018", "mission_019", "mission_020"],

    "finances": {
      "monthlyIncome": 8500,
      "monthlyExpenses": {
        "rent": 2000,
        "salaries": 1500,
        "serverCosts": 1200
      },
      "netProfit": 3800
    },

    "reputation": 72,
    "totalTechDebt": 18
  }
}
```

---

## 11. Teknik Yığın ve Mimari Notlar

### 11.1 Frontend

| Teknoloji | Kullanım Alanı | Neden Seçildi |
|-----------|----------------|---------------|
| **React** | Ana UI framework | Sahne/state bazlı arayüz yönetimi, component mimarisi |
| **Monaco Editor** | Kod editörü (Dockerfile, YAML yazımı) | VSCode'un editör kütüphanesi, sözdizimi vurgulama, otomatik tamamlama, npm'den kolayca kurulabilir |
| **xterm.js** | Terminal simülasyonu | Gerçek shell'e bağlanmadan görsel terminal deneyimi, özelleştirilebilir tema |
| **CSS Modules / Styled Components** | Stil yönetimi | Component bazlı stil izolasyonu |

**Önemli:** Ağır oyun motoruna (Unity, Phaser, PixiJS vb.) gerek **yoktur**. Oyun 1D (sahne + buton + bar) yapısındadır ve standart React bileşenleriyle yönetilebilir.

### 11.2 Backend

| Teknoloji | Kullanım Alanı | Neden Seçildi |
|-----------|----------------|---------------|
| **Node.js** veya **Python (FastAPI)** | API sunucusu | Oyuncu state yönetimi, AI değerlendirme çağrıları, görev yönetimi |
| **SQLite** veya **PostgreSQL** | Veritabanı | Oyuncu kayıtları, ilerleme, NPC durumları |
| **Redis** (opsiyonel) | Oturum yönetimi, cache | Hızlı state erişimi |

### 11.3 AI Entegrasyonu

| Kullanım | Çağrı Sıklığı | Maliyet Profili |
|----------|----------------|-----------------|
| Senaryo metni üretimi (dinamik README) | Görev başına 1 kez | Düşük (kısa metin üretimi) |
| Check Mission değerlendirmesi | Oyuncu "Check Mission" tıkladığında | Orta (dosya analizi + feedback) |
| NPC diyalog çeşitlendirme (opsiyonel) | İsteğe bağlı | Düşük |

### 11.4 Veri Yönetimi

```
data/
├── npcs/
│   ├── npc_anna_01.json
│   ├── npc_mehmet_03.json
│   └── ... (20 dosya)
├── events/
│   ├── social/
│   │   ├── evt_casual_greeting.json
│   │   ├── evt_borrow_money.json
│   │   └── ...
│   ├── career/
│   │   ├── evt_job_referral.json
│   │   └── ...
│   └── romantic/
│       ├── evt_date_invite.json
│       └── ...
├── missions/
│   ├── stage1/
│   │   ├── mission_001.json
│   │   └── ...
│   ├── stage2/
│   └── ...
├── companies/
│   ├── company_techstart.json
│   └── ...
├── templates/
│   ├── scenario_templates/
│   └── ...
└── assets/
    ├── stage1/
    │   └── fastapi_basic/
    │       ├── main.py
    │       └── requirements.txt
    ├── stage2/
    └── ...
```

**Tasarım İlkesi:** NPC olayları, görev şablonları ve senaryo metinleri **JSON formatında** tutulur. Kod değişmeden, sadece veri eklenerek içerik genişletilebilir. Bu, içerik ekibinin (veya topluluk katkılarının) yazılım geliştirme bilgisi olmadan yeni görevler ve olaylar eklemesini mümkün kılar.

### 11.5 Mimari İlkeleri

1. **İzolasyon:** Dockerfile/Compose içerikleri hiçbir zaman gerçekten build/run edilmez. Tüm analiz metin tabanlıdır.
2. **Güvenlik:** Oyuncunun yazdığı hiçbir kod sunucuda çalıştırılmaz. Parser yalnızca metin ayrıştırma yapar.
3. **Genişletilebilirlik:** Yeni görevler, NPC'ler ve olaylar JSON dosyaları eklenerek sisteme dahil edilir.
4. **Determinizm:** Statik kod dosyaları her zaman çalışır durumdadır. Eğitim deneyiminin güvenilirliği garanti edilir.
5. **Maliyet Kontrolü:** AI çağrıları minimize edilir — yalnızca metin üretimi ve değerlendirme için kullanılır.

---

## 12. Yol Haritası / Faz Planı

### Faz 1 — MVP (Minimum Viable Product)

**Hedef:** Temel oyun döngüsünün çalışır halde olması.

| Özellik | Kapsam |
|---------|--------|
| **Ev İçi Sahne** | Tüm tıklanabilir kutucuklar (bilgisayar, telefon, buzdolabı, yatak, kapı) |
| **Bar Sistemi** | Uyku, açlık, stres, sağlık, para — temel etkileşimler |
| **Terminal + Editör** | xterm.js + Monaco Editor — temel komutlar (ls, cd, cat, git, docker build) |
| **Dockerfile Parser** | Temel direktifler (FROM, RUN, COPY, WORKDIR, EXPOSE, CMD) |
| **Sahte Build Log** | Basit başarılı/başarısız build log üretimi |
| **Görevler** | Aşama 1 (Junior) — 5 statik görev |
| **Check Mission** | Yerel kriter kontrolü (AI değerlendirme olmadan, kural tabanlı) |
| **Dış Mekan** | Market (fiziksel) + Park — minimum 2 mekan |
| **NPC** | 5 NPC, temel karşılaşma olayları (selamlaşma, kısa sohbet) |
| **Gün Sonu Özet** | Temel istatistik ekranı |
| **Zaman Sistemi** | 16× hız, eylem bazlı zaman tüketimi |

**Tahmini Süre:** 8–12 hafta

---

### Faz 2 — İçerik Genişletme + AI Entegrasyonu

**Hedef:** Eğitim içeriğinin derinleştirilmesi ve AI katmanının eklenmesi.

| Özellik | Kapsam |
|---------|--------|
| **Görevler** | Aşama 2–4 (Junior+ → Mid Level) — 20+ görev |
| **Docker Compose Parser** | Compose direktiflerinin tam desteği (services, networks, volumes, deploy) |
| **Multi-stage Build** | Multi-stage Dockerfile parser desteği |
| **AI Senaryo Üretimi** | Dinamik README üretimi, şablon + seed sistemi |
| **AI Check Mission** | Pedagojik feedback üretimi (Gemini API entegrasyonu) |
| **Tam NPC Sistemi** | 20 NPC, olay zincirleri, ilişki seviyeleri |
| **Tüm Dış Mekanlar** | Pub, sinema, galeri, emlakçı — tam mekan seti |
| **Kariyer Sistemi** | LinkedIn benzeri platform, mülakat diyalogları, CV mekanizması |
| **Oyun İçi Tarayıcı** | localhost simülasyonu (başarı/hata sayfaları) |
| **Telefon Sistemi** | Mesajlaşma, sosyal medya, online market |
| **Dolap / Görünüm** | Kıyafet değiştirme, sosyal etki |
| **Sigara/Alkol** | Kısa vadeli fayda/uzun vadeli maliyet mekaniği |
| **Tutorial Hub** | 8 eğitim dosyası (linux, dockerfile, compose, k8s, cicd, security) |
| **Ev Yükseltme** | Emlakçı sistemi, bar toparlanma çarpanı |

**Tahmini Süre:** 12–16 hafta

---

### Faz 3 — İleri Seviye + Endgame

**Hedef:** Senior/Lead içerik, şirket kurma ve topluluk altyapısı.

| Özellik | Kapsam |
|---------|--------|
| **Görevler** | Aşama 5–7 (Mid-Senior → Lead/Principal) — 30+ görev |
| **Kubernetes Parser** | K8s manifest parsing (Deployment, Service, Ingress, HPA, PVC, Secret, ConfigMap) |
| **CI/CD Simülasyonu** | GitHub Actions YAML parser, pipeline görselleştirme |
| **Incident Response** | Gece yarısı telefon çalması, canlı sorun teşhis simülasyonu |
| **Teknik Borç Sistemi** | Borç birikimi, incident riski, refactoring görevleri |
| **Şirket Kurma** | Plaza kiralama, NPC çalışan işe alma, ekip yönetimi |
| **Fatura Yönetimi** | Sunucu maliyeti, çalışan maaşları, ofis kirası |
| **NPC Çalışan Kodu İnceleme** | NPC'nin yazdığı hatalı kodu okuma ve düzeltme |
| **Çoklu Proje Yönetimi** | Paralel müşteri projeleri, önceliklendirme |
| **Mimari Kararlar** | Monolith vs microservice karar olayları |
| **Partner İlişkisi Derinliği** | İleri seviye romantik ilişki olayları, ortak yaşam |
| **Başarı / Rozet Sistemi** | Koleksiyon rozetleri, tamamlanma yüzdeleri |
| **Topluluk Görev Editörü** (opsiyonel) | Kullanıcıların kendi görevlerini JSON formatında eklemesi |
| **Leaderboard** (opsiyonel) | Kariyer puanı sıralaması |

**Tahmini Süre:** 16–24 hafta

---

### Faz Özet Tablosu

| Faz | Odak | Aşamalar | NPC | Mekan | Tahmini Süre |
|-----|------|----------|-----|-------|--------------|
| **MVP** | Temel döngü, Dockerfile | 1 | 5 | 2 | 8–12 hafta |
| **Faz 2** | İçerik, AI, Compose, sosyal | 1–4 | 20 | 7 | 12–16 hafta |
| **Faz 3** | K8s, CI/CD, endgame, şirket | 1–7 | 20+ | 9 | 16–24 hafta |

---

## Lisans

TBD — Proje lisansı belirlenmemiştir.

---

> **Bu doküman, MLOps Engineer Simulator projesinin geliştirici referans dokümanıdır.** Oyun tasarımı, teknik mimari ve veri modelleri hakkında kapsamlı bilgi içerir. Güncel tutulması projenin başarısı için kritiktir.
>
> Son güncelleme: Temmuz 2025
