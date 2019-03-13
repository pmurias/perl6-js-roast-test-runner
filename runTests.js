const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');

app.use(express.static('static'));
app.use(express.static('tests'));

const server = app.listen(port, () => true);

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});

  function runTest(file, tap) {
    console.log('running', file);

    return new Promise(function(resolve, reject) {
      (async () => {

        const page = await browser.newPage();

        async function gotError(error) {
          await page.close();
          reject(error);
        }

        try {
          page.on('error', gotError);
          page.on('pageerror', gotError);

          page.on('console', msg => {
            if (msg.type() === 'log') {
              //console.log('tap:', msg.text());
              tap.push(msg.text());
            } else if (msg.type() === 'info' && msg.text() === 'end') {
              (async () => {
                await page.close();
                resolve();
              })();
            } else if (msg.type() === 'info' && msg.text() === 'exit ') {
              tap.push('EXIT');
            } else if (msg.type() === 'error') {
              console.log('error:', msg.text());
              tap.push(msg.text());
            } else {
              console.log('got msg', msg);
            }
          });

          page.on('domcontentloaded', () => {
            page.evaluate(x => window.runTest(x), file.replace(/^tests\//, ''));
          });

          await page.goto('http://localhost:3000/load_test.html');

        } catch (e) {
          console.log('error', e);
        }
        

      })();
    });
  }

  async function runTestAndWriteTap(file) {
    const tap = [];
    try {
      await runTest(file, tap);
    } catch (e) {
      tap.push(e.toString());
    }
    fs.writeFileSync('output/' + file.replace('\.js', '.tap'), tap.join('\n'));
  }

  try {
    const tap = [];

    for (const test of fs.readdirSync('tests').filter(test => /.js$/.test(test))) {
      await runTestAndWriteTap(test);
    }
  } catch (e) {
    console.log(`can't run test`, e);
  }
  console.log('test completed');

  server.close();

  await browser.close();
})();
