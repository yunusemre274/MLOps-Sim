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

- [x] [Bugfix] Zaman/bar hız senkronizasyon hatası düzeltildi
- [x] Bar formülleri denge testi — otomatik simülasyon (100 günlük senaryo)
- [x] Ekonomi dengesi — fiyatlar, gelirler, maliyetler tutarlılık kontrolü
- [x] UX iyileştirmeleri — animasyonlar, geçiş efektleri, hover durumları
- [x] Erişilebilirlik geçişi — klavye navigasyonu, ARIA etiketleri
- [x] Performans profilleme — büyük state'lerde render optimizasyonu
- [x] Bug fix turu — birikmiş sorunların çözümü
- [x] Son kullanıcı playtest — 3 farklı senaryo (kariyer odaklı, sosyal odaklı, dengeli)
- [x] Dokümantasyon güncelleme — README, ROADMAP, son durum

---

## Faz 12 — Bilgisayar Simülasyonu Yenileme (Windows XP Masaüstü)
**Bu fazın çıkış kriteri:** Oyuncu bilgisayara tıkladığında XP tarzı bir masaüstü açılır; terminal, dosya gezgini, kod editörü ve tarayıcı bu masaüstü içinde bağımsız pencereler olarak çalışır ve birbirleriyle veri paylaşır (dosya gezgininden açılan dosya editörde görünür gibi).

