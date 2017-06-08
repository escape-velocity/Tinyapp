
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "disposable!code!!"
  }
};

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "testing"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));

app.use( (req, res, next) => {
  req.user = users[req.session.userid];
  res.locals.user = req.user;
  next();
});

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ";
  for (let i = 0; i < 6 ; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return text;
}

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("register", templateVars);
});

app.post("/register", (req, res) =>{
  var user_id = generateRandomString();
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  for (user in users) {
    if(users[user].email === req.body.email){
      res.status(403);
      res.send('Email or Password exists.');
    }
    if(!req.body.email || !req.body.password) {
      res.status(400);
      res.send('Email or Password can not be empty.');
    }
  }
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  };
  req.session.userid = user_id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user_ID = req.session["user_id"];
  if (users[user_ID]) {
    res.render("urls_new");
  } else {
    res.status(401);
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.userid] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Opps, Email or password left blank.  Please <a href='/login'>try again</a>.");
    return;
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session["user_id"] = users[user].id;
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("Sorry that's the Incorrect password.  Please <a href='/login'>try again</a>.");
        return;
      }
    }
  }
  res.status(403).send("Sorry, Email does not exist!  Please <a href='/register'>register</a>.");
});

app.post("/urls", (req, res) => {
  let randomId = generateRandomString();
  urlDatabase[randomId] = "http://" + req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//initilize app

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

