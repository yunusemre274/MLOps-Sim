# MLOps Engineer Simulator - Yol Haritası (ROADMAP)

**Nasıl Kullanılır:** Bu dosya projenin geliştirme adımlarını ve fazlarını içerir. Her görev tek bir commit'e karşılık gelecek şekilde tasarlanmıştır. Görevleri tamamladıkça yanlarındaki `[ ]` kutucuklarını `[x]` olarak işaretleyebilirsiniz.

---

## Faz 0 — Temel İskelet
**Bu fazın çıkış kriteri:** Uygulamanın başarıyla derlenmesi, boş bir ekran açılması ve GitHub'a ilk commit'in atılmış olması.

- [x] React projesi oluşturma (Vite ile)
- [x] Klasör yapısı oluşturma (src/components, src/scenes, src/store, src/data, src/engine, src/config, src/utils, public/assets)
- [x] Zustand ile merkezi GameState store kurulumu
- [x] Sahne yönetim sistemi (SceneManager bileşeni) — hangi sahne aktif kontrol
- [x] Boş HomeScene bileşeni (ev içi placeholder)
- [x] Temel uygulama kabuğu (App.jsx) — SceneManager entegrasyonu
- [x] Temel CSS tasarım sistemi (renk paleti, tipografi, değişkenler)
- [x] .gitignore, .env.example, package.json düzenlemesi
- [x] Git repo başlatma ve ilk commit

---

## Faz 1 — Bar Sistemi
**Bu fazın çıkış kriteri:** Bar göstergelerinin ekranda görünmesi, zaman aktıkça veya etkileşim yapıldıkça barların doğru matematiksel formüllerle azalıp artması.

- [x] GameState store'a bar veri modeli ekleme (sleep, hunger, health, stress değerleri)
- [x] gameBalance.config.js dosyası — tüm bar sabitleri (decay rate, etkileşim katsayıları, eşik değerleri)
- [x] Zaman ilerleme motoru (TimeEngine) — oyun saati, 16x hız hesaplama, tick mekanizması
- [x] Bar azalma/artma formülleri (barları birbirini etkileyen fonksiyonlar)
- [x] StatusBar UI bileşeni — tek bir barın görsel gösterimi (animasyonlu doluluk çubuğu)
- [x] StatusBarsPanel bileşeni — tüm barları gösteren üst panel
- [x] Para göstergesi UI bileşeni
- [x] Zaman/saat göstergesi UI bileşeni
- [x] Bar etkileşim testleri (birim testleri — bar formüllerinin doğruluğu)

---

## Faz 2 — Ev İçi Etkileşimler
**Bu fazın çıkış kriteri:** Ev içindeki nesnelere tıklanabilmesi, barlara doğru etkilerin yansıması ve yatağa tıklanınca gün sonu özetinin açılması.

- [x] HomeScene layout — tıklanabilir kutucuk grid yapısı
- [x] InteractiveItem bileşeni — genel tıklanabilir kutucuk (ikon, isim, tıklama efekti)
- [x] Buzdolabı etkileşimi — envanter görüntüleme, yemek yeme, açlık barı etkisi
- [x] Yatak etkileşimi — uyuma aksiyonu, uyku barı doldurma, zaman ilerleme
- [x] Gün sonu özet ekranı (DaySummaryModal) — istatistikler, olaylar, kariyer puanı
- [x] Bilgisayar kutucuğu — ComputerScene'e geçiş (henüz boş sahne)
- [x] Telefon kutucuğu — PhoneScene'e geçiş (henüz boş sahne)
- [x] Dolap kutucuğu — placeholder gardırop UI
- [x] Kapı kutucuğu — OutdoorMenuScene'e geçiş
- [x] Buzdolabı boş uyarı pop-up sistemi
- [x] Envanter (buzdolabı stoku) veri modeli GameState'e ekleme

---

## Faz 3 — Dışarı ve Mekanlar
**Bu fazın çıkış kriteri:** Kapıdan çıkılıp farklı mekanlara gidilebilmesi, her mekanın bar ve para üzerinde farklı etkiler yaratması.

- [x] OutdoorMenuScene — mekan seçim kartları (market, pub, sinema, park, galeri, emlakçı)
- [x] Mekan etkileşim motoru — mekan ziyaretinde bar efektlerini uygulayan fonksiyon
- [x] Market sahnesi — ürün listesi, satın alma, buzdolabına ekleme, para düşürme
- [x] Park sahnesi — ücretsiz stres azaltma, sağlık bonusu, zaman tüketimi
- [x] Pub sahnesi — pahalı, yüksek stres azaltma, sağlık malus, alkol mekaniği
- [x] Sinema sahnesi — orta maliyet, stres azaltma
- [x] Galeri sahnesi — orta maliyet, stres azaltma, kültür puanı
- [x] Emlakçı sahnesi — ev listeleme, ev yükseltme (barRecoveryMultiplier), kira güncelleme
- [x] Kilitli mekan gösterimi (Şirket, Plaza — 'kilitli' rozeti + açılma koşulları tooltip)
- [x] Online market (telefon üzerinden) — daha pahalı, zaman kazandıran alternatif
- [x] Sigara/alkol mekaniği — anlık stres azaltma, kümülatif sağlık malus, odak bonusu timer
- [x] Aylık kira ödeme sistemi (ay dönümünde otomatik düşüm)

