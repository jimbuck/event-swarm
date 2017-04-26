const readline = require('readline');
import { EventSwarm, EventHandler, EventArgs } from './';
import { Lookup } from './utils';


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

  swarm.on('event-swarm:connect', ({ id }) => {
    writeToScreen(`Connect (${id})`);
  }).on('event-swarm:disconnect', ({ id }) => {
    writeToScreen(`Disconnect (${id})`);
  }).on('message', ({ msg }, e) => {
    writeToScreen(`${e.sender}: ${msg}`);
  });
        
  rl.on('line', (line: string) => {
    line = line.trim();
    if (line === '/exit') {
      return rl.close();
    }

    swarm.emit('message', { msg: line.trim() });
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