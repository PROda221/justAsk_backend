const Users = require('../Modals/users')
const jwt = require("jsonwebtoken");
const secretKey = "$ThereIsNoTomorrow$";

const getToken = (user) => {
  return jwt.sign(
    { username: user.username, emailId: user.emailId, id: user._id },
    secretKey
  );
};

const findToken = (token) => {
  if(!token){
    return false;
  }
  const access_token = token.split("Bearer ");
  if (!access_token[1]) {
    return false;
  } return access_token[1]
}

const verifyToken = async(token) => {
  let access_token = findToken(token)
    if(access_token){
      let verified = jwt.verify(access_token, secretKey); 
      let authorizedUser = await Users.find({ _id: verified.id });
      return authorizedUser.length > 0 ? verified : false
    }
    
};

module.exports = {
  getToken,
  verifyToken,
  findToken
};
