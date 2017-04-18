import { test } from 'ava';

import { randomString } from './utils';

test(`randomString requires 'length' to be greater than zero`, t => {
  [0, -1, -2, -100].forEach(invalidLength => {
    t.throws(() => randomString(invalidLength))
  });
});

test(`randomString has customizable 'length'`, t => {
  [1, 2, 3, 8, 16, 32, 127].forEach(expectedLength => {
    let str = randomString(expectedLength);

    t.is(str.length, expectedLength, `Failed with length = ${expectedLength}`);
  });
});