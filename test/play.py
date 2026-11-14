import asyncio, json, sys
from playwright.async_api import async_playwright
URL='file://'+sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2)
    pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('**/*gstatic*',lambda r:r.abort()); await pg.route('**/*googleapis*',lambda r:r.abort())
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.screenshot(path='/tmp/shots/01_intro.png')
    await pg.click('[data-a=start]'); await pg.wait_for_timeout(200)
    await pg.screenshot(path='/tmp/shots/02_town.png',full_page=True)
    # lab: balance lime
    await pg.click('[data-tab=lab]'); await pg.click('[data-v=lime]'); await pg.wait_for_timeout(100)
    await pg.screenshot(path='/tmp/shots/03_bal.png')
    await pg.click('[data-a=bcheck]')  # 1,1,1 is correct for lime
    await pg.wait_for_timeout(100); await pg.screenshot(path='/tmp/shots/04_craft.png')
    await pg.click('[data-a=cq]:has-text("最大")'); await pg.click('[data-a=craft]'); await pg.click('[data-a=close]')
    # malachite balance wrong first
    await pg.click('[data-v=malheat]'); await pg.click('[data-a=bcheck]'); await pg.wait_for_timeout(100)
    await pg.screenshot(path='/tmp/shots/05_balwrong.png')
    await pg.click('[data-a=cup][data-v="1"]'); await pg.click('[data-a=bcheck]'); await pg.wait_for_timeout(100)
    await pg.screenshot(path='/tmp/shots/06_balok.png')
    await pg.click('[data-a=close]')
    # gather
    await pg.click('[data-tab=gather]'); await pg.screenshot(path='/tmp/shots/07_gather.png',full_page=True)
    await pg.click('[data-a=gat][data-v=h2o]'); await pg.click('[data-a=gans][data-v="0"]'); await pg.wait_for_timeout(100)
    await pg.screenshot(path='/tmp/shots/08_gq.png')
    await pg.click('#qfb [data-a=close]')
    # cheat inventory to test donate/building done/chapter
    await pg.evaluate("()=>{save.inv.caoh2=10;save.inv.cao=5;save.inv.cu=9;save.inv.fe=9;save.inv.so2=5;save.inv.h2=8;save.inv.co2=10;persist();render()}")
    await pg.click('[data-tab=town]'); await pg.click('[data-v=house]'); await pg.wait_for_timeout(100)
    await pg.screenshot(path='/tmp/shots/09_bld.png')
    await pg.click('[data-a=donate][data-i=caoh2]'); await pg.click('[data-a=donate][data-i=cao]'); await pg.wait_for_timeout(200)
    await pg.screenshot(path='/tmp/shots/10_done.png')
    await pg.click('[data-a=bquiz]'); await pg.wait_for_timeout(100)
    ans=await pg.evaluate("BDM.house[6].o[0]"); await pg.click(f'.opt[data-o="{ans}"]')
    await pg.screenshot(path='/tmp/shots/11_card.png')
    await pg.click('#qfb [data-a=close]')
    for bid,items in [('smithy',['cu','fe']),('granary',['so2','cao']),('lantern',['h2'])]:
      await pg.click(f'[data-v={bid}]')
      for i in items: await pg.click(f'[data-a=donate][data-i={i}]')
      await pg.click('[data-a=close]')
    await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/shots/12_town2.png',full_page=True)
    # daily
    await pg.click('[data-tab=daily]'); await pg.screenshot(path='/tmp/shots/13_daily.png',full_page=True)
    for k in range(3):
      await pg.click('[data-a=dans][data-v="0"]'); await pg.click('[data-a=dnext]')
    await pg.screenshot(path='/tmp/shots/14_dailydone.png',full_page=True)
    # gift
    await pg.click('[data-tab=lab]'); await pg.click('.chip[data-v=co2]'); await pg.click('[data-a=gq][data-v="1"]'); await pg.click('[data-a=gift]')
    herpub=await pg.evaluate("()=>JSON.parse(JSON.stringify(pub()))")
    await pg.click('[data-tab=book]'); await pg.screenshot(path='/tmp/shots/15_book.png',full_page=True)
    # partner view as j
    pg2=await ctx.new_page(); pg2.on('pageerror',lambda e:errs.append('p2 '+str(e)))
    await pg2.add_init_script("localStorage.setItem('mb_role','j')")
    await pg2.goto(URL); await pg2.wait_for_timeout(300); await pg2.click('[data-a=start]')
    herpub['ts']=0
    await pg2.evaluate("d=>onPartner(d)",herpub); await pg2.wait_for_timeout(600)
    await pg2.screenshot(path='/tmp/shots/16_j_town.png',full_page=True)
    print('j co2',await pg2.evaluate("inv('co2')"), 'ch',await pg2.evaluate("curCh()"))
    await pg2.click('[data-tab=daily]'); await pg2.screenshot(path='/tmp/shots/17_j_daily.png',full_page=True)
    # daily answer check vs both roles same questions
    q1=await pg.evaluate("dailyQs(todayStr()).map(g=>g.q+g.o.join())"); q2=await pg2.evaluate("dailyQs(todayStr()).map(g=>g.q+g.o.join())")
    print('same daily',q1==q2)
    # all generators over many days: correct answer unique and 4 opts
    bad=await pg.evaluate("""()=>{let bad=[];for(let i=0;i<400;i++){const d='2027-'+String(1+i%12).padStart(2,'0')+'-'+String(1+i%28).padStart(2,'0')+'x'+i;dailyQs(d).forEach(g=>{if(g.o.length!==4||new Set(g.o).size!==4||g.a<0)bad.push(g.q)})}return bad.slice(0,5)}""")
    print('daily bad',bad)
    print('errors',errs)
    await b.close()
asyncio.run(main())
