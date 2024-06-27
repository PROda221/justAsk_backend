const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const {responseStrings} = require('../Constants/responseStrings')

const allGenres = [
  "Health & Fitness",
  "Relationships",
  "Psycology",
  "Financial",
  "Career",
  "Education",
  "Entrepreneurship",
  "Politics",
  "Diet",
  "Fashion",
  "Family",
  "Pets",
  "Medicine",
  "Cooking",
  "Movies",
  "Music",
  "Games",
  "Vehicals",
  "Plants",
  "Yoga",
  "Culture",
  "Dancing",
  "Spiritual",
  "Technology",
  "Coding",
  "Traveling",
];

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    deviceToken: { type: String },
    salt: { type: String },
    adviceGenre: {
      type: [
        {
          type: String,
          enum: allGenres, // This ensures that only values from predefinedStrings are allowed
        },
      ],
      required: true,
    },
    status: { type: String },
    filename: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPass = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPass;
  next();
});

UserSchema.pre(["findOneAndUpdate"], async function (next) {
  const data = this.getUpdate();
  if (data.password) {
    const salt = randomBytes(16).toString();
    const hashedPass = createHmac("sha256", salt)
      .update(data.password)
      .digest("hex");

    data.salt = salt;
    data.password = hashedPass;
    next();
  }
  next();
});

UserSchema.static("matchPassword", async function (username, password) {
  const user = await this.findOne({ username });
  if (!user) {
    return null
  }

  const salt = user.salt;
  const hashedPass = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (hashedPass !== userProvidedHash) {
    throw new Error(responseStrings.loginAccount.incorrectPassCondition);
  }
  return { ...user._doc, password: undefined, salt: undefined };
});

const Users = mongoose.model("users", UserSchema);

module.exports = Users;
