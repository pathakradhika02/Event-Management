const eventModel = require('../models/eventModel');
const userModel = require('../models/userModel');
const validator = require('../utils/validators');


// Function to create new event
const createEvent = async (req, res) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userId;

        // CHECK: data present in request body
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please enter data in request body..." });
        let { eventName, eventDate, createdBy, invitees } = reqBody

        // CHECK: All mandatory are present in req body and have data
        if (!validator.isMissingOrEmpty(eventName)) return res.status(400).send({ status: "failed", message: "Please enter event name..." });
        if (!validator.isMissingOrEmpty(eventDate)) return res.status(400).send({ status: "failed", message: "Please enter event date..." });
        if (!validator.isMissingOrEmpty(createdBy)) return res.status(400).send({ status: "failed", message: "Please enter event event creator _id..." });

        // CHECK: if invitees are provided 
        if (invitees != null) {
            if (Array.isArray(invitees) == false) return res.status(400).send({ status: "failed", message: "Please enter invitees data in array..." });
            else {
                invitees = invitees.filter(x => x.trim())
                if (invitees.length == 0) return res.status(400).send({ status: "failed", message: "Please enter invitess data..." });
            }

            // CHECK: invitees data is valid 
            for (let i = 0; i < invitees.length; i++) {
                if (!validator.isValidID(invitees[i])) return res.status(400).send({ status: "failed", message: `Please enter valid ObjectId in invitees data at position ${i + 1}...` });
            }
        }

        // CHECK: Authorization
        if (req.user != userId || userId != createdBy) return res.status(403).send({ status: "failed", message: "You haven't right to perform the task" })

        const finalInviteesInfo = validator.removeDuplicateInvitees(invitees);

        // CHECK: createdBy is valid object id
        if (!validator.isValidID(createdBy)) return res.status(400).send({ status: "failed", message: "Please enter valid ObjectId in createdBy..." });

        // CHECK: User exist with given createdBy id
        const isUserExist = await userModel.findOne({ _id: createdBy });
        if (!isUserExist) return res.status(400).send({ status: "failed", message: "User doesn't exist with entered createdBy Id" });

        let newEvent = { eventName, eventDate, createdBy, invitees: finalInviteesInfo }

        newEvent = await eventModel.create(newEvent);
        return res.status(201).send({ status: "success", message: "Event created successfully", data: newEvent });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


