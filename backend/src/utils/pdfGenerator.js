const PDFDocument = require("pdfkit");

/**
 * Generate Rapor PDF untuk siswa
 * @param {Object} data - Data rapor siswa
 * @param {Object} res - Express response object
 */
const generateRaporPDF = async (data, res) => {
  try {
    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Rapor_${data.siswa.nama_lengkap.replace(
        /\s/g,
        "_"
      )}_${data.tahunAjaran.tahun}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to add centered text
    const addCenteredText = (text, y, size = 12, font = "Helvetica") => {
      doc.font(font).fontSize(size);
      const textWidth = doc.widthOfString(text);
      const x = (doc.page.width - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Helper function to draw horizontal line
    const drawLine = (y) => {
      doc
        .moveTo(50, y)
        .lineTo(doc.page.width - 50, y)
        .stroke();
    };

    // ===== HEADER =====
    let yPos = 50;

    // Logo/Title
    addCenteredText("RAPOR SISWA", yPos, 20, "Helvetica-Bold");
    yPos += 25;
    addCenteredText("SISTEM INFORMASI MANAJEMEN NILAI", yPos, 12, "Helvetica");
    yPos += 15;
    addCenteredText("MINDSIO", yPos, 10, "Helvetica-Oblique");
    yPos += 20;

    drawLine(yPos);
    yPos += 20;

    // ===== IDENTITAS SISWA =====
    doc.font("Helvetica-Bold").fontSize(14).text("IDENTITAS SISWA", 50, yPos);
    yPos += 25;

    const identitasData = [
      ["Nama", `: ${data.siswa.nama_lengkap}`],
      ["NISN", `: ${data.siswa.nisn || "-"}`],
      ["Kelas", `: ${data.kelas.nama_kelas}`],
      ["Tahun Ajaran", `: ${data.tahunAjaran.tahun}`],
      ["Semester", `: ${data.tahunAjaran.semester}`],
    ];

    doc.font("Helvetica").fontSize(11);
    identitasData.forEach(([label, value]) => {
      doc.text(label, 70, yPos, { width: 120, continued: false });
      doc.text(value, 190, yPos);
      yPos += 20;
    });

    yPos += 10;
    drawLine(yPos);
    yPos += 20;

    // ===== NILAI MATA PELAJARAN =====
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("NILAI MATA PELAJARAN", 50, yPos);
    yPos += 25;

    // Table Header
    const tableTop = yPos;
    const col1 = 50;
    const col2 = 250;
    const col3 = 330;
    const col4 = 390;
    const col5 = 450;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.rect(col1, tableTop, 500, 25).fillAndStroke("#2563eb", "#1e40af");
    doc.fillColor("white");
    doc.text("Mata Pelajaran", col1 + 5, tableTop + 8);
    doc.text("UTS", col2 + 5, tableTop + 8);
    doc.text("UAS", col3 + 5, tableTop + 8);
    doc.text("Akhir", col4 + 5, tableTop + 8);
    doc.text("Guru", col5 + 5, tableTop + 8);

    yPos = tableTop + 25;
    doc.fillColor("black");

    // Table Rows
    doc.font("Helvetica").fontSize(9);
    let rowColor = true;

    // Check if nilai array has data
    if (data.nilai && data.nilai.length > 0) {
      data.nilai.forEach((item, index) => {
        if (rowColor) {
          doc.rect(col1, yPos, 500, 20).fill("#eff6ff");
        }

        doc.fillColor("black");
        doc.text(item.nama_mapel || "-", col1 + 5, yPos + 5, { width: 190 });
        doc.text(String(item.nilai_uts || "-"), col2 + 5, yPos + 5);
        doc.text(String(item.nilai_uas || "-"), col3 + 5, yPos + 5);
        doc.text(String(item.nilai_akhir || "-"), col4 + 5, yPos + 5);
        doc.text(item.guru_nama || "-", col5 + 5, yPos + 5, { width: 90 });

        yPos += 20;
        rowColor = !rowColor;
      });
    } else {
      // No data message
      doc.fillColor("black");
      doc.font("Helvetica-Oblique").fontSize(10);
      doc.text("Belum ada nilai untuk siswa ini", col1 + 5, yPos + 5);
      yPos += 25;
    }

    // Border for table
    doc.rect(col1, tableTop, 500, yPos - tableTop).stroke();

    yPos += 15;

    // Rata-rata
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Rata-rata Nilai", col1 + 5, yPos);
    const rataRataValue = data.rataRata
      ? Number(data.rataRata).toFixed(2)
      : "0.00";
    doc.text(`: ${rataRataValue}`, col2, yPos);
    yPos += 25;

    drawLine(yPos);
    yPos += 20;

    // Check if need new page for MBTI section
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    // ===== HASIL MBTI =====
    doc.font("Helvetica-Bold").fontSize(14).text("HASIL TES MBTI", 50, yPos);
    yPos += 25;

    if (data.mbti) {
      // MBTI Type Box
      doc.roundedRect(50, yPos, 495, 40, 5).fillAndStroke("#dbeafe", "#2563eb");
      doc.fillColor("black");
      doc.font("Helvetica-Bold").fontSize(16);
      doc.text(`Tipe Kepribadian: ${data.mbti.mbti_type}`, 60, yPos + 12);
      yPos += 50;

      // Deskripsi
      doc.font("Helvetica-Bold").fontSize(11).text("Deskripsi:", 50, yPos);
      yPos += 18;
      doc.font("Helvetica").fontSize(10);
      const deskripsiLines = doc.heightOfString(data.mbti.deskripsi, {
        width: 495,
      });
      doc.text(data.mbti.deskripsi, 50, yPos, { width: 495, align: "justify" });
      yPos += deskripsiLines + 15;

      // Gaya Belajar
      doc.font("Helvetica-Bold").fontSize(11).text("Gaya Belajar:", 50, yPos);
      yPos += 18;
      doc.font("Helvetica").fontSize(10).text(data.mbti.gaya_belajar, 50, yPos);
      yPos += 25;

      // Rekomendasi Belajar
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Rekomendasi Belajar:", 50, yPos);
      yPos += 20;

      const rekomendasi = [
        data.mbti.rekomendasi_belajar_1,
        data.mbti.rekomendasi_belajar_2,
        data.mbti.rekomendasi_belajar_3,
      ].filter(Boolean);

      doc.font("Helvetica").fontSize(10);
      rekomendasi.forEach((rek, index) => {
        if (yPos > 720) {
          doc.addPage();
          yPos = 50;
        }
        const textHeight = doc.heightOfString(`${index + 1}. ${rek}`, {
          width: 480,
        });
        doc.text(`${index + 1}. ${rek}`, 65, yPos, {
          width: 480,
          align: "justify",
        });
        yPos += textHeight + 8;
      });
    } else {
      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text("Siswa belum mengikuti tes MBTI", 50, yPos);
      yPos += 30;
    }

    yPos += 10;
    drawLine(yPos);
    yPos += 20;

    // ===== KOMENTAR DAN APRESIASI =====
    if (data.komentar || data.apresiasi) {
      if (yPos > 680) {
        doc.addPage();
        yPos = 50;
      }

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("KOMENTAR WALI KELAS", 50, yPos);
      yPos += 25;

      if (data.komentar) {
        doc.font("Helvetica-Bold").fontSize(10).text("Komentar:", 50, yPos);
        yPos += 18;
        const komentarHeight = doc.heightOfString(data.komentar, {
          width: 495,
        });
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(data.komentar, 50, yPos, { width: 495, align: "justify" });
        yPos += komentarHeight + 15;
      }

      if (data.apresiasi) {
        doc.font("Helvetica-Bold").fontSize(10).text("Apresiasi:", 50, yPos);
        yPos += 18;
        const apresiasiHeight = doc.heightOfString(data.apresiasi, {
          width: 495,
        });
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(data.apresiasi, 50, yPos, { width: 495, align: "justify" });
        yPos += apresiasiHeight + 15;
      }
    }

    // ===== FOOTER / TTD =====
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    } else {
      yPos = Math.max(yPos + 20, 680);
    }

    const currentDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.font("Helvetica").fontSize(10);
    doc.text(`Malang, ${currentDate}`, 370, yPos);
    yPos += 15;
    doc.text("Wali Kelas,", 370, yPos);
    yPos += 50;
    doc.font("Helvetica-Bold");
    doc.text(data.waliKelas.nama_lengkap, 370, yPos);
    doc.font("Helvetica").fontSize(9);
    doc.text(`NIP. ${data.waliKelas.nip || "-"}`, 370, yPos + 15);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = { generateRaporPDF };
