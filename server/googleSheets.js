// Google Sheets Service - Ghi dữ liệu đơn hàng lên Google Sheets

const { google } = require('googleapis');
require('dotenv').config();

// Cấu hình Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_NAME || 'Đơn hàng'; // Tên sheet mặc định

// Khởi tạo Google Sheets API client
let sheets = null;

/**
 * Chuyển đổi trạng thái từ tiếng Anh sang tiếng Việt
 * @param {string} status - Trạng thái tiếng Anh
 * @returns {string} - Trạng thái tiếng Việt
 */
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

/**
 * Chuyển đổi thời gian từ UTC sang múi giờ Việt Nam (UTC+7) và format
 * @param {string} isoString - Thời gian dạng ISO string (UTC)
 * @returns {string} - Thời gian đã format theo múi giờ Việt Nam (DD/MM/YYYY, HH:mm:ss)
 */
function formatVietnamTime(isoString) {
  let date;
  
  if (!isoString) {
    // Nếu không có thời gian, dùng thời gian hiện tại (UTC)
    date = new Date();
  } else {
    // Chuyển đổi từ ISO string sang Date object
    // ISO string thường là UTC, nên cần convert sang VN time
    date = new Date(isoString);
  }

  // Đảm bảo date là valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', isoString);
    date = new Date(); // Fallback to current time
  }

  try {
    // Sử dụng Intl.DateTimeFormat để format đúng múi giờ Việt Nam
    // Đây là cách đáng tin cậy nhất, hoạt động trên mọi server
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Format và tách các phần
    const parts = formatter.formatToParts(date);
    
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const second = parts.find(p => p.type === 'second').value;
    
    // Format: DD/MM/YYYY, HH:mm:ss
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
  } catch (error) {
    // Fallback: Manual calculation nếu Intl không hoạt động
    console.warn('Intl.DateTimeFormat failed, using manual calculation:', error.message);
    
    // Lấy UTC time từ date object (timestamp in milliseconds)
    const utcTime = date.getTime();
    
    // Convert UTC to Vietnam time (UTC+7)
    // Vietnam is UTC+7, so we add 7 hours (7 * 60 * 60 * 1000 milliseconds)
    const vietnamOffset = 7 * 60 * 60 * 1000;
    const vietnamTimestamp = utcTime + vietnamOffset;
    
    // Tạo Date object từ timestamp đã convert
    const vietnamDate = new Date(vietnamTimestamp);
    
    // Format manually - sử dụng UTC methods vì timestamp đã được convert
    // Khi dùng getUTC* methods với timestamp đã +7h, ta sẽ lấy được VN time
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const year = vietnamDate.getUTCFullYear();
    const hour = String(vietnamDate.getUTCHours()).padStart(2, '0');
    const minute = String(vietnamDate.getUTCMinutes()).padStart(2, '0');
    const second = String(vietnamDate.getUTCSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
  }
}

/**
 * Khởi tạo Google Sheets client
 * Hỗ trợ 2 cách: Service Account (dùng file JSON) hoặc OAuth2 (dùng token)
 */
function initGoogleSheets() {
  try {
    // Cách 1: Sử dụng Service Account (khuyến nghị cho production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets initialized with Service Account');
      return true;
    }
    
    // Cách 2: Sử dụng OAuth2 token (cho development)
    if (process.env.GOOGLE_OAUTH2_TOKEN) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials(JSON.parse(process.env.GOOGLE_OAUTH2_TOKEN));
      sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets initialized with OAuth2');
      return true;
    }

    // Cách 3: Sử dụng file credentials.json (nếu có trong thư mục server)
    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(__dirname, 'credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets initialized with credentials.json');
      return true;
    }

    console.warn('⚠️ Google Sheets chưa được cấu hình. Bỏ qua việc ghi dữ liệu lên Sheets.');
    return false;
  } catch (error) {
    console.error('❌ Error initializing Google Sheets:', error.message);
    return false;
  }
}

/**
 * Ghi đơn hàng mới lên Google Sheets
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<boolean>} - true nếu thành công, false nếu thất bại
 */
async function addOrderToSheets(orderData) {
  if (!sheets || !SPREADSHEET_ID) {
    console.warn('⚠️ Google Sheets chưa được cấu hình, bỏ qua việc ghi dữ liệu');
    return false;
  }

  try {
    // Định dạng dữ liệu đơn hàng
    const itemsText = orderData.items
      .map(item => `${item.name} (x${item.quantity})`)
      .join(', ');
    
    const row = [
      orderData.id || '',                    // ID đơn hàng
      formatVietnamTime(orderData.created_at), // Thời gian đặt hàng (múi giờ Việt Nam)
      orderData.customer_name || '',         // Tên khách hàng
      orderData.customer_phone || '',        // Số điện thoại
      orderData.delivery_address || '',      // Địa chỉ giao hàng
      orderData.delivery_time || '',         // Thời gian giao hàng
      itemsText,                             // Danh sách món
      orderData.items.length,                 // Số lượng món
      orderData.total || 0,                  // Tổng tiền
      getStatusLabel(orderData.status || 'pending'), // Trạng thái (tiếng Việt)
    ];

    // Kiểm tra xem sheet có tồn tại không, nếu không thì tạo mới
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
      });
    } catch (error) {
      // Nếu sheet chưa tồn tại, tạo mới
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEET_NAME,
              },
            },
          }],
        },
      });
      
      // Thêm header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
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
          ]],
        },
      });
    }

    // Thêm dữ liệu đơn hàng vào sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row],
      },
    });

    console.log(`✅ Đã ghi đơn hàng #${orderData.id} lên Google Sheets`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi ghi dữ liệu lên Google Sheets:', error.message);
    // Không throw error để không làm gián đoạn việc tạo đơn hàng trong database
    return false;
  }
}

/**
 * Cập nhật trạng thái đơn hàng trong Google Sheets
 * @param {number} orderId - ID đơn hàng
 * @param {string} newStatus - Trạng thái mới
 * @returns {Promise<boolean>}
 */
async function updateOrderStatusInSheets(orderId, newStatus) {
  if (!sheets || !SPREADSHEET_ID) {
    return false;
  }

  try {
    // Lấy tất cả dữ liệu trong sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return false; // Không có dữ liệu hoặc chỉ có header
    }

    // Tìm dòng chứa orderId (cột A)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] == orderId) { // So sánh không nghiêm ngặt để hỗ trợ cả string và number
        rowIndex = i + 1; // +1 vì Google Sheets bắt đầu từ 1
        break;
      }
    }

    if (rowIndex === -1) {
      console.warn(`⚠️ Không tìm thấy đơn hàng #${orderId} trong Google Sheets`);
      return false;
    }

    // Cập nhật trạng thái (cột I - index 8) - chuyển sang tiếng Việt
    const statusLabel = getStatusLabel(newStatus);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!I${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[statusLabel]],
      },
    });

    console.log(`✅ Đã cập nhật trạng thái đơn hàng #${orderId} trong Google Sheets`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật trạng thái trong Google Sheets:', error.message);
    return false;
  }
}

// Khởi tạo khi module được load
initGoogleSheets();

module.exports = {
  addOrderToSheets,
  updateOrderStatusInSheets,
  initGoogleSheets,
};

