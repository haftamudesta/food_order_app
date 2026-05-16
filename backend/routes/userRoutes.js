const express = require("express");
const router = express.Router();
const { uploadSingle } = require('../config/cloudinary'); 
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
    getUserStats,
    uploadProfilePicture,
    removeProfilePicture
} = require("../controllers/userControllers");

router.use(protect); // All routes below require authentication

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/update-password", updatePassword);
router.delete("/account", deleteAccount);
router.post('/upload-profile-pic', uploadSingle.single('profile_pic'), uploadProfilePicture);
router.delete('/remove-profile-pic',removeProfilePicture);

router.use(authorizeRoles("admin")); 

router.get("/get_all_users", getAllUsers);
router.get("/stats", getUserStats);

router.get("/get_user/:id", getUserById);
router.put("/update-role/:id", updateUserRole);
router.put("/update-status/:id", updateUserStatus);
router.delete("/delete_user/:id", deleteUser);

module.exports = router;