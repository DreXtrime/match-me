import { worker } from './browser.js';
import { DEMO_TOKEN, DEMO_USER_ID } from './data.js';

export async function initDemo() {
  // Seed auth so app boots as logged-in
  localStorage.setItem('token', DEMO_TOKEN);
  localStorage.setItem('userId', DEMO_USER_ID);

  await worker.start({
    onUnhandledRequest: 'bypass', // don't warn on non-API requests (fonts, etc.)
  });
}
