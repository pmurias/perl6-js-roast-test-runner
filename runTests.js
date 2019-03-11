const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('static'));
app.use(express.static('tests'));

const server = app.listen(port, () => true);

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  function runTest() {
    return new Promise(function(resolve, reject) {
      (async () => {
        try {
          page.on('error', reject);
          page.on('pageerror', reject);

          page.on('console', msg => {
            if (msg.type() === 'log') {
              console.log('tap:', msg.text());
            } else if (msg.type() === 'info' && msg.text() === 'end') {
              console.log('test ended');
              resolve();
            } else {
              console.log('got msg', msg);
            }
          });

          await page.goto('http://localhost:3000/load_test.html');
        } catch (e) {
          console.log('error', e);
        }
        

      })();
    });
  }

  console.log('running test');
  try {
    await runTest();
  } catch (e) {
    console.log(`can't run test`, e);
  }
  console.log('test completed');

  server.close();

  await browser.close();
})();
