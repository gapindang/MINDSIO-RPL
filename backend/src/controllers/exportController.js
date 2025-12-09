const pool = require("../config/database");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const { generateRaporPDF } = require("../utils/pdfGenerator");

/**
 * Export rapor ke CSV format
 */
const exportRaporCSV = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Export all students: include users with role 'siswa' even if they don't have a rapor record.
    // Left-join rapor for the currently active tahun_ajaran (if any).
    const [rapors] = await connection.query(`
      SELECT
        u.id as siswa_id,
        u.nama_lengkap as nama_siswa,
        u.nisn,
        -- get kelas from siswa_kelas if present
        (SELECT k2.nama_kelas FROM kelas k2 WHERE k2.id = (
          SELECT sk.kelas_id FROM siswa_kelas sk WHERE sk.siswa_id = u.id LIMIT 1
        ) LIMIT 1) as nama_kelas,
        -- active tahun_ajaran (string)
        (SELECT ta2.tahun_ajaran FROM tahun_ajaran ta2 WHERE ta2.is_aktif = TRUE LIMIT 1) as tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat
      FROM users u
      LEFT JOIN (
        SELECT * FROM rapor WHERE tahun_ajaran_id = (SELECT id FROM tahun_ajaran WHERE is_aktif = TRUE LIMIT 1)
      ) r ON r.siswa_id = u.id
      WHERE u.role = 'siswa'
      ORDER BY u.nama_lengkap ASC
    `);

    connection.release();

    // Generate CSV
    let csvContent =
      "Nama Siswa,NISN,Kelas,Tahun Ajaran,Rata-rata Nilai,Komentar,Apresiasi,Tanggal\n";

    rapors.forEach((rapor) => {
      csvContent += `"${rapor.nama_siswa}","${rapor.nisn}","${
        rapor.nama_kelas
      }","${rapor.tahun_ajaran}",${rapor.rata_rata_nilai},"${
        rapor.komentar_wali_kelas || ""
      }","${rapor.apresiasi_wali_kelas || ""}","${rapor.tanggal_dibuat}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_all.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export rapor ke JSON format (bisa digunakan untuk Excel dengan library pihak ketiga)
 */
const exportRaporJSON = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapors] = await connection.query(`
      SELECT 
        r.id,
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
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

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_all.json"'
    );
    res.json(rapors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export rapor detail dengan nilai per mata pelajaran
 */
const exportRaporDetail = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapors] = await connection.query(`
      SELECT 
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        mp.nama_mapel,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        n.komentar as komentar_mapel,
        r.rata_rata_nilai,
        r.komentar_wali_kelas
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      LEFT JOIN nilai n ON r.siswa_id = n.siswa_id AND r.tahun_ajaran_id = n.tahun_ajaran_id
      LEFT JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      ORDER BY u.nama_lengkap ASC, mp.nama_mapel ASC
    `);

    connection.release();

    // Generate CSV dengan detail nilai
    let csvContent =
      "Nama Siswa,NISN,Kelas,Tahun Ajaran,Mata Pelajaran,UTS,UAS,Nilai Akhir,Komentar Mapel,Rata-rata,Komentar Wali Kelas\n";

    rapors.forEach((rapor) => {
      csvContent += `"${rapor.nama_siswa}","${rapor.nisn}","${
        rapor.nama_kelas
      }","${rapor.tahun_ajaran}","${rapor.nama_mapel || ""}",${
        rapor.nilai_uts || ""
      },${rapor.nilai_uas || ""},${rapor.nilai_akhir || ""},"${
        rapor.komentar_mapel || ""
      }",${rapor.rata_rata_nilai},"${rapor.komentar_wali_kelas || ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_detail.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export rapor ke PDF format
 */
const exportRaporPDF = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapors] = await connection.query(`
      SELECT 
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
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

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 30,
    });

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_all.pdf"'
    );

    // Pipe to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).font("Helvetica-Bold").text("Laporan Rapor Siswa", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`, {
        align: "center",
      });
    doc.moveDown();

    // Add table headers and rows using fixed row positions to avoid overlap
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    // Prefer fixed base widths (in points) and scale them if page is smaller
    const baseWidths = [180, 90, 60, 70, 70, 60]; // sum ~530 for A4 content area
    const totalBase = baseWidths.reduce((a, b) => a + b, 0);
    const scale = pageWidth / totalBase;
    const colWidths = baseWidths.map((w) => Math.floor(w * scale));

    const rowHeight = 20;
    // Start a bit lower after title/date
    let y = doc.y + 8;

    const truncate = (str, len) => {
      if (!str) return "-";
      return str.length > len ? str.substring(0, len - 3) + "..." : str;
    };

    const drawTableHeader = () => {
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#111827");
      let x = left;
      doc.text("Nama Siswa", x, y, { width: colWidths[0], lineBreak: false });
      x += colWidths[0];
      doc.text("NISN", x, y, { width: colWidths[1], lineBreak: false });
      x += colWidths[1];
      doc.text("Kelas", x, y, { width: colWidths[2], lineBreak: false });
      x += colWidths[2];
      doc.text("Tahun", x, y, { width: colWidths[3], lineBreak: false });
      x += colWidths[3];
      doc.text("Rata-rata", x, y, {
        width: colWidths[4],
        align: "center",
        lineBreak: false,
      });
      x += colWidths[4];
      doc.text("Status", x, y, {
        width: colWidths[5],
        align: "center",
        lineBreak: false,
      });
      y += rowHeight;
      // draw separator
      doc.save();
      doc.lineWidth(0.5).strokeColor("#d1d5db");
      doc
        .moveTo(left, y - 6)
        .lineTo(left + pageWidth, y - 6)
        .stroke();
      doc.restore();
    };

    // Draw first header
    drawTableHeader();

    // Add data rows
    doc.fontSize(8).font("Helvetica");
    for (let i = 0; i < rapors.length; i++) {
      const rapor = rapors[i];
      const rata = Number(rapor.rata_rata_nilai || 0).toFixed(2);
      const status =
        Number(rapor.rata_rata_nilai || 0) >= 70 ? "Lulus" : "Belum Lulus";

      // Page break handling
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 20) {
        doc.addPage();
        y = doc.page.margins.top;
        drawTableHeader();
      }

      let x = left;
      doc.fillColor("#000000");
      doc.text(truncate(rapor.nama_siswa, 40), x, y, {
        width: colWidths[0],
        lineBreak: false,
      });
      x += colWidths[0];
      doc.text(truncate(rapor.nisn, 20), x, y, {
        width: colWidths[1],
        lineBreak: false,
      });
      x += colWidths[1];
      doc.text(truncate(rapor.nama_kelas, 15), x, y, {
        width: colWidths[2],
        lineBreak: false,
      });
      x += colWidths[2];
      doc.text(truncate(rapor.tahun_ajaran, 15), x, y, {
        width: colWidths[3],
        lineBreak: false,
      });
      x += colWidths[3];
      doc.text(rata, x, y, {
        width: colWidths[4],
        align: "center",
        lineBreak: false,
      });
      x += colWidths[4];
      doc.text(status, x, y, {
        width: colWidths[5],
        align: "center",
        lineBreak: false,
      });

      y += rowHeight;
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export rapor ke Excel format (.xlsx)
 */
