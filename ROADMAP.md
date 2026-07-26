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
- [ ] StatusBar UI bileşeni — tek bir barın görsel gösterimi (animasyonlu doluluk çubuğu)
- [ ] StatusBarsPanel bileşeni — tüm barları gösteren üst panel
- [ ] Para göstergesi UI bileşeni
- [ ] Zaman/saat göstergesi UI bileşeni
- [ ] Bar etkileşim testleri (birim testleri — bar formüllerinin doğruluğu)

---

## Faz 2 — Ev İçi Etkileşimler
**Bu fazın çıkış kriteri:** Ev içindeki nesnelere tıklanabilmesi, barlara doğru etkilerin yansıması ve yatağa tıklanınca gün sonu özetinin açılması.

- [ ] HomeScene layout — tıklanabilir kutucuk grid yapısı
- [ ] InteractiveItem bileşeni — genel tıklanabilir kutucuk (ikon, isim, tıklama efekti)
- [ ] Buzdolabı etkileşimi — envanter görüntüleme, yemek yeme, açlık barı etkisi
- [ ] Yatak etkileşimi — uyuma aksiyonu, uyku barı doldurma, zaman ilerleme
- [ ] Gün sonu özet ekranı (DaySummaryModal) — istatistikler, olaylar, kariyer puanı
- [ ] Bilgisayar kutucuğu — ComputerScene'e geçiş (henüz boş sahne)
- [ ] Telefon kutucuğu — PhoneScene'e geçiş (henüz boş sahne)
- [ ] Dolap kutucuğu — placeholder gardırop UI
- [ ] Kapı kutucuğu — OutdoorMenuScene'e geçiş
- [ ] Buzdolabı boş uyarı pop-up sistemi
- [ ] Envanter (buzdolabı stoku) veri modeli GameState'e ekleme

---

## Faz 3 — Dışarı ve Mekanlar
**Bu fazın çıkış kriteri:** Kapıdan çıkılıp farklı mekanlara gidilebilmesi, her mekanın bar ve para üzerinde farklı etkiler yaratması.

- [ ] OutdoorMenuScene — mekan seçim kartları (market, pub, sinema, park, galeri, emlakçı)
- [ ] Mekan etkileşim motoru — mekan ziyaretinde bar efektlerini uygulayan fonksiyon
- [ ] Market sahnesi — ürün listesi, satın alma, buzdolabına ekleme, para düşürme
- [ ] Park sahnesi — ücretsiz stres azaltma, sağlık bonusu, zaman tüketimi
- [ ] Pub sahnesi — pahalı, yüksek stres azaltma, sağlık malus, alkol mekaniği
- [ ] Sinema sahnesi — orta maliyet, stres azaltma
- [ ] Galeri sahnesi — orta maliyet, stres azaltma, kültür puanı
- [ ] Emlakçı sahnesi — ev listeleme, ev yükseltme (barRecoveryMultiplier), kira güncelleme
- [ ] Kilitli mekan gösterimi (Şirket, Plaza — 'kilitli' rozeti + açılma koşulları tooltip)
- [ ] Online market (telefon üzerinden) — daha pahalı, zaman kazandıran alternatif
- [ ] Sigara/alkol mekaniği — anlık stres azaltma, kümülatif sağlık malus, odak bonusu timer
- [ ] Aylık kira ödeme sistemi (ay dönümünde otomatik düşüm)

---

## Faz 4 — NPC ve Sosyal Sistem
**Bu fazın çıkış kriteri:** Dış mekan ziyaretlerinde rastgele NPC karşılaşmalarının gerçekleşmesi, olay zincirlerinin çalışması ve ilişki barının değişmesi.

- [ ] NPC veri şeması tanımlama (JSON yapısı)
- [ ] İlk 8 NPC JSON dosyası oluşturma (4 kadın, 4 erkek — çeşitli kişilikler ve meslekler)
- [ ] İlişki barı sistemi — NPC bazlı seviye takibi GameState'te
- [ ] Olay motoru (EventEngine) — koşul kontrolü, olasılık hesaplama, cooldown yönetimi
- [ ] Olay zinciri çalıştırıcı — adım adım diyalog gösterimi, seçenek sunumu, efekt uygulama
- [ ] EventPopup UI bileşeni — NPC karşılaşma pop-up'ı (mesaj + seçenekler)
- [ ] Mekan bazlı NPC havuzu — her mekana özel NPC karşılaşma olasılıkları
- [ ] İlk olay seti (en az 15 olay JSON dosyası — tanışma, selamlaşma, borç, kahve daveti, iş referansı)
- [ ] NPC profil görüntüleme ekranı (telefonda veya karşılaşmada)
- [ ] İlişki seviyesi geçiş bildirimleri (yabancı→tanıdık→arkadaş→yakın arkadaş)

