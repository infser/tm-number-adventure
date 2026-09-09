#!/usr/bin/env python3
import json, urllib.request, time, base64, os, sys
import websocket

OUT = '/workspace/gigs/tm-edu-0506/screenshots'
os.makedirs(OUT, exist_ok=True)

tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
page = next((t for t in tabs if t.get('type')=='page' and 'webSocketDebuggerUrl' in t), tabs[0])
print('using', page.get('url'), file=sys.stderr)
ws = websocket.create_connection(page['webSocketDebuggerUrl'], timeout=30)
msg_id = 0

def cdp(method, params=None):
    global msg_id
    msg_id += 1
    mid = msg_id
    payload = {'id': mid, 'method': method}
    if params: payload['params'] = params
    ws.send(json.dumps(payload))
    while True:
        data = json.loads(ws.recv())
        if data.get('id') == mid:
            return data

def eval_js(expression):
    r = cdp('Runtime.evaluate', {'expression': expression, 'awaitPromise': True, 'returnByValue': True})
    if 'error' in r:
        raise RuntimeError(r)
    return r['result']['result'].get('value')

def screenshot(name):
    path = os.path.join(OUT, name)
    r = cdp('Page.captureScreenshot', {'format': 'png'})
    open(path,'wb').write(base64.b64decode(r['result']['data']))
    print('wrote', path, os.path.getsize(path))

cdp('Page.enable')
cdp('Runtime.enable')
cdp('Emulation.setDeviceMetricsOverride', {'width': 1280, 'height': 900, 'deviceScaleFactor': 1, 'mobile': False})
cdp('Page.navigate', {'url': 'http://127.0.0.1:8765/'})
time.sleep(1.5)
eval_js('try{localStorage.clear()}catch(e){}; true')
cdp('Page.reload')
time.sleep(1.2)
screenshot('01-home-1280.png')

eval_js('document.getElementById("btn-start").click(); true')
time.sleep(0.7)
screenshot('03-activity1-quantity.png')

for _ in range(5):
    target = int(eval_js('Number(document.getElementById("qty-numeral").textContent)'))
    eval_js('document.getElementById("qty-clear").click(); true')
    for i in range(target):
        eval_js('document.getElementById("qty-add").click(); true')
    eval_js('document.getElementById("qty-check").click(); true')
    time.sleep(1.1)

eval_js('var b=document.getElementById("qty-next"); if(b && !b.disabled) b.click(); true')
time.sleep(0.7)
screenshot('04-activity2-maketen.png')

for _ in range(5):
    partA = int(eval_js('Number(document.getElementById("mt-part-a").textContent)'))
    need = 10 - partA
    eval_js('document.getElementById("mt-clear").click(); true')
    for i in range(need):
        eval_js('document.getElementById("mt-add").click(); true')
    if partA == 7:
        screenshot('04b-maketen-7plus3.png')
    eval_js('document.getElementById("mt-check").click(); true')
    time.sleep(1.1)

eval_js('var b=document.getElementById("mt-next"); if(b && !b.disabled) b.click(); true')
time.sleep(0.7)
screenshot('05-activity3-stories.png')

for i in range(7):
    exp = eval_js('''
      (function(){
        var progress = document.getElementById("st-progress").textContent;
        var idx = parseInt(progress.match(/Story (\\d+)/)[1],10)-1;
        var s = window.TenContent.STORIES[idx];
        var D = window.TenDomain;
        var exp = s.answerMode==="whole" ? s.expected : D.storyAnswer(s.op, s.start, s.change);
        document.getElementById("st-clear").click();
        for (var i=0;i<exp;i++) document.getElementById("st-add").click();
        document.getElementById("st-check").click();
        return exp;
      })()
    ''')
    print('story', i+1, 'exp', exp)
    time.sleep(1.15)

eval_js('var b=document.getElementById("st-next"); if(b && !b.disabled) b.click(); true')
time.sleep(0.6)
screenshot('07-summary.png')

cdp('Page.navigate', {'url': 'http://127.0.0.1:8765/'})
time.sleep(1.0)
cdp('Emulation.setDeviceMetricsOverride', {'width': 360, 'height': 800, 'deviceScaleFactor': 1, 'mobile': True})
eval_js('try{localStorage.clear()}catch(e){}; true')
eval_js('document.getElementById("btn-start").click(); true')
time.sleep(0.6)
screenshot('02-mobile-360-quantity.png')

cdp('Emulation.setDeviceMetricsOverride', {'width': 768, 'height': 900, 'deviceScaleFactor': 1, 'mobile': False})
time.sleep(0.3)
screenshot('06-tablet-768.png')

ws.close()
print('ALL OK')
