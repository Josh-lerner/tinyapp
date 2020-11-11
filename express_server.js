const express = require("express");
var cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

let random = function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


// getting login & cookie
app.post('/login', function (req, res) {
  res.cookie('username', req.body.username);
 console.log(req.body.username);
  res.redirect(`/urls/`);
})


app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;  // Log the POST request body to the console;
  let shortUrl = random();
  urlDatabase[shortUrl] = longUrl;

  res.redirect(`/urls/${shortUrl}`);         

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);  // must include http
});


app.set("view engine", "ejs");


// redirect so urls is homepage
app.get("/", (req, res) => {
  res.redirect(`/urls/`)
});

// urls renders urls_index
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase,
   };
  res.render("urls_index", templateVars);
});

// the add new page rendered from urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// the page for specific short urls, rendered from urls_show
app.get("/urls/:shortURL", (req, res) => { 
  const templateVars = { 
    username: req.cookies["username"],
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
  res.clearCookie('username')
  res.redirect('/')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});