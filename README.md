# event-swarm

Cross-machine events made simple.

[![Build Status](https://img.shields.io/travis/JimmyBoh/event-swarm/master.svg?style=flat-square)](https://travis-ci.org/JimmyBoh/event-swarm)
[![Code Coverage](https://img.shields.io/coveralls/JimmyBoh/event-swarm/master.svg?style=flat-square)](https://coveralls.io/github/JimmyBoh/event-swarm?branch=master)
[![Dependencies](https://img.shields.io/david/JimmyBoh/event-swarm.svg?style=flat-square)](https://david-dm.org/JimmyBoh/event-swarm)
[![DevDependencies](https://img.shields.io/david/dev/JimmyBoh/event-swarm.svg?style=flat-square)](https://david-dm.org/JimmyBoh/event-swarm?type=dev)
[![npm](https://img.shields.io/npm/v/event-swarm.svg?style=flat-square)](https://www.npmjs.com/package/event-swarm)
[![Monthly Downloads](https://img.shields.io/npm/dm/event-swarm.svg?style=flat-square)](https://www.npmjs.com/package/event-swarm)
[![Total Downloads](https://img.shields.io/npm/dt/event-swarm.svg?style=flat-square)](https://www.npmjs.com/package/event-swarm)


Easily send events across machines on the same network, built using [airswarm][1] for network discovery and simple TCP sockets.


## Example:

```js
import EventSwarm from 'event-swarm';

// On first machine...
let swarm = new EventSwarm({ channel: 'chat' });

swarm.on('ping', e => {
  // e.sender is the id of the sender
  // e.data is the payload of the message (automatically (de)serialized)...
  // e.event is the 

  console.log('pong', e.data);
});


// On second machine...
let swarm = new EventSwarm({ channel: 'chat' });

swarm.emit('ping', {
  string: 'Hello!',
  num: 10,
  date: new Date()
});

```


## Features:
 - Built on [airswarm][1].
 - Channels allow for multiple swarms to exist on the same network.
 - Built-in events for connection and disconnection.
 - Broadcast events or send events to specific peers.
 
## Contribute
 
 0. Fork it
 1. `npm i`
 2. `gulp watch`
 3. Make changes and **write tests**.
 4. Send pull request! :sunglasses:
 
## License:
 
MIT


[1]: https://github.com/mafintosh/airswarm