const bcrypt = require('bcrypt-nodejs');
const saltRounds = bcrypt.genSaltSync(10);




const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

// returns specific user from user db using email
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
};
// checks registered hashed password and user to login password and user
const authenticateUser = (email, password, users) => {
  const user = getUserByEmail(email, users);
  if ((user && bcrypt.compareSync(password, user.password)) || (user && password === user.password))
    return user;
  }
// gets Urls if it matches the id of the person signed in
  const getUserUrls = (uniqueID, urlDatabase) => {
    const userDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === uniqueID) {
        userDB[shortURL] = urlDatabase[shortURL];
      }
    }
    return userDB;
  };

  // adds new user to the DB with a hashed password
const addNewUser = (email, password, users) => {
  if (email && password && users) {
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = {
      id: userID,
      email,
      password: hashedPassword
    };
    users[userID] = newUser;
    return userID;
  }
};

// fetches url from the db that matches shorturl
const getUrl = (shortURL, urlDatabase) => {
  for (let url in urlDatabase) {
    if (url === shortURL) {
      return url;
    }
  }
};

// adds url to the db, generates random shorturl
const addNewUrl = (longURL, userID, urlDatabase) => {
  if (longURL) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID };
    return shortURL;
  }
};


module.exports = {
  getUserByEmail,
  addNewUser,
  authenticateUser,
  getUserUrls,
  getUrl,
  addNewUrl,


}
