// Script để reset tất cả đơn hàng trong database và Google Sheets
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const dbPath = path.join(__dirname, 'database.sqlite');
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || 'Don hang';

// Khởi tạo Google Sheets
function initGoogleSheets() {
  try {
    // Cách 1: Service Account từ env
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    }
    
    // Cách 2: OAuth2 token
    if (process.env.GOOGLE_OAUTH2_TOKEN) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials(JSON.parse(process.env.GOOGLE_OAUTH2_TOKEN));
      return google.sheets({ version: 'v4', auth });
    }

    // Cách 3: File credentials.json
    const fs = require('fs');
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    }

    console.warn('⚠️ Google Sheets chưa được cấu hình');
    return null;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Google Sheets:', error.message);
    return null;
  }
}

// Xóa tất cả đơn hàng trong database
function clearDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Lỗi kết nối database:', err);
        reject(err);
        return;
      }

      db.run('DELETE FROM orders', function(err) {
        if (err) {
          console.error('❌ Lỗi xóa đơn hàng trong database:', err);
          db.close();
          reject(err);
          return;
        }

        console.log(`✅ Đã xóa ${this.changes} đơn hàng trong database`);
        db.close();
        resolve(this.changes);
      });
    });
  });
}

// Xóa tất cả dữ liệu trong Google Sheets (giữ lại header)
async function clearGoogleSheets(sheets) {
  if (!sheets || !SPREADSHEET_ID) {
    console.warn('⚠️ Bỏ qua việc xóa Google Sheets (chưa cấu hình)');
    return;
  }

  try {
    // Lấy tất cả dữ liệu để xem có bao nhiêu dòng
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      console.log('✅ Google Sheets đã trống (chỉ có header)');
      return;
    }

    const dataRowCount = rows.length - 1; // Trừ header
    console.log(`📊 Tìm thấy ${dataRowCount} dòng dữ liệu trong Google Sheets`);

    // Xóa tất cả dữ liệu từ dòng 2 trở đi (giữ lại header ở dòng 1)
    if (dataRowCount > 0) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J${rows.length}`,
      });

      console.log(`✅ Đã xóa ${dataRowCount} dòng dữ liệu trong Google Sheets (giữ lại header)`);
    }
  } catch (error) {
    // Nếu sheet không tồn tại hoặc lỗi, bỏ qua
    if (error.message.includes('Unable to parse range') || error.message.includes('not found')) {
      console.log('⚠️ Sheet không tồn tại hoặc đã trống');
    } else {
      console.error('❌ Lỗi khi xóa Google Sheets:', error.message);
    }
  }
}

// Hàm chính
async function resetAll() {
  console.log('🔄 Bắt đầu reset tất cả đơn hàng...\n');

  try {
    // 1. Xóa database
    console.log('📦 Đang xóa đơn hàng trong database...');
    const deletedCount = await clearDatabase();
    console.log(`✅ Đã xóa ${deletedCount} đơn hàng trong database\n`);

    // 2. Xóa Google Sheets
    console.log('📊 Đang xóa đơn hàng trong Google Sheets...');
    const sheets = initGoogleSheets();
    await clearGoogleSheets(sheets);
    console.log('✅ Đã xóa dữ liệu trong Google Sheets\n');

    console.log('✅ Hoàn thành! Tất cả đơn hàng đã được reset về trạng thái ban đầu.');
  } catch (error) {
    console.error('❌ Lỗi khi reset:', error);
    process.exit(1);
  }
}

// Chạy script
resetAll()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

