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

async function testWithPeers(t: TestContext, assign: (src: EventSwarm, peers: EventSwarm[]) => Array<Promise<void>>, act: (src: EventSwarm, peers: EventSwarm[]) => void) {
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