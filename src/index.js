const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const cookie_parser = require('cookie-parser');
const env = require("dotenv").config();
const mongoose = require('mongoose');

const app = express();
app.use(cookie_parser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//  Connect to mongoDB
mongoose.connect( process.env.MONGODB_URL, {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )
  
app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});