-- Create Database
CREATE DATABASE IF NOT EXISTS mindsio;
USE mindsio;

-- Create Users Table (Admin, Guru, Siswa)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'guru', 'siswa') NOT NULL DEFAULT 'siswa',
  nama_lengkap VARCHAR(255) NOT NULL,
  nisn VARCHAR(20) UNIQUE,
  nip VARCHAR(20) UNIQUE,
  foto_profil VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_nisn (nisn),
  INDEX idx_nip (nip)
);

-- Create Tahun Ajaran Table
CREATE TABLE tahun_ajaran (
  id VARCHAR(36) PRIMARY KEY,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  is_aktif BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tahun_semester (tahun_ajaran, semester),
  INDEX idx_aktif (is_aktif)
);

-- Create Kelas Table
CREATE TABLE kelas (
  id VARCHAR(36) PRIMARY KEY,
  nama_kelas VARCHAR(50) NOT NULL,
  tingkat INT NOT NULL,
  wali_kelas_id VARCHAR(36),
  tahun_ajaran_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wali_kelas_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
  UNIQUE KEY unique_kelas_tahun (nama_kelas, tahun_ajaran_id),
  INDEX idx_tahun_ajaran (tahun_ajaran_id)
);

-- Create Siswa-Kelas Relationship
CREATE TABLE siswa_kelas (
  id VARCHAR(36) PRIMARY KEY,
  siswa_id VARCHAR(36) NOT NULL,
  kelas_id VARCHAR(36) NOT NULL,
  no_urut INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_siswa_kelas (siswa_id, kelas_id),
  INDEX idx_kelas (kelas_id)
);

-- Create Mata Pelajaran Table
CREATE TABLE mata_pelajaran (
  id VARCHAR(36) PRIMARY KEY,
  nama_mapel VARCHAR(100) NOT NULL,
  kode_mapel VARCHAR(20) UNIQUE,
  guru_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_guru (guru_id)
);

-- Create Guru-Mapel Assignment
CREATE TABLE guru_mapel (
  id VARCHAR(36) PRIMARY KEY,
  guru_id VARCHAR(36) NOT NULL,
  mapel_id VARCHAR(36) NOT NULL,
  kelas_id VARCHAR(36) NOT NULL,
  tahun_ajaran_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
  UNIQUE KEY unique_guru_mapel_kelas (guru_id, mapel_id, kelas_id),
  INDEX idx_kelas (kelas_id)
);

-- Create Nilai (Grades) Table
CREATE TABLE nilai (
  id VARCHAR(36) PRIMARY KEY,
  siswa_id VARCHAR(36) NOT NULL,
  mapel_id VARCHAR(36) NOT NULL,
  guru_id VARCHAR(36) NOT NULL,
  kelas_id VARCHAR(36) NOT NULL,
  tahun_ajaran_id VARCHAR(36) NOT NULL,
  nilai_uts DECIMAL(5,2),
  nilai_uas DECIMAL(5,2),
  nilai_akhir DECIMAL(5,2),
  komentar TEXT,
  apresiasi TEXT,
  tanggal_input TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
  UNIQUE KEY unique_nilai (siswa_id, mapel_id, tahun_ajaran_id),
  INDEX idx_siswa (siswa_id),
  INDEX idx_kelas (kelas_id),
  INDEX idx_tahun_ajaran (tahun_ajaran_id)
);

-- Create Rapor Table (Summary)
CREATE TABLE rapor (
  id VARCHAR(36) PRIMARY KEY,
  siswa_id VARCHAR(36) NOT NULL,
  kelas_id VARCHAR(36) NOT NULL,
  tahun_ajaran_id VARCHAR(36) NOT NULL,
  rata_rata_nilai DECIMAL(5,2),
  komentar_wali_kelas TEXT,
  apresiasi_wali_kelas TEXT,
  tanggal_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tanggal_dicetak TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rapor (siswa_id, tahun_ajaran_id),
  INDEX idx_kelas (kelas_id)
);

