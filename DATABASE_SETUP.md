# 🗄️ SETUP DATABASE MINDSIO - PANDUAN LENGKAP

**Status:** Siap untuk production  
**Database:** MySQL mindsio (sudah ada di .env)  
**Data:** 16 test users + 100+ records

---

## 🚀 OPSI 1: Setup Otomatis (RECOMMENDED)

### Step 1: Buka Terminal & Masuk ke Backend

```bash
cd "d:\UNIVERSITAS NEGERI MALANG\Semester 3\Pemrograman WEB\tubesRPL\backend"
```

### Step 2: Jalankan Database Setup

```bash
# Buat database structure dari database.sql
mysql -u root -p < database.sql

# Masukkan password MySQL Anda (kalau ada)
```

**Penjelasan:**

- `mysql -u root` = Akses MySQL dengan user root
- `-p` = Prompt untuk password (tekan Enter jika tidak ada password)
- `< database.sql` = Import file schema database

### Step 3: Insert Dummy Data

```bash
# Buka database mindsio lalu insert data dari database-seed.sql
mysql -u root -p mindsio < database-seed.sql

# Masukkan password MySQL Anda (kalau ada)
```

**Penjelasan:**

- `mindsio` = Nama database
- `< database-seed.sql` = Import 16 users + 100+ test data

### Step 4: Verifikasi Data Berhasil Masuk

```bash
# Cek jumlah users yang sudah diinsert
mysql -u root -p mindsio -e "SELECT COUNT(*) as total_users FROM users;"

# Expected output: 16
```

---

## 🛠️ OPSI 2: Setup Manual via MySQL Workbench

### Jika Anda Lebih Suka GUI:

1. **Buka MySQL Workbench**

   - Klik "+" atau "New Connection"
   - Username: `root`
   - Password: (kosong atau sesuai setting Anda)

2. **Create Database**

   ```sql
   CREATE DATABASE IF NOT EXISTS mindsio;
   ```

3. **Import Schema**

   - File → Open SQL Script
   - Pilih `backend/database.sql`
   - Click Execute atau Ctrl+Enter

4. **Import Dummy Data**

   - File → Open SQL Script
   - Pilih `backend/database-seed.sql`
   - Click Execute atau Ctrl+Enter

5. **Verify**
   - Klik kanan pada database `mindsio`
   - Refresh
   - Lihat 12 tables sudah ada

---

## 📋 OPSI 3: Setup Manual via Command Line (Detailed)

### Langkah-langkah Lengkap:

#### 1. Masuk MySQL Console

```bash
mysql -u root -p
```

(Tekan Enter jika tidak ada password)

#### 2. Copy-Paste perintah SQL ini satu per satu:

```sql
-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS mindsio;
USE mindsio;

-- Step 2: Check database sudah dibuat
SHOW DATABASES;
-- Expected: Anda akan lihat "mindsio" di list
```

#### 3. Load Schema dari File

Ketik di console:

```bash
source D:\UNIVERSITAS NEGERI MALANG\Semester 3\Pemrograman WEB\tubesRPL\backend\database.sql;
```

#### 4. Verifikasi 12 Tables

```sql
SHOW TABLES;
-- Expected output: 12 tables
```

#### 5. Load Dummy Data

```bash
source D:\UNIVERSITAS NEGERI MALANG\Semester 3\Pemrograman WEB\tubesRPL\backend\database-seed.sql;
```

#### 6. Cek Data Berhasil

```sql
SELECT COUNT(*) as total_users FROM users;
-- Expected: 16

SELECT * FROM users LIMIT 5;
-- Lihat 5 user pertama
```

#### 7. Exit MySQL

```sql
EXIT;
```

---

## ✅ VERIFICATION CHECKLIST

Setelah setup, pastikan semua ini OK:

```sql
-- 1. Database ada?
SHOW DATABASES LIKE 'mindsio';
-- Expected: mindsio ✅

-- 2. Berapa banyak tables?
USE mindsio;
SHOW TABLES;
-- Expected: 12 tables ✅

-- 3. Berapa users?
SELECT COUNT(*) FROM users;
-- Expected: 16 ✅

-- 4. Berapa grades?
SELECT COUNT(*) FROM nilai;
-- Expected: 18 ✅

-- 5. Berapa MBTI results?
SELECT COUNT(*) FROM mbti_hasil;
-- Expected: 10 ✅

-- 6. UUID format OK?
SELECT id, username FROM users LIMIT 1;
-- Expected: id should be UUID like: 550e8400-e29b-41d4-a716-446655440101 ✅
```

---

## 🔧 TROUBLESHOOTING

### Problem 1: "ERROR 1045: Access denied"

