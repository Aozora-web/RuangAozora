PERBAIKAN RUANGFILE — HTML/CSS/JS TANPA PHP DAN DATABASE

KENAPA PDF TIDAK MUNCUL?
Website statis tidak dapat mengetahui file yang hanya kamu salin ke komputer, dan tidak dapat menyimpan upload browser ke hosting. File publik harus ada di folder files/ dan didaftarkan di files.json.

CARA MEMASUKKAN 3 PDF AGAR DILIHAT ORANG LAIN:
1. Salin ketiga PDF ke folder files/ (contoh: files/modul1.pdf, files/modul2.pdf, files/modul3.pdf).
2. Edit files.json. Gunakan format seperti ini (ubah nama dan ukuran sesuai file):
{
  "files": [
    {"name":"modul1.pdf","path":"files/modul1.pdf","size":123456,"description":"Modul 1","addedAt":1791590400000},
    {"name":"modul2.pdf","path":"files/modul2.pdf","size":234567,"description":"Modul 2","addedAt":1791590400000},
    {"name":"modul3.pdf","path":"files/modul3.pdf","size":345678,"description":"Modul 3","addedAt":1791590400000}
  ]
}
3. Upload/publish seluruh folder website (index.html, style.css, script.js, files.json, folder files) ke hosting statis.
4. Buka URL hosting. PDF akan muncul dan dapat diunduh pengunjung.

TOMBOL “PILIH FILE”:
Tombol itu sekarang menampilkan pratinjau file lokal agar kamu bisa memastikan file terbaca, tetapi pratinjau tersebut hanya terlihat di browser/perangkatmu. Ia tidak memublikasikan file.

PENTING:
- Tidak menggunakan PHP atau database.
- Untuk perubahan file publik, edit folder files/ dan files.json lalu publish ulang.
- Jangan masukkan dokumen rahasia karena file bersifat publik.
- Untuk memuat files.json, buka melalui hosting statis atau server lokal; membuka index.html langsung dengan file:// dapat diblokir browser.
