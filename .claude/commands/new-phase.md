# Yeni Faz Başlatma Prosedürü

## Ne Zaman Tetiklenir
Aktif fazdaki TÜM görevler `- [x]` olarak tamamlandığında.

## Adımlar
1. Fazın çıkış kriterini kontrol et (ROADMAP.md'de yazılı)
2. Çıkış kriteri sağlanıyor mu doğrula:
   - Gerekli özellikler çalışıyor mu?
   - Testler geçiyor mu?
   - Bilinen kritik bug var mı?
3. Faz kapanış commit'i at: `[Faz X TAMAMLANDI] Faz özeti`
4. ROADMAP.md'de yeni fazın başlığını bul
5. Yeni fazın ilk göreviyle devam et (new-task.md prosedürü)
6. HANDOFF.md'yi güncelle — yeni aktif faz bilgisi

## Dikkat
- Çıkış kriteri sağlanmadan faz kapatılmaz
- Çıkış kriteri sağlanamayan durumlar HANDOFF.md'ye not edilir
