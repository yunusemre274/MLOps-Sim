# Yeni Görev Alma Prosedürü

## Ne Zaman Tetiklenir
Bir önceki görev tamamlanıp commit'lendiğinde veya session başlangıcında.

## Adımlar
1. HANDOFF.md'yi oku — yarım kalan iş var mı kontrol et
2. ROADMAP.md'yi aç, aktif fazı bul
3. Fazdaki ilk `- [ ]` (tamamlanmamış) görevi tespit et
4. Görevin ne gerektirdiğini anla — gerekirse README.md'den detay oku
5. İlgili dosyaları oluştur veya düzenle
6. Değişiklikleri test et (UI kontrolü veya birim testi)
7. ROADMAP.md'de görevi `- [x]` olarak işaretle
8. Commit at: `[Faz X] Görev açıklaması`
9. Fazın tüm görevleri bittiyse → `new-phase.md` prosedürünü uygula

## Dikkat
- Bir görevi bitirmeden sonrakine geçme
- Checkpoint güncellemesi (ROADMAP checkbox) ve kod değişikliği aynı commit'te olmalı
- Görev tamamlanamayacaksa HANDOFF.md'ye 'yarım kalan iş' olarak not düş
