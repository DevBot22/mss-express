import { check, validationResult } from "express-validator";

//Middleware for validation
export const scheduleValidator = [
    check('studentName').notEmpty().withMessage('Student name is required'),
    check('section').notEmpty().withMessage('Section is required'),
    check('manuscriptTitle').notEmpty().withMessage('Manuscript Title is required'),
    check('adviser').notEmpty().withMessage('Adviser is required'),
    check('panelMembers').isArray({min: 1}).withMessage('At least one panel member is required'),
    check('defenseDate').isISO8601().withMessage('Defense date must be a valid ISO date')
      .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Defense date must be in the future')
      }
      return true
    }),
    check('room').notEmpty().withMessage('Room is required'),
]

//Middleware to catch validation errors
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({errors: errors.array()})
    }
    next()
}

//Middleware Validator for updating status only
export const validateUpdateStatusOnly = [
  check('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be either pending, approved, or rejected'),
];

//Middleware Validator for  updating adviser status only
export const validateUpdateAdviserStatusOnly = [
  check('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved, or rejected'),
];

//Middleware for validating panelStatus only
export const validatePanelStatusOnly = [
  check('status')
  .notEmpty()
  .withMessage('Status is required')
  .isIn(['approved','rejected'])
  .withMessage('Status must be approved or rejected')
]

