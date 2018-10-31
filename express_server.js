const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({entended: true}));
app.set("view engine", "ejs")

function generateRandomString() {
  let randomString = "";
  let possibleLettersAndNumbers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += possibleLettersAndNumbers.charAt(Math.floor(Math.random() * possibleLettersAndNumbers.length));
  }

  return randomString
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(templateVars)
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
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><bod>Hello <b>World</></body></html>\n")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});