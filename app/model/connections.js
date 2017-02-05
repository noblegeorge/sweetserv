/**
 * Created by noblegeorge on 05/02/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connection_schema = new Schema({
    phone_number: { type: Number, required: true},
    socket_id: { type: String, required: true },
    status: {type: Number},
    updated_at: Date
});


connection_schema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

});

var connections = mongoose.model('connections', connection_schema);
module.exports = connections;