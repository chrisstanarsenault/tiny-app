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
  "b2xVn2": {
    "url": "http://www.lighthouselabs.ca",
    "userID": "randomUser1ID"
  },
  "9sm5xK": {
    "url": "http://www.google.com",
    "userID": "randomUser2ID"
  }
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
    user_ID: req.cookies.user_ID
     };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_ID: req.cookies.user_ID
  }
  if (!req.cookies.user_ID) {
    res.redirect("/login")
  }else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // debug statement to see POST parameters
  let shortString = generateRandomString()
  urlDatabase[shortString] = {
    url:req.body["longURL"],
    userID: req.cookies.user_ID}
  res.redirect(`/urls/${shortString}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user_ID: req.cookies.user_ID
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["url"] = req.body[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

app.get("/login", (req, res) => {
   let templateVars = {
     user_ID: req.cookies.user_ID
   }
  res.render("user-login", templateVars)
})

app.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    for (user in users) {
      if ((users[user]["email"] === req.body.email) && (users[user]["password"] === req.body.password)) {
        res.cookie('user_ID', users[user].id );
        res.redirect('/');
        return
      }
    }
    res.status(403).send()
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render('user-register')
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let emailDoesExist = false;

  if(email && password) {
    for (user in users) {
      if (users[user]["email"] === email) {
      emailDoesExist = true;
    }
  }

  if (!emailDoesExist) {
    let randomUserID = generateRandomString()
    res.cookie("user_ID", randomUserID)
    users[randomUserID] = {
      id: randomUserID,
      email: email,
      password: password
    };
    res.redirect("/urls")
    }

  if (emailDoesExist) {
      res.status(400).send("Error 400 - Your email already exisits!")
    } else {
      res.status(400).send("Error 400 - Fill out all forms properly!")
    }
  }
});

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

