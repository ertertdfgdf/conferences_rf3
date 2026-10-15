import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "conf.db"));

db.pragma("foreign_keys = ON");

// Таблица Users

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, 
    fio TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
    );
`);

//наполнить бд тестовыми данными

const count = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;

if (count === 0) {
  const stmt = db.prepare(`
       INSERT INTO users (login, password, fio, phone, email)
       VALUES (?, ?, ?, ?, ?) 
    `);
  stmt.run(
    "ivan",
    "demo",
    "Иванов Иван",
    "8(999)123-45-67",
    "ivan@example.com",
  );
  stmt.run(
    "petr",
    "demo",
    "Петров Пётр",
    "8(999)123-45-68",
    "petr@example.com",
  );
  stmt.run(
    "anna",
    "demo",
    "Сидорова Анна",
    "8(999)123-45-69",
    "anna@example.com",
  );
  console.log("Тестовые пользователи добавлены");
}

db.exec(`
     CREATE TABLE IF NOT EXISTS rooms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, 
    capacity INTEGER NOT NULL
    );
`);

const countRooms = db.prepare("SELECT COUNT(*) AS c FROM rooms").get().c;

if (count === 0) {
  const stmtRoom = db.prepare(`
       INSERT INTO rooms (name, type, capacity)
       VALUES (?, ?, ?) 
    `);
  stmtRoom.run("Конференц-зал А", "конференц-зал", "20");
  stmtRoom.run("Переговорная Б", "переговорная", "10");
  stmtRoom.run("Лекционный зал В", "лекционный зал", "75");
  console.log("Тестовые комнаты добавлены");
}

db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    date_start TEXT NOT NULL,
    payment TEXT NOT NULL, 
    status TEXT NOT NULL DEFAULT 'Новая',
    review TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
    );
`);

const requestsCount = db.prepare("SELECT COUNT(*) AS c FROM requests").get().c;

if (requestsCount === 0) {
  const stmtRequest = db.prepare(`
        INSERT INTO requests (user_id, room_id, date_start, payment)
        VALUES (?, ?, ?, ?)
        `);
  stmtRequest.run(1, 1, "2027-03-15", "При очном посещении");
  stmtRequest.run(1, 3, "2027-03-20", "Перевод по СПБ");
  stmtRequest.run(2, 3, "2027-04-01", "При очном посещении");
}

db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    request_id INTEGER NOT NULL,
    rating INTEGER NOT NULL, 
    comment TEXT, 
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );
`);

const reviewsCount = db.prepare("SELECT COUNT(*) AS c FROM reviews").get().c;

if (reviewsCount === 0) {
  const stmtReview = db.prepare(`
    INSERT INTO reviews (request_id, rating, comment)
    VALUES (?, ?, ?)
    `);

  stmtReview.run(1, 5, "Отличная переговорная, всё понравилось!");
  stmtReview.run(2, 4, "Хороший лекционный зал, но было шумно!");
  stmtReview.run(3, 3, "Нормально, но кондиционер не работал!");
}

const result = db
  .prepare(
    `
    SELECT
    reviews.id AS review_id, 
    reviews.rating,
    reviews.comment,
    requests.date_start,
    requests.payment,
    requests.status,
    users.fio AS user_name,
    rooms.name AS room_name,
    rooms.type AS room_type
    FROM reviews
    JOIN requests ON reviews.request_id = requests.id
    JOIN users ON requests.user_id = users.id
    JOIN rooms ON requests.room_id = rooms.id
    `,
  )
  .all();

class UserModel {
  constructor() {
    this.table = "users";
  }
  findById(id) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id);
  }
  findByLogin(login) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE login = ?`).get(login);
  }

  findALL() {
    return db.prepare(`SELECT * FROM ${this.table}`).all();
  }

  count() {
    return db.prepare(`SELECT COUNT(*) as count FROM ${this.table}`).get()
      .count;
  }

  exists(login) {
    const user = db
      .prepare(`SELECT id FROM ${this.table} WHERE login = ?`)
      .get(login);
  }
}

class RoomModel {
  constructor() {
    this.table = "rooms";
  }

  findAll() {
    return db.prepare(`SELECT * FROM ${this.table}`).all();
  }

  findById(id) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE id = ? `).get(id);
  }

  findByType(type) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE type = ?`).all(type);
  }

  count() {
    return db.prepare(`SELECT COUNT(*) as count FROM ${this.table}`).get()
      .count;
  }
}

class RequestModel {
  constructor() {
    this.table = "requests";
  }

  findById(id) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE id = ? `).get(id);
  }

  findByUser(userid) {
    return db
      .prepare(
        `
        SELECT ${this.table}.*, rooms.name AS room_name
        FROM ${this.table}
        JOIN rooms ON ${this.table}. room_id=rooms.id
        WHERE ${this.table}.user_id = ?
        `,
      )
      .all(userid);
  }

  findAllDetailed() {
    return db
      .prepare(
        `
        SELECT ${this.table}.*,
        users.fio AS user_name,
        rooms.name AS room_name,
        rooms.type AS room_type
        FROM ${this.table}
        JOIN users ON ${this.table}.user_id=users.id
        JOIN rooms ON ${this.table}.room_id=rooms.id
        `,
      )
      .all();
  }
  count() {
    return db.prepare(`SELECT COUNT(*) as count FROM ${this.table}`).get()
      .count;
  }
  updateStatus(id, status) {
    return db
      .prepare(`UPDATE ${this.table} SET status = ? WHERE id = ?`)
      .run(status, id);
  }
}
export const User = new UserModel();
export const Room = new RoomModel();
export const Request = new RequestModel();

export default db;
