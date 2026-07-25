# HANDOFF — Son Güncelleme: 2026-07-25

## Şu An Neredeyiz
- Aktif Faz: Faz 0 - Temel İskelet
- Son tamamlanan görev: Proje dokümantasyon altyapısı oluşturuldu (README.md, ROADMAP.md, CLAUDE.md, .claude/ klasörü, HANDOFF.md)
- Son commit hash/mesajı: `[Kurulum] İlk HANDOFF.md oluşturuldu`

## Yarım Kalan İş (varsa)
- Yok — dokümantasyon altyapısı tamamlandı, Faz 0 görevlerine henüz başlanmadı.

## Bir Sonraki Session'da Yapılacak İlk Şey
- ROADMAP.md'nin Faz 0 bölümüne bak ve ilk görevden başla: "React projesi oluşturma (Vite ile)"
- `npx create-vite` ile React projesi kurulmalı, ardından klasör yapısı oluşturulmalı.

## Bilinen Sorunlar / Dikkat Edilmesi Gerekenler
- Henüz hiçbir kod yazılmadı — proje tamamen dokümantasyon aşamasında.
- Git repo'su başlatılmış ve ilk commit'ler atılmış olmalı.

## Bu Session'da Alınan Önemli Kararlar
- **State yönetimi:** Zustand tercih edildi (README.md'de belirtilen React + merkezi store yapısıyla uyumlu).
- **Proje yapısı:** Vite + React tercih edildi (ağır oyun motoruna gerek yok).
- **Dil politikası:** Kod ve değişken isimleri İngilizce, yorumlar ve dokümantasyon Türkçe.
- **Commit disiplini:** Her ROADMAP görevi = 1 commit, faz sonlarında kapanış commit'i.
- **Dosya yapısı:** src/components, src/scenes, src/store, src/engine, src/config, src/data, src/utils, public/assets, tests/ şeklinde organize edilecek.
- **.claude/ klasörü:** RULES.md, CODE_QUALITY.md, 3 command prosedürü, 4 skill dosyası oluşturuldu.
