const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Создать или открыть SQL базу данных
const db = new sqlite3.Database("./fitrack.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the fitrack database.");
});

// Создание таблиц
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type_id INTEGER NOT NULL,
    FOREIGN KEY (type_id) REFERENCES transaction_types(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transaction_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (type_id) REFERENCES transaction_types(id)
  )`);
});

// Регистрация
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (email, password) VALUES (?, ?)`,
    [email, hashedPassword],
    function (err) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Пользователь уже существует или другая ошибка" });
      }
      res.status(201).json({
        message: "Пользователь успешно зарегестрирован",
        userId: this.lastID,
      });
    }
  );
});

// Логин
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }
    res.status(200).json({ message: "Вход успешен", userId: user.id });
  });
});

// Сохранение операции
app.post("/api/transactions", (req, res) => {
  const { user_id, category_id, type_id, amount, date, comment } = req.body;

  db.run(
    `INSERT INTO transactions (user_id, category_id, type_id, amount, date, comment) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, category_id, type_id, amount, date, comment],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Ошибка сохраненния" });
      }

      const id = this.lastID;

      db.get(
        `SELECT t.id, t.amount, t.date, t.comment, c.name AS category, tt.name AS type
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         JOIN transaction_types tt ON t.type_id = tt.id
         WHERE t.id = ?`,
        [id],
        (err, savedTransaction) => {
          if (err) {
            console.error(err.message);
            return res
              .status(500)
              .json({ message: "Ошибка извлечения сохраненной операции" });
          }
          res.status(201).json(savedTransaction);
        }
      );
    }
  );
});

// Обновление операции
app.put("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { category_id, type_id, amount, date, comment } = req.body;

  if (!category_id || !type_id || !amount || !date) {
    return res.status(400).json({ message: "Отсутствуют обязательные поля" });
  }

  db.run(
    `UPDATE transactions 
     SET category_id = ?, type_id = ?, amount = ?, date = ?, comment = ?
     WHERE id = ?`,
    [category_id, type_id, amount, date, comment, id],
    function (err) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при обновлении транзакции" });
      }

      db.get(
        `SELECT t.id, t.amount, t.date, t.comment, c.name AS category, tt.name AS type
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         JOIN transaction_types tt ON t.type_id = tt.id
         WHERE t.id = ?`,
        [id],
        (err, updatedTransaction) => {
          if (err) {
            console.error(err.message);
            return res
              .status(500)
              .json({ message: "Ошибка при выборке обновленной транзакции" });
          }
          res.status(200).json(updatedTransaction);
        }
      );
    }
  );
});

// Получить типы операций
app.get("/api/transaction_types", (req, res) => {
  db.all(`SELECT * FROM transaction_types`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ message: "Error fetching transaction types" });
    }
    res.status(200).json(rows);
  });
});

// Get categories
app.get("/api/categories", (req, res) => {
  db.all(`SELECT * FROM categories`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ message: "Ошибка при выборе типов транзакций" });
    }
    res.status(200).json(rows);
  });
});

// Получение категорий по типу операции
app.get("/api/categories/:type_id", (req, res) => {
  const { type_id } = req.params;
  db.all(
    `SELECT * FROM categories WHERE type_id = ?`,
    [type_id],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Ошибка при выборе категорий" });
      }
      res.status(200).json(rows);
    }
  );
});

// Получение данных о операциях пользователя (последние 8)
app.get("/api/transactions/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.all(
    `SELECT 
      transactions.id, transactions.amount, transactions.date, transactions.comment,
      categories.name AS category, transaction_types.name AS type,
      transactions.category_id, transactions.type_id
     FROM transactions
     JOIN categories ON transactions.category_id = categories.id
     JOIN transaction_types ON transactions.type_id = transaction_types.id
     WHERE transactions.user_id = ?
     ORDER BY transactions.date DESC
     LIMIT 8`,
    [user_id],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при извлечении транзакций" });
      }
      res.status(200).json(rows);
    }
  );
});

// Удаление операции
app.delete("/api/transactions/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM transactions WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ message: "Ошибка при удалении транзакции" });
    }
    res.status(200).json({ message: "Транзакция успешно удалена" });
  });
});

app.get("/api/transactions/total/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.get(
    `SELECT 
      SUM(CASE WHEN tt.name = 'Доход' THEN t.amount ELSE -t.amount END) AS total 
     FROM transactions t
     JOIN transaction_types tt ON t.type_id = tt.id
     WHERE t.user_id = ?`,
    [user_id],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при расчете общего бюджета" });
      }
      res.status(200).json(row);
    }
  );
});

app.get("/api/transactions/monthly/:user_id", (req, res) => {
  const { user_id } = req.params;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).toISOString();

  db.all(
    `SELECT 
      tt.name AS type, 
      SUM(t.amount) AS amount 
    FROM transactions t
    JOIN transaction_types tt ON t.type_id = tt.id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
    GROUP BY tt.name`,
    [user_id, startOfMonth, endOfMonth],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при получении ежемесячной сводки" });
      }
      res.status(200).json(rows);
    }
  );
});

app.get("/api/transactions/paginated/:user_id", (req, res) => {
  const { user_id } = req.params;
  const {
    page = 1,
    limit = 8,
    startDate,
    endDate,
    type,
    categories,
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT t.*, c.name as category, tt.name as type 
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN transaction_types tt ON t.type_id = tt.id
    WHERE t.user_id = ?`;

  let queryParams = [user_id];

  if (startDate) {
    query += " AND t.date >= ?";
    queryParams.push(startDate);
  }

  if (endDate) {
    query += " AND t.date <= ?";
    queryParams.push(endDate);
  }

  if (type && type !== "Все типы") {
    query += " AND tt.name = ?";
    queryParams.push(type);
  }

  if (categories && categories.length > 0) {
    query += " AND c.name IN (" + categories.map(() => "?").join(",") + ")";
    queryParams = queryParams.concat(categories);
  }

  query += " ORDER BY t.date DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), offset);

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ message: "Ошибка при извлечении транзакций" });
    }

    db.get(
      `SELECT COUNT(*) as count FROM transactions WHERE user_id = ?`,
      [user_id],
      (countErr, countRow) => {
        if (countErr) {
          console.error(countErr.message);
          return res
            .status(500)
            .json({ message: "Ошибка при подсчете транзакций" });
        }

        res
          .status(200)
          .json({ transactions: rows, totalCount: countRow.count });
      }
    );
  });
});

