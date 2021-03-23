const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const ProdutoSchema = Schema({

});

ProdutoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Produto', ProdutoSchema);
