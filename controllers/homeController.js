const fs = require("fs");
const multer = require("multer");
const Home = require("../models/Home");
const Renter = require('../models/Renter');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
}).array("images", 5); // Allow multiple files (up to 5)

const homeSender = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const {
        title, name, mobile, street, town, district,
        pincode, pluscode, rentprice
      } = req.body;

      if (!title || !name || !mobile || !street || !town || !district || !pincode || !pluscode || !rentprice) {
        return res.status(400).json({ error: "All required fields must be filled" });
      }

      const renter = await Renter.findById(req.renterId);
      if (!renter) return res.status(404).json({ error: "Renter not found" });

      // Process uploaded images
      const imageBuffers = req.files.map(file => ({
        data: file.buffer,  // Use file.buffer directly
        contentType: file.mimetype,
        filename: file.originalname,
      }));

      const newHome = new Home({
        title, name, mobile, street, town, district,
        pincode, pluscode, rentprice,
        images: imageBuffers,
        renter: renter._id
      });

      await newHome.save();
      renter.homes.push(newHome._id);
      await renter.save();

      res.status(201).json({ message: "Home listing added successfully", home: newHome });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

const getHomes = async (req, res) => {
  try {
    // Example for handling image data
    const homes = await Home.find().populate("renter");

    const homesWithBase64 = homes.map(home => {
      // Assume each home has images stored as Buffers
      const images = home.images.map(img => {
        return {
          base64: img.data ? img.data.toString('base64') : null,
          contentType: img.contentType,
        };
      });

      return { ...home.toObject(), images };
    });

    res.json(homesWithBase64);
  } catch (err) {
    console.error("Error fetching homes:", err);
    res.status(500).json({ error: "Failed to fetch homes" });
  }
};

const deleteHome = async (req, res) => {
  const { id } = req.params;
  try {
    const home = await Home.findById(id);
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }
    await Renter.findByIdAndUpdate(home.user, { $pull: { homes: home._id } });
    await Home.findByIdAndDelete(id);
    res.status(200).json({ message: "Home deleted successfully" });
  } catch (error) {
    console.error("Error deleting home:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { homeSender, getHomes, deleteHome };
