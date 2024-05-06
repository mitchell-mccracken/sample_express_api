const express = require( 'express' );
const app = express();
const cors = require( 'cors' );
const bodyParser = require( 'body-parser' );

// env file
require( 'dotenv' ).config();
const port = process.env.PORT;


app.use( bodyParser.urlencoded( { extended:true, limit: '5mb' } ) );
app.use( bodyParser.json( { limit: '5mb' } ) );

app.use( cors( {
  origin: [
    'http://localhost:3000',
    'https://localhost:3000'
  ]
} ) );

app.get( '/', ( req, res) => {
  const message = 'this is the base route';
  const data = { message };
  res.send( { data } );
} );

app.post( '/createUser', ( req, res ) => {
  console.log(req.body)

  const data = {
    message: 'good',
    token: Date.now(),
  };
  res.send( { data } );
} );


// link to high level routes
app.use( '/api', require( './controllers/routes' ) );



app.listen(port, () => {
  console.log('\n');
  console.log('-----------------  --------------------------');
  console.log('-----------------  --------------------------');
  console.log(`Example app listening on port ${port}`)
  console.log('\n')
});