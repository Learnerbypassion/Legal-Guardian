const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    userType: {
      type: String,
      enum: ["freelancer", "student", "business", "general"],
      default: "general",
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Hindi", "Bengali"],
      default: "English",
    },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
