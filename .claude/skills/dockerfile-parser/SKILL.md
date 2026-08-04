# Dockerfile Parser Skill

## Ne Zaman Tetiklenir
Dockerfile parser modülü üzerinde çalışırken — yeni direktif desteği eklerken, hata mesajı genişletirken, AST yapısını değiştirirken.

## Adım Adım Nasıl Uygulanır
1. `src/engine/dockerfileParser.js` dosyasını aç
2. README.md Bölüm 9.2'yi referans al — desteklenmesi gereken direktifler listesi
3. Her direktif için:
   a. Tokenizer'a yeni kural ekle
   b. AST node tipi tanımla
   c. Build log üretici'ye karşılık gelen çıktı satırı ekle
   d. Hata durumları için simüle hata mesajı ekle
4. Parser çıktısını README.md 9.2'deki örnek JSON yapısıyla karşılaştır
5. Birim testi yaz — en az: geçerli girdi → doğru AST, hatalı girdi → doğru hata

## Örnek Girdi/Çıktı

Girdi:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

Beklenen AST çıktısı:
```json
{
  "stages": [{
    "name": null,
    "baseImage": "python:3.11-slim",
    "directives": [
      { "type": "WORKDIR", "args": ["/app"] },
      { "type": "COPY", "src": ".", "dst": "." },
      { "type": "EXPOSE", "port": 8000 },
      { "type": "CMD", "command": ["python", "main.py"] }
    ]
  }],
  "errors": [],
  "warnings": []
}
```

## Sık Yapılan Hatalar
- `FROM` satırı olmadan diğer direktifleri kabul etmek (hata vermeli)
- Multi-stage build'de `AS` anahtar kelimesini büyük/küçük harf duyarsız yapmamak
- `CMD` ve `ENTRYPOINT`'in exec form vs shell form ayrımını atlamak
- `EXPOSE` port numarasını string olarak bırakmak (integer olmalı)
- Yorum satırlarını (#) direktif olarak parse etmeye çalışmak
- Çok satırlı RUN komutlarında (backslash continuation) birleştirme yapmamak
