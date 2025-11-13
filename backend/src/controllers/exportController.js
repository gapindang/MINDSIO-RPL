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
      .text(`Generated on ${new Date().toLocaleDateString("id-ID")}`, {
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

module.exports = {
  exportRaporCSV,
  exportRaporJSON,
  exportRaporDetail,
  exportRaporPDF,
  exportRaporExcel,
  exportRaporDetailExcel,
};
