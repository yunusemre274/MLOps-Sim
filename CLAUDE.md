# MLOps Sim — Proje Kuralları ve Mimari Standartlar

## VFS ve State Yönetimi Kuralı (MANDATORY)
- **VFS'e erişim her zaman `useVFS()` hook'u veya `globalVFS` üzerinden yapılır.**
- **Hiçbir bileşen kendi lokal dosya listesi state'i tutmaz!**

## Docker Komut Mimarisi Kuralı (MANDATORY)
- **Her Docker komutu kavramsal olarak tek bir handler'a sahip olmalıdır.**
- Sözdizimi varyasyonları (`docker X` / `docker <kaynak> X` / `docker container X`) bu handler'a yönlendirilen alias'lardır, asla ayrı implementasyon olarak kopyalanmaz.

## Gerçekçi Docker/Compose Doğrulama Kuralı (MANDATORY)
- **Hiçbir doğrulama sonucu, gerçek Docker davranışını simüle etmeden "başarılı" dönemez.**
- Base image yetenek modeli (`binaries`, `hasApt`, `osFamily`), VFS build context'inde dosya varlığı ve komut sözdizimi (örn. `pip install -r`) mutlaka denetlenir. Bir image'da bulunmayan binary çalıştırıldığında build veya OCI runtime aşamasında gerçek hata üretilir.
