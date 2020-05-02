const mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const PcGamer= mongoose.Schema({
    article_url: String,
    article_short: String,
    article_image: String,
    release_date: String
    

})
module.exports = mongoose.model('pcGamer', PcGamer);