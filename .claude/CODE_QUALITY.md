Kod kalitesi prensipleri, her biri açıklama ve gerekçesiyle:

1. **Tek sorumluluk ilkesi:** Her fonksiyon/bileşen tek bir işi yapar. Bir bileşen hem UI render hem state mutasyonu hem API çağrısı yapıyorsa bölünmelidir.

2. **State tek merkezden yönetilir:** GameState tek bir merkezi Zustand store'da tutulur. Prop-drilling ile dağıtılmaz.

3. **Sihirli sayı (magic number) yasağı:** Bar azalma/artma oranları, eşik değerleri, fiyatlar gibi tüm sabitler gameBalance.config.js'te tanımlanır.

4. **Veri ve mantık ayrımı:** NPC'ler, olaylar, görev şablonları, senaryo metinleri kod içinde değil JSON/veri dosyalarında tutulur.

5. **Dosya/fonksiyon uzunluk sınırı:** Dosya ~300 satır, fonksiyon ~50 satır. Aşarsa bölünme değerlendirilir.

6. **Anlamlı isimlendirme:** Proje boyunca tutarlı İngilizce. Yorumlar Türkçe olabilir.

7. **Test yazımı:** Dockerfile/Compose parser ve bar formülleri gibi mantık-yoğun modüllerde birim testleri zorunlu. UI için zorunlu değil.

8. **Hata yönetimi sessiz geçilmez:** Try-catch'lerde hata en azından loglanır; UI'da anlamlı geri bildirim gösterilir.

9. **Erken optimizasyon yapılmaz:** Önce çalışan, okunabilir kod. Performans sorunu somut olarak gözlemlenmeden optimizasyona girilmez.

10. **Yorum = neden:** Kodun ne yaptığını tekrar eden yorum yazılmaz, sadece 'neden böyle yapıldığı' açıklanır.

11. **Commit kendi kendine anlaşılır olmalı:** Diff'e bakan biri başka dosyaya bakmadan neyin neden değiştiğini anlayabilmeli.
