# 📄 Dokumentasi Rapor PDF Generator

## Overview

Sistem ini menggunakan **PDFKit** untuk menghasilkan rapor siswa dalam format PDF yang profesional dan terstruktur.

## Fitur Rapor PDF

### ✅ Konten Rapor

Rapor PDF mencakup informasi lengkap:

1. **Identitas Siswa**

   - Nama lengkap
   - NISN (Nomor Induk Siswa Nasional)
   - Kelas
   - Tahun ajaran
   - Semester

2. **Nilai Mata Pelajaran**

   - Daftar semua mata pelajaran yang diikuti
   - Nilai UTS (Ujian Tengah Semester)
   - Nilai UAS (Ujian Akhir Semester)
   - Nilai akhir
   - Nama guru pengajar
   - Rata-rata nilai keseluruhan

3. **Hasil MBTI**

   - Tipe kepribadian MBTI (contoh: INFP, ENTJ, dll)
   - Deskripsi tipe kepribadian
   - Gaya belajar yang sesuai
   - 3 rekomendasi belajar khusus berdasarkan tipe MBTI

4. **Komentar & Apresiasi**

   - Komentar dari wali kelas
   - Apresiasi untuk siswa

5. **Tanda Tangan Digital**
   - Nama wali kelas
   - NIP wali kelas
   - Tanggal cetak

## Struktur File

```
backend/
├── src/
│   ├── utils/
│   │   └── pdfGenerator.js          # Generator PDF menggunakan PDFKit
│   ├── controllers/
│   │   └── guruController.js        # Controller untuk export rapor
│   └── routes/
│       └── guruRoutes.js            # Route untuk endpoint PDF

frontend/
└── src/
    ├── services/
    │   └── api.js                   # API client
    └── pages/
        └── Teacher/
            └── CetakRapor.jsx       # Halaman cetak rapor
```

## Endpoint API

### Export Rapor PDF by Siswa ID

```
GET /api/guru/rapor/siswa/:siswaId/pdf
```

**Authorization:** Bearer Token (Role: guru)

**Parameters:**

- `siswaId` (path parameter) - ID siswa yang akan dicetak rapornya

**Response:** Binary PDF file

**Headers:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename=Rapor_[Nama_Siswa]_[Tahun].pdf
```

**Contoh Response Headers:**

```
Content-Disposition: attachment; filename=Rapor_Budi_Santoso_2024.pdf
```

## Cara Penggunaan

### 1. Backend - Generate PDF

```javascript
// Di guruController.js
const { generateRaporPDF } = require('../utils/pdfGenerator');

const exportRaporPDF = async (req, res) => {
    // Ambil data dari database
    const pdfData = {
        siswa: {
            nama_lengkap: 'Budi Santoso',
            nisn: '1234567890'
        },
        kelas: { nama_kelas: 'XII IPA 1' },
        tahunAjaran: { tahun: '2024/2025', semester: 'Ganjil' },
        nilai: [...], // Array nilai mata pelajaran
        rataRata: 85.5,
        mbti: { ... }, // Data hasil MBTI
        komentar: 'Siswa yang aktif...',
        apresiasi: 'Pertahankan prestasimu!',
        waliKelas: { nama_lengkap: 'Ibu Guru', nip: '198501012010012001' }
    };

    // Generate PDF
    await generateRaporPDF(pdfData, res);
};
```

### 2. Frontend - Download PDF

```javascript
// Di CetakRapor.jsx
import { guruAPI } from "../../services/api";

const handleDownloadPDF = async (siswaId) => {
  try {
    const response = await guruAPI.exportRaporPDFBySiswa(siswaId);

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rapor_${siswaId}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert("Rapor berhasil diunduh!");
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Gagal mengunduh rapor");
  }
};
```

### 3. Axios Configuration

```javascript
// Di api.js
export const guruAPI = {
  exportRaporPDFBySiswa: (siswaId) =>
    api.get(`/guru/rapor/siswa/${siswaId}/pdf`, {
      responseType: "blob", // PENTING: responseType harus 'blob'
    }),
};
```

## Template PDF

### Layout

- **Size:** A4 (210mm x 297mm)
- **Margins:** 50px (top, bottom, left, right)
- **Font:** Helvetica (Bold, Regular, Oblique)

### Color Scheme

- **Primary Blue:** `#2563eb` (Header table, borders)
- **Dark Blue:** `#1e40af` (Header background)
- **Light Blue:** `#eff6ff` (Alternating table rows)
- **Blue Background:** `#dbeafe` (MBTI box)

### Sections

#### 1. Header

```
┌─────────────────────────────────────┐
│         RAPOR SISWA                 │
│  SISTEM INFORMASI MANAJEMEN NILAI   │
│            MINDSIO                  │
└─────────────────────────────────────┘
```

#### 2. Identitas Siswa

```
Nama        : Budi Santoso
NISN        : 1234567890
Kelas       : XII IPA 1
Tahun Ajaran: 2024/2025
Semester    : Ganjil
```

#### 3. Tabel Nilai

```
┌──────────────────┬─────┬─────┬──────┬────────────┐
│ Mata Pelajaran   │ UTS │ UAS │ Akhir│ Guru       │
├──────────────────┼─────┼─────┼──────┼────────────┤
│ Matematika       │ 85  │ 88  │ 86.5 │ Pak Ahmad  │
│ Fisika           │ 80  │ 85  │ 82.5 │ Bu Siti    │
│ ...              │ ... │ ... │ ...  │ ...        │
└──────────────────┴─────┴─────┴──────┴────────────┘

Rata-rata Nilai: 85.50
```

