const PORT = 8080; // default port 8080

const express = require("express");
const app = express();
app.set("view engine", "ejs");

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['go', 'habs'],
}))

const { getUserByEmail, addNewUser, authenticateUser, getUserUrls, getUrl, addNewUrl } = require('./helpers')
const urlDatabase = {};
const users = {};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


// render the register page
app.get("/register", (req, res) => {
  res.render("register")
})

// getUserByEmail checks DB to see if user exists. addNewUser adds the new user to DB, 
// if email exists send 400 code
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  const newUser = getUserByEmail(email, users);
  if (!newUser) {
    req.session['user_id'] = addNewUser(email, password, users); // sets cookie
    return res.redirect(`/login`)
  }
  res.status(403).send("That email is already in use")
})
// render the login page
app.get('/login', (req, res) => {
  res.render("login")
})

// getting login & cookie info not working at top when logged in
app.post('/login', (req, res) => {
  let { email, password } = req.body;
  let newUser = authenticateUser(email, password, users);
  if (newUser) {
    req.session['user_id'] = newUser.id;
    console.log(newUser.id)
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Wrong credentials")
  }
})

// redirect so urls is homepage
app.get("/", (req, res) => {
  res.redirect(`/urls`)
});

// renders urls_index if client is logged in otherwise sends error
app.get("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const userDB = getUserUrls(userId, urlDatabase);
  const templateVars = {
    urls: urlDatabase,
    userUrls: userDB,
    user: user
  };
  if (!user) {
    res.status(403).send("Error, please go register at /register, or sign in at /login")
  } else {
    res.render("urls_index", templateVars);
  }
});

// uses addNewUrl function and then adds a random shorturl tied to an inputed long url into url database otherwise sends error message
app.post("/urls", (req, res) => {
  const newId = req.session['user_id']; 
  const longURL = req.body.longURL;
  if (Object.keys(users).includes(newId)) {
    if (longURL) {
      const newShort = addNewUrl(longURL, newId, urlDatabase);
      res.redirect(`/urls/${newShort}`);
    } 
    }else {
      res.status(403).send("Oops")
  } 
});

// the add new page rendered from urls_new, lets you access if you're signed in, otherwise redirects to login
app.get("/urls/new", (req, res) => {
  const user = users[req.session['user_id']]
  let templateVars = { user };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

// if url for the id match redirect to longURL, otherwise send error
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (getUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("uhoh 94")
  }
});

// the page for specific short urls, rendered from urls_show, only accessible if logged in
// otherwise send appropriate error messages
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const definedURL = getUrl(shortURL, urlDatabase);
  const currentUser = users[req.session['user_id']];
  if (!definedURL) {
    res.status(404).send("uhoh 124 short id doesnt exist")
  } else if (currentUser.id === urlDatabase[shortURL].userID && definedURL) {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.session['user_id']]
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send("You can't access someone else's links")
  }
});


// update a previous url from the DB, only works if right client is logged in, send error message
app.post('/urls/:shortURL/', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = req.session['user_id'];
  const longURL = req.body.longURL;
  // console.log(shortURL)
  // console.log(currentUser)
  // console.log(longURL)
  if (currentUser === urlDatabase[shortURL].userID) {
    if (longURL) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    }
  };
  res.status(404).send("uhoh 134")
});
// Delete an item from the db, only works if right client is logged in, otherwise send error message
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['user_id']];
  if (currentUser.id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(404).send("You can't delete someone else's links")
  }
});
// log out and delete cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});