const exportRaporExcel = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapors] = await connection.query(`
      SELECT 
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
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

    // Prepare data untuk Excel
    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Tahun Ajaran",
      "Rata-rata Nilai",
      "Status",
      "Tanggal",
    ];

    const data = rapors.map((rapor, index) => {
      const status = rapor.rata_rata_nilai >= 70 ? "Lulus" : "Belum Lulus";
      return [
        index + 1,
        rapor.nama_siswa,
        rapor.nisn,
        rapor.nama_kelas,
        rapor.tahun_ajaran,
        Number(rapor.rata_rata_nilai || 0).toFixed(2),
        status,
        rapor.tanggal_dibuat,
      ];
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");

    // Generate Excel file
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_all.xlsx"'
    );

    // Send file
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export rapor detail ke Excel dengan nilai per mata pelajaran
 */
const exportRaporDetailExcel = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rapors] = await connection.query(`
      SELECT 
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        mp.nama_mapel,
        n.nilai_uts,
        n.nilai_uas,
        n.nilai_akhir,
        n.komentar as komentar_mapel,
        r.rata_rata_nilai,
        r.komentar_wali_kelas
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      LEFT JOIN nilai n ON r.siswa_id = n.siswa_id AND r.tahun_ajaran_id = n.tahun_ajaran_id
      LEFT JOIN mata_pelajaran mp ON n.mapel_id = mp.id
      ORDER BY u.nama_lengkap ASC, mp.nama_mapel ASC
    `);

    connection.release();

    // Prepare data untuk Excel
    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Tahun Ajaran",
      "Mata Pelajaran",
      "UTS",
      "UAS",
      "Nilai Akhir",
      "Rata-rata",
      "Status",
    ];

    const data = [];
    let rowNum = 1;
    rapors.forEach((rapor) => {
      const status =
        (rapor.nilai_akhir >= 70 ? "Lulus" : "Belum Lulus") ||
        (rapor.rata_rata_nilai >= 70 ? "Lulus" : "Belum Lulus");

      data.push([
        rowNum,
        rapor.nama_siswa,
        rapor.nisn,
        rapor.nama_kelas,
        rapor.tahun_ajaran,
        rapor.nama_mapel || "-",
        rapor.nilai_uts || "-",
        rapor.nilai_uas || "-",
        rapor.nilai_akhir || "-",
        Number(rapor.rata_rata_nilai || 0).toFixed(2),
        status,
      ]);
      rowNum++;
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor Detail");

    // Generate Excel file
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rapor_detail.xlsx"'
    );

    // Send file
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export satu rapor (by id) ke CSV
 */
const verifyRaporAccessForUser = async (req, raporId, connection) => {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;
  if (req.user.role === "guru") {
    const [rows] = await connection.query(
      `SELECT k.wali_kelas_id FROM rapor r JOIN kelas k ON r.kelas_id = k.id WHERE r.id = ? LIMIT 1`,
      [raporId]
    );
    if (rows.length === 0) return false;
    return rows[0].wali_kelas_id === req.user.id;
  }
  return false;
};

const exportRaporByIdCSV = async (req, res) => {
  try {
    const { raporId } = req.params;
    const connection = await pool.getConnection();

    // Access control: admin or wali kelas of the rapor's class
    const allowed = await verifyRaporAccessForUser(req, raporId, connection);
    if (!allowed) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [rows] = await connection.query(
      `
      SELECT 
        r.id,
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      WHERE r.id = ?
      LIMIT 1
    `,
      [raporId]
    );

    connection.release();

    if (!rows.length) {
      return res.status(404).json({ message: "Rapor tidak ditemukan" });
    }

    const rapor = rows[0];

    let csvContent =
      "Nama Siswa,NISN,Kelas,Tahun Ajaran,Rata-rata Nilai,Komentar,Apresiasi,Tanggal\n";
    csvContent += `"${rapor.nama_siswa}","${rapor.nisn}","${
      rapor.nama_kelas
    }","${rapor.tahun_ajaran}",${rapor.rata_rata_nilai},"${
      rapor.komentar_wali_kelas || ""
    }","${rapor.apresiasi_wali_kelas || ""}","${rapor.tanggal_dibuat}"\n`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapor_${rapor.id}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export satu rapor (by id) ke JSON
 */
