const express = require( 'express' );
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require( '../models/User' );
const secretKey = process.env.SECRET_KEY;


// ROUTES
router.post( '/create', createUser );
router.post( '/login', userLogin );
router.post( '/fetchUserName', fetchUserName );






async function createUser( req, res ) {
  try {

    // this is assuming the password is already encrypted
    
    // TODO: ensure passwords are encrypted and decrypted
    const { userName, password, rePassword, email } = req.body;

    // check that passwords match - add back in
    // if ( password !== rePassword ) {
    //   const error = 'passwords do not match';
    //   throw error;
    // }

    // check if user exists
    const query = {
      $or: [
        { userName: userName },
        { email: email}
      ]
    }
    const user = await User.findOne(query);   
    
    const token = jwt.sign(
      { userId: 'user._id' },
      secretKey,
      { expiresIn: '1h'}
    );

    if ( !user ) {

      const user = new User({
        userName,
        password,
        email,
        token
      });
      await user.save();
    }
    else {
      // TODO: this probably isn't the correct logic, need to send an error back to APP

      // user exists, let's update the token
      user.token = token;
      await user.save();
    }

    const data = {
      message: 'user has been created',
      token,
    };
  
    res.send( data );
  } 
  catch (error) {
    console.error( error );
    res.status(500).send(error);
  }
}

async function userLogin( req, res ) {
  try {

    const { userName, password } = req.body;

    const user = await User.findOne({ userName })
      .lean()
      .exec();


    const loginSuccessful = await bcrypt.compareSync( password, user.password );
  
    if ( !loginSuccessful ) {
      res.status( 500 ).send( 'password or username incorrect' );
      return;
    }

    const token = jwt.sign(
      { userId: 'user._id' },
      secretKey,
      { expiresIn: '1h'}
    );

    const data = {
      message: 'good',
      token
    };

    res.send( data );
  } 
  catch (error) {
    console.error( error );
    res.send(error)
  }
}

async function fetchUserName( req, res ) {
  try {
    console.log('----------------- fetchUserName --------------------------');
    const { token } = req.body;

    const user = await User.findOne( { token } )
      .lean()
      .exec();

    // no user, send error message
    if ( !user ) {
      const err = 'User could not be found';
      res.status(404).send(err);
      return;
    }

    const data = { 
      message: 'done',
      userName: user.userName
    };
    res.send( data );
  } 
  catch (error) {
    console.error( error );
    res.status(500).send(error);
  }
}


module.exports = router;