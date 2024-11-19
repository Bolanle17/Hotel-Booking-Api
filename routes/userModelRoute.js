const express = require("express");
const userModelController = require("../controllers/userModelController");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});      

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", upload.single("image"), (req, res, next) => {
  userModelController.register(req, res).catch(next);
});

router.post("/login",  (req, res, next) => {
  userModelController.login(req, res).catch(next);
});

router.get("/user", auth, (req, res, next) => {
  userModelController.getUser(req, res).catch(next);
});

module.exports = router;