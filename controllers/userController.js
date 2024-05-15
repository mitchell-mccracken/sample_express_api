const express = require( 'express' );
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require( '../models/User' );
const secretKey = process.env.SECRET_KEY;

const { Client } = require( 'square' );
const { randomUUID } = require( 'crypto' );



// GLOBALS
const MAX_AGE = 1000*60*60;    // 5 minutes

// ROUTES
router.post( '/create', createUser );
router.post( '/login', userLogin );
router.get( '/fetchUserName/:userId', fetchUserName );


router.post( '/payment', testPayment );

BigInt.prototype.toJSON = function() { return this.toString(); }






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


    // set cookie values
    // TODO: change to an expires value
    res.cookie( 'mitch_test_app_token', token, { maxAge: MAX_AGE } );
    res.cookie( 'mitch_test_app_uid', user._id.toString(), { maxAge: MAX_AGE } );

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

    const { userId } = req.params

    if ( !userId || userId === 'undefined' ) {
      const data = {
        'redirect': '/login'
      }
      res.send( data );
      return
    }

    const user = await User.findOne( { _id: userId } )
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


async function testPayment( req, res ) {
  try {

    if ( !req.body?.sourceId ) {
      res.status(501).send('no sourceId')
    }

    const { paymentsApi } = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: 'sandbox'
    });

    const { result } = await paymentsApi.createPayment({
      idempotencyKey: randomUUID(),
      sourceId: req.body.sourceId,
      amountMoney: {
        currency: 'USD',
        amount: 100
      }
    });

    console.log(result);
    res.status(200).json(result);
    
  } 
  catch (error) {
    console.error( error );
    res.status(500).send(error);
  }
}


module.exports = router;