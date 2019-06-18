const mongoose = require('mongoose');
const config = require('../config/config');
const Mx = require('../models/mx.model');
const monq = require('monq');
console.log('child process started');

var client = monq('mongodb://localhost:27017/mean');
var worker = client.worker(['queue_1']);
let port = config.mongo.host;
mongoose.connect(port, {keepAlive: 1});
mongoose.connection.on('connected', async () => {
    console.log('connected');
    setInterval(async function() {
        console.log('timeout running');
        let mxObjects = await Mx.find({status: 'pending'});
        if(mxObjects.length){
            console.log(mxObjects.length);
            let mxObj = mxObjects[0];
            console.log('registering worker ' + mxObj.name);
            let job = {};
            job[mxObj.name] = execJob;
            worker.register(job);
            worker.start();
        }
        else {
            console.log('no job found');
        }
        worker.on('complete', async (data) => {
            // console.log(data);
            console.log('executed: ' + data.name);
            await Mx.updateOne({name: data.name},{status: 'done'});
        })
        worker.on('error', (err) => {
            console.log(err.message);
        })
        
    
    },5000);
    
    // console.log(instance);
})

var execJob = function(params, callback){
    try {
        var param = params;
        console.log('executing : ' + param);
        callback(null,'done');
    }
    catch(err){
        callback(err);
    }
}