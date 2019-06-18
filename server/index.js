// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
require('./config/mongoose');
const monq = require('monq');
const Mx = require('./models/mx.model');

const childProcess = require('child_process');

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
var client = monq('mongodb://localhost:27017/mean');
var queue = client.queue('queue_1');

 
let child = childProcess.fork('server/jobs/job.worker.js');
child.on('exit', (code) => {
  console.log(`child process exited with code : ${code}`);
});

function conditioning(){
  var i = 0;
  setInterval(async () => {
   
    var mx = await new Mx({name: 'shikhar'+i, status: 'pending'}).save();
    console.log('creating new job queue');
    queue.enqueue('shikhar' + i, {details: 'some_details'}, function(err, job) {
      console.log('enqueued: ' , job.data.name);
    });
    i++;
  },4000);
}

if (!module.parent) {
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
    conditioning();
  });
}

module.exports = app;
