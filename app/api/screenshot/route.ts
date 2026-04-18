import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  let browser;
  try {
    const { targetPath, selector } = await req.json();
    
    // Resolve cookies dynamically via Next.js headers
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://62.77.156.58:8739';
    const url = new URL(targetPath, baseUrl);

    // Set cookies for both domains just to be safe
    const domains = [new URL(baseUrl).hostname, 'localhost'];
    for (const d of domains) {
      const puppeteerCookies = allCookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: d,
        path: '/',
      }));
      if (puppeteerCookies.length > 0) {
        await page.setCookie(...puppeteerCookies);
      }
    }

    await page.goto(url.toString(), { waitUntil: 'networkidle0', timeout: 30000 });

    // Focus on element and add watermark
    if (selector) {
      await page.waitForSelector(selector, { timeout: 10000 }).catch(() => null);
      
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Hide everything else
          document.querySelectorAll('body > *').forEach((node) => {
             if (node !== el && !node.contains(el) && !el.contains(node)) {
                 (node as HTMLElement).style.display = 'none';
             }
          });
          document.body.style.background = '#0a0f1a';
        }
      }, selector);
    }
    
    // Add watermark
    await page.evaluate(() => {
        const watermark = document.createElement('div');
        watermark.style.position = 'fixed';
        watermark.style.top = '50%';
        watermark.style.left = '50%';
        watermark.style.transform = 'translate(-50%, -50%) rotate(-30deg)';
        watermark.style.pointerEvents = 'none';
        watermark.style.zIndex = '999999';
        
        const txt = document.createElement('div');
        txt.innerHTML = 'MT Community';
        txt.style.fontSize = '8vw';
        txt.style.fontWeight = '900';
        txt.style.color = 'rgba(255, 0, 0, 0.4)';
        txt.style.textShadow = '0 0 20px rgba(255,0,0,0.2)';
        txt.style.whiteSpace = 'nowrap';
        txt.style.padding = '40px';
        txt.style.border = '15px double rgba(255,0,0,0.4)';
        txt.style.borderRadius = '30px';
        
        watermark.appendChild(txt);
        document.body.appendChild(watermark);
    });

    // Take screenshot
    let imageBuffer;
    if (selector) {
      const element = await page.$(selector);
      if (element) {
        // give it a moment to render animations
        await new Promise(resolve => setTimeout(resolve, 500));
        imageBuffer = await element.screenshot({ type: 'png' });
      } else {
        imageBuffer = await page.screenshot({ type: 'png', fullPage: true });
      }
    } else {
      imageBuffer = await page.screenshot({ type: 'png', fullPage: true });
    }

    await browser.close();
    browser = null; // nullify to prevent catching

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to take screenshot', details: String(error) }, { status: 500 });
  }
}
