# Linux Temel Komutlar

## pwd — Bulunduğun Dizini Göster
Terminalde hangi dizinde olduğunu görmek için `pwd` komutunu kullan.
Çıktı olarak tam yol (absolute path) gösterilir.

## ls — Dizin İçeriğini Listele
`ls` komutu, bulunduğun dizindeki dosya ve klasörleri listeler.
- Klasörler mavi renkte gösterilir
- `ls /home/user` gibi başka dizinleri de listeleyebilirsin

## cd — Dizin Değiştir
`cd` komutu ile dizinler arasında gezebilirsin:
- `cd projects` — projects klasörüne gir
- `cd ..` — bir üst dizine çık
- `cd ~` veya `cd` — ev dizinine dön
- `cd /home/user` — mutlak yol ile git

## cat — Dosya İçeriğini Göster
`cat dosya.txt` komutu ile bir dosyanın tüm içeriğini terminalde görebilirsin.

## mkdir — Yeni Dizin Oluştur
`mkdir yeni_klasor` komutu ile yeni bir dizin oluşturabilirsin.
Zaten varsa hata verir.

## touch — Boş Dosya Oluştur
`touch dosya.txt` komutu ile boş bir dosya oluşturur.
Dosya zaten varsa hiçbir şey yapmaz (zarar vermez).

## echo — Metin Yazdır veya Dosyaya Yaz
- `echo Merhaba` — terminale "Merhaba" yazar
- `echo Merhaba > dosya.txt` — "Merhaba" metnini dosya.txt'ye yazar

## rm — Dosya veya Dizin Sil
`rm dosya.txt` komutu ile dosya silebilirsin.
DİKKAT: Silinen dosya geri gelmez!

## tree — Dizin Ağacını Göster
`tree` komutu bulunduğun dizinin ağaç yapısını gösterir.
Hangi dosya nerede, hızlıca görmek için kullanışlıdır.
