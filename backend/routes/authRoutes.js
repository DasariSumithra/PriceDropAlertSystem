const { protect } = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

router.get("/test", (req, res) => {
    res.json({
        message: "Authentication route is working!"
    });
});
router.get("/profile", protect, (req, res) => {

    res.json({
        message: "Protected Route",
        user: req.user
    });

});

router.post("/register", registerUser);

router.post("/login", loginUser);

module.exports = router;