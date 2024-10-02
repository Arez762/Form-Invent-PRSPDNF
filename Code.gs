function doGet() {
  return HtmlService.createHtmlOutputFromFile('formPeminjaman')
      .setTitle('Form Peminjaman')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getRuanganOptions() {
  const spreadsheetId = '19kHPJl9fm5iunjrl7MStanetMeivI7LzZ8zyP5Ph13k'; // Ganti dengan ID spreadsheet Anda
  const sheetName = 'Kode Ruangan'; // Nama sheet yang sesuai
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  
  // Mengambil data dari kolom yang berisi ruangan, ganti 'B' jika berbeda kolom
  const data = sheet.getRange('B5:B1000').getValues();
  
  // Filter untuk menghapus elemen kosong
  const ruanganOptions = data.flat().filter(String); 

  return ruanganOptions;
}

function getJenisBarangOptions() {
  const spreadsheetId = '19kHPJl9fm5iunjrl7MStanetMeivI7LzZ8zyP5Ph13k'; // ID spreadsheet
  const sheetName = 'Manajemen Barang'; // Nama sheet yang sesuai
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId); // Buka spreadsheet berdasarkan ID
  const sheet = spreadsheet.getSheetByName(sheetName); // Ambil sheet berdasarkan nama

  if (!sheet) {
    throw new Error("Sheet dengan nama '" + sheetName + "' tidak ditemukan.");
  }

  // Ambil data dari kolom C (baris 7 hingga 1000)
  const dataRange = sheet.getRange('C7:C1000');
  const data = dataRange.getValues();

  // Ubah array 2D menjadi array 1D dan hilangkan elemen yang kosong atau null
  const jenisBarangOptions = data.flat().filter(function(item) {
    return item && item[0].trim() !== ''; // Hanya ambil data yang tidak kosong
  });

  return jenisBarangOptions;
}

function submitDataToDatabase(formData) {
  try {
    // ID Spreadsheet Database
    var databaseSpreadsheetId = '19kHPJl9fm5iunjrl7MStanetMeivI7LzZ8zyP5Ph13k';
    var databaseSheetName = 'FormManajemenPeminjaman';

    // Akses spreadsheet database
    var databaseSpreadsheet = SpreadsheetApp.openById(databaseSpreadsheetId);
    var databaseSheet = databaseSpreadsheet.getSheetByName(databaseSheetName);

    if (!databaseSheet) {
      throw new Error("Sheet dengan nama '" + databaseSheetName + "' tidak ditemukan di database.");
    }

    // Ambil baris terakhir yang berisi data
    var lastRow = databaseSheet.getLastRow();

    // Tentukan nomor urut
    var nomorUrut;
    if (lastRow === 1) { // Jika hanya ada baris header
      nomorUrut = 1;
    } else {
      // Ambil nomor urut terakhir dari kolom pertama
      var lastNumber = databaseSheet.getRange(lastRow, 1).getValue();
      // Jika lastNumber bukan angka, mulai dari 1, jika tidak, tambahkan 1
      nomorUrut = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    // Buat ID Pinjam
    var idPinjam = 'P-' + nomorUrut.toString().padStart(4, '0');

    // Data yang dikirimkan ke database sesuai urutan kolom, termasuk nomor urut dan ID Pinjam
    var data = [
      nomorUrut,
      idPinjam,
      formData.namaPeminjam,
      formData.nip,
      formData.jabatan,
      formData.nomorTelepon,
      formData.tanggalPinjam,
      formData.tanggalKembali,
      formData.ruangan,
      formData.jenisBarang
    ];

    // Masukkan data ke spreadsheet database
    databaseSheet.appendRow(data);

    // Log sukses
    Logger.log("Data berhasil dimasukkan dengan nomor urut: " + nomorUrut + " dan ID Pinjam: " + idPinjam);

    // Return success message
    return {
      success: true,
      message: "Data berhasil disubmit dengan ID Pinjam: " + idPinjam
    };

  } catch (error) {
    Logger.log("Error saat memasukkan data: " + error.message);
    // Return error message
    return {
      success: false,
      message: "Terjadi kesalahan: " + error.message
    };
  }
}