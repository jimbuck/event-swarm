const readline = require('readline');
import { EventSwarm, EventHandler, EventArgs } from './';
import { Lookup } from './utils';

interface DemoPayload {  
  /**
   * The message to send.
   * 
   * @type {string}
   * @memberOf DemoPayload
   */
  msg: string;
}

let swarm: EventSwarm;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `>`
});

rl.on('close', async () => {
  await delay(200);
  swarm.close();

  await delay(200);
  process.exit(0);
});

rl.question(`Channel: `, (channel: string) => {

  swarm = new EventSwarm({ channel });

  swarm.on('event-swarm:connect', e => {
    writeToScreen(`Connect (${e.sender})`);
  }).on('event-swarm:disconnect', e => {
    writeToScreen(`Disconnect (${e.sender})`);
  }).on<DemoPayload>('message', e => {
    writeToScreen(`${e.sender}: ${e.data.msg}`);
  });
  
  rl.on('line', (line: string) => {
    line = line.trim();
    if (line === '/exit') {
      return rl.close();
    }

    swarm.emit<DemoPayload>('message', { msg: line.trim() });
    rl.prompt();
  });

  writeToScreen(`Joined "${swarm.channel}" as "${swarm.id}"...`);

  rl.prompt();
});

function writeToScreen(msg: string) {
  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  console.log(msg);
}

function delay(time: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, time));
}