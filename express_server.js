const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({entended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  let randomString = "";
  let possibleLettersAndNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += possibleLettersAndNumbers.charAt(Math.floor(Math.random() * possibleLettersAndNumbers.length));
  }

  return randomString;
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "randomUser1ID": {
    id: "Chris Arsenault",
    email: "chrisstanarsenault@gmail.com",
    password: "rainstorm4"
  },
  "randomUser2ID": {
    id: "Maija Reisenauer",
    email: "hello@midge.ca",
    password: "hijinx182"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
     };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // debug statement to see POST parameters
  let shortString = generateRandomString()
  urlDatabase[shortString] = req.body.longURL;
  res.redirect(`/urls/${shortString}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render('user-register')
})

app.post("/register", (req, res) => {
  //res.cookie("register", req.body.email)
  const userName = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  let randomUserID = generateRandomString()
  users[randomUserID] = {id:userName, email:email, password:password};
  console.log(users)
  res.redirect("urls")
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><bod>Hello <b>World</></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});