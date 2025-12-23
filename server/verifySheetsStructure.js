// Script để kiểm tra và sửa cấu trúc Google Sheets
const { google } = require('googleapis');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || 'Don hang';

async function verifyAndFixStructure() {
  try {
    // Khởi tạo Google Sheets
    let auth;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {
      const fs = require('fs');
      const path = require('path');
      const credentialsPath = path.join(__dirname, 'credentials.json');
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else {
        console.error('❌ Không tìm thấy credentials');
        return;
      }
    }

    const sheets = google.sheets({ version: 'v4', auth });

    // Lấy header row
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:J1`,
    });

    const headers = headerResponse.data.values?.[0] || [];
    console.log('📋 Header hiện tại:', headers);

    // Kiểm tra header đúng
    const correctHeaders = [
      'ID Đơn hàng',
      'Thời gian đặt',
      'Tên khách hàng',
      'Số điện thoại',
      'Địa chỉ giao hàng',
      'Thời gian giao hàng',
      'Danh sách món',
      'Số lượng món',
      'Tổng tiền',
      'Trạng thái'
    ];

    // So sánh headers
    let headersMatch = true;
    for (let i = 0; i < correctHeaders.length; i++) {
      if (headers[i] !== correctHeaders[i]) {
        headersMatch = false;
        console.log(`⚠️ Cột ${String.fromCharCode(65 + i)} (${i + 1}): "${headers[i]}" khác với "${correctHeaders[i]}"`);
      }
    }

    if (!headersMatch) {
      console.log('\n🔄 Đang cập nhật header...');
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        resource: {
          values: [correctHeaders],
        },
      });
      console.log('✅ Đã cập nhật header');
    } else {
      console.log('✅ Header đã đúng');
    }

    // Lấy một vài dòng dữ liệu để kiểm tra
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J6`,
    });

    const rows = dataResponse.data.values || [];
    console.log('\n📊 Kiểm tra dữ liệu mẫu:');
    rows.forEach((row, index) => {
      console.log(`\nDòng ${index + 2}:`);
      console.log(`  A (ID): ${row[0] || 'empty'}`);
      console.log(`  B (Thời gian): ${row[1] || 'empty'}`);
      console.log(`  C (Tên): ${row[2] || 'empty'}`);
      console.log(`  D (SĐT): ${row[3] || 'empty'}`);
      console.log(`  E (Địa chỉ): ${row[4] || 'empty'}`);
      console.log(`  F (TG giao): ${row[5] || 'empty'}`);
      console.log(`  G (Món): ${row[6] || 'empty'}`);
      console.log(`  H (SL): ${row[7] || 'empty'}`);
      console.log(`  I (Tổng tiền): ${row[8] || 'empty'}`);
      console.log(`  J (Trạng thái): ${row[9] || 'empty'}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

verifyAndFixStructure();

