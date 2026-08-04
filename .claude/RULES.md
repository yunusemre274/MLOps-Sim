Projenin katı kuralları. Her kural numaralı, açıklamalı ve gerekçeli:

1. **Gerçek Docker daemon asla çalıştırılmaz.** Sistemde hiçbir zaman gerçek `docker build`/`docker run` komutu tetiklenmez, gerçek bir container ayağa kalkmaz. Her şey parser + simülasyon katmanında kalır. Gerekçe: Güvenlik ve maliyet.

2. **Kullanıcıdan gelen hiçbir metin doğrudan eval/exec/shell olarak çalıştırılmaz.** Dockerfile içeriği, kullanıcı adı, sohbet mesajı — sadece parse edilip metin olarak analiz edilir. Gerekçe: Güvenlik — kod enjeksiyonu önleme.

3. **Kod dosyaları (main.py, app.js vb.) her zaman statik ve önceden test edilmiştir.** Runtime'da AI tarafından üretilip doğrudan kullanıcıya sunulmaz (README/senaryo metni hariç). Gerekçe: Eğitim deneyiminin güvenilirliği — bozuk uygulama kodu öğrenme sürecini mahveder.

4. **Sağlık/stres/bağımlılık mekanikleri zararlı davranışı özendirici şekilde sunulmaz.** Oyun içi mesajlaşma/UI dili bu davranışları 'havalı' göstermez; kısa vadeli fayda - uzun vadeli maliyet dengesi her zaman açıkça yansıtılır. Gerekçe: Etik sorumluluk.

5. **NPC ilişki/flört sistemi hiçbir zaman gerçek kişileri temsil etmez.** Tamamen kurgusal karakterler. Gerçek isim/kişi referansı kullanılmaz. Gerekçe: Gizlilik ve etik.

6. **Her yeni özellik ROADMAP.md'de karşılığı olmadan kod tabanına eklenmez.** Önce ROADMAP'e görev olarak eklenir, sonra geliştirilir. Gerekçe: Kapsam kayması (scope creep) önleme.

7. **API anahtarları, ücretli servis bağlantı bilgileri asla kod içine gömülmez veya commit'lenmez.** .env dosyaları kullanılır ve .gitignore'a eklenir. Gerekçe: Güvenlik — credential leak önleme.

8. **Her session en az bir kez HANDOFF.md güncellemesi ile kapanır.** Gerekçe: Çok session'lı geliştirmede bağlam kaybını önleme.

9. **Zorluk seviyeleri arası tutarlılık bozulmaz.** Junior etiketli bir göreve Kubernetes gerektiren kriter eklenmez. README.md'deki Aşama tanımları referans kaynaktır. Gerekçe: Eğitim tasarımı tutarlılığı.

10. **Bar formülleri tek bir yerde tanımlanır (gameBalance.config.js).** Birden fazla dosyaya dağıtılmaz. Denge ayarlamaları tek noktadan yapılabilir. Gerekçe: Bakım kolaylığı, playtesting verimliliği.
