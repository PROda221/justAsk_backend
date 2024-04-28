const mongoose = require("mongoose");

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
    adviceGenre: {
      type: [
        {
          type: String,
          enum: allGenres, // This ensures that only values from predefinedStrings are allowed
        },
      ],
      required: true,
    },
  },
  { TimeStamps: true }
);

const Users = mongoose.model("users", UserSchema);

module.exports = Users;
