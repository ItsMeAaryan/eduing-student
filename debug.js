const puppeteer = require('puppeteer-core');

(async () => {
  // Use a local chromium path if available or fallback
  const browser = await puppeteer.launch({ 
    channel: 'chrome', // Use system chrome
    headless: 'new'
  }).catch(e => {
    console.log("Failed to launch chrome, trying chromium...");
    return puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Common path on linux
      headless: 'new'
    });
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://localhost:3000/student/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('URL:', page.url());
  console.log('HTML LENGTH:', content.length);
  console.log(content.substring(0, 800));
  
  await browser.close();
})();
