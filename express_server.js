const express = require("express");
const app = express();
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

app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL;  // Log the POST request body to the console;
  let shortUrl = random();
  urlDatabase[shortUrl] = longUrl;

  res.redirect(`/urls/${shortUrl}`);         // Respond with 'Ok' (we will replace this)

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);  // must include http
});


app.set("view engine", "ejs");



app.get("/", (req, res) => {
  res.redirect(`/urls/`)
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) =>{
console.log(req.params.shortURL);
delete urlDatabase[req.params.shortURL];
console.log(urlDatabase)
res.redirect(`/urls/`);
})    
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});