const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};


const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
};
const authenticateUser = (email, password, users) => {
  const user = getUserByEmail(email, users);
  if ((user && bcrypt.compareSync(password, user.password)) || (user && password === user.password))
    return user;
  }
  const getUserUrls = (uniqueID, urlDatabase) => {
    const userDB = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === uniqueID) {
        userDB[shortURL] = urlDatabase[shortURL];
      }
    }
    return userDB;
  };

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


const getUrl = (shortURL, urlDatabase) => {
  for (let url in urlDatabase) {
    if (url === shortURL) {
      return url;
    }
  }
};
const addNewUrl = (longURL, userID, urlDatabase) => {
  if (longURL) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID };
    return shortURL;
  }
};


module.exports = {
  generateRandomString,
  getUserByEmail,
  addNewUser,
  authenticateUser,
  getUserUrls,
  getUrl,
  addNewUrl,


}
