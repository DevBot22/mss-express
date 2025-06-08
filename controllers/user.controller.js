import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
        if(users.length === 0){
            return res.status(404).json({message: 'No users found'})
        }
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const deleteUser = await User.findByIdAndDelete(req.params.id)

        if(!deleteUser) {
            return res.status(404).json({message: 'User not found'})
        }

        res.status(200).json({message: 'User has been successfully deleted', deleteUser})

    } catch (error) {
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        )
        if(!updateUser){
            return res.status(404).json({message: "No user found"})
        }
        res.status(200).json({message: "User has been updated"})
    } catch (error) {
        next(error)
    }
}