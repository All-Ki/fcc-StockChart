var mon = require( 'mongoose' );
var findOrCreate = require( 'mongoose-findorcreate' )

var Schema = mon.Schema;

var stockSchema = new Schema( {
	name: { type: String, unique: true },
	dates: [ String ],
	data: [ String ]
} );
stockSchema.plugin( findOrCreate );

var model = mon.model( 'stockSchema', stockSchema );

function stockController() {
	this.model = model;
	this.getList = function ( cb ) {

		model.find()
			.then( ( data ) =>{ data = data.map( ( x ) => { return x.name } );
       cb( data ) });
	}



	this.removeStock = function ( name ,cb) {

		model.findOne( { 'name': name.toString() } ,(err,item)=>{
      item.remove();
      cb(err);
    })
	}

	this.addStock = function ( name, data,cb ) {
		var dates = [];
		var datas = [];
		for ( var i = 0; i < data.length; i++ ) {
			dates.push( data[ i ][ 0 ] );
			datas.push( data[ i ][ 1 ] );

		}
		model.findOrCreate( { name: name, dates: dates, data: datas },
			( err,item,created ) => { cb( err,item,created ) } );
	}

}



module.exports = stockController;
