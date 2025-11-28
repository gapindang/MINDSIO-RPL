const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const getNilaiRapor = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const { tahun_ajaran_id } = req.query;

    const connection = await pool.getConnection();

    let query = `
      SELECT 
        n.id,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        n.komentar,
        n.apresiasi,
        mp.nama_mapel,
        u.nama_lengkap as guru_nama,
        ta.tahun_ajaran
      FROM nilai n
      JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      JOIN users u ON n.guru_id = u.id
      JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.id
      WHERE n.siswa_id = ?
    `;
    const params = [siswaId];

    if (tahun_ajaran_id) {
      query += " AND n.tahun_ajaran_id = ?";
      params.push(tahun_ajaran_id);
    }

    query += " ORDER BY mp.nama_mapel ASC";

    const [nilai] = await connection.query(query, params);
    connection.release();

    res.json(nilai);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRaporSummary = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const connection = await pool.getConnection();

    const [rapor] = await connection.query(
      `SELECT 
        r.id,
        r.tahun_ajaran_id,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat,
        ta.tahun_ajaran,
        k.nama_kelas
      FROM rapor r
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      JOIN kelas k ON r.kelas_id = k.id
      WHERE r.siswa_id = ?
      ORDER BY ta.tahun_ajaran DESC`,
      [siswaId]
    );

    connection.release();
    res.json(rapor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMBTIResult = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const connection = await pool.getConnection();

    const [mbti] = await connection.query(
      `SELECT 
        id,
        mbti_type,
        deskripsi,
        kekuatan_1,
        kekuatan_2,
        kekuatan_3,
        gaya_belajar,
        rekomendasi_belajar_1,
        rekomendasi_belajar_2,
        rekomendasi_belajar_3,
        tanggal_upload
      FROM mbti_hasil
      WHERE siswa_id = ?`,
      [siswaId]
    );

    connection.release();

    if (mbti.length === 0) {
      return res.status(404).json({ message: "Hasil MBTI belum tersedia" });
    }

    res.json(mbti[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveMBTIResult = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const {
      mbti_type,
      deskripsi = null,
      kekuatan_1 = null,
      kekuatan_2 = null,
      kekuatan_3 = null,
      gaya_belajar = null,
    } = req.body;

    const connection = await pool.getConnection();

    // Ambil referensi gaya belajar untuk tipe MBTI ini
    const [referensi] = await connection.query(
      "SELECT deskripsi, gaya_belajar, tips_1, tips_2, tips_3 FROM gaya_belajar_referensi WHERE mbti_type = ?",
      [mbti_type]
    );

    // Cek apakah sudah ada hasil MBTI sebelumnya
    const [existing] = await connection.query(
      "SELECT id FROM mbti_hasil WHERE siswa_id = ?",
      [siswaId]
    );

    if (existing.length > 0) {
      connection.release();
      return res
        .status(409)
        .json({ message: "Hasil MBTI sudah ada. Hubungi admin untuk reset." });
    } else {
      // Insert
      const mbtiId = uuidv4();
      await connection.query(
        `INSERT INTO mbti_hasil 
        (id, siswa_id, mbti_type, deskripsi, kekuatan_1, kekuatan_2, kekuatan_3, gaya_belajar) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mbtiId,
          siswaId,
          mbti_type,
          deskripsi || referensi[0]?.deskripsi || null,
          kekuatan_1,
          kekuatan_2,
          kekuatan_3,
          gaya_belajar || referensi[0]?.gaya_belajar || null,
        ]
      );
    }

    if (referensi.length > 0) {
      await connection.query(
        `UPDATE mbti_hasil 
        SET rekomendasi_belajar_1 = ?, rekomendasi_belajar_2 = ?, rekomendasi_belajar_3 = ?
        WHERE siswa_id = ?`,
        [referensi[0].tips_1, referensi[0].tips_2, referensi[0].tips_3, siswaId]
      );
    }

    const [result] = await connection.query(
      "SELECT * FROM mbti_hasil WHERE siswa_id = ?",
      [siswaId]
    );

    connection.release();

    res.json({
      message:
        existing.length > 0 ? "Hasil MBTI diperbarui" : "Hasil MBTI disimpan",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getKelasInfo = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const connection = await pool.getConnection();

    const [kelas] = await connection.query(
      `SELECT 
        k.id,
        k.nama_kelas,
        k.tingkat,
        u.nama_lengkap as wali_kelas_nama,
        ta.tahun_ajaran
      FROM siswa_kelas sk
      JOIN kelas k ON sk.kelas_id = k.id
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN users u ON k.wali_kelas_id = u.id
      WHERE sk.siswa_id = ? AND ta.is_aktif = TRUE`,
      [siswaId]
    );

    connection.release();

    if (kelas.length === 0) {
      return res.status(404).json({ message: "Data kelas tidak ditemukan" });
    }

    res.json(kelas[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadRaporPDF = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const { generateRaporPDF } = require("../utils/pdfGenerator");
    const connection = await pool.getConnection();

    // Get rapor data untuk tahun ajaran aktif
    const [rapor] = await connection.query(
      `SELECT 
        r.id,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        u.nama_lengkap as siswa_nama,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        ta.semester,
        wk.nama_lengkap as wali_kelas_nama,
        wk.nip as wali_kelas_nip
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      LEFT JOIN users wk ON k.wali_kelas_id = wk.id
      WHERE r.siswa_id = ? AND ta.is_aktif = TRUE`,
      [siswaId]
    );

    if (rapor.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Rapor tidak ditemukan" });
    }

    // Get nilai data
    const [nilai] = await connection.query(
      `SELECT 
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        mp.nama_mapel,
        u.nama_lengkap as guru_nama
      FROM nilai n
      JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      JOIN users u ON n.guru_id = u.id
      JOIN tahun_ajaran ta ON n.tahun_ajaran_id = ta.id
      WHERE n.siswa_id = ? AND ta.is_aktif = TRUE
      ORDER BY mp.nama_mapel ASC`,
      [siswaId]
    );

    // Get MBTI data
    const [mbti] = await connection.query(
      `SELECT 
        mbti_type,
        deskripsi,
        gaya_belajar,
        rekomendasi_belajar_1,
        rekomendasi_belajar_2,
        rekomendasi_belajar_3
      FROM mbti_hasil
      WHERE siswa_id = ?`,
      [siswaId]
    );

    connection.release();

    // Compile PDF data
    const pdfData = {
      siswa: {
        nama_lengkap: rapor[0].siswa_nama,
        nisn: rapor[0].nisn,
      },
      kelas: {
        nama_kelas: rapor[0].nama_kelas,
      },
      tahunAjaran: {
        tahun: rapor[0].tahun_ajaran,
        semester: rapor[0].semester,
      },
      nilai: nilai.map((n) => ({
        nama_mapel: n.nama_mapel,
        nilai_uts: n.nilai_uts,
        nilai_uas: n.nilai_uas,
        nilai_akhir: n.nilai_akhir,
        guru_nama: n.guru_nama,
      })),
      rataRata: rapor[0].rata_rata_nilai,
      mbti:
        mbti.length > 0
          ? {
              mbti_type: mbti[0].mbti_type,
              deskripsi: mbti[0].deskripsi,
              gaya_belajar: mbti[0].gaya_belajar,
              rekomendasi_belajar_1: mbti[0].rekomendasi_belajar_1,
              rekomendasi_belajar_2: mbti[0].rekomendasi_belajar_2,
              rekomendasi_belajar_3: mbti[0].rekomendasi_belajar_3,
            }
          : null,
      komentar: rapor[0].komentar_wali_kelas,
      apresiasi: rapor[0].apresiasi_wali_kelas,
      waliKelas: {
        nama_lengkap: rapor[0].wali_kelas_nama,
        nip: rapor[0].wali_kelas_nip,
      },
    };

    await generateRaporPDF(pdfData, res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNilaiRapor,
  getRaporSummary,
  getMBTIResult,
  saveMBTIResult,
  getKelasInfo,
  downloadRaporPDF,
};
