import { Router } from "express";
import { addSchedule, deleteAllSchedules, deleteMySchedule, deleteSchedule, getAdviserSchedules, getAllSchedules, getMySchedules, getPanelSchedules, getSchedule, updateAdviserScheduleStatus, updateMySchedule, updatePanelScheduleStatus, updateSchedule } from "../controllers/schedule.controller.js";
import { scheduleValidator, validatePanelStatusOnly, validateRequest, validateUpdateStatusOnly } from "../middlewares/schedule.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const scheduleRoutes = Router()

//Student routes only
scheduleRoutes.get('/my-schedules', protect, authorizeRoles('student'), getMySchedules);
scheduleRoutes.patch('/my-schedules/:id', protect, authorizeRoles('student'), scheduleValidator, validateRequest, updateMySchedule);
scheduleRoutes.delete('/my-schedules/:id', protect, authorizeRoles('student'), deleteMySchedule)
scheduleRoutes.post('/new-schedule', protect, authorizeRoles('student'), scheduleValidator, validateRequest, addSchedule);

//Adviser routes only
scheduleRoutes.get('/adviser/schedules', protect, authorizeRoles('adviser'), getAdviserSchedules )
scheduleRoutes.patch('/adviser/update-status/:id', protect, authorizeRoles('adviser'), validateUpdateStatusOnly, validateRequest, updateAdviserScheduleStatus)

//Panel routes only
scheduleRoutes.get('/panel/schedules', protect, authorizeRoles('panel'), getPanelSchedules)
scheduleRoutes.patch('/panel/schedules/update-status/:id', protect, authorizeRoles('panel'), validatePanelStatusOnly, validateRequest, updatePanelScheduleStatus)

//Admin routes only
scheduleRoutes.post('/admin/add-schedule', protect, authorizeRoles('admin'), )
scheduleRoutes.patch('/admin/update-status/:id', protect, authorizeRoles('admin'), validateUpdateStatusOnly, updateSchedule);
scheduleRoutes.delete('/admin/delete-schedule/:id', protect, authorizeRoles('admin'), deleteSchedule);
scheduleRoutes.delete('/admin/empty-schedules', protect, authorizeRoles('admin'), deleteAllSchedules);

scheduleRoutes.get('/', protect, getAllSchedules);
scheduleRoutes.get('/:id', protect, getSchedule);

export default scheduleRoutes   