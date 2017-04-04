/**
 * Created by noblegeorge on 05/02/17.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var connection_schema = new Schema({
    phone_number: { type: String, required: true, unique: true},
    socket_id: { type: String },
    status: {type: Number},
    updated_at: Date
});


connection_schema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;
            console.log(this);

    next();
});

connection_schema.methods.statusCheck = function() {
	var state = 1;
    if(state.localeCompare(this.status)==0) {
        return 1;   
    }else{
    	return 0;
    }
};

var Connection = mongoose.model('Connection', connection_schema);
module.exports = Connection;