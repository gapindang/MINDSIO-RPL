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
  let connection;
  try {
    const { userId } = req.params;
    const {
      username,
      email,
      nama_lengkap,
      role,
      nisn,
      nip,
      is_active,
      password,
    } = req.body;

    connection = await pool.getConnection();

    // Check if username/email already used by another user
    const [conflict] = await connection.query(
      "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ? LIMIT 1",
      [username, email, userId]
    );

    if (conflict.length > 0) {
      connection.release();
      return res
        .status(400)
        .json({
          message: "Username atau email sudah digunakan oleh pengguna lain",
        });
    }

    // Normalize is_active to boolean (if provided)
    const activeVal = is_active === undefined ? undefined : Boolean(is_active);

    // Update main fields
    await connection.query(
      `UPDATE users SET username = ?, email = ?, nama_lengkap = ?, role = ?, nisn = ?, nip = ?, updated_at = CURRENT_TIMESTAMP ${
        activeVal === undefined ? "" : ", is_active = ?"
      } WHERE id = ?`,
      activeVal === undefined
        ? [
            username,
            email,
            nama_lengkap,
            role,
            nisn || null,
            nip || null,
            userId,
          ]
        : [
            username,
            email,
            nama_lengkap,
            role,
            nisn || null,
            nip || null,
            activeVal,
            userId,
          ]
    );

    // If password provided and non-empty, update hashed password
    if (password && password.trim().length > 0) {
      const hashed = await hashPassword(password);
      await connection.query(`UPDATE users SET password = ? WHERE id = ?`, [
        hashed,
        userId,
      ]);
    }

    const [updated] = await connection.query(
      "SELECT id, username, email, role, nama_lengkap, nisn, nip, is_active FROM users WHERE id = ?",
      [userId]
    );

    connection.release();

    res.json({ message: "User berhasil diperbarui", user: updated[0] });
  } catch (error) {
    if (connection) connection.release();
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
        ta.id as tahun_ajaran_id,
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

// Assign a student to a class (admin)
const assignStudentToKelas = async (req, res) => {
  try {
    const { siswaId, kelasId, no_urut } = req.body;

    if (!siswaId || !kelasId) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const connection = await pool.getConnection();

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

// Unassign a student from a class (admin)
const unassignStudentFromKelas = async (req, res) => {
  try {
    const { siswaId, kelasId } = req.params;
    const connection = await pool.getConnection();

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

// Assign a guru to a mapel in a kelas for a tahun ajaran (admin)
// If `guruId` is omitted, derive from `mata_pelajaran.guru_id`.
const assignGuruMapel = async (req, res) => {
  try {
    let { guruId, mapelId, kelasId, tahunAjaranId } = req.body;
    if (!mapelId || !kelasId || !tahunAjaranId) {
      return res.status(400).json({
        message:
          "Data tidak lengkap: mapelId, kelasId, tahunAjaranId diperlukan",
      });
    }

    const connection = await pool.getConnection();

    // derive guruId from mata_pelajaran if not provided
    if (!guruId) {
      const [mp] = await connection.query(
        "SELECT guru_id FROM mata_pelajaran WHERE id = ?",
        [mapelId]
      );
      if (mp.length === 0 || !mp[0].guru_id) {
        connection.release();
        return res.status(400).json({
          message:
            "Mapel tidak memiliki guru utama; berikan guruId secara eksplisit",
        });
      }
      guruId = mp[0].guru_id;
    }

    // check duplicate assignment for same mapel+kelas+tahun
    const [exists] = await connection.query(
      "SELECT id FROM guru_mapel WHERE mapel_id = ? AND kelas_id = ? AND tahun_ajaran_id = ?",
      [mapelId, kelasId, tahunAjaranId]
    );
    if (exists.length > 0) {
      connection.release();
      return res.status(409).json({
        message:
          "Penugasan untuk mata pelajaran ini di kelas tersebut sudah ada",
      });
    }

    const id = uuidv4();
    await connection.query(
      "INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, tahun_ajaran_id) VALUES (?, ?, ?, ?, ?)",
      [id, guruId, mapelId, kelasId, tahunAjaranId]
    );

    connection.release();
    res.status(201).json({
      message: "Mata pelajaran berhasil ditugaskan ke kelas",
      id,
      guruId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unassign guru_mapel by id
const unassignGuruMapel = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query("DELETE FROM guru_mapel WHERE id = ?", [id]);
    connection.release();
    res.json({ message: "Penugasan dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assignments for a kelas
const getGuruMapelByKelas = async (req, res) => {
  try {
    const { kelasId } = req.query;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT gm.id, gm.guru_id, u.nama_lengkap as guru_nama, gm.mapel_id, mp.nama_mapel, gm.tahun_ajaran_id
       FROM guru_mapel gm
       JOIN users u ON gm.guru_id = u.id
       JOIN mata_pelajaran mp ON gm.mapel_id = mp.id
       WHERE gm.kelas_id = ?
       ORDER BY mp.nama_mapel ASC`,
      [kelasId]
    );
    connection.release();
    res.json(rows);
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
        (SELECT COUNT(DISTINCT siswa_id) FROM mbti_hasil) as mbti_selesai,
        (SELECT tahun_ajaran FROM tahun_ajaran WHERE is_aktif = TRUE LIMIT 1) as tahun_ajaran_aktif
    `);

    connection.release();

    // Normalize response keys for frontend
    const s = stats[0] || {};
    res.json({
      totalAdmin: Number(s.jumlah_admin || 0),
      totalGuru: Number(s.jumlah_guru || 0),
      totalSiswa: Number(s.jumlah_siswa || 0),
      totalKelas: Number(s.jumlah_kelas || 0),
      totalMapel: Number(s.jumlah_mapel || 0),
      mbtiSelesai: Number(s.mbti_selesai || 0),
      tahunAjaranAktif: s.tahun_ajaran_aktif || null,
    });
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

// Reset/Delete MBTI result for a student (admin only)
const resetMBTIResult = async (req, res) => {
  try {
    const { siswaId } = req.params;
    const connection = await pool.getConnection();
    const [existing] = await connection.query(
      "SELECT id FROM mbti_hasil WHERE siswa_id = ?",
      [siswaId]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Hasil MBTI tidak ditemukan" });
    }

    await connection.query("DELETE FROM mbti_hasil WHERE siswa_id = ?", [
      siswaId,
    ]);
    connection.release();
    res.json({ message: "Hasil MBTI berhasil direset" });
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
  assignGuruMapel,
  unassignGuruMapel,
  getGuruMapelByKelas,
  getAllTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
  getDashboard,
  getAllRapor,
  getRaporById,
  resetMBTIResult,
  assignStudentToKelas,
  unassignStudentFromKelas,
};
