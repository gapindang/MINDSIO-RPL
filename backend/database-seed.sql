USE mindsio;

-- Note: Default tahun_ajaran (2024/2025, Semester 1) sudah ada di database.sql
-- Hanya tambahkan data tahun ajaran tambahan jika perlu
INSERT INTO tahun_ajaran (id, tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, is_aktif) VALUES
('550e8400-e29b-41d4-a716-446655440001', '2023/2024', 1, '2023-07-01', '2023-12-31', FALSE),
('550e8400-e29b-41d4-a716-446655440002', '2023/2024', 2, '2024-01-01', '2024-06-30', FALSE),
('550e8400-e29b-41d4-a716-446655440004', '2024/2025', 2, '2025-01-01', '2025-06-30', FALSE);

INSERT INTO users (id, username, email, password, role, nama_lengkap, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'admin1', 'admin1@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'admin', 'Admin Mindsio', TRUE),
('550e8400-e29b-41d4-a716-446655440102', 'admin2', 'admin2@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'admin', 'Admin Sekolah', TRUE);

INSERT INTO users (id, username, email, password, role, nama_lengkap, nip, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'guru_budi', 'budi@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'guru', 'Budi Santoso', '19800515200001001', TRUE),
('550e8400-e29b-41d4-a716-446655440202', 'guru_siti', 'siti@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'guru', 'Siti Nurhaliza', '19851022200001002', TRUE),
('550e8400-e29b-41d4-a716-446655440203', 'guru_ahmad', 'ahmad@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'guru', 'Ahmad Wijaya', '19800310200001003', TRUE),
('550e8400-e29b-41d4-a716-446655440204', 'guru_dewi', 'dewi@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'guru', 'Dewi Kusuma', '19751228200001004', TRUE);

INSERT INTO users (id, username, email, password, role, nama_lengkap, nisn, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'siswa_adi', 'adi@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Adi Pratama', '0123456001', TRUE),
('550e8400-e29b-41d4-a716-446655440302', 'siswa_ani', 'ani@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Ani Wijaya', '0123456002', TRUE),
('550e8400-e29b-41d4-a716-446655440303', 'siswa_budi', 'budi_s@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Budi Setiawan', '0123456003', TRUE),
('550e8400-e29b-41d4-a716-446655440304', 'siswa_citra', 'citra@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Citra Dewi', '0123456004', TRUE),
('550e8400-e29b-41d4-a716-446655440305', 'siswa_doni', 'doni@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Doni Hardianto', '0123456005', TRUE),
('550e8400-e29b-41d4-a716-446655440306', 'siswa_eka', 'eka@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Eka Putri', '0123456006', TRUE);

INSERT INTO users (id, username, email, password, role, nama_lengkap, nisn, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440307', 'siswa_farah', 'farah@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Farah Aziza', '0123456007', TRUE),
('550e8400-e29b-41d4-a716-446655440308', 'siswa_gilang', 'gilang@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Gilang Ramadhan', '0123456008', TRUE),
('550e8400-e29b-41d4-a716-446655440309', 'siswa_hana', 'hana@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Hana Kristina', '0123456009', TRUE),
('550e8400-e29b-41d4-a716-446655440310', 'siswa_indra', 'indra@mindsio.com', '$2b$10$YmFkZGVkIGVkZWQgZWRlZA==', 'siswa', 'Indra Wijaya', '0123456010', TRUE);

INSERT INTO kelas (id, nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440401', 'X-A', 10, '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440402', 'X-B', 10, '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440403', 'XI-A', 11, '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO siswa_kelas (id, siswa_id, kelas_id, no_urut) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', 1),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440401', 2),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440401', 3),
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440401', 4),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440401', 5),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440401', 6);

INSERT INTO siswa_kelas (id, siswa_id, kelas_id, no_urut) VALUES
('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440403', 1),
('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440403', 2),
('550e8400-e29b-41d4-a716-446655440509', '550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440403', 3),
('550e8400-e29b-41d4-a716-446655440510', '550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440403', 4);

INSERT INTO mata_pelajaran (id, nama_mapel, kode_mapel, guru_id) VALUES
('550e8400-e29b-41d4-a716-446655440601', 'Bahasa Indonesia', 'BIN', '550e8400-e29b-41d4-a716-446655440201'),
('550e8400-e29b-41d4-a716-446655440602', 'Matematika', 'MAT', '550e8400-e29b-41d4-a716-446655440202'),
('550e8400-e29b-41d4-a716-446655440603', 'Bahasa Inggris', 'ENG', '550e8400-e29b-41d4-a716-446655440203'),
('550e8400-e29b-41d4-a716-446655440604', 'Fisika', 'FIS', '550e8400-e29b-41d4-a716-446655440204'),
('550e8400-e29b-41d4-a716-446655440605', 'Kimia', 'KIM', '550e8400-e29b-41d4-a716-446655440201'),
('550e8400-e29b-41d4-a716-446655440606', 'Biologi', 'BIO', '550e8400-e29b-41d4-a716-446655440202');

INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003');


INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440706', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003');


INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES
('550e8400-e29b-41d4-a716-446655440707', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 78, 82, 80.0, 'Baik', 'Pengucapan kurang jelas'),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 85, 88, 86.5, 'Sangat Baik', 'Penguasaan konsep baik'),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 75, 78, 76.5, 'Baik', 'Aktif dalam diskusi'),
('550e8400-e29b-41d4-a716-446655440804', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 82, 85, 83.5, 'Sangat Baik', 'Praktikum rapi'),
('550e8400-e29b-41d4-a716-446655440805', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 80, 82, 81.0, 'Baik', 'Perlu perhatian');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440806', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 88, 90, 89.0, 'Sangat Baik', 'Prestasi terbaik di kelas'),
('550e8400-e29b-41d4-a716-446655440807', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 92, 94, 93.0, 'Sangat Baik', 'Konsisten unggul'),
('550e8400-e29b-41d4-a716-446655440808', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 86, 88, 87.0, 'Sangat Baik', 'Pengucapan sempurna'),
('550e8400-e29b-41d4-a716-446655440809', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 90, 92, 91.0, 'Sangat Baik', 'Analisis mendalam');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440810', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 72, 75, 73.5, 'Cukup', 'Perlu belajar lebih keras'),
('550e8400-e29b-41d4-a716-446655440811', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 70, 73, 71.5, 'Cukup', 'Kurang menguasai'),
('550e8400-e29b-41d4-a716-446655440812', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 76, 78, 77.0, 'Baik', 'Partisipasi aktif');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440813', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 85, 87, 86.0, 'Sangat Baik', 'Kreatif menulis'),
('550e8400-e29b-41d4-a716-446655440814', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 88, 90, 89.0, 'Sangat Baik', 'Pemahaman baik');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440815', '550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 81, 83, 82.0, 'Baik', 'Fokus meningkat'),
('550e8400-e29b-41d4-a716-446655440816', '550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 84, 86, 85.0, 'Baik', 'Progres bagus');

INSERT INTO nilai (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi) VALUES
('550e8400-e29b-41d4-a716-446655440817', '550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 79, 81, 80.0, 'Baik', 'Kerja keras'),
('550e8400-e29b-41d4-a716-446655440818', '550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 82, 84, 83.0, 'Baik', 'Disiplin baik');

INSERT INTO rapor (id, siswa_id, kelas_id, tahun_ajaran_id, rata_rata_nilai, komentar_wali_kelas, apresiasi_wali_kelas) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 81.0, 'Siswa menunjukkan perkembangan yang konsisten', 'Terus tingkatkan prestasi'),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 90.0, 'Siswi berprestasi dengan konsisten sangat baik', 'Jadilah teladan teman-teman'),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 73.8, 'Siswa perlu lebih meningkatkan prestasi', 'Rajin belajar dan fokus'),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 87.5, 'Siswi menunjukkan kemampuan yang baik', 'Pertahankan prestasi baik'),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 83.5, 'Siswa menunjukkan peningkatan prestasi', 'Tetap semangat belajar'),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440003', 81.5, 'Siswi bekerja keras meningkatkan prestasi', 'Lanjutkan usaha maksimal');


