const express = require("express");
const roomController = require("../controllers/roomController");
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

router.post("/", upload.single("image"), roomController.createRoom);


router.get("/", roomController.getAllRooms);


router.get("/:id", roomController.getSingleRoom);


router.put("/:id", upload.single("image"), roomController.updateRoom);


router.delete("/:id", roomController.deleteRoom);

router.get('/featured/:id', roomController.getRoomFeatured);

module.exports = router;
