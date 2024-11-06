const express = require("express");
const hotelController = require("../controllers/hotelController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/", upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]), hotelController.createHotel);

router.get("/", hotelController.getAllHotel);

router.delete("/delete", hotelController.deleteHotel);

router.get("/:id", hotelController.getHotelById);

router.put("/:id", upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]), hotelController.updateHotelById);

module.exports = router;