INSERT INTO mbti_hasil (id, siswa_id, mbti_type, deskripsi, kekuatan_1, kekuatan_2, kekuatan_3, gaya_belajar, rekomendasi_belajar_1, rekomendasi_belajar_2, rekomendasi_belajar_3) VALUES
('550e8400-e29b-41d4-a716-446655440a01', '550e8400-e29b-41d4-a716-446655440301', 'ISTJ', 'Logistician - Praktis, detail-oriented, dan bertanggung jawab', 'Konsisten', 'Terorganisir', 'Handal', 'Belajar dengan sistematis', 'Buat jadwal belajar terstruktur dengan materi yang terorganisir', 'Gunakan catatan yang rapi dan sistematis untuk setiap pelajaran', 'Praktik dengan latihan rutin dan evaluasi kemajuan berkala'),
('550e8400-e29b-41d4-a716-446655440a02', '550e8400-e29b-41d4-a716-446655440302', 'ENTJ', 'Commander - Pemimpin alami, strategis, dan tegas', 'Kepemimpinan', 'Logika', 'Keputusan cepat', 'Belajar melalui tantangan', 'Tetapkan target akademik yang ambisius dan terukur', 'Pelajari big picture terlebih dahulu sebelum detail spesifik', 'Ikuti kompetisi akademik dan tantangan pembelajaran tingkat tinggi'),
('550e8400-e29b-41d4-a716-446655440a03', '550e8400-e29b-41d4-a716-446655440303', 'ISFP', 'Adventurer - Fleksibel, artistik, dan loyal', 'Kepekaan', 'Kreativitas', 'Harmoni', 'Belajar dengan praktek', 'Belajar dengan contoh konkret dan aplikasi praktis nyata', 'Gunakan media visual seperti diagram, gambar, dan video', 'Praktik hands-on dan belajar melalui pengalaman langsung'),
('550e8400-e29b-41d4-a716-446655440a04', '550e8400-e29b-41d4-a716-446655440304', 'ESFJ', 'Consul - Sosial, penuh perhatian, dan kooperatif', 'Empati', 'Kolaborasi', 'Dukungan', 'Belajar berkelompok', 'Studi kelompok aktif dengan diskusi interaktif antar teman', 'Minta feedback positif dan bimbingan dari guru atau teman', 'Kolaborasi dalam proyek kelompok untuk perkembangan sosial'),
('550e8400-e29b-41d4-a716-446655440a05', '550e8400-e29b-41d4-a716-446655440305', 'ISTP', 'Virtuoso - Logis, independen, dan praktis', 'Problem-solving', 'Fleksibel', 'Independen', 'Belajar dengan eksperimen', 'Eksperimen dan trial-error untuk pahami cara kerja sistem', 'Analisis masalah dari sudut pandang logis dan sistematis', 'Belajar sesuai kebutuhan saat dihadapkan dengan masalah nyata'),
('550e8400-e29b-41d4-a716-446655440a06', '550e8400-e29b-41d4-a716-446655440306', 'INFP', 'Mediator - Idealis, empati, dan kreatif', 'Kreativitas', 'Empati', 'Idealisme', 'Belajar dengan makna', 'Temukan makna dan koneksi personal dalam setiap materi', 'Tuliskan refleksi pembelajaran dan ekspresikan secara kreatif', 'Belajar topik yang sesuai dengan nilai dan passion pribadi'),
('550e8400-e29b-41d4-a716-446655440a07', '550e8400-e29b-41d4-a716-446655440307', 'ENFP', 'Campaigner - Antusias, kreatif, dan spontan', 'Kreativitas', 'Antusiasme', 'Fleksibilitas', 'Belajar dengan eksplorasi', 'Pelajari berbagai perspektif dan buat koneksi antar topik', 'Gunakan media visual dan variasi metode belajar interaktif', 'Ikuti minat personal dan passion dalam eksplorasi materi'),
('550e8400-e29b-41d4-a716-446655440a08', '550e8400-e29b-41d4-a716-446655440308', 'INTJ', 'Architect - Strategis, independen, dan visioner', 'Strategis', 'Independen', 'Visi', 'Belajar mandiri mendalam', 'Belajar mandiri dengan struktur terencana dan riset mendalam', 'Pahami teori fundamental sebelum aplikasi praktis', 'Rencanakan jangka panjang dan kritik analisis materi'),
('550e8400-e29b-41d4-a716-446655440a09', '550e8400-e29b-41d4-a716-446655440309', 'ESFP', 'Entertainer - Enthusiastik, sosial, dan fleksibel', 'Energi', 'Sosial', 'Kepositifan', 'Belajar dengan aksi', 'Belajar dengan aksi nyata melalui pembelajaran interaktif', 'Ikuti aktivitas pembelajaran yang menghibur dan dinamis', 'Variasi metode belajar dan diskusi energik dengan teman'),
('550e8400-e29b-41d4-a716-446655440a10', '550e8400-e29b-41d4-a716-446655440310', 'INFJ', 'Advocate - Perasa, intuitif, dan idealis', 'Intuisi', 'Empati', 'Kepedulian', 'Belajar dengan refleksi', 'Refleksi mendalam tentang dampak sosial dari pembelajaran', 'Koneksi emosional dengan materi dan mentoring dari guru', 'Eksplorasi makna pembelajaran dan dampak sosialnya');

