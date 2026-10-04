const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    contact: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Lost", "Found", "Claimed", "Returned"],
      default: "Lost",
    },

    // For a Found item, this stores
    // the Lost item that it belongs to.
    linkedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    otherLostItem: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);