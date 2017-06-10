
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "abcdef": {
    id: "abcdef",
    email: "lighthouse@lighthouse.com",
    password: bcrypt.hashSync("lighthouse", 10)
  }
};

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "testing"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));

app.use( (req, res, next) => {
  req.user = users[req.session.userId];
  res.locals.user = req.user;

  next();

});

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "9sm5Ad": {
    longURL: "http://www.lighthouse.com",
    userID: "abcdef"
  }
};

function generateRandomString() {
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ";
  for (let i = 0; i < 6 ; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return text;
}

function userSpecificUrls(userID) {
  let result = {};

  for (let key in urlDatabase) {
    let url = urlDatabase[key];

    if (userID === url.userID) {
      result[key] = url;
    }
  }

  return result;
}


app.get("/", (req, res) => {
  let user_id = req.user;
  if(!user_id) {
   res.redirect('/login');
 } else {
   res.redirect('/urls');
 }
});

app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("register", templateVars);
});

app.post("/register", (req, res) =>{
  var user_id = generateRandomString();
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  if(!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Email or Password can not be empty.');
    return;
  }
  for (user in users) {
    if(users[user].email === req.body.email){
      res.status(403);
      res.send('Email or Password exists.');
      return;
    }
  }
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: hashed_password
  };
  req.session.userId = user_id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (req.user) {
    let userId = req.user.id;
    let templateVars = { urls: userSpecificUrls(userId) };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send(`You should login <a href="/login">Login</a>
      or register <a href="/register">Register</a> to access this site`);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.user) {
    let userId = req.user.id;
    res.render("urls_new");
  } else {
    res.status(401);
    res.redirect("/login");
  }
});


app.get("/urls/:id", (req, res) => {


  if (!req.user) {
    res.status(401).send(`You should login <a href="/login">Login</a>
    or register <a href="/register">Register</a> to access this site`);
  }
  if(req.params.id in urlDatabase) {
    let userId = req.user.id;
    let url = urlDatabase[req.params.id];
    url.shortURL = req.params.id;

    res.render("urls_show", {url: url});
  } else {
    res.status(401).send(`You should use a correct shortURL <a href="/login">Login</a>
    or register <a href="/register">Register</a> to access this site`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    let URL = "http://" + longURL;
    res.redirect(longURL);
    return ;
  } else {
    res.status(400).send(`You shoud put right shortURL<br>Go to
    <a href="/urls">login</a> in page<br>or go to <a href="/register">
    Register</a> page`);
  }
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.user };
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
        req.session["userId"] = users[user].id;
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

  let data = {
    longURL: "http://" + req.body.longURL,
    userID: req.user.id
  };

  urlDatabase[randomId] = data;
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.user.id
  };
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.user;
  if(!user_id) {
    req.session = null;;
   res.redirect('/login');
 } else {
  delete urlDatabase[req.params.id];
   res.redirect('/urls');
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//initilize app

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

