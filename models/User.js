const mongoose = require( 'mongoose' );
const OPTS = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
}

const schema = new mongoose.Schema( {
  userName: String,
  email: String,
  token: String,
  password: String,

  emailValidated: Boolean,
  emailValidateToken: String,

  // this is used to determine what page will load for the user ...
  // ... user will be a generic user page to show orders, create order, etc.
  // ... lab will have extra features
  accountType: {
    type: String,
    enum: ['USER', 'LAB']
  },

} );

// const connection = dbConfig.GetShopConnection();
// const model = connection.model("user", schema);

const connection = mongoose.createConnection( process.env.MONGODB_SHOP_URL )
const model = connection.model('user', schema);
// const User = mongoose.model('user', schema);

module.exports = model;