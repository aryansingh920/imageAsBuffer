const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://Admin_Aryan:test123@cluster0.ixtp3tq.mongodb.net/imageTest?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((r) => console.log("Connected"))
  .catch((e) => console.log(e));

// Create a schema for your image data
const imageSchema = new mongoose.Schema({
  name: String,
  data: { type: Buffer },
  contentType: String,
});

// Create a model based on the schema
const Image = mongoose.model("Image", imageSchema);

// Configure Multer for image upload
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const fileFilter = function (req, file, cb) {
  // only accept jpeg, png, and gif files
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage, // specify the storage engine to use
  fileFilter: fileFilter, // specify the file filter function
  limits: {
    // fileSize: 1024 * 1024, // specify the maximum file size in bytes
  },
});

app.get("/", (req, res) => {
  res.render("upload", { message: null, error: null });
});

// Set up an endpoint to handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req.file);
  try {
    const image = new Image({
      name: req.file.originalname,
      data: req.file.buffer, // Use the buffer property instead of req.file.fieldname
      contentType: req.file.mimetype,
    });

    await image.save();
    res.render("upload", {
      message: "Image uploaded successfully!",
      error: null,
    });
  } catch (err) {
    console.log(err);
    res.render("upload", {
      message: null,
      error: "Error uploading image.",
    });
  }
});

// Set up an endpoint to fetch the image
app.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).send("Image not found.");
    }

    res.set("Content-Type", image.contentType);
    res.send(image.data);
  } catch (err) {
    res.status(400).send("Error fetching image.");
  }
});

app.listen(9999, () => {
  console.log("Server listening on port 9999");
});
