import { test, TestContext } from 'ava';

import { EventSwarm } from './';

test(`EventSwarm#Constructor requires a channel`, t => {
  t.throws(() => new EventSwarm({ channel: null }));
});

test(`EventSwarm#Constructor allows for custom channel`, t => {
  const channel = getChannel();
  const swarm = new EventSwarm({ channel });

  t.is(swarm.channel, channel);
});

test(`EventSwarm#Constructor defaults to a random id`, t => {
  const channel = getChannel();
  const swarm = new EventSwarm({ channel });

  t.true(swarm.id.length > 0);
});

test(`EventSwarm#address provides the IP and port`, t => {
  const channel = getChannel();
  const swarm = new EventSwarm({ channel });

  const [host, port] = swarm.address.split(':');

  t.true(host.length > 0);
  t.true(port.length > 0);
});

test(`EventSwarm#address returns null upon error`, t => {
  const swarm = new EventSwarm({ channel: getChannel() });
  swarm['_swarm'] = null;
  t.is(swarm.address, null);
});

test(`EventSwarm#emit broadcasts to all peers`, async (t) => {
  const eventName = 'tick';
  const expectedValue = Date.now();

  return testWithPeers(t, (src, peers) => {
  
    t.plan(2);

    return peers.map(peer => new Promise<void>(resolve => {
      peer.on<number>(eventName, e => {
        t.is(e.data, expectedValue);
        resolve();
      });
    }));
  }, (src, peers) => src.emit(eventName, expectedValue));
});

test(`EventSwarm#send emits to specified peers`, async t => {
  const eventName = 'tick';
  const expectedValue = Date.now();
  
  return testWithPeers(t, (src, peers) => {
    t.plan(1);

    return peers.map(peer => {
      // Wait a full second before considering the "listener" to be skipped!
      return Promise.race([delay(1000), new Promise<void>(resolve => {
        peer.on<number>(eventName, e => {
          t.is(e.data, expectedValue);
          resolve();
        });
      })]);
    });
  }, (src, peers) => src.send(src.peers[0], eventName, expectedValue));
});

test(`EventSwarm#once removes handler after execution`, t => {
  const event = 'tick';
  
  const swarm = new EventSwarm({ channel: getChannel() });

  let count = 0;

  function inc(e: any) {
    count++;
  }

  swarm.once(event, inc);
  t.is(swarm['_handlers'][event].length, 1);
  swarm['_handleEvent'](null, { event } as any);
  swarm['_handleEvent'](null, { event } as any);
  t.is(swarm['_handlers'][event].length, 0);
  
});

test(`EventSwarm#off requires an event name`, t => {
  const eventName: string = null;
  
  const swarm = new EventSwarm({ channel: getChannel() });

  t.throws(() => swarm.off(eventName));
});

test(`EventSwarm#off removes provided handler`, t => {
  const event = 'tick';
  
  const swarm = new EventSwarm({ channel: getChannel() });

  function handler(e: any) {
    t.fail();
  }

  swarm.on(event, function () { });
  swarm.on(event, handler);
  t.is(swarm['_handlers'][event].length, 2);
  swarm.off(event, handler);
  t.is(swarm['_handlers'][event].length, 1);
  swarm['_handleEvent'](null, { event } as any);
});

test(`EventSwarm#off removes all handlers`, t => {
  const event = 'tick';
  
  const swarm = new EventSwarm({ channel: getChannel() });

  function handler() {
    t.fail();
  }

  swarm.on(event, function () { t.fail() });
  swarm.on(event, handler);
  t.is(swarm['_handlers'][event].length, 2);
  swarm.off(event);
  t.is(swarm['_handlers'][event].length, 0);
  swarm['_handleEvent'](null, { event } as any);
});

test(`EventSwarm#close removes all handlers`, async t => {
  t.plan(3);
  
  const event = 'tick';
  
  const swarm = new EventSwarm({ channel: getChannel() });
  const peer = new EventSwarm({ channel: swarm.channel });

  peer.on('event-swarm:disconnect', e => {
    t.is(e.sender, swarm.id);
  });

  await delay(100);

  function handler() {
    t.fail();
  }

  swarm.on(event, function () { t.fail() });
  swarm.on(event, handler);
  t.is(swarm['_handlers'][event].length, 2);
  swarm.close();

  await delay(100);

  t.is(Object.keys(swarm['_handlers']).length, 0);
  swarm['_handleEvent'](null, { event } as any);
});

async function testWithPeers(
  t: TestContext,
  assign: (src: EventSwarm, peers: EventSwarm[]) => Array<Promise<void|any>>,
  act: (src: EventSwarm, peers: EventSwarm[]) => void|any)
{
  const channel = getChannel();
  const src = new EventSwarm({ channel });
  const peers = [new EventSwarm({ channel }), new EventSwarm({ channel })];

  // Delay to allow for the clients to connect...
  await delay(100);

  let failureTimeout = setTimeout(() => t.fail(), 5000);

  let handlers = assign(src, peers);

  act(src, peers);

  await Promise.all(handlers);

  clearTimeout(failureTimeout);
}



function getChannel() {
  return 'channel_' + Math.floor(Math.random() * 99999999);
}

function delay(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}