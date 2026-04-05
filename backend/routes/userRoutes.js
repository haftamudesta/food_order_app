const express = require("express");
const router = express.Router();
const {protect}  = require("../middleware/Protect");
const authorizeRoles=require("../middleware/authorizeRoles")
const {
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser
} = require("../controllers/userControllers");

// Protected routes (require authentication)
router.use(protect); // All routes below require login

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Admin only routes
router.use(authorizeRoles("admin")); // All routes below require admin role
router.get("/get_all_users", getAllUsers);
router.delete("/delete_user/:id", deleteUser);

module.exports=router