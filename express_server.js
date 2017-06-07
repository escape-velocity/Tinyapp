var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

//create routes

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req,res)=>{
  //let templateVars = { urls: urlDatabase };

  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.userid] }
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  console.log(res.cookie("username"));
});

app.post("/urls", (req, res) => {
  let randomId = generateRandomString();
  urlDatabase[randomId] = "http://" + req.body.longURL
  res.redirect('/urls')
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls')
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


//initilize app

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

