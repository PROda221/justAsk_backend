// Set up Multer storage configuration
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const { verifyToken } = require("./authentication");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ProfileImgs");
  },
  filename: async function (req, file, cb) {
    let verified = await verifyToken(req.headers["authorization"]);
    cb(null, `${verified.username}-profilePic-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const deleteExistingImage = async (currentPath) => {
  const existingImagePath = `ProfileImgs/${currentPath}`; // Adjust the path as needed

  fs.unlink(existingImagePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Error deleting existing image' });
    }
  });
};

const uploadAndCheckFile = (req, res, next) => {
    verifyToken(req.headers["authorization"]).then((verified) => {
      if (verified) {
        upload.single("profileImg")(req, res, function (err) {
          if (err) {
            return res.status(400).send({ error: "File upload error" });
          }
          req.verifiedUser = verified;
          next();
        });
      } else {
        return res.status(401).send({ error: "Unauthorized" });
      }
    }).catch(err => res.status(500).send({ error: "Server error during verification" }));
  };

module.exports = {
  uploadAndCheckFile,
  deleteExistingImage
};
