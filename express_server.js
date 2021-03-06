const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt')

app.use(bodyParser.urlencoded({entended: true}));
app.use(cookieSession( {
  name: 'session',
  keys: ["purple-monkey-dishwasher"],
  maxAge: 10 * 60 * 1000 //expires after 10 minutes
}))

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
    id: "randomUser1ID",
    email: "chrisstanarsenault@gmail.com",
    password: "rainstorm4"
  },
  "randomUser2ID": {
    id: "randomUser2ID",
    email: "hello@midge.ca",
    password: "hijinx182"
  }
}

// function to check session to see if a user is already logged on.  Thanks to Sylvain Junca for the tip for this great helper function
const userLoggedOn = (req) => req.session.user_ID;
//function to check if item belongs to the logged in user.
const userIsOwner = (req) => {
  return (req.session.user_ID === urlDatabase[req.params.id]["userID"])
};

// creates object storing urls belonging to logged in user.
const urlsForUser = (id) => {
  const userURL = {}
  for (each in urlDatabase) {
    if (urlDatabase[each]["userID"] === id) {
      userURL[each] = urlDatabase[each];
    };
  };
  return userURL;
}

app.get("/", (req, res) => {
  if (userLoggedOn(req)) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  if (userLoggedOn(req)) {
    let templateVars = {
      urls: urlsForUser(req.session.user_ID),
      user: users[req.session.user_ID],
      user_ID: req.session.user_ID
    }
    res.render("urls_index", templateVars);
  } else {
    res.send(`Time to <a href='/login'>log in </a> or <a href='/register'>register</a>`);
  }
});

app.get("/urls/new", (req, res) => {
  if (userLoggedOn(req)) {
  let templateVars = {
    user: users[req.session.user_ID],
    urls: urlDatabase,
    user_ID: req.session.user_ID
  }
  res.render("urls_new", templateVars);
 } else {
    res.redirect("/login")
  }
});

app.post("/urls", (req, res) => {
  if (userLoggedOn(req)){
  let shortString = generateRandomString()
  urlDatabase[shortString] = {
    url:req.body["longURL"],
    userID: req.session.user_ID}
  res.redirect(`/urls/${shortString}`);
  } else {
    res.send('Make sure to log in if you want to do some URL shortening!')
  }
});

app.get("/urls/:id", (req, res) => {
  if(!userLoggedOn(req)) {
    res.send('Please login or register')
  } if (userIsOwner(req)) {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase[req.params.id],
    user: users[req.session.user_ID],
    user_ID: req.session.user_ID
  }
  res.render("urls_show", templateVars);
  } else {
    res.send('Access Denied!')
  }
});

app.post("/urls/:id", (req, res) => {
  if (userLoggedOn(req)) {
    if (userIsOwner(req)) {
    urlDatabase[req.params.id]["url"] = req.body[req.params.id];
    res.redirect('/urls');
    } else {
      res.send("Turn away!  You don't belong here!  Login or register!")
    }
  } else {
    res.send(`Why don't you try <a href="/login">logging in</a> or <a href="/register">registering</a>?`)
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (userIsOwner(req)) {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
  }
});

app.get("/login", (req, res) => {
  if (userLoggedOn(req)) {
    res.redirect('/urls')
  }

  let templateVars = {
     user_ID: users[req.session.user_ID]
   }
  res.render("user-login", templateVars)
})

app.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    for (user in users) {
      if ((users[user]["email"] === req.body.email) && (bcrypt.compareSync(req.body.password, users[user]["password"]))) {
        req.session.user_ID = users[user].id;
        res.redirect('/');
        return
      }
    }
    res.status(403).send(`Oops, either your email or password was incorrect!  Try <a href="/login">logging in</a> again!`)
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_ID;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  if (userLoggedOn(req)) {
    res.redirect('/urls')
  }
  let templateVars = {
    user: users[req.session.user_ID]
  }
  res.render('user-register', templateVars)
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  let emailDoesExist = false;

  if(email && password) {
    for (user in users) {
      if (users[user]["email"] === email) {
        emailDoesExist = true;
      }
    }

    if (!emailDoesExist) {
      let randomUserID = generateRandomString()
      req.session.user_ID = randomUserID;
      users[randomUserID] = {
        id: randomUserID,
        email: email,
        password: hashedPassword
      };
    res.redirect("/urls")
  } else {
    res.status(400).send(`Your email already exists! Try <a href="/register"> registering </a> again with a different email!`)
    }
  } else {
    res.status(400).send(`Fill out all forms properly!  Try <a href="/register"> registering </a> again!`)
  }
  // if (emailDoesExist) {
  //     res.status(400).send(`Your email already exists! Try <a href="/register"> registering </a> again with a different email!`)
  //   } else {
  //     res.status(400).send(`Fill out all forms properly!  Try <a href="/register"> registering </a> again!`)
  //   }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]['url'];
  res.redirect(longURL);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><bod>Hello <b>World</></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

