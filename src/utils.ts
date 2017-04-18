import { randomBytes } from 'crypto';

export type Lookup<T> = { [key: string]: T };

export function randomString(length: number): string {
  if (length < 1) {
    throw new Error(`'length' must be greater than zero!`);
  }

  let bytes = Math.ceil(length / 2);

  let str = randomBytes(bytes).toString('hex');
    
  if (length % 2 === 1) {
    str = str.slice(0, length);
  }

  return str;
}