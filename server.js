var app = require( 'express' )();
var http = require( 'http' )
	.Server( app );
var io = require( 'socket.io' )( http );
var mongoose = require( 'mongoose' );
var request = require( 'request' );
var moment = require( 'moment' )
require('dotenv').load()
mongoose.connect( process.env.MONGO_URI);
var StockController = require( './stocksdb.js' );
var stockController = new StockController()


app.get( '/', ( req, res ) => {
	res.sendFile( __dirname + '/index.html' );
} );

app.get( '/getList', ( req, res ) => {
	stockController.getList( ( data ) => {
		res.send( data );
	} )
} )

app.get( '/getAll', ( req, res ) => {
	stockController.model.find()
		.then( ( data ) => {
			res.json( data );
		} )
} )

app.get( '/data/:name', ( req, res ) => {
	res.send()

} )



io.on( 'connection', function ( socket ) {
	var today = moment()
		.format( 'YYYY-MM-DD' );
	var oldest = moment()
		.subtract( 6, 'months' )
		.format( 'YYYY-MM-DD' )
	console.log( 'a user connected' );
	socket.on( 'removeStock', ( name ) => {
		stockController.removeStock( name, ( err ) => {
			console.log( err );
			socket.emit( 'stockRemoved', name );
		} );


	} )


	socket.on( 'newStock', ( data ) => {

		request( 'https://www.quandl.com/api/v3/datasets/WIKI/' + data +
			'/data.json?&start_date=' + oldest + '&end_date=' + today + '&collapse=monthly&' +
			'column_index=1&api_key=VJjRy6xjDsDtnu6mG6Z-',
			( err, res, body ) => {
				body = JSON.parse( body );
				if ( body.quandl_error ) {
					if ( body[ 'quandl_error' ][ 'code' ] == 'QECx02' ) {
						console.log( 'bad stock symbol' );

					}
				} else {
					//console.log( data + '\n good stock symbol' +'\n DATA' + JSON.stringify(body)	);
					stockController.addStock( data, body.dataset_data.data, ( err, item, created ) => {;
						if ( err ) {
							console.log( err )
						} else if ( created ) {
							var toSend = body.dataset_data.data.map( ( x ) => { return x[ 1 ] } )
							socket.emit( 'newStockAdded', { name: data, data: toSend } );
						}

					} )
				}
			}


		)

	} )

} );
http.listen( 8080, function () {
	console.log( 'listening on *:8080' );
} );



function formatDate( x ) {
	return x.slice( 0, 10 );
}
