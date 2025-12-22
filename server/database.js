const sqlite3 = require('sqlite3').verbose();

function initDatabase(db, callback) {
  // Create menu_items table
  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      image_url TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating menu_items table:', err);
      if (callback) callback(err);
      return;
    }
    
    // Create orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        delivery_address TEXT,
        created_at TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
      )
    `, (err) => {
      if (err) {
        console.error('Error creating orders table:', err);
        if (callback) callback(err);
        return;
      }
      
      // Add delivery_address column if it doesn't exist (for existing databases)
      // SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
      // So we'll try to add it and ignore errors if column already exists
      db.run(`
        ALTER TABLE orders ADD COLUMN delivery_address TEXT
      `, (err) => {
        // Ignore error if column already exists (SQLite error: duplicate column name)
        // Different SQLite versions may have different error messages
        if (err) {
          const errorMsg = err.message.toLowerCase();
          if (!errorMsg.includes('duplicate') && !errorMsg.includes('already exists')) {
            console.error('Error adding delivery_address column:', err);
          }
          // Column already exists, which is fine
        }
      });
      
      console.log('Database tables created successfully');
      if (callback) callback(null);
    });
  });
}

function seedDatabase(db) {
  // Check if menu items already exist
  db.get('SELECT COUNT(*) as count FROM menu_items', (err, row) => {
    if (err) {
      console.error('Error checking menu items:', err);
      return;
    }
    
    if (row.count > 0) {
      console.log('Menu items already seeded');
      return;
    }

    // ĐỒ ĂN (Food)
    const foodItems = [
      { name: 'Nem chua', price: 36000, description: '36k/10c' },
      { name: 'Nem cối', price: 25000, description: '' },
      { name: 'Nem cối bigsize', price: 40000, description: '' }
    ];

    // ĐỒ UỐNG (Drinks)
    const drinkItems = [
      { name: 'Trà chanh', price: 10000, description: '' },
      { name: 'Trà quất', price: 10000, description: '' },
      { name: 'Trà tắc dứa', price: 15000, description: '' },
      { name: 'Trà táo xanh', price: 15000, description: '' },
      { name: 'Soda việt quất', price: 10000, description: '' },
      { name: 'Soda dứa', price: 10000, description: '' },
      { name: 'Soda táo xanh', price: 10000, description: '' },
      { name: 'Trà việt quất', price: 15000, description: '' },
      { name: 'Trà lài vải', price: 15000, description: '' },
      { name: 'Soda vải', price: 10000, description: '' }
    ];

    const stmt = db.prepare('INSERT INTO menu_items (name, category, price, description) VALUES (?, ?, ?, ?)');

    // Insert food items
    foodItems.forEach(item => {
      stmt.run(item.name, 'ĐỒ ĂN', item.price, item.description);
    });

    // Insert drink items
    drinkItems.forEach(item => {
      stmt.run(item.name, 'ĐỒ UỐNG', item.price, item.description);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error seeding database:', err);
      } else {
        console.log('Database seeded successfully');
      }
    });
  });
}

module.exports = { initDatabase, seedDatabase };

