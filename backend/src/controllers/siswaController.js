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
      return res.status(404).json({ message: "Hasil MBTI belum diunggah" });
    }

    res.json(mbti[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadMBTIResult = async (req, res) => {
  try {
    const siswaId = req.user.id;
    const {
      mbti_type,
      deskripsi,
      kekuatan_1,
      kekuatan_2,
      kekuatan_3,
      gaya_belajar,
    } = req.body;
    const fileName = req.file ? req.file.filename : null;

    const connection = await pool.getConnection();

    // Cek apakah sudah ada hasil MBTI sebelumnya
    const [existing] = await connection.query(
      "SELECT id FROM mbti_hasil WHERE siswa_id = ?",
      [siswaId]
    );

    if (existing.length > 0) {
      // Update
      await connection.query(
        `UPDATE mbti_hasil 
        SET mbti_type = ?, deskripsi = ?, kekuatan_1 = ?, kekuatan_2 = ?, kekuatan_3 = ?, 
            gaya_belajar = ?, file_hasil = ?, updated_at = CURRENT_TIMESTAMP
        WHERE siswa_id = ?`,
        [
          mbti_type,
          deskripsi,
          kekuatan_1,
          kekuatan_2,
          kekuatan_3,
          gaya_belajar,
          fileName,
          siswaId,
        ]
      );
    } else {
      // Insert
      const mbtiId = uuidv4();
      await connection.query(
        `INSERT INTO mbti_hasil 
        (id, siswa_id, mbti_type, deskripsi, kekuatan_1, kekuatan_2, kekuatan_3, gaya_belajar, file_hasil) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mbtiId,
          siswaId,
          mbti_type,
          deskripsi,
          kekuatan_1,
          kekuatan_2,
          kekuatan_3,
          gaya_belajar,
          fileName,
        ]
      );
    }

    // Ambil rekomendasi pembelajaran dari tabel referensi
    const [referensi] = await connection.query(
      "SELECT tips_1, tips_2, tips_3 FROM gaya_belajar_referensi WHERE mbti_type = ?",
      [mbti_type]
    );

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
        existing.length > 0 ? "MBTI hasil diperbarui" : "MBTI hasil diunggah",
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

module.exports = {
  getNilaiRapor,
  getRaporSummary,
  getMBTIResult,
  uploadMBTIResult,
  getKelasInfo,
};