#### 4. Hasil MBTI

```
┌─────────────────────────────────────┐
│ Tipe Kepribadian: INFP              │
└─────────────────────────────────────┘

Deskripsi:
Si Mediator adalah pribadi yang idealis dan penuh empati...

Gaya Belajar:
Visual & Reflektif

Rekomendasi Belajar:
1. Sediakan waktu khusus untuk refleksi...
2. Hubungkan informasi baru dengan nilai pribadi...
3. Gunakan cerita atau narasi...
```

#### 5. Komentar & Apresiasi

```
KOMENTAR WALI KELAS

Komentar:
Siswa yang aktif dan memiliki motivasi tinggi...

Apresiasi:
Pertahankan prestasi yang luar biasa!
```

#### 6. Tanda Tangan

```
                                Malang, 19 November 2025
                                Wali Kelas,



                                Ibu Guru
                                NIP. 198501012010012001
```

## Contoh Query Database

```sql
-- Ambil data untuk PDF
SELECT
    u.nama_lengkap, u.nisn,
    k.nama_kelas,
    ta.tahun_ajaran, ta.semester,
    r.rata_rata, r.komentar, r.apresiasi,
    wk.nama_lengkap as wali_nama, wk.nip as wali_nip
FROM rapor r
JOIN users u ON r.siswa_id = u.id
JOIN kelas k ON r.kelas_id = k.id
JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
JOIN users wk ON k.wali_kelas_id = wk.id
WHERE r.siswa_id = ?;

-- Ambil nilai mata pelajaran
SELECT
    mp.nama_mapel,
    n.nilai_uts, n.nilai_uas, n.nilai_akhir,
    guru.nama_lengkap as guru_nama
FROM nilai n
JOIN mata_pelajaran mp ON n.mapel_id = mp.id
JOIN guru_mapel gm ON gm.mapel_id = mp.id
JOIN users guru ON gm.guru_id = guru.id
WHERE n.siswa_id = ?;

-- Ambil hasil MBTI
SELECT
    mbti_type, deskripsi, gaya_belajar,
    rekomendasi_belajar_1,
    rekomendasi_belajar_2,
    rekomendasi_belajar_3
FROM mbti_hasil
WHERE siswa_id = ?;
```

## Error Handling

### Common Errors

1. **404 - Rapor tidak ditemukan**

```javascript
{
  message: "Rapor belum dibuat untuk siswa ini";
}
```

**Solusi:** Pastikan guru sudah membuat rapor melalui halaman "Komentar & Apresiasi"

2. **403 - Akses ditolak**

```javascript
{
  message: "Akses ditolak";
}
```

**Solusi:** Pastikan guru adalah wali kelas dari siswa tersebut

3. **500 - Error generating PDF**

```javascript
{
  message: "Error message...";
}
```

**Solusi:** Cek log server untuk detail error

## Testing

### Manual Test

1. Login sebagai guru (wali kelas)
2. Buka halaman "Cetak Rapor"
3. Klik tombol "PDF" pada salah satu siswa
4. File PDF akan otomatis terunduh

### Curl Test

```bash
curl -X GET \
  http://localhost:5000/api/guru/rapor/siswa/[SISWA_ID]/pdf \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  --output rapor.pdf
```

## Customization

### Mengubah Font Size

```javascript
// Di pdfGenerator.js
doc.fontSize(14); // Ubah ukuran font
```

### Mengubah Warna

```javascript
// Warna header table
doc.fillAndStroke("#2563eb", "#1e40af");

// Warna teks
doc.fillColor("black");
```

### Menambah Section Baru

```javascript
// Tambahkan sebelum footer
yPos += 20;
doc.font("Helvetica-Bold").fontSize(14).text("SECTION BARU", 50, yPos);
yPos += 25;
doc.font("Helvetica").fontSize(10).text("Konten section baru...", 50, yPos);
```

### Mengubah Margin

```javascript
const doc = new PDFDocument({
  size: "A4",
  margins: {
    top: 60, // atas
    bottom: 60, // bawah
    left: 60, // kiri
    right: 60, // kanan
  },
});
```

## Troubleshooting

### PDF Kosong atau Corrupt

- Pastikan `res.headersSent` belum true sebelum generate PDF
- Jangan kirim response lain setelah `doc.pipe(res)`
- Pastikan `doc.end()` dipanggil di akhir

### Data Tidak Muncul

- Cek query database apakah return data
- Pastikan field database match dengan yang digunakan di template
- Cek console.log untuk debug data

### Layout Berantakan

- Periksa nilai `yPos` (posisi Y)
- Tambahkan `doc.addPage()` jika konten panjang
- Sesuaikan `width` parameter di `doc.text()`

## Performance Tips

1. **Cache MBTI Data:** Simpan hasil MBTI di session jika sering diakses
2. **Compress PDF:** Gunakan `compress: true` di PDFDocument options
3. **Async Processing:** Untuk bulk export, gunakan queue system

## Dependencies

```json
{
  "pdfkit": "^0.17.2"
}
```

## Kesimpulan

Sistem rapor PDF ini memberikan output yang profesional dan lengkap dengan semua informasi penting siswa. Template dapat dengan mudah di-customize sesuai kebutuhan sekolah.

---

**Dibuat oleh:** GitHub Copilot  
**Tanggal:** 19 November 2025  
**Versi:** 1.0.0
