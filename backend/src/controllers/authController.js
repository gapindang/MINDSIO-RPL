const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("../utils/jwt");

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      nama_lengkap,
      role = "siswa",
      nisn,
      nip,
    } = req.body;

    if (!username || !email || !password || !nama_lengkap) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res
        .status(400)
        .json({ message: "Username atau email sudah terdaftar" });
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await connection.query(
      "INSERT INTO users (id, username, email, password, nama_lengkap, role, nisn, nip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
      message: "Registrasi berhasil",
      user: newUser[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password wajib diisi" });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      "SELECT * FROM users WHERE (username = ? OR email = ? OR nisn = ?) AND is_active = TRUE",
      [username, username, username]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = users[0];

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = generateToken(user);

    connection.release();

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
        nisn: user.nisn,
        nip: user.nip,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      "SELECT id, username, email, role, nama_lengkap, nisn, nip, foto_profil FROM users WHERE id = ?",
      [userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_lengkap, email } = req.body;

    const connection = await pool.getConnection();

    await connection.query(
      "UPDATE users SET nama_lengkap = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [nama_lengkap, email, userId]
    );

    const [updatedUser] = await connection.query(
      "SELECT id, username, email, role, nama_lengkap, nisn, nip FROM users WHERE id = ?",
      [userId]
    );

    connection.release();

    res.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