---

## Faz 5 — Terminal ve Dockerfile Simülasyonu (kritik faz)
**Bu fazın çıkış kriteri:** Bilgisayar ekranında terminal ve editörün açılması, `docker build` komutu yazıldığında simüle edilmiş log'ların akması ve AST parser'ın doğru çalışması.

- [ ] ComputerScene layout — terminal/editör/tarayıcı sekmeleri
- [ ] xterm.js entegrasyonu — terminal bileşeni, tema, font ayarları
- [ ] Monaco Editor entegrasyonu — Dockerfile ve YAML syntax highlighting
- [ ] Simüle dosya sistemi (VirtualFileSystem) — dizinler, dosyalar, içerikler
- [ ] Temel terminal komutları (ls, cd, cat, mkdir, pwd, echo, touch, rm)
- [ ] Git komut simülasyonu (git clone, git status, git add, git commit, git push, git pull)
- [ ] Dockerfile parser — tokenizer ve AST üretici (FROM, RUN, COPY, WORKDIR, EXPOSE, CMD, USER, ENV, ARG, ENTRYPOINT, HEALTHCHECK)
- [ ] Multi-stage build desteği (FROM ... AS name ayrıştırma)
- [ ] Build log üretici — parser AST'sinden gerçekçi Docker build çıktısı oluşturma
- [ ] Hata simülatörü — sözdizimi hataları, bilinmeyen direktifler, eksik base image hata mesajları
- [ ] docker build komutu simülasyonu — Dockerfile okuma → parse → build log → sonuç
- [ ] docker run komutu simülasyonu — container state yönetimi
- [ ] Oyun içi tarayıcı bileşeni — localhost:PORT simülasyonu (başarı/hata sayfası)
- [ ] Dockerfile parser birim testleri

---

## Faz 6 — Görev Sistemi (Junior Seviyeleri)
**Bu fazın çıkış kriteri:** Oyuncunun iş bulma platformundan görev alıp, terminalde çözerek teslim edebilmesi ve para/puan kazanabilmesi.

- [ ] Görev (Mission) veri modeli — JSON şeması
- [ ] İlk 3 şirket (CompanyContract) JSON dosyası oluşturma
- [ ] İş bulma platformu UI (LinkedIn benzeri) — ilan listesi, başvuru, mülakat diyaloğu
- [ ] GitHub simülasyonu — repo listesi, repo içeriği görüntüleme
- [ ] Görev repo'su oluşturma akışı — statik asset + senaryo metni birleştirme
- [ ] Aşama 1 statik asset'leri — 3 farklı FastAPI uygulaması (main.py + requirements.txt)
- [ ] Aşama 1 görev şablonları (3-5 görev JSON dosyası)
- [ ] Aşama 2 statik asset'leri — Python multi-stage, Go, Node.js uygulamaları
- [ ] Aşama 2 görev şablonları (4-6 görev JSON dosyası)
- [ ] Check Mission (kural tabanlı) — expectedCriteria ile parser çıktısı karşılaştırma
- [ ] Görev sonuç ekranı — puan, feedback, ödül gösterimi
- [ ] Aylık bakım geliri sistemi — tamamlanan görevlerden tekrarlayan gelir
- [ ] Kariyer puanı ve rütbe ilerleme sistemi
- [ ] Tutorial Hub — en az 3 eğitim dosyası (linux_basics.md, dockerfile_basics.md, multistage_build.md)

---

## Faz 7 — AI Değerlendirme Katmanı
**Bu fazın çıkış kriteri:** Görev tesliminde Gemini API'sine çağrı atılıp pedagojik ve yapılandırılmış geri bildirim alınabilmesi.

- [ ] AI servis katmanı — Gemini API entegrasyonu (backend endpoint)
- [ ] Check Mission AI modu — dosyaları + kriterleri AI'ya gönderme, pedagojik feedback alma
- [ ] AI feedback UI bileşeni — detaylı değerlendirme kartı (doğru/yanlış/ipucu)
- [ ] Dinamik senaryo metni üretimi — şablon + seed → AI'dan README metni alma
- [ ] API anahtar yönetimi — .env dosyası, güvenli çağrı
- [ ] Fallback mekanizması — AI erişilemezse kural tabanlı değerlendirmeye geri dönüş
- [ ] Rate limiting ve maliyet kontrolü — günlük/saatlik çağrı limiti