---

## Faz 4 — NPC ve Sosyal Sistem
**Bu fazın çıkış kriteri:** Dış mekan ziyaretlerinde rastgele NPC karşılaşmalarının gerçekleşmesi, olay zincirlerinin çalışması ve ilişki barının değişmesi.

- [x] NPC veri şeması tanımlama (JSON yapısı)
- [x] İlk 8 NPC JSON dosyası oluşturma (4 kadın, 4 erkek — çeşitli kişilikler ve meslekler)
- [x] İlişki barı sistemi — NPC bazlı seviye takibi GameState'te
- [x] Olay motoru (EventEngine) — koşul kontrolü, olasılık hesaplama, cooldown yönetimi
- [x] Olay zinciri çalıştırıcı — adım adım diyalog gösterimi, seçenek sunumu, efekt uygulama
- [x] EventPopup UI bileşeni — NPC karşılaşma pop-up'ı (mesaj + seçenekler)
- [x] Mekan bazlı NPC havuzu — her mekana özel NPC karşılaşma olasılıkları
- [x] İlk olay seti (en az 15 olay JSON dosyası — tanışma, selamlaşma, borç, kahve daveti, iş referansı)
- [x] NPC profil görüntüleme ekranı (telefonda veya karşılaşmada)
- [x] İlişki seviyesi geçiş bildirimleri (yabancı→tanıdık→arkadaş→yakın arkadaş)

---

## Faz 5 — Terminal ve Dockerfile Simülasyonu (kritik faz)
**Bu fazın çıkış kriteri:** Bilgisayar ekranında terminal ve editörün açılması, `docker build` komutu yazıldığında simüle edilmiş log'ların akması ve AST parser'ın doğru çalışması.

- [x] ComputerScene layout — terminal/editör/tarayıcı sekmeleri
- [x] xterm.js entegrasyonu — terminal bileşeni, tema, font ayarları
- [x] Monaco Editor entegrasyonu — Dockerfile ve YAML syntax highlighting
- [x] Simüle dosya sistemi (VirtualFileSystem) — dizinler, dosyalar, içerikler
- [x] Temel terminal komutları (ls, cd, cat, mkdir, pwd, echo, touch, rm)
- [x] Git komut simülasyonu (git clone, git status, git add, git commit, git push, git pull)
- [x] Dockerfile parser — tokenizer ve AST üretici (FROM, RUN, COPY, WORKDIR, EXPOSE, CMD, USER, ENV, ARG, ENTRYPOINT, HEALTHCHECK)
- [x] Multi-stage build desteği (FROM ... AS name ayrıştırma)
- [x] Build log üretici — parser AST’sinden gerçekçi Docker build çıktısı oluşturma
- [x] Hata simülatörü — sözdizimi hataları, bilinmeyen direktifler, eksik base image hata mesajları
- [x] docker build komutu simülasyonu — Dockerfile okuma → parse → build log → sonuç
- [x] docker run komutu simülasyonu — container state yönetimi
- [x] Oyun içi tarayıcı bileşeni — localhost:PORT simülasyonu (başarı/hata sayfası)
- [x] Dockerfile parser birim testleri

---

## Faz 6 — Görev Sistemi (Junior Seviyeleri)
**Bu fazın çıkış kriteri:** Oyuncunun iş bulma platformundan görev alıp, terminalde çözerek teslim edebilmesi ve para/puan kazanabilmesi.

- [x] Görev (Mission) veri modeli — JSON şeması
- [x] İlk 3 şirket (CompanyContract) JSON dosyası oluşturma
- [x] İş bulma platformu UI (LinkedIn benzeri) — ilan listesi, başvuru, mülakat diyaloğu
- [x] GitHub simülasyonu — repo listesi, repo içeriği görüntüleme
- [x] Görev repo'su oluşturma akışı — statik asset + senaryo metni birleştirme
- [x] Aşama 1 statik asset'leri — 3 farklı FastAPI uygulaması (main.py + requirements.txt)
- [x] Aşama 1 görev şablonları (3-5 görev JSON dosyası)
- [x] Aşama 2 statik asset'leri — Python multi-stage, Go, Node.js uygulamaları
- [x] Aşama 2 görev şablonları (4-6 görev JSON dosyası)
- [x] Check Mission (kural tabanlı) — expectedCriteria ile parser çıktısı karşılaştırma
- [x] Görev sonuç ekranı — puan, feedback, ödül gösterimi
- [x] Aylık bakım geliri sistemi — tamamlanan görevlerden tekrarlayan gelir
- [x] Kariyer puanı ve rütbe ilerleme sistemi
- [x] Tutorial Hub — en az 3 eğitim dosyası (linux_basics.md, dockerfile_basics.md, multistage_build.md)

---

