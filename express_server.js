
var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  "j9eN2d": {
    id: "j9eN2d",
    email: "test@user.com",
    password: "123456"
  }
}

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

app.get("/urls", (req, res) => {
  console.log(req.cookies.userid);
  let templateVars = { urls: urlDatabase, user: users[req.cookies.userid] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('urls' + shortURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.userid] };
  console.log("this is the value of long url", urlDatabase[req.params.id]);
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  //console.log(res.cookie("username"));
});

app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.shortID;
  urlDatabase[shortID] = longURL;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase}

  res.render("register", templateVars)
});
app.post("/register",(req, res) =>{
  var user_id = generateRandomString();

  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  }

  res.cookie("userid", user_id);
  res.redirect("/urls");
})

app.get("/debug", (req, res) => {
  res.json(users);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
