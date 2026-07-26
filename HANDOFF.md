# HANDOFF — Son Güncelleme: 2026-07-26

## Şu An Neredeyiz
- Aktif Faz: Faz 0 - Temel İskelet
- Son tamamlanan görev: Zustand ile merkezi GameState store kurulumu
- Son commit: `[Faz 0] Zustand ile merkezi GameState store kurulumu`

## Tamamlanan Görevler (Bu Session)
1. ✅ React projesi oluşturma (Vite ile)
2. ✅ Klasör yapısı oluşturma
3. ✅ Zustand ile merkezi GameState store kurulumu

## Yarım Kalan İş (varsa)
- Yok — Görev 3 tamamlandı, Görev 4'e (SceneManager) henüz başlanmadı.

## Bir Sonraki Session'da Yapılacak İlk Şey
- Faz 0, Görev 4: Sahne yönetim sistemi (SceneManager bileşeni) oluşturma

## Bilinen Sorunlar / Dikkat Edilmesi Gerekenler
- Vite scaffold `--overwrite` ile çalıştırıldığında mevcut dosyaları (README.md, ROADMAP.md vb.) sildi. Git checkout ile geri yüklendi. Gelecekte scaffold çalıştırırken dikkatli olunmalı.
- `.oxlintrc.json` Vite'ın varsayılanı olarak geldi, şu an kullanılmıyor ama zararsız.

## Bu Session'da Alınan Önemli Kararlar
- Vite `--no-eslint` ile kuruldu (oxlint tercih edildi — Vite varsayılanı).
- Zustand store, README.md Bölüm 10.1'deki GameState veri modeline birebir uygun kuruldu.
- Store aksiyonları: setScene, updateBar, setBar, setTime, advanceDay, addMoney, spendMoney, updateRelationship, addCareerPoints, setRank, addToFridge, removeFromFridge, addEvent, togglePause, resetGame.
- Bar sabitleri (decay rate vb.) store'da değil, gameBalance.config.js'te tanımlanacak (Faz 1'de).
