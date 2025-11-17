const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

const getKelasTeaching = async (req, res) => {
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
      FROM kelas k
      LEFT JOIN siswa_kelas sk ON k.id = sk.kelas_id
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      WHERE k.wali_kelas_id = ? AND ta.is_aktif = TRUE
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

    // Verifikasi guru mengajar kelas ini
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
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
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
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

    // Verifikasi guru mengajar kelas ini
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
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

    // Verifikasi guru mengajar kelas ini
    const [verif] = await connection.query(
      "SELECT id FROM kelas WHERE id = ? AND wali_kelas_id = ?",
      [kelasId, guruId]
    );

    if (verif.length === 0) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
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

module.exports = {
  getKelasTeaching,
  getSiswaInKelas,
  inputNilai,
  getDashboardKelas,
  createRapor,
  getMapelForClass,
  getRaporIdBySiswa,
};