// Получить общее количество транзакций пользователя
app.get("/api/transactions/count/:user_id", (req, res) => {
  const { user_id } = req.params;

  db.get(
    `SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?`,
    [user_id],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при извлечении транзакций" });
      }
      res.status(200).json(row);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/api/transactions/monthly-summary/:user_id", (req, res) => {
  const { user_id } = req.params;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).toISOString();

  db.all(
    `SELECT 
      tt.name AS type, 
      SUM(t.amount) AS amount 
    FROM transactions t
    JOIN transaction_types tt ON t.type_id = tt.id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
    GROUP BY tt.name`,
    [user_id, startOfMonth, endOfMonth],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при получении ежемесячной сводки" });
      }
      res.status(200).json(rows);
    }
  );
});

app.get("/api/transactions/monthly-incomes/:user_id", (req, res) => {
  const { user_id } = req.params;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).toISOString();

  db.all(
    `SELECT 
      c.name AS category,
      SUM(t.amount) AS amount,
      cc.color AS color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN category_colors cc ON c.id = cc.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ? AND t.type_id = (
      SELECT id FROM transaction_types WHERE name = 'Доход'
    )
    GROUP BY c.name`,
    [user_id, startOfMonth, endOfMonth],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при получении ежемесячных доходов" });
      }
      res.status(200).json(rows);
    }
  );
});

app.get("/api/transactions/monthly-expenses/:user_id", (req, res) => {
  const { user_id } = req.params;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).toISOString();

  db.all(
    `SELECT 
      c.name AS category,
      SUM(t.amount) AS amount,
      cc.color AS color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN category_colors cc ON c.id = cc.category_id
    WHERE t.user_id = ? AND t.date BETWEEN ? AND ? AND t.type_id = (
      SELECT id FROM transaction_types WHERE name = 'Расход'
    )
    GROUP BY c.name`,
    [user_id, startOfMonth, endOfMonth],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ message: "Ошибка при выборке ежемесячных расходов" });
      }
      res.status(200).json(rows);
    }
  );
});
