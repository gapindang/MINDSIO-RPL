const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const { generateRaporPDF } = require("../utils/pdfGenerator");

const getKelasTeaching = async (req, res) => {
  try {
    const guruId = req.user.id;
    const connection = await pool.getConnection();

    // Kembalikan kelas yang guru ini wali kelasnya atau dia mengajar (guru_mapel)
    const [kelas] = await connection.query(
      `SELECT DISTINCT
        k.id,
        k.nama_kelas,
        k.tingkat,
        ta.id as tahun_ajaran_id,
        ta.tahun_ajaran,
        COUNT(DISTINCT sk.siswa_id) as jumlah_siswa
      FROM kelas k
      LEFT JOIN siswa_kelas sk ON k.id = sk.kelas_id
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN guru_mapel gm ON gm.kelas_id = k.id AND gm.tahun_ajaran_id = ta.id
      WHERE (k.wali_kelas_id = ? OR gm.guru_id = ?) AND ta.is_aktif = TRUE
      GROUP BY k.id
      ORDER BY k.nama_kelas ASC`,
      [guruId, guruId]
    );

    connection.release();
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kembalikan kelas yang guru **mengajar** (berdasarkan guru_mapel) pada tahun ajaran aktif
const getKelasMengajar = async (req, res) => {
  try {
    const guruId = req.user.id;
    const connection = await pool.getConnection();

    const [kelas] = await connection.query(
      `SELECT DISTINCT
        k.id,
        k.nama_kelas,
        k.tingkat,
        ta.id as tahun_ajaran_id,
        ta.tahun_ajaran,
        COUNT(DISTINCT sk.siswa_id) as jumlah_siswa
      FROM guru_mapel gm
      JOIN kelas k ON gm.kelas_id = k.id
      JOIN tahun_ajaran ta ON gm.tahun_ajaran_id = ta.id
      LEFT JOIN siswa_kelas sk ON k.id = sk.kelas_id
      WHERE gm.guru_id = ? AND ta.is_aktif = TRUE
      GROUP BY k.id
      ORDER BY k.nama_kelas ASC`,
      [guruId]
    );

    connection.release();
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSiswaInKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    // Verifikasi: guru boleh akses jika dia wali kelas ATAU dia mengajar mapel di kelas ini
    const [isWali] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (isWali.length === 0) {
      const [isPengajar] = await connection.query(
        `SELECT gm.id FROM guru_mapel gm
         JOIN tahun_ajaran ta ON gm.tahun_ajaran_id = ta.id
         WHERE gm.kelas_id = ? AND gm.guru_id = ? AND ta.is_aktif = TRUE LIMIT 1`,
        [kelasId, guruId]
      );

      if (isPengajar.length === 0) {
        connection.release();
        return res.status(403).json({ message: "Akses ditolak" });
      }
    }

    const [siswa] = await connection.query(
      `SELECT 
        u.id,
        u.nisn,
        u.nama_lengkap,
        sk.no_urut,
        AVG(n.nilai_akhir) as rata_rata_nilai
      FROM siswa_kelas sk
      JOIN users u ON sk.siswa_id = u.id
      LEFT JOIN nilai n ON u.id = n.siswa_id
      WHERE sk.kelas_id = ?
      GROUP BY u.id
      ORDER BY sk.no_urut ASC`,
      [kelasId]
    );

    connection.release();
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inputNilai = async (req, res) => {
  try {
    const guruId = req.user.id;
    const {
      siswaId,
      mapelId,
      kelasId,
      tahunAjaranId,
      nilaiUts,
      nilaiUas,
      komentar,
      apresiasi,
    } = req.body;

    if (!siswaId || !mapelId || !kelasId || !tahunAjaranId) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();

    // Verifikasi guru mengajar mapel di kelas ini
    const [verif] = await connection.query(
      `SELECT id FROM guru_mapel 
      WHERE guru_id = ? AND mapel_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?`,
      [guruId, mapelId, kelasId, tahunAjaranId]
    );

    if (verif.length === 0) {
      // Tambahan logging untuk membantu debugging: cek apakah guru punya penugasan lain pada kelas/tahun ini
      try {
        const [otherAssignments] = await connection.query(
          `SELECT gm.id, gm.mapel_id, mp.nama_mapel FROM guru_mapel gm
           LEFT JOIN mata_pelajaran mp ON gm.mapel_id = mp.id
           WHERE gm.guru_id = ? AND gm.kelas_id = ? AND gm.tahun_ajaran_id = ?`,
          [guruId, kelasId, tahunAjaranId]
        );
        console.warn(
          `inputNilai: akses ditolak untuk guru=${guruId}, siswa=${siswaId}, mapel=${mapelId}, kelas=${kelasId}, tahun=${tahunAjaranId}. assignmentsCount=${otherAssignments.length}`
        );
        if (otherAssignments.length > 0)
          console.warn(
            "existing assignments for this guru in kelas:",
            otherAssignments
          );
      } catch (logErr) {
        console.error(
          "inputNilai: gagal mengecek penugasan lain untuk guru:",
          logErr
        );
      }

      connection.release();
      return res.status(403).json({
        message:
          "Akses ditolak: Anda tidak ditugaskan mengajar mata pelajaran ini di kelas/tahun ajaran yang dipilih",
      });
    }

    // Hitung nilai akhir
    const nilaiAkhir =
      nilaiUts && nilaiUas ? (nilaiUts + nilaiUas) / 2 : nilaiUts || nilaiUas;

    // Cek apakah nilai sudah ada
    const [existing] = await connection.query(
      `SELECT id FROM nilai 
      WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?`,
      [siswaId, mapelId, tahunAjaranId]
    );

    if (existing.length > 0) {
      // Update
      await connection.query(
        `UPDATE nilai 
        SET nilai_uts = ?, nilai_uas = ?, nilai_akhir = ?, komentar = ?, apresiasi = ?, updated_at = CURRENT_TIMESTAMP
        WHERE siswa_id = ? AND mapel_id = ? AND tahun_ajaran_id = ?`,
        [
          nilaiUts,
          nilaiUas,
          nilaiAkhir,
          komentar,
          apresiasi,
          siswaId,
          mapelId,
          tahunAjaranId,
        ]
      );
    } else {
      // Insert
      const nilaiId = uuidv4();
      await connection.query(
        `INSERT INTO nilai 
        (id, siswa_id, mapel_id, guru_id, kelas_id, tahun_ajaran_id, nilai_uts, nilai_uas, nilai_akhir, komentar, apresiasi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nilaiId,
          siswaId,
          mapelId,
          guruId,
          kelasId,
          tahunAjaranId,
          nilaiUts,
          nilaiUas,
          nilaiAkhir,
          komentar,
          apresiasi,
        ]
      );
    }

    connection.release();

    res.json({
      message:
        existing.length > 0
          ? "Nilai berhasil diperbarui"
          : "Nilai berhasil disimpan",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    // Verifikasi: guru boleh akses jika dia wali kelas ATAU dia mengajar mapel di kelas ini
    const [isWali] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (isWali.length === 0) {
      const [isPengajar] = await connection.query(
        `SELECT gm.id FROM guru_mapel gm
         JOIN tahun_ajaran ta ON gm.tahun_ajaran_id = ta.id
         WHERE gm.kelas_id = ? AND gm.guru_id = ? AND ta.is_aktif = TRUE LIMIT 1`,
        [kelasId, guruId]
      );

      if (isPengajar.length === 0) {
        connection.release();
        return res.status(403).json({ message: "Akses ditolak" });
      }
    }

    // Statistik kelas
    const [stats] = await connection.query(
      `SELECT 
        COUNT(DISTINCT sk.siswa_id) as jumlah_siswa,
        AVG(n.nilai_akhir) as rata_rata_kelas,
        MAX(n.nilai_akhir) as nilai_tertinggi,
        MIN(n.nilai_akhir) as nilai_terendah,
        COUNT(DISTINCT mbti.siswa_id) as mbti_selesai
      FROM siswa_kelas sk
      LEFT JOIN nilai n ON sk.siswa_id = n.siswa_id
      LEFT JOIN mbti_hasil mbti ON sk.siswa_id = mbti.siswa_id
      WHERE sk.kelas_id = ?`,
      [kelasId]
    );

    // Performa per mapel
    const [performa] = await connection.query(
      `SELECT 
        mp.nama_mapel,
        AVG(n.nilai_akhir) as rata_rata,
        COUNT(n.id) as jumlah_siswa
      FROM nilai n
      JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      WHERE n.kelas_id = ?
      GROUP BY mp.id
      ORDER BY mp.nama_mapel ASC`,
      [kelasId]
    );

    connection.release();

    res.json({
      statistik: stats[0],
      performa_mapel: performa,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRapor = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { siswaId, kelasId, tahunAjaranId, komentar, apresiasi } = req.body;

    const connection = await pool.getConnection();

    // Verifikasi akses: hanya wali kelas yang boleh melihat MBTI siswa di kelas ini
    const [isWali] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (isWali.length === 0) {
      connection.release();
      return res.status(403).json({
        message:
          "tidak memiliki akses mbti ke kelas ini, karena anda bukan wali kelasnya",
      });
    }

    // Pastikan siswa memang terdaftar di kelas ini
    const [siswaInKelas] = await connection.query(
      "SELECT id FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ? LIMIT 1",
      [siswaId, kelasId]
    );

    if (siswaInKelas.length === 0) {
      connection.release();
      return res
        .status(400)
        .json({ message: "Siswa tidak terdaftar di kelas ini" });
    }

    // Pastikan tahun ajaran yang dikirim sesuai dengan kelas
    const [kelasCheck] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND tahun_ajaran_id = ? LIMIT 1",
      [kelasId, tahunAjaranId]
    );

    if (kelasCheck.length === 0) {
      connection.release();
      return res
        .status(400)
        .json({
          message: "Tahun ajaran tidak cocok dengan kelas yang dipilih",
        });
    }

    // Hitung rata-rata nilai
    const [nilaiData] = await connection.query(
      `SELECT AVG(nilai_akhir) as rata_rata FROM nilai 
      WHERE siswa_id = ? AND tahun_ajaran_id = ?`,
      [siswaId, tahunAjaranId]
    );

    const rataRata = nilaiData[0].rata_rata || 0;

    // Cek rapor sudah ada
    const [existing] = await connection.query(
      "SELECT id FROM rapor WHERE siswa_id = ? AND tahun_ajaran_id = ?",
      [siswaId, tahunAjaranId]
    );

    if (existing.length > 0) {
      await connection.query(
        `UPDATE rapor 
        SET rata_rata_nilai = ?, komentar_wali_kelas = ?, apresiasi_wali_kelas = ?
        WHERE siswa_id = ? AND tahun_ajaran_id = ?`,
        [rataRata, komentar, apresiasi, siswaId, tahunAjaranId]
      );
    } else {
      const raporId = uuidv4();
      await connection.query(
        `INSERT INTO rapor (id, siswa_id, kelas_id, tahun_ajaran_id, rata_rata_nilai, komentar_wali_kelas, apresiasi_wali_kelas)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          raporId,
          siswaId,
          kelasId,
          tahunAjaranId,
          rataRata,
          komentar,
          apresiasi,
        ]
      );
    }

    connection.release();

    res.json({
      message:
        existing.length > 0
          ? "Rapor berhasil diperbarui"
          : "Rapor berhasil dibuat",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List mapel yang diajar guru untuk kelas tertentu di tahun ajaran aktif
const getMapelForClass = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    // Validasi guru wali kelas atau guru mengajar di kelas tsb
    const [auth] = await connection.query(
      `SELECT 1 FROM kelas WHERE id = ? AND (wali_kelas_id = ? OR EXISTS (
        SELECT 1 FROM guru_mapel gm WHERE gm.kelas_id = kelas.id AND gm.guru_id = ?
      )) LIMIT 1`,
      [kelasId, guruId, guruId]
    );
    if (auth.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [mapel] = await connection.query(
      `SELECT mp.id, mp.nama_mapel
       FROM guru_mapel gm
       JOIN mata_pelajaran mp ON gm.mapel_id = mp.id
       JOIN tahun_ajaran ta ON gm.tahun_ajaran_id = ta.id
       WHERE gm.guru_id = ? AND gm.kelas_id = ? AND ta.is_aktif = TRUE
       ORDER BY mp.nama_mapel ASC`,
      [guruId, kelasId]
    );

    connection.release();
    res.json(mapel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ambil rapor id berdasarkan siswa dan tahun ajaran (untuk ekspor)
const getRaporIdBySiswa = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { siswaId, tahunAjaranId } = req.query;
    const connection = await pool.getConnection();

    // Pastikan guru adalah wali kelas siswa tersebut pada tahun ajaran tsb
    const [valid] = await connection.query(
      `SELECT r.id, r.kelas_id FROM rapor r
       JOIN kelas k ON r.kelas_id = k.id
       WHERE r.siswa_id = ? AND r.tahun_ajaran_id = ? AND k.wali_kelas_id = ?
       LIMIT 1`,
      [siswaId, tahunAjaranId, guruId]
    );

    connection.release();

    if (valid.length === 0) {
      return res.status(404).json({ message: "Rapor belum dibuat" });
    }

    res.json({ raporId: valid[0].id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ambil hasil MBTI siswa dalam kelas
const getMBTISiswaInKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    // Verifikasi guru mengajar kelas ini
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [mbtiData] = await connection.query(
      `SELECT 
        u.id,
        u.nisn,
        u.nama_lengkap,
        mbti.mbti_type as tipe_mbti,
        mbti.deskripsi,
        CONCAT_WS('\n', mbti.rekomendasi_belajar_1, mbti.rekomendasi_belajar_2, mbti.rekomendasi_belajar_3) as rekomendasi_belajar,
        mbti.tanggal_upload as tanggal_tes
      FROM siswa_kelas sk
      JOIN users u ON sk.siswa_id = u.id
      LEFT JOIN mbti_hasil mbti ON u.id = mbti.siswa_id
      WHERE sk.kelas_id = ?
      ORDER BY u.nama_lengkap ASC`,
      [kelasId]
    );

    connection.release();
    res.json(mbtiData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cek apakah user saat ini adalah wali kelas untuk kelas yang diberikan
const isWaliForKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    const [isWali] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    connection.release();

    if (isWali.length === 0) {
      return res
        .status(403)
        .json({
          message:
            "tidak memiliki akses komentar/apresiasi ke kelas ini, karena anda bukan wali kelasnya",
        });
    }

    res.json({ isWali: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students (for teacher UI) - limited fields
const getAllSiswa = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [siswa] = await connection.query(
      "SELECT id, nama_lengkap, nisn, username, email FROM users WHERE role = 'siswa' ORDER BY nama_lengkap ASC"
    );
    connection.release();
    res.json(siswa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign a student to a class (by wali kelas/guru)
const assignStudentToKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { siswaId, kelasId, no_urut } = req.body;

    if (!siswaId || !kelasId) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();

    // Verify guru is wali of the class
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Verify siswa exists and is role 'siswa'
    const [siswa] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND role = 'siswa'",
      [siswaId]
    );
    if (siswa.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    // Check if already assigned
    const [existing] = await connection.query(
      "SELECT id FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ?",
      [siswaId, kelasId]
    );

    if (existing.length > 0) {
      connection.release();
      return res
        .status(400)
        .json({ message: "Siswa sudah terdaftar di kelas ini" });
    }

    const id = uuidv4();
    await connection.query(
      "INSERT INTO siswa_kelas (id, siswa_id, kelas_id, no_urut) VALUES (?, ?, ?, ?)",
      [id, siswaId, kelasId, no_urut || null]
    );

    connection.release();
    res
      .status(201)
      .json({ message: "Siswa berhasil ditambahkan ke kelas", id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unassign a student from a class (by wali kelas/guru)
const unassignStudentFromKelas = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { siswaId, kelasId } = req.params;
    const connection = await pool.getConnection();

    // Verify guru is wali of the class
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    await connection.query(
      "DELETE FROM siswa_kelas WHERE siswa_id = ? AND kelas_id = ?",
      [siswaId, kelasId]
    );

    connection.release();
    res.json({ message: "Siswa berhasil dikeluarkan dari kelas" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Rapor PDF
const exportRaporPDF = async (req, res) => {
  try {
    const guruId = req.user.id;
    const { siswaId } = req.params;
    const connection = await pool.getConnection();

    // Ambil data siswa
    const [siswaData] = await connection.query(
      `SELECT u.id, u.nama_lengkap, u.nisn, u.email
       FROM users u WHERE u.id = ? AND u.role = 'siswa'`,
      [siswaId]
    );

    if (siswaData.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    const siswa = siswaData[0];

    // Ambil rapor siswa (tahun ajaran aktif)
    // Guru bisa export rapor untuk siswa di kelas yang dia ajar
    const [raporData] = await connection.query(
      `SELECT r.*, k.nama_kelas, ta.tahun_ajaran, ta.semester
       FROM rapor r
       JOIN kelas k ON r.kelas_id = k.id
       JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
       WHERE r.siswa_id = ? AND ta.is_aktif = TRUE
       LIMIT 1`,
      [siswaId]
    );

    if (raporData.length === 0) {
      connection.release();
      return res
        .status(404)
        .json({ message: "Rapor belum dibuat untuk siswa ini" });
    }

    const rapor = raporData[0];

    // Ambil semua nilai siswa untuk tahun ajaran ini dengan guru yang tepat
    const [nilaiData] = await connection.query(
      `SELECT 
        mp.nama_mapel,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        n.komentar,
        u.nama_lengkap as guru_nama
       FROM nilai n
       JOIN mata_pelajaran mp ON n.mapel_id = mp.id
       JOIN users u ON n.guru_id = u.id
       WHERE n.siswa_id = ? AND n.tahun_ajaran_id = ? AND n.kelas_id = ?
       ORDER BY mp.nama_mapel ASC`,
      [siswaId, rapor.tahun_ajaran_id, rapor.kelas_id]
    );

    // Ambil hasil MBTI siswa
    const [mbtiData] = await connection.query(
      `SELECT mbti_type, deskripsi, gaya_belajar, 
              rekomendasi_belajar_1, rekomendasi_belajar_2, rekomendasi_belajar_3
       FROM mbti_hasil
       WHERE siswa_id = ?
       LIMIT 1`,
      [siswaId]
    );

    // Ambil data wali kelas
    const [waliKelasData] = await connection.query(
      `SELECT u.nama_lengkap, u.nip
       FROM kelas k
       JOIN users u ON k.wali_kelas_id = u.id
       WHERE k.id = ?`,
      [rapor.kelas_id]
    );

    // Calculate rata-rata if it's 0 or null
    let rataRata = rapor.rata_rata_nilai;
    if (!rataRata || parseFloat(rataRata) === 0) {
      if (nilaiData.length > 0) {
        const nilaiAkhirArray = nilaiData
          .map(n => Number(n.nilai_akhir))
          .filter(n => !isNaN(n) && n !== null);
        if (nilaiAkhirArray.length > 0) {
          rataRata = (nilaiAkhirArray.reduce((a, b) => a + b, 0) / nilaiAkhirArray.length).toFixed(2);
        } else {
          rataRata = "0.00";
        }
      } else {
        rataRata = "0.00";
      }
    }

    connection.release();

    // Compile data untuk PDF
    const pdfData = {
      siswa: {
        nama_lengkap: siswa.nama_lengkap,
        nisn: siswa.nisn,
      },
      kelas: {
        nama_kelas: rapor.nama_kelas,
      },
      tahunAjaran: {
        tahun: rapor.tahun_ajaran,
        semester: rapor.semester === 1 ? "Ganjil" : "Genap",
      },
      nilai: nilaiData,
      rataRata: String(rataRata),
      mbti: mbtiData.length > 0 ? mbtiData[0] : null,
      komentar: rapor.komentar_wali_kelas,
      apresiasi: rapor.apresiasi_wali_kelas,
      waliKelas:
        waliKelasData.length > 0
          ? waliKelasData[0]
          : { nama_lengkap: "-", nip: "-" },
    };

    // Log untuk debugging
    console.log("PDF Data:", {
      siswaId,
      nilaiCount: nilaiData.length,
      hasMBTI: mbtiData.length > 0,
      rataRata: pdfData.rataRata,
      komentar: pdfData.komentar,
      apresiasi: pdfData.apresiasi,
    });

    // Generate PDF
    await generateRaporPDF(pdfData, res);
  } catch (error) {
    console.error("Error exporting rapor PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  getKelasTeaching,
  getKelasMengajar,
  getSiswaInKelas,
  inputNilai,
  getDashboardKelas,
  createRapor,
  getMapelForClass,
  getRaporIdBySiswa,
  getMBTISiswaInKelas,
  exportRaporPDF,
  assignStudentToKelas,
  unassignStudentFromKelas,
  getAllSiswa,
  isWaliForKelas,
};