const exportRaporByIdJSON = async (req, res) => {
  try {
    const { raporId } = req.params;
    const connection = await pool.getConnection();

    const allowed = await verifyRaporAccessForUser(req, raporId, connection);
    if (!allowed) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [rows] = await connection.query(
      `
      SELECT 
        r.id,
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      WHERE r.id = ?
      LIMIT 1
    `,
      [raporId]
    );

    connection.release();

    if (!rows.length) {
      return res.status(404).json({ message: "Rapor tidak ditemukan" });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapor_${rows[0].id}.json"`
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Export satu rapor (by id) ke PDF
 */
const exportRaporByIdPDF = async (req, res) => {
  try {
    const { raporId } = req.params;
    const connection = await pool.getConnection();

    const allowed = await verifyRaporAccessForUser(req, raporId, connection);
    if (!allowed) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Ambil data rapor lengkap
    const [raporRows] = await connection.query(
      `SELECT r.*, k.nama_kelas, ta.tahun_ajaran, ta.semester, r.siswa_id, r.kelas_id, r.tahun_ajaran_id
       FROM rapor r
       JOIN kelas k ON r.kelas_id = k.id
       JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
       WHERE r.id = ?
       LIMIT 1`,
      [raporId]
    );

    if (raporRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Rapor tidak ditemukan" });
    }

    const rapor = raporRows[0];

    // Ambil data siswa
    const [siswaData] = await connection.query(
      `SELECT id, nama_lengkap, nisn FROM users WHERE id = ? AND role = 'siswa'`,
      [rapor.siswa_id]
    );

    if (siswaData.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    }

    // Ambil semua nilai siswa
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
      [rapor.siswa_id, rapor.tahun_ajaran_id, rapor.kelas_id]
    );

    // Ambil hasil MBTI siswa
    const [mbtiData] = await connection.query(
      `SELECT mbti_type, deskripsi, gaya_belajar, 
              rekomendasi_belajar_1, rekomendasi_belajar_2, rekomendasi_belajar_3
       FROM mbti_hasil
       WHERE siswa_id = ?
       LIMIT 1`,
      [rapor.siswa_id]
    );

    // Ambil data wali kelas
    const [waliKelasData] = await connection.query(
      `SELECT u.nama_lengkap, u.nip
       FROM kelas k
       JOIN users u ON k.wali_kelas_id = u.id
       WHERE k.id = ?`,
      [rapor.kelas_id]
    );

    connection.release();

    // Compile data untuk PDF
    const pdfData = {
      siswa: {
        nama_lengkap: siswaData[0].nama_lengkap,
        nisn: siswaData[0].nisn,
      },
      kelas: {
        nama_kelas: rapor.nama_kelas,
      },
      tahunAjaran: {
        tahun: rapor.tahun_ajaran,
        semester: rapor.semester === 1 ? "Ganjil" : "Genap",
      },
      nilai: nilaiData,
      rataRata: rapor.rata_rata_nilai || 0,
      mbti: mbtiData.length > 0 ? mbtiData[0] : null,
      komentar: rapor.komentar_wali_kelas,
      apresiasi: rapor.apresiasi_wali_kelas,
      waliKelas:
        waliKelasData.length > 0
          ? waliKelasData[0]
          : { nama_lengkap: "-", nip: "-" },
    };

    // Generate PDF menggunakan generator yang lengkap
    await generateRaporPDF(pdfData, res);
  } catch (error) {
    console.error("Error exporting rapor PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

/**
 * Export satu rapor (by id) ke Excel
 */
const exportRaporByIdExcel = async (req, res) => {
  try {
    const { raporId } = req.params;
    const connection = await pool.getConnection();

    const allowed = await verifyRaporAccessForUser(req, raporId, connection);
    if (!allowed) {
      connection.release();
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const [rows] = await connection.query(
      `
      SELECT 
        r.id,
        u.nama_lengkap as nama_siswa,
        u.nisn,
        k.nama_kelas,
        ta.tahun_ajaran,
        r.rata_rata_nilai,
        r.komentar_wali_kelas,
        r.apresiasi_wali_kelas,
        r.tanggal_dibuat
      FROM rapor r
      JOIN users u ON r.siswa_id = u.id
      JOIN kelas k ON r.kelas_id = k.id
      JOIN tahun_ajaran ta ON r.tahun_ajaran_id = ta.id
      WHERE r.id = ?
      LIMIT 1
    `,
      [raporId]
    );

    connection.release();

    if (!rows.length) {
      return res.status(404).json({ message: "Rapor tidak ditemukan" });
    }

    const rapor = rows[0];
    const headers = [
      "Nama Siswa",
      "NISN",
      "Kelas",
      "Tahun Ajaran",
      "Rata-rata Nilai",
      "Komentar",
      "Apresiasi",
      "Tanggal",
    ];

    const data = [
      [
        rapor.nama_siswa,
        rapor.nisn,
        rapor.nama_kelas,
        rapor.tahun_ajaran,
        Number(rapor.rata_rata_nilai || 0).toFixed(2),
        rapor.komentar_wali_kelas || "",
        rapor.apresiasi_wali_kelas || "",
        rapor.tanggal_dibuat,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 30 },
      { wch: 20 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapor_${rapor.id}.xlsx"`
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportRaporCSV,
  exportRaporJSON,
  exportRaporDetail,
  exportRaporPDF,
  exportRaporExcel,
  exportRaporDetailExcel,
  exportRaporByIdCSV,
  exportRaporByIdJSON,
  exportRaporByIdPDF,
  exportRaporByIdExcel,
};