```
Solusi: Password MySQL salah
- Coba: mysql -u root (tanpa -p)
- Atau masukkan password yang benar
```

### Problem 2: "ERROR 1049: Unknown database"

```
Solusi: Database belum dibuat
- Jalankan: mysql -u root -p < database.sql
```

### Problem 3: "Cannot open file"

```
Solusi: Path file salah
- Pastikan Anda di folder backend:
  cd backend
- Atau gunakan full path:
  mysql -u root -p < "D:\UNIVERSITAS...\database.sql"
```

### Problem 4: MySQL tidak terinstall

```
Solusi: Install MySQL
1. Download dari: mysql.com
2. Atau gunakan XAMPP (sudah include MySQL)
3. Start MySQL service
```

### Problem 5: Access denied for user

```
Solusi: Buat user baru atau reset password
mysql -u root
CREATE USER 'mindsio'@'localhost' IDENTIFIED BY 'mindsio123';
GRANT ALL PRIVILEGES ON mindsio.* TO 'mindsio'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 DATA YANG AKAN DIINSERT

```
Tahun Ajaran (Academic Years)
├── 2023/2024 Semester 1 (Inactive)
├── 2023/2024 Semester 2 (Inactive)
├── 2024/2025 Semester 1 (Active) ← Current
└── 2024/2025 Semester 2

Users (16 Total)
├── Admin (2)
│   ├── admin1
│   └── admin2
├── Guru/Teachers (4)
│   ├── guru_budi
│   ├── guru_siti
│   ├── guru_ahmad
│   └── guru_dewi
└── Siswa/Students (10)
    ├── siswa_adi
    ├── siswa_ani
    ├── siswa_budi
    ├── siswa_citra
    ├── siswa_doni
    ├── siswa_eka
    ├── siswa_farah
    ├── siswa_gilang
    ├── siswa_hana
    └── siswa_indra

Classes (3)
├── X-A (Grade 10-A) - 6 students
├── X-B (Grade 10-B) - ready
└── XI-A (Grade 11-A) - 4 students

Subjects (6)
├── Bahasa Indonesia
├── Matematika
├── Bahasa Inggris
├── Fisika
├── Kimia
└── Biologi

Grades (18 Records)
└── Complete UTS, UAS, Final scores

Report Cards (6 Rapor)
└── Summary grades per student

MBTI Results (10)
└── All students have MBTI profile

Learning References (10)
└── One for each MBTI type
```

---

## 🎯 NEXT STEPS SETELAH SETUP DATABASE

### 1. Verifikasi Database OK

```bash
# Login ke MySQL
mysql -u root -p mindsio

# Cek data
SELECT * FROM users LIMIT 3;
SELECT COUNT(*) FROM nilai;
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
# Output: Server Mindsio berjalan di port 5000
```

### 3. Test API

```bash
# Di terminal baru, test health check
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}
```

### 4. Login dengan Test Account

```
Username: siswa_adi
Email: adi@mindsio.com
```

---

## 📝 QUICK COPY-PASTE COMMAND

Jika MySQL sudah bisa dari command line:

```bash
# 1. Navigate to backend
cd "d:\UNIVERSITAS NEGERI MALANG\Semester 3\Pemrograman WEB\tubesRPL\backend"

# 2. Create schema & insert data (pilih satu)

# Option A: Dengan password
mysql -u root -pYOURPASSWORD < database.sql
mysql -u root -pYOURPASSWORD mindsio < database-seed.sql

# Option B: Tanpa password (tekan Enter saat diminta)
mysql -u root -p < database.sql
mysql -u root -p mindsio < database-seed.sql

# 3. Verify
mysql -u root -p mindsio -e "SELECT COUNT(*) as users FROM users;"
```

---

## 🔒 SECURE YOUR DATABASE

Setelah setup, jangan lupa:

```sql
-- 1. Change root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newPassword123!';

-- 2. Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- 3. Update .env dengan password yang benar
DB_PASSWORD=newPassword123!

-- 4. Flush privileges
FLUSH PRIVILEGES;
```

---

## 📱 JIKA PAKAI XAMPP

```bash
# 1. Buka XAMPP Control Panel
# 2. Start MySQL

# 3. Di terminal, masuk MySQL:
mysql -u root

# 4. Lalu lakukan setup seperti di atas
```

---

## ✨ DATABASE SUDAH SIAP!

Setelah selesai, Anda akan memiliki:

✅ 12 Tables dengan UUID primary keys  
✅ 16 Test Users siap digunakan  
✅ 18 Grade Records untuk testing  
✅ 10 MBTI Results complete  
✅ Production-ready database

---

**Sudah siap? Buka `INTEGRATION_GUIDE.md` untuk langkah berikutnya!** 🚀