// Function to invite peoples
const invitePeoples = async (req, res) => {
    try {
        const reqBody = req.body;
        const userId = req.params.userId;

        // CHECK: data present in request body
        if (Object.keys(reqBody).length == 0) return res.status(400).send({ status: "failed", message: "Please enter data in request body..." });
        let { invitees, eventId } = reqBody

        // CHECK: All mandatory are present in req body and have data
        if (!validator.isMissingOrEmpty(eventId)) return res.status(400).send({ status: "failed", message: "Please enter eventId..." });

        // CHECK: if invitees are provided 
        if (Array.isArray(invitees) == false) return res.status(400).send({ status: "failed", message: "Please enter invitees data in array..." });
        else {
            invitees = invitees.filter(x => x.trim())
            if (invitees.length == 0) return res.status(400).send({ status: "failed", message: "Please enter invitess data..." });
        }

        console.log(req.user, userId)

        // CHECK: Authorization
        if (req.user != userId) return res.status(403).send({ status: "failed", message: "You haven't right to perform the task" })


        // CHECK: createdBy is valid object id and event exist 
        if (!validator.isValidID(eventId)) return res.status(400).send({ status: "failed", message: "Please enter valid ObjectId in eventId..." });
        const eventExist = await eventModel.findOne({ _id: eventId });
        if (!eventExist) return res.status(400).send({ status: "failed", message: "Event doesn't exist with entered eventId" });

        // CHECK: invitees data is valid 
        for (let i = 0; i < invitees.length; i++) {
            if (!validator.isValidID(invitees[i])) return res.status(400).send({ status: "failed", message: `Please enter valid ObjectId in invitees data at position ${i + 1}...` });

            // CHECK: user userExist with given userId
            const inviteeExist = await userModel.findOne({ _id: invitees[i] });
            if (!inviteeExist) return res.status(400).send({ status: "failed", message: `User doesn't exist with given invitee ID at position ${i + 1}` });
        }

        if (eventExist.invitees.length > 0) {
            var finalInviteesInfo = validator.finalInvitees(eventExist.invitees, invitees);
        }
        else {
            var finalInviteesInfo = validator.removeDuplicateInvitees(invitees);
        }

        const updatedEvent = await eventModel.findOneAndUpdate({ _id: eventId }, { $addToSet: { invitees: finalInviteesInfo } }, { new: true })
        return res.status(200).send({ status: "success", message: "Peoples Invited successfully", data: updatedEvent });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


// Function to get event details
const eventDetails = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!eventId) return res.status(400).send({ status: "failed", message: "Please provide eventId" });
        if (!validator.isValidID(eventId)) return res.status(400).send({ status: "failed", message: "Please enter valid eventId" });

        const eventDetails = await eventModel.findOne({ _id: eventId });
        if (!eventDetails) return res.status(404).send({ status: "failed", message: "No event found with this eventId" });

        return res.status(200).send({ status: "failed", message: "Event details", data: eventDetails });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


// Function to update event details
const updateEventDetails = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;

        const reqBody = req.body;
        const { eventName, eventDate, invitees } = reqBody;

        if (!eventId) return res.status(400).send({ status: "failed", message: "Please provide eventId" });
        if (!validator.isValidID(eventId)) return res.status(400).send({ status: "failed", message: "Please enter valid eventId" });

        const eventDetails = await eventModel.findOne({ _id: eventId });
        if (!eventDetails) return res.status(404).send({ status: "failed", message: "No event found with this eventId" });
        if (eventDetails.createdBy != userId) return res.status(403).send({ status: "failed", message: "You haven't right to update event details" });
        if (req.user != userId) return res.status(403).send({ status: "failed", message: "You haven't right to perform the task" })

        const updates = {};

        if (eventName != null) {
            if (!validator.isMissingOrEmpty(eventName)) return res.status(400).send({ status: "failed", message: "Please enter event name" });
            updates['eventName'] = eventName;
        }
        if (eventDate != null) {
            if (!validator.isMissingOrEmpty(eventDate)) return res.status(400).send({ status: "failed", message: "Please enter event date" });
            updates['eventDate'] = eventDate;
        }
        if (invitees != null) {
            if (Array.isArray(invitees) == false) return res.status(400).send({ status: "failed", message: "Please enter invitees data in array..." });
            else {
                invitees = invitees.filter(x => x.trim())
                if (invitees.length == 0) return res.status(400).send({ status: "failed", message: "Please enter invitess data..." });
            }
            updates['invitees'] = invitees;
        }

        const updatedEvent = await eventModel.findOneAndUpdate({ _id: eventId }, updates, { new: true });
        return res.status(200).send({ status: "failed", message: "Event details", data: updatedEvent });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}


// Function to list event details
const listEvent = async (req, res) => {
    try {
        const userId = req.params.userId;
        const filters = req.query;
        let page = filters.page
        const { eventDate } = filters;

        if (!validator.isMissingOrEmpty(page)) return res.status(400).send({ status: "failed", message: "Please enter page" });

        if (eventDate != null) {
            if (!validator.isMissingOrEmpty(eventDate)) return res.status(400).send({ status: "failed", message: "Please enter event date" });
        }
        const eventDetails = await eventModel.find();

        const details = []
        for (let i = 0; i < eventDetails.length; i++) {
            for (let j = i; j < eventDetails[i].invitees.length; j++) {
                if (userId == eventDetails[i].invitees[j].invitee && eventDetails[i].createdBy != userId) details.push(eventDetails[i]);
            }
        }
        const eventDetailsByCreator = await eventModel.find({ ...filters, createdBy: userId });

        for (let i = 0; i < eventDetailsByCreator.length; i++) {
            details.push(eventDetailsByCreator[i])
        }

        const finalDeatilList = []
        page = page * 10 - 10
        for (let i = page; i < page + 15 && details[i] !== undefined; i++) {
            finalDeatilList.push(details[i]);
        }

        return res.status(200).send({ status: "failed", message: "Event details", data: finalDeatilList });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: "failed", message: error.message });
    }
}



module.exports = { createEvent, invitePeoples, eventDetails, updateEventDetails, listEvent }