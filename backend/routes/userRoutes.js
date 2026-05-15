const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/Protect");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
    getProfile,
    updateProfile,
    updatePassword,
    deleteAccount,
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getUserStats
} = require("../controllers/userControllers");

router.use(protect); // All routes below require authentication

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/update-password", updatePassword);
router.delete("/account", deleteAccount);

//ADMIN ONLY ROUTES
router.use(authorizeRoles("admin")); // All routes below require admin role

// Specific routes first
router.get("/get_all_users", getAllUsers);
router.get("/stats", getUserStats);

// Parameter routes (with :id) - after specific routes
router.get("/get_user/:id", getUserById);
router.put("/update-role/:id", updateUserRole);
router.put("/update-status/:id", updateUserStatus);
router.delete("/delete_user/:id", deleteUser);

module.exports = router;