const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_task_db',
  });

  console.log('Connected to database. Seeding...');

  try {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const empPassword   = await bcrypt.hash('password123', 10);

    // Admin
    await connection.execute(
      'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@company.com', adminPassword, 'admin']
    );

    // Employees
    const employees = [
      ['John Doe',    'john@company.com', empPassword, 'employee', 'Engineering', '+1-555-0101'],
      ['Jane Smith',  'jane@company.com', empPassword, 'employee', 'Marketing',   '+1-555-0102'],
      ['Bob Johnson', 'bob@company.com',  empPassword, 'employee', 'Design',      '+1-555-0103'],
    ];
    for (const emp of employees) {
      await connection.execute(
        'INSERT IGNORE INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
        emp
      );
    }

    // Fetch seeded user IDs
    const [[admin]] = await connection.execute('SELECT id FROM users WHERE email = ?', ['admin@company.com']);
    const [[john]]  = await connection.execute('SELECT id FROM users WHERE email = ?', ['john@company.com']);
    const [[jane]]  = await connection.execute('SELECT id FROM users WHERE email = ?', ['jane@company.com']);
    const [[bob]]   = await connection.execute('SELECT id FROM users WHERE email = ?', ['bob@company.com']);

    // Sample tasks
    const tasks = [
      ['Setup Development Environment',  'Configure dev tools and CI/CD pipeline',              'completed',   'high',   john.id,  admin.id, '2025-11-15'],
      ['Build REST API Endpoints',        'Create all RESTful APIs for the mobile app',          'in_progress', 'high',   john.id,  admin.id, '2025-12-15'],
      ['Design Marketing Campaign',       'Create Q4 marketing materials and landing pages',     'pending',     'medium', jane.id,  admin.id, '2025-12-20'],
      ['Database Performance Tuning',     'Optimize slow queries and add missing indexes',       'pending',     'high',   john.id,  admin.id, '2025-12-18'],
      ['Create UI Mockups',               'Design mockups for the new dashboard screens',        'completed',   'medium', bob.id,   admin.id, '2025-11-30'],
      ['Write Unit Tests',                'Achieve 80% test coverage for all API endpoints',    'pending',     'medium', john.id,  admin.id, '2025-12-25'],
      ['Social Media Content',            'Schedule posts for December marketing calendar',      'in_progress', 'low',    jane.id,  admin.id, '2025-12-10'],
      ['Brand Style Guide Update',        'Refresh brand guidelines for 2026',                   'pending',     'medium', bob.id,   admin.id, '2025-12-28'],
    ];

    for (const task of tasks) {
      await connection.execute(
        'INSERT IGNORE INTO tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        task
      );
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('──────────────────────────────────────');
    console.log('Admin    → admin@company.com  / admin123');
    console.log('Employee → john@company.com   / password123');
    console.log('Employee → jane@company.com   / password123');
    console.log('Employee → bob@company.com    / password123');
    console.log('──────────────────────────────────────\n');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await connection.end();
  }
}

seed();