INSERT INTO gaya_belajar_referensi (id, mbti_type, nama_tipe, deskripsi, gaya_belajar, tips_1, tips_2, tips_3, tips_4, tips_5) VALUES
('550e8400-e29b-41d4-a716-446655440b01', 'ISTJ', 'Logistician', 'Praktis, terorganisir, bertanggung jawab', 'Sistematis', 'Buat jadwal belajar terstruktur', 'Gunakan catatan yang terorganisir', 'Pahami konsep dasar sebelum detail', 'Praktik dengan latihan rutin', 'Ciptakan lingkungan belajar tenang'),
('550e8400-e29b-41d4-a716-446655440b02', 'ENTJ', 'Commander', 'Pemimpin, strategis, tegas', 'Kompetitif', 'Tetapkan target ambisius', 'Pelajari konsep besar dulu', 'Debat dan diskusi mendalam', 'Cari tantangan akademik', 'Analisis strategi belajar'),
('550e8400-e29b-41d4-a716-446655440b03', 'ISFP', 'Adventurer', 'Artistik, fleksibel, loyal', 'Praktik langsung', 'Belajar dengan contoh konkret', 'Gunakan metode visual', 'Praktik hands-on', 'Ciptakan suasana nyaman', 'Belajar sesuai kecepatan sendiri'),
('550e8400-e29b-41d4-a716-446655440b04', 'ESFJ', 'Consul', 'Sosial, perhatian, kooperatif', 'Kelompok', 'Studi kelompok aktif', 'Diskusi dengan teman', 'Minta feedback positif', 'Kolaborasi dalam proyek', 'Sharing pengetahuan dengan teman'),
('550e8400-e29b-41d4-a716-446655440b05', 'ISTP', 'Virtuoso', 'Logis, independen, praktis', 'Problem-solving', 'Eksperimen dan trial-error', 'Pelajari cara kerja sistem', 'Praktik dengan proyek nyata', 'Analisis masalah logis', 'Belajar saat dibutuhkan'),
('550e8400-e29b-41d4-a716-446655440b06', 'INFP', 'Mediator', 'Idealis, kreatif, empati', 'Bermakna', 'Temukan makna dalam materi', 'Koneksi dengan nilai pribadi', 'Tuliskan refleksi pembelajaran', 'Kreatif ekspresikan ide', 'Belajar dengan passion'),
('550e8400-e29b-41d4-a716-446655440b07', 'ENFP', 'Campaigner', 'Antusias, kreatif, spontan', 'Eksplorasi', 'Pelajari berbagai perspektif', 'Buat koneksi antar topik', 'Gunakan media visual', 'Variasi metode belajar', 'Ikuti minat dan passion'),
('550e8400-e29b-41d4-a716-446655440b08', 'INTJ', 'Architect', 'Strategis, independen, visioner', 'Mendalam', 'Belajar mandiri terstruktur', 'Pahami teori fundamental', 'Riset tema mendalam', 'Kritik analisis materi', 'Rencanakan jangka panjang'),
('550e8400-e29b-41d4-a716-446655440b09', 'ESFP', 'Entertainer', 'Energik, sosial, fleksibel', 'Aksi', 'Belajar dengan aksi nyata', 'Ikuti pembelajaran interaktif', 'Belajar sambil bermain', 'Diskusi energik', 'Variasi aktivitas belajar'),
('550e8400-e29b-41d4-a716-446655440b10', 'INFJ', 'Advocate', 'Intuitif, empati, idealis', 'Refleksi', 'Refleksi mendalam', 'Koneksi emosional materi', 'Belajar dengan makna', 'Mentoring dan bimbingan', 'Eksplorasi dampak sosial');