const express = require("express");
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080



let random = function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};


const urlDatabase = {};

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
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const cookieExist = function(cookie, users) {
  for (const user in users) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

// register adds a new user to user db, saves id, email and password, stores email as a cookie, redirects home
// if email exists send 400 code
app.post("/register", (req, res) => {
  let { email, password } = req.body
  //  console.log(email)
  for (const user in users) {
    // console.log(user)
    if (req.body.email === users[user].email) {
      return res.status(403).send("That email is already in use")
    }
    // links for pop up alert instead of sending
    //stackoverflow.com/questions/27812639/display-alert-message-in-browser-using-node-js/27813908
    // https://www.npmjs.com/package/alert-node 
  }
  let id = random();
  const newUser = {
    id: id,
    email: email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  users[id] = newUser;
  // if r.b.email === users.user.email
   console.log(users)
  res.redirect(`/login`)
})

app.get('/login', (req, res) => {
  res.render("login")
})

// getting login & cookie
app.post('/login', (req, res) => {
  let regUser = false
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        regUser = true
        res.cookie('user_id', users[user].id);
      }
    }
  }
  // trying to solve 'Cannot set headers after they are sent to the client'
  if (!regUser) {
    res.status(403).send("Wrong credentials")
  }
  res.redirect(`/urls`);
})

app.post("/urls", (req, res) => {
  let shortURL = random();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  // console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);  // must include http
});


app.set("view engine", "ejs");


// redirect so urls is homepage
app.get("/", (req, res) => {
  res.redirect(`/urls/`)
});

// render the register page
app.get("/register", (req, res) => {
  res.render("register")
})



// urls renders urls_index
app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// the add new page rendered from urls_new
app.get("/urls/new", (req, res) => {
  if (!cookieExist(req.cookies["user_id"], users)){
    res.redirect("/login");
  } else {
  const templateVars = {
    user_id: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
}
});

// the page for specific short urls, rendered from urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[`${req.params.shortURL}`]
  };
  res.render("urls_show", templateVars);
});

// Delete an item from the db
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  // console.log(urlDatabase)
  res.redirect(`/urls/`);
})

// edit item 
app.post('/urls/:shortURL', (req, res) => {
  const shortUrl = (req.params.shortURL)
  urlDatabase[shortUrl] = req.body.longURL; // from urls_show.. get name from input field/form 
  // console.log(urlDatabase)
  res.redirect(`/urls/${shortUrl}`);
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});