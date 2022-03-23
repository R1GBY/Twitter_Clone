const mongoose = require("mongoose");
//mongoose.set('useNewUrlParser', true);
//mongoose.set('useUnifiedTopology', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useUnifiedTopology', true);

class Database {

    constructor(){
        this.connect();
    }

    connect(){
        mongoose.connect("mongodb+srv://R1GBY:umut1234@twitter-clone.2diit.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority")
        .then(() => {
            console.log("database connection successfull");
        })
        .catch(err => {
            console.log("database connection error " + err);
        })
    }
}

module.exports = new Database();