const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file:///Users/natanaelfernandogattibrentano/Andrio/index.html');
    
    // Wait for the slider to initialize
    await page.waitForTimeout(2000);
    
    // Check if slider exists and buttons exist
    const slider = await page.$('#catalogo');
    const prev = await page.$('#arrow-prev');
    const next = await page.$('#arrow-next');
    
    console.log('Slider exists:', !!slider);
    console.log('Prev exists:', !!prev);
    console.log('Next exists:', !!next);
    
    // Try to trigger click on next
    const btnNext = await page.evaluate(() => {
        const n = document.getElementById('arrow-next');
        if (n) n.click();
        return !!n;
    });
    console.log('Clicked next:', btnNext);
    
    // Get transform
    const transform = await page.evaluate(() => {
        const s = document.querySelector('.keen-slider__slide');
        return s ? s.style.transform : 'null';
    });
    console.log('Transform after click:', transform);
    
    await browser.close();
})();
