const express = require('express');
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth'); 
const multer = require('multer') 

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null,` ${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({storage:storage})

router.get("/view", auth, profileController.getProfile);
router.post("/update", auth, upload.single("image"), profileController.updateProfile); 



module.exports = router;