- [x] Pencere Yöneticisi (WindowManager) bileşeninin temel iskeleti (aç/kapat/sürükle/boyutlandır/z-index)
- [x] Masaüstü sahnesi (arka plan, simge grid'i, taskbar iskeleti)
- [x] Terminal'in pencere sistemine entegrasyonu
- [x] Dosya gezgini penceresi + Projeler klasörü + görev veri modeliyle bağlantı
- [x] Kod editörünün (Monaco) pencere sistemine entegrasyonu, dosya gezgininden dosya açma akışı
- [x] Chrome/Edge simgeleri + mevcut tarayıcı modülünün pencere sistemine entegrasyonu
- [x] Taskbar saat senkronizasyonu (düzeltilmiş zaman sistemiyle bağlantılı)
- [x] Görsel cila: XP Luna renk paleti, pencere çerçeve stilleri, simge görselleri
- [x] (Düşük öncelik, opsiyonel) Çöp kutusu etkileşimi
- [x] [Bugfix Round 4] .app uzantı sızıntısının temizlenmesi ve görünen etiketlerin (label) ayrıştırılması
- [x] [Bugfix Round 4] Dosya Gezgini VFS okumasının düzeltilmesi ve React Error Boundary entegrasyonu
- [x] [Bugfix Round 4] Pencere kontrol butonlarının (küçült/büyüt/kapat) düzeltilmesi
- [x] [Bugfix Round 4 TAMAMLANDI] 6 adımlık regresyon ve pencere kontrol doğrulama testi geçildi
- [x] Bağımsız WindowManagerEngine mimarisi ve birim testleri (`tests/WindowManager.test.js`)
- [x] XP Başlat menüsü, başlık çubuğu çift tık ile maximize toggle ve taskbar pencere mantığı
- [x] [Round 5] ls çıktısında klasör/uygulama ayrımı (`[app]` turkuaz etiket, `a` kip izinleri)
- [x] [Round 5] open komutu eklendi (app, dir, file destekli WindowManager entegrasyonu)
- [x] [Round 5] cd hata mesajı netleştirildi (uygulama kısayolları için open önerisi)
- [x] [Round 5 TAMAMLANDI] Zorunlu 6 adımlık doğrulama testi geçildi (`tests/Round5Verification.test.js`)
- [x] [Round 6] Docker CLI tam komut kapsaması (`container`, `image`, `volume`, `network`, `system`, `cp`, `stats`, `top`, `inspect`, `pull`, `push`, `tag`)
- [x] [Round 6] Tek çekirdek handler ve çoklu alias mimarisinin `CLAUDE.md` ve `AGENTS.md` dosyalarına kaydedilmesi
- [x] [Round 6 TAMAMLANDI] Zorunlu 6 senaryoluk Docker doğrulama testi geçildi (`tests/Round6DockerVerification.test.js`)

---

## Faz 13 — Sanal Dosya Sistemi (Single Source of Truth VFS) [GÖREV GRUBU 1]
**Bu fazın çıkış kriteri:** Terminal, Dosya Gezgini ve Kod Editörü'nün tek bir merkezi VFS (GameState VFS) üzerinden oku/yaz yapması, path şemasının (`/home/user/desktop`, `/home/user/projects/<id>`) tam senkronize çalışması.

- [x] Single Source of Truth VFS veri yapısının GameState'e (Zustand) taşınması
- [x] Masaüstü simgelerinin VFS `/home/user/desktop` dizini ile senkronize edilmesi
- [x] Görev kabul edildiğinde repo dosyalarının VFS `/home/user/projects/<görev-id>` altına aktarılması
- [x] Terminal `cd`, `pwd`, `ls` komutlarının VFS ağacına tam bağlanması
- [x] Kod Editörü kaydetme mantığının VFS'e doğrudan yazacak şekilde güncellenmesi ve `cat` ile Terminalde doğrulanması
- [x] [Bugfix Round 3] VFS tek kaynak reaktivite düzeltmesi — terminal/masaüstü/dosya gezgini senkronize edildi (10 adımlık doğrulama testi geçildi)

---

## Faz 14 — Denge ve Zaman Hızı Revizyonu (2. Tur) [GÖREV GRUBU 4]
**Bu fazın çıkış kriteri:** Oyun hızının 5x'e ayarlanması (1 dk = 12 real sec), bar azalma ve stres formüllerinin yeniden ölçeklenmesi, 10 dk sürüklenme testinin başarıyla geçmesi.

- [x] Zaman çarpanının 5x olarak güncellenmesi (`GAME_TIME_MULTIPLIER = 5`, 1 oyun dk = 12 real sec)
- [x] Bar azalma oranlarının saatlik bazda yeniden kalibre edilmesi (uyku ~3.5 gün, açlık ~8 oyun saati)
- [x] Stres katlanma formülünün ve çoklu faktör ağırlıklandırılmasının yeniden yapılandırılması
- [x] Barların pürüzsüz delta-time zaman dilimlerinde güncellenmesi
- [x] 10 dakikalık gerçek zaman rölanti (idle) test senaryosunun yazılması ve HANDOFF.md'ye doğrulanması

---

## Faz 15 — Terminal Komut Seti ve Docker Runtime Simülasyonu [GÖREV GRUBU 2]
**Bu fazın çıkış kriteri:** Gelişmiş Linux (`cp`, `mv`, `rm -rf`, `chmod`, `apt-get`, `env`, `grep`, `find`, `history` vb.) ve Docker runtime (`docker run -p`, `ps`, `logs`, `exec -it`, `network`, `volume`, `compose`) komutlarının simüle edilmesi.

- [x] Gelişmiş Linux dosya/dizin komutları (`cp`, `mv`, `rm -rf`, `mkdir -p`, `touch`, `cat`, `head`, `tail`)
- [x] İzinler, paket yönetimi ve ortam değişkenleri (`chmod`, `chown`, `apt-get install`, `env`, `export`, `echo $VAR`)
- [x] Arama ve sistem komutları (`grep`, `find`, `history`, `clear`, `man`/`help`)
- [x] Docker container runtime state'i ve `docker run` bayrakları (`-p`, `-d`, `--name`, `-e`, `-v`, `--network`, `--rm`)
- [x] Docker konteyner ve imaj yönetimi (`docker ps -a`, `stop`, `rm`, `rmi`, `images`, `logs`)
- [x] Docker Network & Volume yönetimi (`docker network`, `docker volume`)
- [x] Docker Exec & Version simülasyonu (`docker exec -it`, `docker --version`)
- [x] Docker Compose CLI genişletmesi (`docker-compose` ve `docker compose` tiresiz destek)
- [x] Docker runtime state'inin localhost tarayıcı kontrolüne ve Check Mission'a bağlanması

---

## Faz 16 — Entegre IDE Terminali ve Çoklu Dosya Desteği [GÖREV GRUBU 3]
**Bu fazın çıkış kriteri:** Kod Editörü içerisine alt terminal paneli gömülmesi, VSCode tarzı sekmeli dosya yönetimi ve 9+ dosya türü için sözdizimi vurgulama & ikon desteği.

- [x] Kod Editörü penceresinin alt kısmına açılır-kapanır entegre terminal paneli eklenmesi (component reuse)
- [x] VSCode tarzı çoklu dosya sekme (tab) yönetimi ve kaydedilmemiş değişiklik göstergesi
- [x] 9+ dosya türü için sözdizimi vurgulama ve ikon desteği (`.md`, `.txt`, `.json`, `.go`, `.js`/`.ts`, `.env`, `.yml`, `.gitignore`, `.sh`)

---

## Faz 17 — Masaüstü Etkileşimleri ve Kaynak İzleme (Monitoring) [GÖREV GRUBU 5]
**Bu fazın çıkış kriteri:** Masaüstü simgelerinin sürüklenebilmesi, sağ tık bağlam menüsü (Context Menu) ve kaynak kullanımı izleme (Monitoring/Task Manager) uygulamasının eklenmesi.

- [x] Masaüstü simgelerinin sürüklenebilir (Drag & Drop) yapılması
- [x] Masaüstü boş alan sağ tık bağlam menüsü (Sırala, Yenile, Yapıştır, Yeni Klasör/Metin Belgesi)
- [x] Masaüstü simge sağ tık bağlam menüsü (Aç, Yeniden Adlandır, Sil)
- [x] Yeni "Monitoring" (Görev Yöneticisi) uygulaması ve çalışan container'lara bağlı kaynak grafik simülasyonu

---

## Faz 18 — Telefon DevJobs Mobil Uygulaması
**Bu fazın çıkış kriteri:** Telefonda LinkedIn tarzı DevJobs Mobile kariyer uygulamasının eklenmesi, Single Source of Truth store ve kilitli Yetenek Avı sekmesi.

- [x] DevJobs Mobile arayüzü (`PhoneJobApp.jsx` & `PhoneJobApp.css`)
- [x] Merkezi `useGameStore` üzerinden çift yönlü iş kabul reaktivitesi
- [x] Kilitli Yetenek Avı sekmesi ve bildirim sistemi

---

## Faz 19 — Gerçekçi DevOps Görev Akışı ve Doğrulama Motoru Sıkılaştırması (Round 6 & Round 7)
**Bu fazın çıkış kriteri:** Docker CLI tam komut kapsaması, 4 katmanlı sıkı doğrulama motoru, `git clone` ile dizine repo klonlama ve `git push` ile CI/CD remote pipeline çalıştırma.

- [x] **Round 6 — Docker CLI Tam Komut Kapsaması (Tek Handler Mimarisi):**
  - [x] `docker container` yönetim komutları (`run`, `ls`/`ls -a`, `stop`, `start`, `restart`, `rm`, `logs`, `exec`, `inspect`, `prune`, `top`, `rename`, `cp`)
  - [x] `docker image` yönetim komutları (`ls`, `rm`, `inspect`, `history`, `prune`, `pull`, `push`, `tag`)
  - [x] `docker volume` & `docker network` yönetim komutları (`create`, `ls`, `rm`, `inspect`, `connect`, `disconnect`, `prune`)
  - [x] `docker system` komutları (`df`, `prune`) ve ekstra CLI araçları (`stats`, `top`, `cp`)
  - [x] Detaylı Docker yardım sistemi (`docker --help`, `docker <resource> --help`)

- [x] **Round 7 — 4 Katmanlı Docker/Compose Doğrulama Motoru:**
  - [x] Katman 1 (Sözdizimi Doğrulama): Tanınmayan direktif ve ilk satırın FROM olması kontrolü
  - [x] Katman 2 (Semantik / Referans Bütünlüğü): `COPY`/`ADD` kaynaklarının VFS build context'inde varlığı, base image doğrulaması
  - [x] Katman 3 (Görev Kriteri Doğrulama): `checkMission` ile multi-stage, non-root user, EXPOSE port kuralları
  - [x] Katman 4 (Runtime Doğrulama): `docker run` ve `git push` sırasında çalışan container & port kontrolü

- [x] **Round 8 — Base Image Yetenek Modeli ve Komut Sözdizimi Doğrulaması:**
  - [x] Base Image Capability Model (`BASE_IMAGE_CAPABILITIES` ile `binaries`, `hasApt`, `osFamily` tanımları)
  - [x] Çok aşamalı (multi-stage) build aşamalar arası yetenek izolasyonu
  - [x] Paket yöneticisi komut sözdizimi doğrulayıcısı (`pip install -r`, `npm install`, `npm ci`, `go build`)
  - [x] Runtime CMD/ENTRYPOINT executable doğrulaması (OCI runtime create failed simülasyonu)

- [x] **DevJobs & Git Entegrasyonu:**
  - [x] `git clone <url>` ile bulunulan VFS dizinine repo dosyalarının yazılması
  - [x] `git push` ile remote CI/CD pipeline'ın tetiklenmesi ve `ready_to_deliver` durumu
  - [x] İş Platformunda (DevJobs) kopyalanabilir siyah Git URL kutusu ve "Görevi Teslim Et" butonu

---

## 🔮 İleriye Dönük Faz — Kubernetes Simülasyonu & 4-Katmanlı Manifest Doğrulama (Tasarım Notu)
*Kubernetes fazı başladığında uygulanacak 4-katmanlı doğrulama standardı:*
1. **Katman 1 (YAML & Şema Sözdizimi):** `apiVersion`, `kind`, `metadata`, `spec` yapılarının Kubernetes standardına uygunluğu.
2. **Katman 2 (Semantik Bütünlük):** Referans verilen `ConfigMap`, `Secret`, `Service`, `PersistentVolumeClaim` kaynaklarının kümede tanımlı olması.
3. **Katman 3 (Görev Kriteri):** Replica sayısı, Resource Limit/Request (`cpu`, `memory`), Liveness/Readiness probe tanımları.
4. **Katman 4 (Runtime Simülasyonu):** Pod'ların `Running` statüsüne geçişi, `Service` ve `Ingress` routing simülasyonu.
