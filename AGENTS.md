# MLOps Sim — Proje Kuralları ve Mimari Standartlar

## VFS ve State Yönetimi Kuralı (MANDATORY)
- **VFS'e erişim her zaman `useVFS()` hook'u veya `globalVFS` üzerinden yapılır.**
- **Hiçbir bileşen kendi lokal dosya listesi state'i tutmaz!**
- Terminal, Dosya Gezgini, Kod Editörü ve Masaüstü Sahnesi VFS ağacından oku/yaz yapar. VFS mutasyonları reaktif olarak tüm arayüzü otomatik günceller.

## Docker Komut Mimarisi Kuralı (MANDATORY)
- **Her Docker komutu kavramsal olarak tek bir handler'a sahip olmalıdır.**
- Sözdizimi varyasyonları (`docker X` / `docker <kaynak> X` / `docker container X`) bu handler'a yönlendirilen alias'lardır, asla ayrı implementasyon olarak kopyalanmaz.
