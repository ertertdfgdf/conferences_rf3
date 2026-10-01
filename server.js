import express from "express";

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <nav>
      <a href="/register">Регистрация</a> | 
      <a href="/login">Вход</a> | 
      <a href="/about">О портале</a> | 
      <a href="/contact">Контакты</a> | 
      <a href="/help">Помощь</a> | 
      <a href="/rooms">Помещения</a>
    </nav>
  `);
});

app.get("/about", (req, res) => {
  res.render('about', {
    title: 'О портале Конференции.РФ',
    description: 'Единая платформа для организации научных мероприятий.'
  });
});

app.get("/contact", (req, res) => {
  res.send("<h1>Контакты</h1><p>Email: info@conferences.rf</p>");
});

app.get("/help", (req, res) => {
  res.send("<h1>Помощь</h1><p>Техническая поддержка портала.</p>");
});

app.get("/rooms", (req, res) => {
  res.send("<h1>Список помещений</h1><ul><li>Зал А</li><li>Зал Б</li></ul>");
});

app.get("/register", (req, res) => {
  res.render('register', {
    title: 'Регистрация на портале',
    errors: []
  });
});

app.post("/register", (req, res) => {
  console.log("Город:", req.body.city);
  
  res.send(`
    <h2>Вы зарегистрированы!</h2>
    <p>Логин: ${req.body.login}</p>
    <p>ФИО: ${req.body.FIO}</p>
    <p>Почта: ${req.body.email}</p>
    <p>Телефон: ${req.body.tel}</p>
    <p>Город: ${req.body.city || 'Не указан'}</p>
    <a href="/login">Перейти ко входу</a>
  `);
});

app.get("/login", (req, res) => {
  res.render('login', {
    title: 'Вход в систему',
    errors: []
  });
});

app.post("/login", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
  const requests = []; 
  
  res.render("dashboard", {
    title: "Личный Кабинет",
    errors: [],
    requests: requests 
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});