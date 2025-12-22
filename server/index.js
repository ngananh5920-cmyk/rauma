const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initDatabase, seedDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Create new order
app.post('/api/orders', (req, res) => {
  const { items, total, customer_name, customer_phone, delivery_address } = req.body;
  const created_at = new Date().toISOString();
  
  db.run(
    'INSERT INTO orders (items, total, customer_name, customer_phone, delivery_address, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [JSON.stringify(items), total, customer_name || null, customer_phone || null, delivery_address || null, created_at, 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        items, 
        total, 
        customer_name, 
        customer_phone, 
        delivery_address,
        created_at, 
        status: 'pending' 
      });
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
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
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

