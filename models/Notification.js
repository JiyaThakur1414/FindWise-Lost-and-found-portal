const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "claim",
        "approved",
        "rejected",
        "returned",
        "match",
      ],
      required: true,
    },

    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },

    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);