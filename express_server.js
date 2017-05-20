
var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//anon function for user check through middleware
app.use((req, res, next) => {
  req.user = users[req.cookies.userid];
  res.locals.user = req.user;
  next();
});
app.use("/urls", redirectMiddleware);
function redirectMiddleware(req, res, next){
  if (req.user == undefined){
    res.redirect("/login");
  } else {
    next();
  }
};


const users = {
  "j9eN2d": {
    id: "j9eN2d",
    email: "test@user.com",
    password: "123456"
  },
  "abc123": {
    id: "abc123",
    email: "test2@user.com",
    password: "123456"
  }

}
var urlDatabase = {
  "b2xVn2": {
    userid: "j9eN2d",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userid: "abc123",
    longURL: "http://www.google.com"
  }
};

function userSpecificURLS(userid){
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userid === [key].userid) {
      result[key] = urlDatabase[key].longURL;
    }
  }
  return result;
}

function generateRandomString() {
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUWXYZ";

  for (let i = 0; i < 6 ; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return text;
}

app.get("/urls", (req, res) => {
  if (!req.cookies.userid){
    res.send ("Please log in to see your Urls.")
    return;
  };
  const user = users[req.cookies.userid];
  var result = userSpecificURLS(req.cookies.userid)
  let templateVars = { urls: result};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userid: req.cookies.userid
  };
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});



app.get("/login", (req, res) => {
  let templateVars = { user: req.user }
  res.render("login", templateVars)
});



app.post("/login", (req, res) => {
      if(!req.body.email || !req.body.password) {
        res.status(403);
        res.send('Email and Password cannot be empty.');
        return;
      }
      for ( user in users){
        if (users[user].email === req.body.email) {
          if (users[user].password === req.body.password) {
            res.cookie("userid", user);
            res.redirect("/urls");
            return;
          }
        }
      }
      res.status(403).send('No match for Email or Password in the database.<br><a href="/login">return login</a>');
});


app.get("/urls/:id", (req, res) => {

  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL,
   userid: req.cookies.userid };
  console.log(urlDatabase[req.params.id]);
  console.log(req.cookies.userid);
  if ( urlDatabase[req.params.id].userid != req.user.id) {
    res.redirect("/urls");
  } else
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortID].longURL = longURL;
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

  for (user in users) {
    if(users[user].email === req.body.email){
      // console.log('existing email');
      res.status(403);
      res.send('Email or Password exists.');
    }

   if(!req.body.email || !req.body.password) {
    // console.log('empty error');
    res.status(400);
    res.send('Email or Password can not be empty.');
    }

 }
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
