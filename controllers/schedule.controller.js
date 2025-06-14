import { sendEmail } from '../utils/send.email.js';
import User from '../models/user.model.js';
import Schedule from '../models/schedule.model.js'

export const getAllSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.find().sort({defenseDate : 1})

       if (schedules.length === 0) {
        return res.status(404).json({ message: "🚫 No schedules found." });
        }
        
        return res.status(200).json(schedules)
    } catch (error) {
        next(error)
    }
}

export const addSchedule = async (req, res, next) => {
    try {
        const { section ,manuscriptTitle, adviser, panelMembers,
               defenseDate, room, status
             } = req.body;

        const studentName = req.user.name //from token
        const studentId = req.user._id || req.user.id

          // Check if schedule for this student on this date already exists
        const existingSchedule = await Schedule.findOne({ studentId, defenseDate });
         if (existingSchedule) {
         return res.status(400).json({ message: 'Schedule for this student on this date already exists.' });
        }

        const newSchedule = new Schedule({
           studentId ,studentName, section, manuscriptTitle, adviser, panelMembers,
               defenseDate, room, status,
               panelStatus: panelMembers.map(name => ({name, status: 'pending'}))//automatic populate panel's status to pending
        })

        await newSchedule.save()
        return res.status(201).json({message: 'New Schedule added successfully ✅'})
    } catch (error) {
        next(error)
    }
}

export const getSchedule = async (req, res, next) => {
    try {
        const schedules = await Schedule.findById(req.params.id)

        if(!schedules){
            return res.status(404).json({message: 'No schedule found'})
        }

        res.status(200).json(schedules)

    } catch (error) {
        next(error)
    }
}


export const updateSchedule = async (req, res, next) => {
  try {
    const { status } = req.body;
    const scheduleId = req.params.id;

    const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, req.body, { new: true });
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'No schedule found!' });
    }

    // Send notification only if schedule is approved
    if (status === 'approved') {
      const { adviser, panelMembers, studentId, defenseDate } = updatedSchedule;

      const student = await User.findById(studentId);
      const adviserUser = await User.findOne({ name: adviser });
      const panelUsers = await User.find({ name: { $in: panelMembers } });

      const emails = [
        student?.email,
        adviserUser?.email,
        ...panelUsers.map(user => user.email)
      ].filter(Boolean); // Remove null/undefined

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

export const deleteSchedule = async (req, res, next) => {
    try {
        const deleteSchedule = await Schedule.findByIdAndDelete(req.params.id)

        if(!deleteSchedule){
            return res.status(404).json({message: 'No schedule found'})
        }

        res.status(200).json({message: 'Schedule has been deleted successfuly', deleteSchedule})

    } catch (error) {
        next(error)
    }
}

export const deleteAllSchedules = async (req, res, next) => {
    try {
        await Schedule.deleteMany({})
        return res.status(200).json({message: 'All schedules have been delete'})
    } catch (error) {
        next(error)
    }
}

export const getMySchedules = async (req, res, next) => {
    try {
        const studentId = req.user._id // from decoded token
        const mySchedules = await Schedule.find({studentId})

        if (mySchedules.length === 0) {
          return res.status(404).json({ message: 'No schedule found' });
        }

        res.status(200).json(mySchedules)
    } catch (error) {
        next(error)
    }
}

export const updateMySchedule = async (req, res, next) => {
    try {
        
        const studentId = req.user._id
        const scheduleId = req.params.id
        
        //Find schedule 
        const schedule = await Schedule.findOne({_id : scheduleId, studentId})

        if(!schedule){
            return res.status(404).json({message: 'Schedule not found'})
        }

        if(schedule.status !== 'pending'){
            return res.status(400).json({message: 'Only pending schedules can be edited'})
        }

        const fieldsToUpdate = req.body

        const updated = await Schedule.findByIdAndUpdate(scheduleId, fieldsToUpdate, 
            {new: true}
        )

        res.status(200).json({
            message: 'Schedule updated successfully',
            updated
        })

    } catch (error) {
        next(error)
    }
}

export const deleteMySchedule = async (req, res, next) => {
    try {

        const studentId = req.user._id
        const scheduleId = user.params.id

        //Find schedule
        const schedule = await Schedule.findOne({_id: scheduleId, studentId})

        if(!schedule){
            return res.status(404).json({message: 'Schedule not found'})
        }

        if (schedule.status === 'approved') {
        return res.status(403).json({ message: 'Cannot delete an approved schedule ❌' });
        }


        await Schedule.findByIdAndDelete(scheduleId)
          return res.status(200).json({ message: '✅ Your schedule has been deleted successfully' });
    } catch (error) {
        next(error)
    }
}

//The following controller is for asdviser only
export const getAdviserSchedules = async (req, res, next) => {
    try {
        
        const adviserName = req.user.name
        const schedules = await Schedule.find({adviser: adviserName}).sort({defenseDate: 1})

        if(schedules.length === 0){
            return res.status(404).json({message: "No Schedules assign to you"})
        }

        res.status(200).json(schedules)

    } catch (error) {
        next(error)
    }
}

export const updateAdviserScheduleStatus = async (req, res, next) => {
    try {
        const {id} = req.params
        const {status} = req.body
        const adviserName = req.user.name
        if(!['approved', 'rejected'].includes(status)){
            return res.status(400).json({message: 'Status must be approved or rejected'})
        }

        const schedule = await Schedule.findOne({_id: id, adviser: adviserName})
        if(!schedule){
            return res.status(404).json({message: 'Schedule not found or not assigned'})
        }

        //Only updates adviserStatus
        schedule.adviserStatus = status

        await schedule.save()
        res.status(200).json({message: `Schedule ${status} by adviser`})
    } catch (error) {
        next(error)
    }
}

//The following controller is for panel member only
export const getPanelSchedules = async (req, res, next) => {
    try {
        const panelName = req.user.name

        const schedules = await Schedule.findOne({
            'panelStatus.name': panelName
        })
        if(!schedules || schedules.length === 0){
            return res.status(400).json({message: 'No schedules assigned to you'})
        }

        res.status(200).json(schedules)

    } catch (error) {
        next(error)
    }
}


export const updatePanelScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const panelName = req.user.name

    // Find the schedule
    const schedule = await Schedule.findById(id)
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' })
    }

    // Find the panel member in the schedule
    const panel = schedule.panelStatus.find(p => p.name === panelName)
    if (!panel) {
      return res.status(403).json({ message: 'You are not assigned as a panel on this schedule' })
    }

    // Update status
    panel.status = status
    await schedule.save()

    res.status(200).json({ message: `Panel status updated to ${status}` })
  } catch (error) {
    next(error)
  }
}


//admin get-ready schedules
export const getPendingFinalApprovals = async (req, res, next) => {

    try {
        const schedules  = await Schedule.find()

        const readySchedules = schedules.filter(schedule => {
            const allPanelIsApproved = schedule.panelStatus.every(p => p.status === 'approved')
            const adviserApproved = schedule.adviserStatus === 'approved'
            const isPendingAdmin = schedule.status === 'pending' //only count if admin hasn't approved yet

            return allPanelIsApproved && adviserApproved && isPendingAdmin
        })

        res.status(200).json({count: readySchedules.length,  schedules: readySchedules})
        
    } catch (error) {
        next(error)
    }

}