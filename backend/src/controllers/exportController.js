const pool = require("../config/database");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");

/**
 * Export rapor ke CSV format
 */
const exportRaporCSV = async (req, res) => {
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

    // Add table headers
    const pageWidth = doc.page.width - 60;
    const colWidth = pageWidth / 6;

    // Header row
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Nama Siswa", 30, doc.y, { width: colWidth });
    doc.text("NISN", 30 + colWidth, doc.y - 15, { width: colWidth });
    doc.text("Kelas", 30 + colWidth * 2, doc.y - 15, { width: colWidth });
    doc.text("Tahun", 30 + colWidth * 3, doc.y - 15, { width: colWidth });
    doc.text("Rata-rata", 30 + colWidth * 4, doc.y - 15, {
      width: colWidth,
    });
    doc.text("Status", 30 + colWidth * 5, doc.y - 15, { width: colWidth });
    doc.moveDown();

    // Add data rows
    doc.fontSize(8).font("Helvetica");
    rapors.forEach((rapor, index) => {
      const status = rapor.rata_rata_nilai >= 70 ? "Lulus" : "Belum Lulus";
      doc.text(rapor.nama_siswa.substring(0, 15), 30, doc.y, {
        width: colWidth,
      });
      doc.text(rapor.nisn, 30 + colWidth, doc.y - 12, { width: colWidth });
      doc.text(rapor.nama_kelas, 30 + colWidth * 2, doc.y - 12, {
        width: colWidth,
      });
      doc.text(rapor.tahun_ajaran, 30 + colWidth * 3, doc.y - 12, {
        width: colWidth,
      });
      doc.text(
        rapor.rata_rata_nilai.toFixed(2),
        30 + colWidth * 4,
        doc.y - 12,
        {
          width: colWidth,
          align: "center",
        }
      );
      doc.text(status, 30 + colWidth * 5, doc.y - 12, {
        width: colWidth,
        align: "center",
      });
      doc.moveDown();

      // Add page break if needed
      if ((index + 1) % 20 === 0 && index + 1 < rapors.length) {
        doc.addPage();
      }
    });

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
        parseFloat(rapor.rata_rata_nilai).toFixed(2),
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
        parseFloat(rapor.rata_rata_nilai).toFixed(2),
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

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="rapor_${rapor.id}.pdf"`
    );
    doc.pipe(res);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Rapor Siswa", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).font("Helvetica");
    doc.text(`Nama: ${rapor.nama_siswa}`);
    doc.text(`NISN: ${rapor.nisn}`);
    doc.text(`Kelas: ${rapor.nama_kelas}`);
    doc.text(`Tahun Ajaran: ${rapor.tahun_ajaran}`);
    doc.text(
      `Rata-rata Nilai: ${parseFloat(rapor.rata_rata_nilai).toFixed(2)}`
    );
    doc.moveDown();
    if (rapor.komentar_wali_kelas) {
      doc.text("Komentar Wali Kelas:");
      doc.font("Helvetica-Oblique").text(rapor.komentar_wali_kelas);
      doc.font("Helvetica");
      doc.moveDown();
    }
    if (rapor.apresiasi_wali_kelas) {
      doc.text("Apresiasi:");
      doc.font("Helvetica-Oblique").text(rapor.apresiasi_wali_kelas);
      doc.font("Helvetica");
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        parseFloat(rapor.rata_rata_nilai).toFixed(2),
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
