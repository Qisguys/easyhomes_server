const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  data: Buffer,       // Store image data as a Buffer
  contentType: String, // Store MIME type (e.g., image/png, image/jpeg)
  filename: String,    // Store original filename
}, { _id: false }); // Don't create an _id for the image subdocument

const homeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  street: { type: String, required: true },
  town: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String, required: true },
  pluscode: { type: String, required: true },
  rentprice: { type: String, required: true },
  images: [imageSchema], // Array of images with Buffer data
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "Renter", required: true },
  commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }],
}, { timestamps: true });

const Home = mongoose.model("Home", homeSchema);
module.exports = Home;
