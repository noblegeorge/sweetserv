// grab the things we need
var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/sweetsmile');
var Schema = mongoose.Schema;

// create a schema
var profileSchema = new Schema({
  phone_number: { type: String, required: true, unique: true },
  first_name: String,
  second_name: String,
  token: { type: String, required: true, unique: false },
  imei: { type: String, required: true, unique: true },
  device: String,
  created_at: Date,
  updated_at: Date
});

// custom method to add string to end of name
// you can create more important methods like name validations or formatting
// you can also do queries and find similar users 
// userSchema.methods.check_login = function() {

// };

// on every save, add the date
profileSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

profileSchema.methods.compareToken = function(candidateToken) {
    if(candidateToken.localeCompare(this.token
      )==0) {
        return 1;   
    }else{
    	return 0;
    }
};


// the schema is useless so far
// we need to create a model using it
var Profile = mongoose.model('Profile', profileSchema);

// make this available to our users in our Node applications
module.exports = Profile;