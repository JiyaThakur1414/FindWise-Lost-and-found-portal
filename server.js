const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Item = require("./models/Item");
const Claim = require("./models/Claim");
const Notification = require("./models/Notification");

dotenv.config();

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

// Important for Base64 images
app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log(
      "MongoDB connection error:",
      error.message
    );
  });


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("FindWise server is running");
});


// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "Register error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please enter email and password",
      });
    }

    const user =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET ||
        "findwise_secret",

      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// CREATE ITEM
// ===============================

app.post("/api/items", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      location,
      date,
      type,
      image,
      contact,
      reportedBy,
      linkedItem,
    } = req.body;


    // ===============================
    // REQUIRED FIELDS
    // ===============================

    if (
      !name ||
      !description ||
      !category ||
      !location ||
      !date ||
      !type
    ) {
      return res.status(400).json({
        message:
          "Please fill all required fields",
      });
    }


    // ===============================
    // OPTIONAL LINKED ITEM
    // FOUND ITEM ONLY
    // ===============================

    let linkedLostItem = null;

    if (
      type === "found" &&
      linkedItem
    ) {
      linkedLostItem =
        await Item.findById(
          linkedItem
        );

      if (!linkedLostItem) {
        return res.status(404).json({
          message:
            "Related lost item not found",
        });
      }

      if (
        linkedLostItem.type !== "lost"
      ) {
        return res.status(400).json({
          message:
            "You can only link a found item to a lost item",
        });
      }

      if (
        linkedLostItem.status ===
        "Returned"
      ) {
        return res.status(400).json({
          message:
            "This lost item has already been returned",
        });
      }
    }


    // ===============================
    // CREATE ITEM
    // ===============================

    const item = await Item.create({
      name,
      description,
      category,
      location,
      date,
      type,

      image: image || "",

      contact: contact || "",

      reportedBy:
        reportedBy || null,

      linkedItem:
        type === "found" &&
        linkedItem
          ? linkedItem
          : null,

      status:
        type === "lost"
          ? "Lost"
          : "Found",
    });


    // ===============================
    // MANUAL MATCH NOTIFICATION
    // ===============================

    /*
      If a person posts a Found Item
      and manually selects a Lost Item,
      notify the person who posted
      the Lost Item.

      No AI is used here.
    */

    if (
      type === "found" &&
      linkedLostItem &&
      linkedLostItem.reportedBy
    ) {
      const finderId =
        reportedBy
          ? reportedBy.toString()
          : "";

      const ownerId =
        linkedLostItem.reportedBy.toString();

      // Do not notify yourself
      if (finderId !== ownerId) {
        await Notification.create({
          user:
            linkedLostItem.reportedBy,

          message:
            `A found item has been linked to your lost item: ${linkedLostItem.name}.`,

          type: "match",

          relatedItem: item._id,
        });
      }
    }


    // ===============================
    // RESPONSE
    // ===============================

    res.status(201).json({
      message:
        "Item posted successfully",

      item,
    });

  } catch (error) {
    console.log(
      "Create item error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// GET ALL ITEMS
// ===============================

app.get("/api/items", async (req, res) => {
  try {
    const items =
      await Item.find()
        .populate(
          "reportedBy",
          "name email"
        )
        .populate("linkedItem")
        .sort({
          createdAt: -1,
        });

    res.status(200).json(items);

  } catch (error) {
    console.log(
      "Get items error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// SUBMIT CLAIM
// ===============================

app.post("/api/claims", async (req, res) => {
  try {
    const {
      item,
      claimedBy,
      message,
    } = req.body;


    // ===============================
    // VALIDATION
    // ===============================

    if (
      !item ||
      !claimedBy ||
      !message
    ) {
      return res.status(400).json({
        message:
          "Please provide all claim details",
      });
    }


    // ===============================
    // FIND ITEM
    // ===============================

    const foundItem =
      await Item.findById(item);

    if (!foundItem) {
      return res.status(404).json({
        message: "Item not found",
      });
    }


    // ===============================
    // ONLY FOUND ITEMS
    // ===============================

    if (
      foundItem.type !== "found"
    ) {
      return res.status(400).json({
        message:
          "Only found items can be claimed",
      });
    }


    // ===============================
    // RETURNED ITEM
    // ===============================

    if (
      foundItem.status ===
      "Returned"
    ) {
      return res.status(400).json({
        message:
          "This item has already been returned",
      });
    }


    // ===============================
    // CANNOT CLAIM OWN ITEM
    // ===============================

    if (
      foundItem.reportedBy &&
      foundItem.reportedBy.toString() ===
        claimedBy.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot claim your own found item",
      });
    }


    // ===============================
    // DUPLICATE CLAIM
    // ===============================

    const existingClaim =
      await Claim.findOne({
        item,
        claimedBy,
      });

    if (existingClaim) {
      return res.status(400).json({
        message:
          "You have already submitted a claim for this item",
      });
    }


    // ===============================
    // CREATE CLAIM
    // ===============================

    const claim =
      await Claim.create({
        item,
        claimedBy,
        message,
        status: "Pending",
      });


    // ===============================
    // NOTIFY FINDER
    // ===============================

    if (
      foundItem.reportedBy &&
      foundItem.reportedBy.toString() !==
        claimedBy.toString()
    ) {
      await Notification.create({
        user:
          foundItem.reportedBy,

        message:
          `Someone has claimed your found item: ${foundItem.name}.`,

        type: "claim",

        relatedItem:
          foundItem._id,

        relatedClaim:
          claim._id,
      });
    }


    // ===============================
    // POPULATE CLAIM
    // ===============================

    const populatedClaim =
      await Claim.findById(
        claim._id
      )
        .populate("item")
        .populate(
          "claimedBy",
          "name email"
        );


    res.status(201).json({
      message:
        "Claim submitted successfully",

      claim:
        populatedClaim,
    });

  } catch (error) {
    console.log(
      "Submit claim error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// GET MY CLAIMS
// ===============================

app.get(
  "/api/claims/my/:userId",
  async (req, res) => {
    try {
      const claims =
        await Claim.find({
          claimedBy:
            req.params.userId,
        })
          .populate("item")
          .populate(
            "claimedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json(
        claims
      );

    } catch (error) {
      console.log(
        "My claims error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// GET CLAIMS RECEIVED
// ===============================

app.get(
  "/api/claims/received/:userId",
  async (req, res) => {
    try {
      const items =
        await Item.find({
          reportedBy:
            req.params.userId,

          type: "found",
        });

      const itemIds =
        items.map(
          (item) => item._id
        );

      const claims =
        await Claim.find({
          item: {
            $in: itemIds,
          },
        })
          .populate("item")
          .populate(
            "claimedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json(
        claims
      );

    } catch (error) {
      console.log(
        "Received claims error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// APPROVE CLAIM
// ===============================

app.put(
  "/api/claims/:id/approve",
  async (req, res) => {
    try {

      // ===============================
      // FIND CLAIM
      // ===============================

      const claim =
        await Claim.findById(
          req.params.id
        );

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }


      // ===============================
      // ONLY PENDING
      // ===============================

      if (
        claim.status !== "Pending"
      ) {
        return res.status(400).json({
          message:
            "This claim has already been processed",
        });
      }


      // ===============================
      // FIND ITEM
      // ===============================

      const item =
        await Item.findById(
          claim.item
        );

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }


      // ===============================
      // RETURNED ITEM
      // ===============================

      if (
        item.status ===
        "Returned"
      ) {
        return res.status(400).json({
          message:
            "This item has already been returned",
        });
      }


      // ===============================
      // APPROVE CLAIM
      // ===============================

      claim.status = "Approved";

      await claim.save();


      // ===============================
      // MARK ITEM CLAIMED
      // ===============================

      item.status = "Claimed";

      await item.save();


      // ===============================
      // NOTIFY CLAIMANT
      // ===============================

      if (claim.claimedBy) {
        await Notification.create({
          user:
            claim.claimedBy,

          message:
            `Your claim for ${item.name} has been approved.`,

          type: "approved",

          relatedItem:
            item._id,

          relatedClaim:
            claim._id,
        });
      }


      // ===============================
      // REJECT OTHER PENDING CLAIMS
      // ===============================

      const otherPendingClaims =
        await Claim.find({
          item: item._id,

          _id: {
            $ne: claim._id,
          },

          status: "Pending",
        });


      for (
        const otherClaim
        of otherPendingClaims
      ) {

        otherClaim.status =
          "Rejected";

        await otherClaim.save();


        if (
          otherClaim.claimedBy
        ) {
          await Notification.create({
            user:
              otherClaim.claimedBy,

            message:
              `Another claim for ${item.name} was approved, so your claim was rejected.`,

            type: "rejected",

            relatedItem:
              item._id,

            relatedClaim:
              otherClaim._id,
          });
        }
      }


      // ===============================
      // RETURN UPDATED CLAIM
      // ===============================

      const updatedClaim =
        await Claim.findById(
          claim._id
        )
          .populate("item")
          .populate(
            "claimedBy",
            "name email"
          );


      res.status(200).json({
        message:
          "Claim approved successfully",

        claim:
          updatedClaim,
      });

    } catch (error) {
      console.log(
        "Approve claim error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// REJECT CLAIM
// ===============================

app.put(
  "/api/claims/:id/reject",
  async (req, res) => {
    try {

      const claim =
        await Claim.findById(
          req.params.id
        );

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }


      // ===============================
      // ONLY PENDING
      // ===============================

      if (
        claim.status !== "Pending"
      ) {
        return res.status(400).json({
          message:
            "This claim has already been processed",
        });
      }


      // ===============================
      // FIND ITEM
      // ===============================

      const item =
        await Item.findById(
          claim.item
        );


      // ===============================
      // REJECT
      // ===============================

      claim.status =
        "Rejected";

      await claim.save();


      // ===============================
      // NOTIFY CLAIMANT
      // ===============================

      if (
        claim.claimedBy &&
        item
      ) {
        await Notification.create({
          user:
            claim.claimedBy,

          message:
            `Your claim for ${item.name} has been rejected.`,

          type: "rejected",

          relatedItem:
            item._id,

          relatedClaim:
            claim._id,
        });
      }


      // ===============================
      // UPDATED CLAIM
      // ===============================

      const updatedClaim =
        await Claim.findById(
          claim._id
        )
          .populate("item")
          .populate(
            "claimedBy",
            "name email"
          );


      res.status(200).json({
        message:
          "Claim rejected successfully",

        claim:
          updatedClaim,
      });

    } catch (error) {
      console.log(
        "Reject claim error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// MARK ITEM AS RETURNED
// ===============================

app.put(
  "/api/items/:id/returned",
  async (req, res) => {
    try {

      // ===============================
      // FIND ITEM
      // ===============================

      const item =
        await Item.findById(
          req.params.id
        );

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }


      // ===============================
      // ALREADY RETURNED
      // ===============================

      if (
        item.status ===
        "Returned"
      ) {
        return res.status(400).json({
          message:
            "Item is already marked as returned",
        });
      }


      // ===============================
      // SAVE LINKED LOST ITEM
      // ===============================

      let linkedLostItem = null;


      // ===============================
      // MARK CURRENT ITEM RETURNED
      // ===============================

      item.status = "Returned";

      await item.save();


      // ===============================
      // FOUND -> LOST
      // ===============================

      if (
        item.type === "found" &&
        item.linkedItem
      ) {

        linkedLostItem =
          await Item.findById(
            item.linkedItem
          );


        if (linkedLostItem) {

          linkedLostItem.status =
            "Returned";

          await linkedLostItem.save();
        }
      }


      // ===============================
      // LOST -> FOUND PROTECTION
      // ===============================

      if (
        item.type === "lost"
      ) {

        await Item.updateMany(
          {
            linkedItem:
              item._id,
          },

          {
            status:
              "Returned",
          }
        );
      }


      // ===============================
      // REJECT PENDING CLAIMS
      // ===============================

      const pendingClaims =
        await Claim.find({
          item: item._id,

          status: "Pending",
        });


      for (
        const pendingClaim
        of pendingClaims
      ) {

        pendingClaim.status =
          "Rejected";

        await pendingClaim.save();


        if (
          pendingClaim.claimedBy
        ) {
          await Notification.create({
            user:
              pendingClaim.claimedBy,

            message:
              `The item ${item.name} has been marked as returned, so your claim was closed.`,

            type: "rejected",

            relatedItem:
              item._id,

            relatedClaim:
              pendingClaim._id,
          });
        }
      }


      // ===============================
      // RETURNED NOTIFICATIONS
      // ===============================

      const usersToNotify = [];


      // Finder
      if (item.reportedBy) {
        usersToNotify.push(
          item.reportedBy.toString()
        );
      }


      // Original owner
      if (
        linkedLostItem &&
        linkedLostItem.reportedBy
      ) {
        usersToNotify.push(
          linkedLostItem.reportedBy.toString()
        );
      }


      // Remove duplicate users
      const uniqueUsers = [
        ...new Set(usersToNotify),
      ];


      for (
        const userId
        of uniqueUsers
      ) {

        await Notification.create({
          user: userId,

          message:
            `The item ${item.name} has been marked as returned.`,

          type: "returned",

          relatedItem:
            item._id,
        });
      }


      // ===============================
      // GET UPDATED ITEM
      // ===============================

      const updatedItem =
        await Item.findById(
          item._id
        )
          .populate(
            "linkedItem"
          );


      res.status(200).json({
        message:
          "Item and related item marked as returned",

        item:
          updatedItem,
      });

    } catch (error) {
      console.log(
        "Mark returned error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// GET NOTIFICATIONS
// ===============================

app.get(
  "/api/notifications/:userId",
  async (req, res) => {
    try {

      const notifications =
        await Notification.find({
          user:
            req.params.userId,
        })
          .populate(
            "relatedItem"
          )
          .populate(
            "relatedClaim"
          )
          .sort({
            createdAt: -1,
          });


      res.status(200).json(
        notifications
      );

    } catch (error) {

      console.log(
        "Get notifications error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// GET UNREAD COUNT
// ===============================

app.get(
  "/api/notifications/:userId/unread-count",
  async (req, res) => {
    try {

      const count =
        await Notification.countDocuments({
          user:
            req.params.userId,

          isRead: false,
        });


      res.status(200).json({
        count,
      });

    } catch (error) {

      console.log(
        "Unread notification count error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// MARK ONE AS READ
// ===============================

app.put(
  "/api/notifications/:id/read",
  async (req, res) => {
    try {

      const notification =
        await Notification.findById(
          req.params.id
        );


      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }


      notification.isRead = true;

      await notification.save();


      res.status(200).json({
        message:
          "Notification marked as read",

        notification,
      });

    } catch (error) {

      console.log(
        "Mark notification read error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// MARK ALL AS READ
// ===============================

app.put(
  "/api/notifications/:userId/read-all",
  async (req, res) => {
    try {

      await Notification.updateMany(
        {
          user:
            req.params.userId,

          isRead: false,
        },

        {
          isRead: true,
        }
      );


      res.status(200).json({
        message:
          "All notifications marked as read",
      });

    } catch (error) {

      console.log(
        "Mark all notifications error:",
        error.message
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `FindWise server running on port ${PORT}`
    );
  }
);

//FindWise1262