	/**
	 * Created by noblegeorge on 05/02/17.
	 */
	 var mongoose = require('mongoose');

	 var Schema = mongoose.Schema;

	 var call_schema = new Schema({
	 	caller: { type: String, required: true},
	 	callee: { type: String, required: true, unique: false},
	 	status: {type: Number},
	 	init_time: Date,
	 	term_time: Date
		});

	 call_schema.methods.statusCheck = function() {
	 	var state = 1;
	 	if(state.localeCompare(this.status)==0) {
	 		return 1;   
	 	}else{
	 		return 0;
	 	}
	 };



	 var Call = mongoose.model('Call', call_schema);
	 module.exports = Call;