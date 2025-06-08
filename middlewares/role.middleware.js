import { check, validationResult } from "express-validator";

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
         console.log('User role:', req.user?.role);
         console.log('Allowed roles:', allowedRoles);
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return res.status(403).json({message: 'Restricted permission'})
        }
        next()
    }
}


//Validation for updating role only
export const validateUpdateRoleOnly = [
    check('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'adviser', 'panel', 'admin'])
    .withMessage('Role must be in student, adviser, panel, admin')
]

//Middleware to catch validation errors
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json(errors.array())
    }
    next()
}