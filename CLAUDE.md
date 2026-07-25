# MLOps Engineer Simulator — Agent Rehberi

## Proje Kimliği
Tek cümlelik tanım: 'Tarayıcı tabanlı, 1D yaşam simülasyonu + kariyer simülasyonu oyunu. Gerçekçi Docker/Compose/K8s sözdizimi simülasyonu üzerinden MLOps mühendisliği öğretir.'
Referanslar: Detaylı oynanış için README.md'ye, ilerleme durumu için ROADMAP.md'ye, kaldığın yer için HANDOFF.md'ye bak.

## Çalışma Prensibi
Her session'a başlarken:
1. HANDOFF.md oku — kaldığın yeri öğren
2. ROADMAP.md'de aktif fazı bul
3. Sıradaki görevi al ve uygula
4. Session sonunda HANDOFF.md güncelle

## Git Commit Disiplini
- Her tamamlanan ROADMAP görevi kendi commit'ini alır
- Commit mesajı formatı: `[Faz X] Görev açıklaması`
- Checkbox güncellemesi + kod değişikliği aynı commit'te
- Çalışmayan/yarım kod commit'lenmez (WIP: prefix kullanılabilir)
- Faz sonunda: `[Faz X TAMAMLANDI] Faz özeti`
- Her session sonunda: `[Handoff] Session özeti`

## Kod Kalitesi Kuralları (Özet)
Detaylar: .claude/CODE_QUALITY.md
- Tek sorumluluk ilkesi: her fonksiyon/bileşen tek bir işi yapar
- State tek merkezden yönetilir (Zustand store)
- Sihirli sayı yasağı — tüm sabitler gameBalance.config.js'te
- Veri ve mantık ayrımı — NPC, olay, görev verileri JSON dosyalarında
- Dosya ~300 satır, fonksiyon ~50 satır sınırı
- İngilizce isimlendirme (yorumlar Türkçe olabilir)
- Kritik modüllerde (parser, bar formülleri) birim testleri zorunlu
- Hata sessiz geçilmez — try-catch'lerde loglama
- Erken optimizasyon yapılmaz
- Yorum = 'neden', kodun tekrarı değil

## Projenin Katı Kuralları (Özet)
Detaylar: .claude/RULES.md
1. ❌ Gerçek Docker daemon asla çalıştırılmaz
2. ❌ Kullanıcı girdisi eval/exec ile çalıştırılmaz
3. ❌ Kod dosyaları runtime'da AI ile üretilmez (senaryo metni hariç)
4. ❌ Zararlı davranış özendirici dil kullanılmaz
5. ❌ Gerçek kişi referansı kullanılmaz
6. ❌ ROADMAP'sız özellik eklenmez
7. ❌ API anahtarları commit'lenmez
8. ❌ Session HANDOFF güncellemesiz kapanmaz
9. ❌ Zorluk seviyeleri arası tutarsızlık yapılmaz
10. ❌ Bar formülleri birden fazla dosyaya dağıtılmaz

## Klasör Yapısı
```
mlops-sim/
├── README.md                    # Proje tasarım dokümanı
├── ROADMAP.md                   # Geliştirme yol haritası
├── HANDOFF.md                   # Session devir teslim dosyası
├── CLAUDE.md                    # Bu dosya — agent rehberi
├── .claude/
│   ├── RULES.md                 # Katı kurallar
│   ├── CODE_QUALITY.md          # Kod kalitesi prensipleri
│   ├── commands/
│   │   ├── new-task.md          # Yeni görev alma prosedürü
│   │   ├── close-session.md     # Session kapatma prosedürü
│   │   └── new-phase.md         # Yeni faz başlatma prosedürü
│   └── skills/
│       ├── dockerfile-parser/SKILL.md
│       ├── compose-parser/SKILL.md
│       ├── npc-content/SKILL.md
│       └── mission-content/SKILL.md
├── src/
│   ├── components/              # Yeniden kullanılabilir UI bileşenleri
│   ├── scenes/                  # Oyun sahneleri (HomeScene, ComputerScene vb.)
│   ├── store/                   # Zustand state yönetimi
│   ├── engine/                  # Oyun motorları (TimeEngine, EventEngine, Parser vb.)
│   ├── config/                  # Sabitler ve denge ayarları
│   ├── utils/                   # Yardımcı fonksiyonlar
│   └── data/                    # JSON veri dosyaları (NPC, olay, görev)
├── public/
│   └── assets/                  # Statik görev dosyaları, görseller
└── tests/                       # Birim testleri
```

## Session Handoff Şablonu
Her session sonunda HANDOFF.md şu formatta güncellenir:
```markdown
# HANDOFF — Son Güncelleme: [tarih]

## Şu An Neredeyiz
- Aktif Faz: [Faz X - Faz Adı]
- Son tamamlanan görev: [görev açıklaması]
- Son commit hash/mesajı: [commit mesajı]

## Yarım Kalan İş (varsa)
- [Ne yapılıyordu, nerede kesildi, neden kesildi]

## Bir Sonraki Session'da Yapılacak İlk Şey
- [Somut, net, tek bir sonraki adım]

## Bilinen Sorunlar / Dikkat Edilmesi Gerekenler
- [Açık bug'lar, ertelenen kararlar, teknik borç]

## Bu Session'da Alınan Önemli Kararlar
- [Mimari kararlar, README/ROADMAP'te olmayan netleşen şeyler]
```

## Asla Yapılmaması Gerekenler
- ❌ Gerçek docker build/run komutu tetiklemek
- ❌ Kullanıcı girdisini eval/exec etmek
- ❌ API anahtarlarını koda gömmek veya commit'lemek
- ❌ ROADMAP'ta olmayan özellik eklemek
- ❌ Birden fazla görevi tek commit'e sığdırmak
- ❌ Yarım/bozuk kodu commit'lemek
- ❌ Bar sabitlerini kod içine hardcode etmek
- ❌ Session'ı HANDOFF güncellemeden kapatmak
- ❌ Junior görevine K8s kriteri koymak (seviye tutarsızlığı)
- ❌ Statik asset kod dosyalarını AI ile runtime'da üretmek
