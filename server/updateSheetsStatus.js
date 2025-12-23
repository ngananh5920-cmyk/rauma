// Script để cập nhật tất cả trạng thái trong Google Sheets sang tiếng Việt

const { google } = require('googleapis');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || 'Đơn hàng';

// Hàm chuyển đổi trạng thái
function getStatusLabel(status) {
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'preparing': 'Đang chuẩn bị',
    'delivering': 'Đang giao hàng',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
}

// Khởi tạo Google Sheets
async function initGoogleSheets() {
  const credentialsPath = path.join(__dirname, 'credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.error('❌ Không tìm thấy file credentials.json');
    return null;
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  return google.sheets({ version: 'v4', auth });
}

// Cập nhật tất cả trạng thái
async function updateAllStatuses() {
  if (!SPREADSHEET_ID) {
    console.error('❌ Chưa cấu hình GOOGLE_SHEETS_ID trong file .env');
    return;
  }

  const sheets = await initGoogleSheets();
  if (!sheets) return;

  try {
    // Lấy tất cả dữ liệu
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      console.log('⚠️ Không có dữ liệu để cập nhật');
      return;
    }

    console.log(`📊 Tìm thấy ${rows.length - 1} dòng dữ liệu (không tính header)`);

    // Map trạng thái tiếng Việt sang tiếng Anh (để kiểm tra)
    const reverseMap = {
      'Chờ xác nhận': 'pending',
      'Đã xác nhận': 'confirmed',
      'Đang chuẩn bị': 'preparing',
      'Đang giao hàng': 'delivering',
      'Hoàn thành': 'completed',
      'Đã hủy': 'cancelled'
    };

    let updatedCount = 0;
    const updates = [];

    // Bắt đầu từ dòng 2 (bỏ qua header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 9) continue; // Bỏ qua nếu không đủ cột

      const currentStatus = row[8]; // Cột I (index 8) là trạng thái
      
      // Nếu trạng thái đã là tiếng Việt, bỏ qua
      if (reverseMap[currentStatus]) {
        continue;
      }

      // Nếu trạng thái là tiếng Anh, chuyển sang tiếng Việt
      const vietnameseStatus = getStatusLabel(currentStatus);
      
      if (vietnameseStatus !== currentStatus) {
        const rowNumber = i + 1; // Google Sheets bắt đầu từ 1
        updates.push({
          range: `${SHEET_NAME}!I${rowNumber}`,
          values: [[vietnameseStatus]]
        });
        updatedCount++;
        console.log(`  - Dòng ${rowNumber}: "${currentStatus}" → "${vietnameseStatus}"`);
      }
    }

    if (updates.length === 0) {
      console.log('✅ Tất cả trạng thái đã là tiếng Việt!');
      return;
    }

    console.log(`\n🔄 Đang cập nhật ${updates.length} trạng thái...`);

    // Cập nhật từng dòng
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: 'RAW',
        resource: {
          values: update.values,
        },
      });
    }

    console.log(`✅ Đã cập nhật ${updatedCount} trạng thái sang tiếng Việt!`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật:', error.message);
  }
}

// Chạy script
updateAllStatuses()
  .then(() => {
    console.log('\n✨ Hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

