const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
let multer;
try {
  // Multer dùng để upload file ảnh. Nếu chưa cài, backend vẫn chạy được (chỉ không dùng được API upload).
  multer = require('multer');
} catch (e) {
  console.warn('Multer chưa được cài, API /api/upload sẽ bị tắt. Bỏ qua cảnh báo này nếu bạn không dùng upload ảnh.');
}
const { initDatabase, seedDatabase } = require('./database');
const { addOrderToSheets, updateOrderStatusInSheets } = require('./googleSheets');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Static serving for uploads
app.use('/uploads', express.static(uploadsDir));

let upload;
if (multer) {
  // Multer storage config
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
      const uniqueSuffix = Date.now();
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    },
  });

  upload = multer({ storage });
}

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  
  // Initialize database
  initDatabase(db, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
      process.exit(1);
    }
    // Seed database after initialization
    seedDatabase(db);
  });
});

// API Routes

// Upload image
if (upload) {
  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // URL for frontend to use
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ image_url: imageUrl });
  });
} else {
  // Nếu chưa cài multer, trả về lỗi rõ ràng để frontend hiểu
  app.post('/api/upload', (req, res) => {
    res.status(500).json({
      error: 'Multer is not installed on server. Image upload is disabled.',
    });
  });
}

// Get all menu items
app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items ORDER BY category, name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get menu items by category
app.get('/api/menu/category/:category', (req, res) => {
  const { category } = req.params;
  db.all('SELECT * FROM menu_items WHERE category = ? ORDER BY name', [category], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get menu item by ID
app.get('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(row);
  });
});

// Create new menu item
app.post('/api/menu', (req, res) => {
  const { name, category, price, description, image_url } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Thiếu tên, danh mục hoặc giá' });
  }

  const stmt = db.prepare(
    'INSERT INTO menu_items (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)'
  );

  stmt.run(
    name,
    category,
    price,
    description || null,
    image_url || null,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT * FROM menu_items WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update menu item
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, image_url } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Thiếu tên, danh mục hoặc giá' });
  }

  db.run(
    'UPDATE menu_items SET name = ?, category = ?, price = ?, description = ?, image_url = ? WHERE id = ?',
    [name, category, price, description || null, image_url || null, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err2, row) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        res.json(row);
      });
    }
  );
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM menu_items WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Xóa món thành công' });
  });
});

// Create new order
app.post('/api/orders', async (req, res) => {
  const { items, total, customer_name, customer_phone, delivery_address, delivery_time } = req.body;
  const created_at = new Date().toISOString();
  
  db.run(
    'INSERT INTO orders (items, total, customer_name, customer_phone, delivery_address, delivery_time, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [JSON.stringify(items), total, customer_name || null, customer_phone || null, delivery_address || null, delivery_time || null, created_at, 'pending'],
    async function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const orderData = {
        id: this.lastID,
        items,
        total,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_time: delivery_time || null,
        created_at,
        status: 'pending'
      };

      // Ghi đơn hàng lên Google Sheets (không chặn response nếu có lỗi)
      try {
        await addOrderToSheets(orderData);
      } catch (error) {
        console.error('Lỗi khi ghi lên Google Sheets (không ảnh hưởng đến đơn hàng):', error);
      }

      res.json(orderData);
    }
  );
});

// Get all orders
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON items
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    res.json(orders);
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      ...row,
      items: JSON.parse(row.items)
    });
  });
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], async function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Cập nhật trạng thái trong Google Sheets (không chặn response nếu có lỗi)
    try {
      await updateOrderStatusInSheets(id, status);
    } catch (error) {
      console.error('Lỗi khi cập nhật Google Sheets (không ảnh hưởng đến cập nhật):', error);
    }
    
    res.json({ message: 'Order status updated successfully' });
  });
});

// Update order (full update)
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { items, total, customer_name, customer_phone, delivery_address, delivery_time, status } = req.body;
  
  db.run(
    'UPDATE orders SET items = ?, total = ?, customer_name = ?, customer_phone = ?, delivery_address = ?, delivery_time = ?, status = ? WHERE id = ?',
    [JSON.stringify(items), total, customer_name || null, customer_phone || null, delivery_address || null, delivery_time || null, status || 'pending', id],
    async function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Cập nhật trong Google Sheets nếu có thay đổi status
      if (status) {
        try {
          await updateOrderStatusInSheets(id, status);
        } catch (error) {
          console.error('Lỗi khi cập nhật Google Sheets:', error);
        }
      }
      
      res.json({ message: 'Order updated successfully' });
    }
  );
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/orders/${id} - Attempting to delete order`);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
      if (err) {
        console.error(`Error deleting order ${id}:`, err);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        console.log(`Order ${id} not found`);
        return res.status(404).json({ error: 'Order not found' });
      }
      console.log(`Order ${id} deleted successfully`);
      res.json({ message: 'Order deleted successfully', deletedId: id });
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/orders/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

