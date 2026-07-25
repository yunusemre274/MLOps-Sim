# Session Kapatma Prosedürü

## Ne Zaman Tetiklenir
Session sonlanmadan önce (zaman kısıtı, kullanıcı talebi veya doğal bitiş).

## Adımlar
1. Mevcut görevin durumunu kontrol et:
   - Tamamlandıysa: commit at, ROADMAP'te checkbox işaretle
   - Yarım kaldıysa: ya WIP commit at ya da uncommitted bırak
2. HANDOFF.md dosyasını güncelle:
   - Aktif faz ve son tamamlanan görev
   - Yarım kalan iş detayları (varsa)
   - Bir sonraki session'da yapılacak ilk şey
   - Bilinen sorunlar
   - Bu session'da alınan önemli kararlar
3. Handoff commit'i at: `[Handoff] Session özeti`
4. Kısa bir özet mesajı yaz (ne yapıldı, ne kaldı)

## Dikkat
- Bu prosedür ATLANAMAZ — her session bu adımlarla kapanır
- Commit'lenmemiş değişiklik kalmamalı (ya commit ya stash)