-- Create MBTI Hasil Tes Table
CREATE TABLE mbti_hasil (
  id VARCHAR(36) PRIMARY KEY,
  siswa_id VARCHAR(36) NOT NULL UNIQUE,
  mbti_type VARCHAR(10),
  deskripsi TEXT,
  kekuatan_1 VARCHAR(100),
  kekuatan_2 VARCHAR(100),
  kekuatan_3 VARCHAR(100),
  gaya_belajar VARCHAR(100),
  rekomendasi_belajar_1 TEXT,
  rekomendasi_belajar_2 TEXT,
  rekomendasi_belajar_3 TEXT,
  file_hasil VARCHAR(255),
  tanggal_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_mbti_type (mbti_type)
);

-- Create Gaya Belajar Reference Table
CREATE TABLE gaya_belajar_referensi (
  id VARCHAR(36) PRIMARY KEY,
  mbti_type VARCHAR(10) NOT NULL UNIQUE,
  nama_tipe VARCHAR(100),
  deskripsi TEXT,
  gaya_belajar VARCHAR(100),
  tips_1 TEXT,
  tips_2 TEXT,
  tips_3 TEXT,
  tips_4 TEXT,
  tips_5 TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Aktivitas Log Table
CREATE TABLE aktivitas_log (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  tipe_aksi VARCHAR(100),
  deskripsi TEXT,
  tabel_terkait VARCHAR(100),
  id_terkait VARCHAR(36),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);

-- Insert default Tahun Ajaran
INSERT INTO tahun_ajaran (tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, is_aktif) 
VALUES ('2024/2025', 1, '2024-07-01', '2024-12-31', TRUE);

-- Insert default MBTI Reference Data (16 types)
INSERT INTO gaya_belajar_referensi (id, mbti_type, nama_tipe, deskripsi, gaya_belajar, tips_1, tips_2, tips_3, tips_4, tips_5) VALUES
(UUID(), 'ISTJ', 'The Logistician', 'Praktis, bertanggung jawab, dan terorganisir', 'Systematic & Structured', 'Ikuti struktur dan jadwal yang jelas', 'Pelajari dari sumber terpercaya', 'Praktek dengan konsistensi', 'Fokus pada detail penting', 'Atur waktu belajar dengan baik'),
(UUID(), 'ISFJ', 'The Defender', 'Dedicated, penuh kasih sayang, dan detail', 'Hands-on & Collaborative', 'Belajar dalam kelompok kecil', 'Hubungkan dengan pengalaman nyata', 'Butuh persetujuan dan feedback', 'Fokus pada aplikasi praktis', 'Ciptakan lingkungan nyaman'),
(UUID(), 'INFJ', 'The Advocate', 'Idealis, visioner, dan empatik', 'Intuitive & Reflective', 'Cari makna mendalam dalam materi', 'Diskusi tentang nilai dan tujuan', 'Waktu untuk introspeksi', 'Hubungkan dengan impian besar', 'Belajar melalui mentoring'),
(UUID(), 'INTJ', 'The Architect', 'Pemikir strategis yang independen', 'Analytical & Logical', 'Pelajari konsep secara mendalam', 'Hubungkan teori dengan praktik', 'Fokus pada struktur dan logika', 'Cari pola dan sistem', 'Belajar dari sumber berkualitas tinggi'),
(UUID(), 'ISTP', 'The Virtuoso', 'Logis, objektif, dan praktis', 'Hands-on & Experimental', 'Belajar dengan eksperimen langsung', 'Pahami mekanisme cara kerja', 'Independen dalam belajar', 'Fokus pada efisiensi', 'Coba sendiri sebelum meminta bantuan'),
(UUID(), 'ISFP', 'The Adventurer', 'Sensitif, artistik, dan spontan', 'Aesthetic & Experiential', 'Lingkungan belajar yang indah', 'Praktik dengan cara yang menyenangkan', 'Eksplorasi sesuai minat', 'Hindari kritik yang tajam', 'Belajar dengan apa yang disukai'),
(UUID(), 'INFP', 'The Mediator', 'Idealist yang kreatif dan empatik', 'Visual & Reflective', 'Belajar dengan visual yang menarik', 'Hubungkan materi dengan nilai pribadi', 'Ambil waktu untuk refleksi mendalam', 'Cari makna dalam setiap pembelajaran', 'Diskusi dengan teman yang mendukung'),
(UUID(), 'INTP', 'The Logician', 'Pemikir inovatif dan objektif', 'Conceptual & Independent', 'Pahami konsep di balik materi', 'Eksplorasi teori yang menarik', 'Independen dan self-motivated', 'Tanyakan "mengapa" berkali-kali', 'Debat untuk memperdalam pemahaman'),
(UUID(), 'ESTP', 'The Entrepreneur', 'Energik, pragmatis, dan berani', 'Active & Experiential', 'Belajar melalui pengalaman langsung', 'Praktik di dunia nyata', 'Butuh variasi dan tantangan', 'Belajar dengan teman', 'Cari hasil yang terukur'),
(UUID(), 'ESFP', 'The Entertainer', 'Outgoing, spontan, dan riang', 'Kinesthetic & Social', 'Belajar dalam suasana ceria', 'Kolaborasi dengan banyak orang', 'Aktivitas interaktif dan fun', 'Hindari tugas monoton', 'Belajar dengan bermain'),
(UUID(), 'ENFP', 'The Campaigner', 'Enthusiast yang kreatif dan sosial', 'Kinesthetic & Interactive', 'Variasi metode pembelajaran', 'Kolaborasi dengan kelompok', 'Gunakan aktivitas interaktif', 'Kaitkan dengan minat pribadi', 'Brainstorm ide kreatif'),
(UUID(), 'ENTP', 'The Debater', 'Pemikir cepat dan argumentatif', 'Analytical & Interactive', 'Debat dan diskusi ilmiah', 'Tantang ide yang ada', 'Eksplorasi berbagai perspektif', 'Kembangkan argumen logis', 'Cari sumber alternatif'),
(UUID(), 'ESTJ', 'The Executive', 'Organisir, tanggung jawab, dan decisive', 'Structured & Goal-oriented', 'Belajar dengan rencana jelas', 'Target dan deadline terukur', 'Ikuti aturan dan standar', 'Pengetahuan praktis yang berguna', 'Evaluasi progress secara berkala'),
(UUID(), 'ESFJ', 'The Consul', 'Peduli, hangat, dan loyal', 'Collaborative & Supportive', 'Belajar bersama kelompok', 'Apresiasi dan pengakuan penting', 'Fokus pada topik yang relevan sosial', 'Butuh feedback positif', 'Hubungan baik dengan pengajar'),
(UUID(), 'ENFJ', 'The Protagonist', 'Karismatik, empati, dan pemimpin', 'Interactive & Motivational', 'Inspirasi dari nilai-nilai besar', 'Motivasi orang lain sambil belajar', 'Diskusi yang bermakna', 'Hubungan personal penting', 'Kepemimpinan dalam pembelajaran'),
(UUID(), 'ENTJ', 'The Commander', 'Strategis, decisive, dan powerful', 'Logical & Goal-driven', 'Tujuan pembelajaran yang jelas', 'Efisiensi waktu dan sumber daya', 'Kuasai topik secara menyeluruh', 'Aplikasi praktis langsung', 'Tantang diri dengan standar tinggi');

-- Create indexes for better performance
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_nilai_siswa_tahun ON nilai(siswa_id, tahun_ajaran_id);
CREATE INDEX idx_siswa_kelas_tahun ON siswa_kelas(siswa_id);
