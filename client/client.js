//!/usr/bin/env node

const EventSource = require('eventsource');
const util        = require('util');
const supervisor  = require('./lib/supervisor.js')

const ENDPOINT    = process.env.EVERGREEN_ENDPOINT;
console.debug('Using the Evergreen endpoint:', ENDPOINT);

const sse = new EventSource(util.format('%s/sse', ENDPOINT));
console.debug('EventSource created', sse);

/* First set up a generic event handler.
 *
 * This function will be called whenever an unnamed SSE is received, an that
 * should typically never happen.
 */
sse.onmessage = function(ev) {
  console.error('Unhandled message from Evergreen:', ev);
};


/* Types of Commands we can process */
['ping', 'update', 'flags', 'logs'].map((command) => {
    console.debug('Adding SSE event listener for', command);
});

sse.addEventListener('restart', (ev) => {
  console.log(ev);
  return;

  supervisor.isRunning().then((running) => {
      if (!running) { return; }
      console.log('Supervisord can be accessed..');

      supervisor.restartProcess('jenkins').then(() => {
          console.log('restarted....');
      });
  });
}, false);

/* Currently not exporting any symbols */
module.exports = () => {
};
