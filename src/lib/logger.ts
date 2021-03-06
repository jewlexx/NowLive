/* eslint-disable no-console */
const dev = process.env.PRODUCTION !== 'true';

export function log(...data: unknown[]): void {
  if (dev) {
    console.log(...data);
  }
}

export function error(...data: unknown[]): void {
  if (dev) {
    console.error(...data);
  }
}
