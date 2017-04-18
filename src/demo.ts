const readline = require('readline');
import { EventSwarm, EventHandler, EventArgs } from './';
import { Lookup } from './utils';

interface ChatData {
  from: string;
  msg: string;
}

interface Introduction {
  name: string;
}

let swarm: EventSwarm;
let names: Lookup<string> = {};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `>`
});

rl.question(`What is your name?\n>`, (name: string) => {
  rl.setPrompt(`${name}> `);
  rl.on('close', async () => {
    writeToChat('Have a great day!');

    await delay(200);
    swarm.close();

    await delay(200);
    process.exit(0);
  });
  rl.question(`Which channel would you like to join?\n>`, (channel: string) => {

    swarm = new EventSwarm({ channel });

    swarm.on('event-swarm:connect', ({ id }) => {
      writeToChat(`Connect (${id})`);
    }).on('event-swarm:disconnect', ({ id }) => {
      writeToChat(`"${name}" left the chat... (${id})`);
    }).on<ChatData>('chat', (data, e) => {
      writeToChat(data.from, data.msg);
      rl.prompt(true);
    }).on<Introduction>('intro', ({ name }, e) => {
      names[e.sender] = name;
      writeToChat(`"${name}" joined the chat...`);
    });
        
    rl.on('line', (line: string) => {
      line = line.trim();
      if (line === '/exit') {
        return rl.close();
      }

      swarm.emit<ChatData>('chat', { from: name, msg: line.trim() });
      rl.prompt();
    });

    writeToChat(`Welcome to ${swarm.channel}... `);
    setTimeout(() =>
      swarm.emit<Introduction>('intro', { name })
      , 100);

    rl.prompt();
  });
});

function writeToChat(sender: string, msg?: string) {
  if (!msg) {
    msg = sender;
    sender = '        ';
  } else {
    sender = `${sender}> `;
  }

  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  console.log(`${sender}${msg}`);
}

function delay(time: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, time));
}