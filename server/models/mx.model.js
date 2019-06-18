const mongoose = require('mongoose');
const mxSchema = new mongoose.Schema({
    name: {
        type: String
    },
    status: {
        type: String
    }
})

module.exports = mongoose.model('Mx',mxSchema);
