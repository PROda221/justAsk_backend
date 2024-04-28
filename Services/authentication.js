const jwt = require("jsonwebtoken");
const secretKey = "$ThereIsNoTomorrow$";

const getToken = (user) => {
  return jwt.sign(
    { username: user.username, password: user.password, id: user._id },
    secretKey
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, secretKey);
};

module.exports = {
  getToken,
  verifyToken,
};
