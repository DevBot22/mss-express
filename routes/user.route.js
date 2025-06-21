import { Router } from "express";
import { deleteUser, getUser, getAllUsers, updateUser, searchUsers } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles, validateRequest, validateUpdateRoleOnly } from "../middlewares/role.middleware.js";

const userRoutes = Router()

//This route is for admin only
userRoutes.get('/', protect, authorizeRoles('admin'), getAllUsers)
userRoutes.get('/:id', protect, authorizeRoles('admin'), getUser)
userRoutes.delete('/delete-user/:id', protect, authorizeRoles('admin'), deleteUser)
userRoutes.patch('/update-user/:id', protect, validateUpdateRoleOnly, validateRequest, authorizeRoles('admin'), updateUser )
userRoutes.get('/search', protect, authorizeRoles('admin'), searchUsers)

export default userRoutes