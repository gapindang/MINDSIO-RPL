const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../utils/jwt");

const getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;
    const connection = await pool.getConnection();

    let query =
      "SELECT id, username, email, role, nama_lengkap, nisn, nip, is_active FROM users WHERE 1=1";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active === "true");
    }

    const [users] = await connection.query(query, params);
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, nama_lengkap, role, nisn, nip } =
      req.body;

    if (!username || !email || !password || !nama_lengkap || !role) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();

    const [existing] = await connection.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Username atau email sudah ada" });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await connection.query(
      `INSERT INTO users (id, username, email, password, nama_lengkap, role, nisn, nip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        email,
        hashedPassword,
        nama_lengkap,
        role,
        nisn || null,
        nip || null,
      ]
    );

    const [newUser] = await connection.query(
      "SELECT id, username, email, role, nama_lengkap FROM users WHERE id = ?",
      [userId]
    );

    connection.release();

    res.status(201).json({
      message: "User berhasil dibuat",
      user: newUser[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, nama_lengkap, role, nisn, nip, is_active } =
      req.body;

    const connection = await pool.getConnection();

    await connection.query(
      `UPDATE users 
      SET username = ?, email = ?, nama_lengkap = ?, role = ?, nisn = ?, nip = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        username,
        email,
        nama_lengkap,
        role,
        nisn || null,
        nip || null,
        is_active,
        userId,
      ]
    );

    const [updated] = await connection.query(
      "SELECT id, username, email, role, nama_lengkap FROM users WHERE id = ?",
      [userId]
    );

    connection.release();

    res.json({
      message: "User berhasil diperbarui",
      user: updated[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    await connection.query("DELETE FROM users WHERE id = ?", [userId]);
    connection.release();

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMapel = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [mapel] = await connection.query(`
      SELECT 
        mp.id,
        mp.nama_mapel,
        mp.kode_mapel,
        u.nama_lengkap as guru_nama
      FROM mata_pelajaran mp
      LEFT JOIN users u ON mp.guru_id = u.id
      ORDER BY mp.nama_mapel ASC
    `);
    connection.release();
    res.json(mapel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMapel = async (req, res) => {
  try {
    const { nama_mapel, kode_mapel, guru_id } = req.body;

    if (!nama_mapel) {
      return res.status(400).json({ message: "Nama mapel wajib diisi" });
    }

    const connection = await pool.getConnection();
    const mapelId = uuidv4();

    await connection.query(
      "INSERT INTO mata_pelajaran (id, nama_mapel, kode_mapel, guru_id) VALUES (?, ?, ?, ?)",
      [mapelId, nama_mapel, kode_mapel || null, guru_id || null]
    );

    connection.release();

    res.status(201).json({
      message: "Mata pelajaran berhasil dibuat",
      id: mapelId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMapel = async (req, res) => {
  try {
    const { mapelId } = req.params;
    const { nama_mapel, kode_mapel, guru_id } = req.body;

    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE mata_pelajaran SET nama_mapel = ?, kode_mapel = ?, guru_id = ? WHERE id = ?",
      [nama_mapel, kode_mapel || null, guru_id || null, mapelId]
    );

    connection.release();

    res.json({ message: "Mata pelajaran berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMapel = async (req, res) => {
  try {
    const { mapelId } = req.params;
    const connection = await pool.getConnection();

    await connection.query("DELETE FROM mata_pelajaran WHERE id = ?", [
      mapelId,
    ]);
    connection.release();

    res.json({ message: "Mata pelajaran berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllKelas = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [kelas] = await connection.query(`
      SELECT 
        k.id,
        k.nama_kelas,
        k.tingkat,
        u.nama_lengkap as wali_kelas_nama,
        ta.tahun_ajaran,
        COUNT(DISTINCT sk.siswa_id) as jumlah_siswa
      FROM kelas k
      JOIN tahun_ajaran ta ON k.tahun_ajaran_id = ta.id
      LEFT JOIN users u ON k.wali_kelas_id = u.id
      LEFT JOIN siswa_kelas sk ON k.id = sk.kelas_id
      GROUP BY k.id
      ORDER BY k.nama_kelas ASC
    `);
    connection.release();
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createKelas = async (req, res) => {
  try {
    const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id } = req.body;

    if (!nama_kelas || !tingkat || !tahun_ajaran_id) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();
    const kelasId = uuidv4();

    await connection.query(
      "INSERT INTO kelas (id, nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id) VALUES (?, ?, ?, ?, ?)",
      [kelasId, nama_kelas, tingkat, wali_kelas_id || null, tahun_ajaran_id]
    );

    connection.release();

    res.status(201).json({
      message: "Kelas berhasil dibuat",
      id: kelasId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateKelas = async (req, res) => {
  try {
    const { kelasId } = req.params;
    const { nama_kelas, tingkat, wali_kelas_id, tahun_ajaran_id } = req.body;

    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE kelas SET nama_kelas = ?, tingkat = ?, wali_kelas_id = ?, tahun_ajaran_id = ? WHERE id = ?",
      [nama_kelas, tingkat, wali_kelas_id || null, tahun_ajaran_id, kelasId]
    );

    connection.release();

    res.json({ message: "Kelas berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteKelas = async (req, res) => {
  try {
    const { kelasId } = req.params;
    const connection = await pool.getConnection();

    await connection.query("DELETE FROM kelas WHERE id = ?", [kelasId]);
    connection.release();

    res.json({ message: "Kelas berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTahunAjaran = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tahun] = await connection.query(
      "SELECT * FROM tahun_ajaran ORDER BY tahun_ajaran DESC"
    );
    connection.release();
    res.json(tahun);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTahunAjaran = async (req, res) => {
  try {
    const { tahun_ajaran, semester, tanggal_mulai, tanggal_selesai } = req.body;

    if (!tahun_ajaran || !semester) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();
    const tahunId = uuidv4();

    await connection.query(
      "INSERT INTO tahun_ajaran (id, tahun_ajaran, semester, tanggal_mulai, tanggal_selesai) VALUES (?, ?, ?, ?, ?)",
      [
        tahunId,
        tahun_ajaran,
        semester,
        tanggal_mulai || null,
        tanggal_selesai || null,
      ]
    );

    connection.release();

    res.status(201).json({
      message: "Tahun ajaran berhasil dibuat",
      id: tahunId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTahunAjaran = async (req, res) => {
  try {
    const { tahunId } = req.params;
    const { tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, is_aktif } =
      req.body;

    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE tahun_ajaran SET tahun_ajaran = ?, semester = ?, tanggal_mulai = ?, tanggal_selesai = ?, is_aktif = ? WHERE id = ?",
      [
        tahun_ajaran,
        semester,
        tanggal_mulai || null,
        tanggal_selesai || null,
        is_aktif || false,
        tahunId,
      ]
    );

    connection.release();

    res.json({ message: "Tahun ajaran berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTahunAjaran = async (req, res) => {
  try {
    const { tahunId } = req.params;
    const connection = await pool.getConnection();

    await connection.query("DELETE FROM tahun_ajaran WHERE id = ?", [tahunId]);
    connection.release();

    res.json({ message: "Tahun ajaran berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as jumlah_admin,
        (SELECT COUNT(*) FROM users WHERE role = 'guru') as jumlah_guru,
        (SELECT COUNT(*) FROM users WHERE role = 'siswa') as jumlah_siswa,
        (SELECT COUNT(*) FROM kelas) as jumlah_kelas,
        (SELECT COUNT(*) FROM mata_pelajaran) as jumlah_mapel,
        (SELECT COUNT(DISTINCT siswa_id) FROM mbti_hasil) as mbti_selesai
    `);

    connection.release();
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRapor = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapor] = await connection.query(`
      SELECT 
        r.id,
        r.siswa_id,
        u.nama_lengkap as siswa_nama,
        u.nisn as siswa_nisn,
        k.nama_kelas as kelas_nama,
        ta.tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      ORDER BY u.nama_lengkap ASC
    `);

    connection.release();
    res.json(rapor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRaporById = async (req, res) => {
  try {
    const { raporId } = req.params;
    const connection = await pool.getConnection();

    const [rapor] = await connection.query(
      `
      SELECT 
        r.id,
        r.siswa_id,
        u.nama_lengkap as siswa_nama,
        u.nisn as siswa_nisn,
        k.nama_kelas as kelas_nama,
        ta.tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        mp.nama_mapel
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      LEFT JOIN nilai n ON r.siswa_id = n.siswa_id AND r.tahun_ajaran_id = n.tahun_ajaran_id
      LEFT JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      WHERE r.id = ?
    `,
      [raporId]
    );

    connection.release();
    res.json(rapor[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMapel,
  createMapel,
  updateMapel,
  deleteMapel,
  getAllKelas,
  createKelas,
  updateKelas,
  deleteKelas,
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  getDashboard,
  getAllRapor,
  getRaporById,
};
