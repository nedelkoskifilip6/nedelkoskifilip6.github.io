import {test,expect,type Page} from '@playwright/test';

async function ready(page:Page) {
  await page.goto('./');
  await page.evaluate(()=>document.fonts.ready);
  await expect.poll(()=>page.locator('.hero-image img').evaluate(i=>(i as HTMLImageElement).complete)).toBe(true);
}
async function scrollFrames(page:Page, destination:number) {
  return page.evaluate(async target=>{
    const header=document.querySelector<HTMLElement>('.site-header')!;
    const image=document.querySelector<HTMLElement>('.hero-image')!;
    const samples:{alpha:number;photoTop:number;photoBottom:number;headerBottom:number;scroll:number;logoColors:string[]}[]=[];
    const start=performance.now(), origin=scrollY, end=start+2400;
    // A controlled gesture samples the crossing independently of browser fling speed.
    await new Promise<void>(resolve=>{
      const frame=()=>{
        const fraction=Math.min(1,(performance.now()-start)/1400);
        window.scrollTo({top:origin+(target-origin)*fraction,behavior:'instant'});
        const r=image.getBoundingClientRect();
        const match=getComputedStyle(image).clipPath.match(/inset\(\s*([\d.]+)(%|px)?/);
        const inset=match?Number(match[1])*(match[2]==='%'?r.height/100:1):0;
        const channels=getComputedStyle(header).backgroundColor.match(/[\d.]+/g)!.map(Number);
        samples.push({alpha:channels.length===4?channels[3]:1,photoTop:r.top+inset,photoBottom:r.bottom,headerBottom:header.getBoundingClientRect().bottom,scroll:scrollY,logoColors:[...new Set([...header.querySelectorAll<HTMLElement>('.wordmark-art, .wordmark-art *')].filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>getComputedStyle(e).color))]});
        if(performance.now()<end)requestAnimationFrame(frame);else resolve();
      };requestAnimationFrame(frame);
    });return samples;
  },destination);
}

for(const [width,height] of [[1440,900],[390,844],[800,600]]) {
  test(`navigation follows the visible Hero mask in both directions at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height});await ready(page);
    const early=await scrollFrames(page,56);
    expect(early.at(-1)!.alpha).toBeLessThan(.02);
    const forward=await scrollFrames(page,height*1.4);
    expect(forward.filter(s=>s.alpha>.05&&s.alpha<.9).length).toBeGreaterThan(3);
    for(const sample of forward) {
      expect(sample.logoColors, 'All visible parts of the logo share one color').toHaveLength(1);
      if(sample.photoTop<.5&&sample.photoBottom>sample.headerBottom&&sample.scroll<height*.8)expect(sample.alpha).toBeLessThan(.03);
      if(sample.photoTop>=sample.headerBottom+2)expect(sample.alpha).toBeGreaterThan(.94);
    }
    expect(forward.at(-1)!.alpha).toBeGreaterThan(.94);
    const reverse=await scrollFrames(page,0);
    expect(reverse.filter(s=>s.alpha>.05&&s.alpha<.9).length).toBeGreaterThan(3);
    expect(reverse.at(-1)!.alpha).toBeLessThan(.02);
    for(const sample of reverse)expect(sample.logoColors).toHaveLength(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  });
}

for(const reduced of [true,false]) {
  test(`static Hero navigation remains legible and reverses (${reduced?'reduced motion':'short screen'})`,async({page})=>{
    await page.setViewportSize({width:390,height:reduced?844:440});await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});await ready(page);
    const height=page.viewportSize()!.height;
    expect(await page.locator('html').getAttribute('class')).toContain('motion-lite');
    expect((await scrollFrames(page,56)).at(-1)!.alpha).toBeLessThan(.02);
    expect((await scrollFrames(page,height+50)).at(-1)!.alpha).toBeGreaterThan(.94);
    expect((await scrollFrames(page,0)).at(-1)!.alpha).toBeLessThan(.02);
  });
}

test('menu and credits navigation stays solid at the top',async({page})=>{
  for(const route of ['menu/','credits/']){
    await page.goto(route);
    const alpha=await page.locator('.site-header').evaluate(h=>{const c=getComputedStyle(h).backgroundColor.match(/[\d.]+/g)!.map(Number);return c.length===4?c[3]:1;});
    expect(alpha).toBeGreaterThan(.94);
  }
});
