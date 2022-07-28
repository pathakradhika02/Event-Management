const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");
const {authentication} = require("../middlewares/auth");

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/logout/:userId', authentication, userController.logoutUser);
router.post('/changepassword/:userId', authentication, userController.changePassword);
router.post('/generateotp', userController.resetPassword);
router.post('/verifyotp', userController.verifyOTP);
router.post('/updatepassword', userController.updatePassword);

router.post('/createevent/:userId', authentication, eventController.createEvent);
router.post('/invitepeoples/:userId', authentication, eventController.invitePeoples);
router.get('/eventdetails/:userId/:eventId', authentication, eventController.eventDetails);
router.post('/updateevent/:userId/:eventId', authentication, eventController.updateEventDetails);
router.get('/listevents/:userId', authentication, eventController.listEvent);



module.exports = router;