---

## Faz 8 — Orta ve İleri Görevler
**Bu fazın çıkış kriteri:** `docker-compose.yml` dosyalarının ayrıştırılıp simüle edilmesi ve multi-container yapıların başarıyla test edilmesi.

- [ ] Docker Compose parser — services, ports, volumes, networks, depends_on, env_file, deploy.resources ayrıştırma
- [ ] Compose build log üretici — docker compose up simülasyonu
- [ ] Aşama 3 içeriği — Dockerfile + Compose görevleri (tek servis, iki servisli), 4-6 görev
- [ ] Aşama 4 içeriği — çoklu servis, network, resource limit görevleri, 5-8 görev
- [ ] Aşama 5 içeriği — CI/CD YAML, temel K8s manifest görevleri, 5-8 görev
- [ ] Compose hata simülasyonu — servis bağımlılık hataları, network tanım hataları
- [ ] docker compose up/down komut simülasyonu
- [ ] Tutorial Hub genişletme — docker_compose.md, kubernetes_basics.md, github_actions.md, cicd_concepts.md, security_best_practices.md

---

## Faz 9 — Kariyer İlerleme ve Şirket Kurma
**Bu fazın çıkış kriteri:** Belirli aşamaya gelen oyuncunun şirket kurması, NPC işe alabilmesi ve finans tablosunu yönetebilmesi.

- [ ] Rütbe sistemi tam implementasyonu — aşama geçiş koşulları, kilit açma bildirimleri
- [ ] Şirket kurma ön koşul kontrolü (görev sayısı, rütbe, para, ofis)
- [ ] Şirket kurma akışı — isim seçme, ofis kiralama, başlangıç ayarları
- [ ] Plaza sahnesi — ofis seçenekleri, kiralama UI
- [ ] NPC çalışan işe alma sistemi — aday NPC listesi, maaş belirleme, kabul/red
- [ ] Görev delegasyonu — NPC çalışana görev atama, çalışanın hata oranına göre sonuç
- [ ] NPC çalışan çıktısı inceleme — hatalı Dockerfile review, geri bildirim
- [ ] Şirket finans paneli — aylık gelir, gider, kâr, sunucu maliyeti
- [ ] Müşteri portföy yönetimi — aktif müşteriler, memnuniyet, yeni müşteri çekme

---

## Faz 10 — NPC Popülasyonu Genişletme
**Bu fazın çıkış kriteri:** Toplam 20 NPC'nin aktif olarak dünyada yer alması, partnerlik mekanizmasının ve mesajlaşma sisteminin çalışması.

- [ ] Kalan 12 NPC JSON dosyası oluşturma (toplam 20 NPC'ye tamamlama)
- [ ] Yeni olay zincirleri — flört, ilişki, kavga, kıskançlık, aldatma, ayrılma, barışma
- [ ] Partner ilişki sistemi — özel bar, küsme/ayrılma mekanizması
- [ ] Kariyer-NPC kesişimi olayları — iş referansı, iş teklifi, ortak proje
- [ ] Mekan bazlı olay havuzlarını genişletme (her mekana en az 5 benzersiz olay)
- [ ] NPC mesajlaşma sistemi (telefon) — proaktif NPC mesajları, davetler
- [ ] NPC zamanlama sistemi (hafta içi/sonu farklı mekan dağılımları)

---

## Faz 11 — Cilalama ve Denge
**Bu fazın çıkış kriteri:** Oyunun 100 günlük bir senaryoda ekonomik olarak kırılmaması, bug'sız ve akıcı bir deneyim sunması.

- [ ] Bar formülleri denge testi — otomatik simülasyon (100 günlük senaryo)
- [ ] Ekonomi dengesi — fiyatlar, gelirler, maliyetler tutarlılık kontrolü
- [ ] UX iyileştirmeleri — animasyonlar, geçiş efektleri, hover durumları
- [ ] Erişilebilirlik geçişi — klavye navigasyonu, ARIA etiketleri
- [ ] Performans profilleme — büyük state'lerde render optimizasyonu
- [ ] Bug fix turu — birikmiş sorunların çözümü
- [ ] Son kullanıcı playtest — 3 farklı senaryo (kariyer odaklı, sosyal odaklı, dengeli)
- [ ] Dokümantasyon güncelleme — README, ROADMAP, son durum
