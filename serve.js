const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  console.log('got response');
  res.send('Hello World');
});

app.use(express.static('static'));
app.use(express.static('tests'));

app.listen(port, () => console.log(`Listening on port ${port}`));

const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('tap:', msg.text());
      } else {
        console.log('got msg', msg);
      }
    });
    await page.goto('http://localhost:3000/load_test.html');
//    await browser.close();
  } catch (e) {
    console.log('error', e);
  }
})();