## Faz 7 — AI Değerlendirme Katmanı
**Bu fazın çıkış kriteri:** Görev tesliminde Gemini API'sine çağrı atılıp pedagojik ve yapılandırılmış geri bildirim alınabilmesi.

- [x] AI servis katmanı — Gemini API entegrasyonu (backend endpoint)
- [x] Check Mission AI modu — dosyaları + kriterleri AI'ya gönderme, pedagojik feedback alma
- [x] AI feedback UI bileşeni — detaylı değerlendirme kartı (doğru/yanlış/ipucu)
- [x] Dinamik senaryo metni üretimi — şablon + seed → AI'dan README metni alma
- [x] API anahtar yönetimi — .env dosyası, güvenli çağrı
- [x] Fallback mekanizması — AI erişilemezse kural tabanlı değerlendirmeye geri dönüş
- [x] Rate limiting ve maliyet kontrolü — günlük/saatlik çağrı limiti

---

## Faz 8 — Orta ve İleri Görevler
**Bu fazın çıkış kriteri:** `docker-compose.yml` dosyalarının ayrıştırılıp simüle edilmesi ve multi-container yapıların başarıyla test edilmesi.

- [x] Docker Compose parser — services, ports, volumes, networks, depends_on, env_file, deploy.resources ayrıştırma
- [x] Compose build log üretici — docker compose up simülasyonu
- [x] Aşama 3 içeriği — Dockerfile + Compose görevleri (tek servis, iki servisli), 4-6 görev
- [x] Aşama 4 içeriği — çoklu servis, network, resource limit görevleri, 5-8 görev
- [x] Aşama 5 içeriği — CI/CD YAML, temel K8s manifest görevleri, 5-8 görev
- [x] Compose hata simülasyonu — servis bağımlılık hataları, network tanım hataları
- [x] docker compose up/down komut simülasyonu
- [x] Tutorial Hub genişletme — docker_compose.md, kubernetes_basics.md, github_actions.md, cicd_concepts.md, security_best_practices.md

---

## Faz 9 — Kariyer İlerleme ve Şirket Kurma
**Bu fazın çıkış kriteri:** Belirli aşamaya gelen oyuncunun şirket kurması, NPC işe alabilmesi ve finans tablosunu yönetebilmesi.

- [x] Rütbe sistemi tam implementasyonu — aşama geçiş koşulları, kilit açma bildirimleri
- [x] Şirket kurma ön koşul kontrolü (görev sayısı, rütbe, para, ofis)
- [x] Şirket kurma akışı — isim seçme, ofis kiralama, başlangıç ayarları
- [x] Plaza sahnesi — ofis seçenekleri, kiralama UI
- [x] NPC çalışan işe alma sistemi — aday NPC listesi, maaş belirleme, kabul/red
- [x] Görev delegasyonu — NPC çalışana görev atama, çalışanın hata oranına göre sonuç
- [x] NPC çalışan çıktısı inceleme — hatalı Dockerfile review, geri bildirim
- [x] Şirket finans paneli — aylık gelir, gider, kâr, sunucu maliyeti
- [x] Müşteri portföy yönetimi — aktif müşteriler, memnuniyet, yeni müşteri çekme

---

## Faz 10 — NPC Popülasyonu Genişletme
**Bu fazın çıkış kriteri:** Toplam 20 NPC'nin aktif olarak dünyada yer alması, partnerlik mekanizmasının ve mesajlaşma sisteminin çalışması.

- [x] Kalan 12 NPC JSON dosyası oluşturma (toplam 20 NPC'ye tamamlama)
- [x] Yeni olay zincirleri — flört, ilişki, kavga, kıskançlık, aldatma, ayrılma, barışma
- [x] Partner ilişki sistemi — özel bar, küsme/ayrılma mekanizması
- [x] Kariyer-NPC kesişimi olayları — iş referansı, iş teklifi, ortak proje
- [x] Mekan bazlı olay havuzlarını genişletme (her mekana en az 5 benzersiz olay)
- [x] NPC mesajlaşma sistemi (telefon) — proaktif NPC mesajları, davetler
- [x] NPC zamanlama sistemi (hafta içi/sonu farklı mekan dağılımları)

---

## Faz 11 — Cilalama ve Denge
**Bu fazın çıkış kriteri:** Oyunun 100 günlük bir senaryoda ekonomik olarak kırılmaması, bug'sız ve akıcı bir deneyim sunması.

- [x] Bar formülleri denge testi — otomatik simülasyon (100 günlük senaryo)
- [x] Ekonomi dengesi — fiyatlar, gelirler, maliyetler tutarlılık kontrolü
- [x] UX iyileştirmeleri — animasyonlar, geçiş efektleri, hover durumları
- [x] Erişilebilirlik geçişi — klavye navigasyonu, ARIA etiketleri
- [x] Performans profilleme — büyük state'lerde render optimizasyonu
- [x] Bug fix turu — birikmiş sorunların çözümü
- [x] Son kullanıcı playtest — 3 farklı senaryo (kariyer odaklı, sosyal odaklı, dengeli)
- [x] Dokümantasyon güncelleme — README, ROADMAP, son durum
