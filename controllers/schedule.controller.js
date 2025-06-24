// controllers/schedule.controller.js

import { sendEmail } from '../utils/send.email.js';
import User from '../models/user.model.js';
import Schedule from '../models/schedule.model.js';

// Get all schedules
export const getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find().sort({ defenseDate: 1 });

    if (schedules.length === 0) {
      return res.status(404).json({ message: '🚫 No schedules found.' });
    }

    return res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

// Add new schedule
export const addSchedule = async (req, res, next) => {
  try {
    const { section, manuscriptTitle, adviser, panelMembers, defenseDate, defenseTime, room, status } = req.body;

    const studentName = req.user.name;
    const studentId = req.user._id || req.user.id;

    const combinedDateTime = new Date(`${defenseDate}T${defenseTime}`);

    const existingSchedule = await Schedule.findOne({ studentId, defenseDate: combinedDateTime });
    if (existingSchedule) {
      return res.status(400).json({ message: 'Schedule for this student on this date and time already exists.' });
    }

    const newSchedule = new Schedule({
      studentId,
      studentName,
      section,
      manuscriptTitle,
      adviser,
      panelMembers,
      defenseDate: combinedDateTime,
      room,
      status,
      panelStatus: panelMembers.map(name => ({ name, status: 'pending' }))
    });

    await newSchedule.save();
    return res.status(201).json({ message: 'New Schedule added successfully ✅' });
  } catch (error) {
    next(error);
  }
};

// Get schedule by ID
export const getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    next(error);
  }
};

// Update schedule by ID
export const updateSchedule = async (req, res, next) => {
  try {
    const { status } = req.body;
    const scheduleId = req.params.id;

    const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, req.body, { new: true });
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'No schedule found!' });
    }

    if (status === 'approved') {
      const { adviser, panelMembers, studentId, defenseDate } = updatedSchedule;
      const student = await User.findById(studentId);
      const adviserUser = await User.findOne({ name: adviser });
      const panelUsers = await User.find({ name: { $in: panelMembers } });

      const emails = [student?.email, adviserUser?.email, ...panelUsers.map(user => user.email)].filter(Boolean);

      const subject = 'Defense Schedule Approved';
      const message = `A manuscript defense schedule has been approved for ${defenseDate}. Please check your account for details.`;

      for (const email of emails) {
        await sendEmail(email, subject, message);
      }
    }

    res.status(201).json({ message: 'Schedule has been updated' });
  } catch (error) {
    next(error);
  }
};

// Delete schedule by ID
export const deleteSchedule = async (req, res, next) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    res.status(200).json({ message: 'Schedule has been deleted successfully', deletedSchedule });
  } catch (error) {
    next(error);
  }
};

// Delete all schedules
export const deleteAllSchedules = async (req, res, next) => {
  try {
    await Schedule.deleteMany({});
    return res.status(200).json({ message: 'All schedules have been deleted' });
  } catch (error) {
    next(error);
  }
};

// Get schedules for logged-in student
export const getMySchedules = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const mySchedules = await Schedule.find({ studentId });

    if (mySchedules.length === 0) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    res.status(200).json(mySchedules);
  } catch (error) {
    next(error);
  }
};

// Update schedule for logged-in student
export const updateMySchedule = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const scheduleId = req.params.id;

    const schedule = await Schedule.findOne({ _id: scheduleId, studentId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending schedules can be edited' });
    }

    const updated = await Schedule.findByIdAndUpdate(scheduleId, req.body, { new: true });

    res.status(200).json({ message: 'Schedule updated successfully', updated });
  } catch (error) {
    next(error);
  }
};

// Delete schedule for logged-in student
export const deleteMySchedule = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const scheduleId = req.params.id;

    const schedule = await Schedule.findOne({ _id: scheduleId, studentId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.status === 'approved') {
      return res.status(403).json({ message: 'Cannot delete an approved schedule ❌' });
    }

    await Schedule.findByIdAndDelete(scheduleId);
    return res.status(200).json({ message: '✅ Your schedule has been deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adviser: Get all schedules assigned to adviser
export const getAdviserSchedules = async (req, res, next) => {
  try {
    const adviserName = req.user.name;
    const schedules = await Schedule.find({ adviser: adviserName }).sort({ defenseDate: 1 });

    if (schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules assigned to you' });
    }

    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

// Adviser: Update schedule status
export const updateAdviserScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adviserName = req.user.name;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const schedule = await Schedule.findOne({ _id: id, adviser: adviserName });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found or not assigned' });
    }

    schedule.adviserStatus = status;
    await schedule.save();

    res.status(200).json({ message: `Schedule ${status} by adviser` });
  } catch (error) {
    next(error);
  }
};

// Panel: Get all schedules assigned to panel
export const getPanelSchedules = async (req, res, next) => {
  try {
    const panelName = req.user.name;

    const schedules = await Schedule.find({ 'panelStatus.name': panelName });
    if (!schedules || schedules.length === 0) {
      return res.status(400).json({ message: 'No schedules assigned to you' });
    }

    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

// Panel: Update panel status
export const updatePanelScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const panelName = req.user.name;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const panel = schedule.panelStatus.find(p => p.name === panelName);
    if (!panel) {
      return res.status(403).json({ message: 'You are not assigned as a panel on this schedule' });
    }

    panel.status = status;
    await schedule.save();

    res.status(200).json({ message: `Panel status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

// Admin: Get schedules ready for final approval
export const getPendingFinalApprovals = async (req, res, next) => {
  try {
    const schedules = await Schedule.find();

    const readySchedules = schedules.filter(schedule => {
      const allPanelApproved = schedule.panelStatus.every(p => p.status === 'approved');
      const adviserApproved = schedule.adviserStatus === 'approved';
      const isPendingAdmin = schedule.status === 'pending';

      return allPanelApproved && adviserApproved && isPendingAdmin;
    });

    res.status(200).json({ count: readySchedules.length, schedules: readySchedules });
  } catch (error) {
    next(error);
  }
};

// Admin: Get approved schedules for calendar display
export const getApprovedSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({
      status: 'approved',
      adviserStatus: 'approved',
      panelStatus: { $not: { $elemMatch: { status: { $ne: 'approved' } } } }
    });

    const approved = schedules.map(s => ({
      studentName: s.studentName,
      defenseDate: s.defenseDate,
      room: s.room
    }));

    res.status(200).json(approved);
  } catch (error) {
    next(error);
  }
};

// Search schedules
export const searchSchedules = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const schedules = await Schedule.find({
      $or: [
        { studentName: { $regex: query, $options: 'i' } },
        { section: { $regex: query, $options: 'i' } },
        { manuscriptTitle: { $regex: query, $options: 'i' } }
      ]
    }).sort({ defenseDate: 1 });

    res.status(schedules.length ? 200 : 404).json(
      schedules.length ? schedules : { message: 'No matching schedules found' }
    );
  } catch (error) {
    next(error);
  }
};
