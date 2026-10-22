'use strict';
(()=>{
const canvas=document.getElementById('station-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;const W=960,H=620;canvas.width=W;canvas.height=H;
const rooms=[
{id:'manager',name:'MANAGER HQ',x:354,y:34,w:252,h:177,c:'#f4c36e',role:'Command & approvals'},
{id:'research',name:'RESEARCH',x:42,y:48,w:256,h:188,c:'#b8a1ff',role:'Discovery & analysis'},
{id:'marketing',name:'MARKETING',x:662,y:48,w:256,h:188,c:'#fa84ba',role:'Creative & campaigns'},
{id:'job_hunter',name:'CLIENT ACQUISITION',x:354,y:250,w:252,h:78,c:'#86dafa',role:'Leads & outreach drafts'},
{id:'product_factory',name:'PRODUCT FACTORY',x:42,y:357,w:256,h:206,c:'#ffbd70',role:'Digital product studio'},
{id:'quality_control',name:'QUALITY CONTROL',x:354,y:357,w:252,h:206,c:'#65e8ba',role:'Audit & revisions'},
{id:'publishing',name:'PUBLISHING',x:662,y:357,w:256,h:206,c:'#84baff',role:'Release queue'}];
const states={};let selected='manager',zoom=1,panX=0,panY=0,drag=null,frame=0;
const color=s=>({working:'#55f5b8',completed:'#7dd5ff',pending_review:'#ffd179',blocked:'#fb8589',failed:'#ff6666',idle:'#9eabb6'})[s]||'#98aab0';
const box=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
const stroke=(x,y,w,h,c,l=1)=>{ctx.strokeStyle=c;ctx.lineWidth=l;ctx.strokeRect(x,y,w,h)};
const txt=(t,x,y,c='#d3e9e6',sz=11,align='left')=>{ctx.font='bold '+sz+'px monospace';ctx.textAlign=align;ctx.fillStyle=c;ctx.fillText(t,x,y)};
function glow(x,y,r,c){let g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function floor(x,y,w,h){box(x,y,w,h,'#101c23');for(let yy=y;yy<y+h;yy+=24)for(let xx=x;xx<x+w;xx+=24){const odd=((Math.floor(xx/24)+Math.floor(yy/24))%2);box(xx+1,yy+1,22,22,odd?'#202d32':'#1a282d');box(xx+2,yy+2,18,1,'#314047');box(xx+20,yy+20,2,2,'#527078');if((xx+yy)%5===0)box(xx+8,yy+8,2,2,'#415057')}}
function wallDetails(r){for(let x=r.x+16;x<r.x+r.w-16;x+=42){box(x,r.y-10,29,4,'#91a6aa');box(x+3,r.y-13,23,2,'#293b42');box(x+11,r.y-7,4,3,r.c)}for(let y=r.y+45;y<r.y+r.h-20;y+=44){box(r.x-10,y,4,24,'#a0a9a6');box(r.x+r.w+6,y,4,24,'#a0a9a6')}for(let x=r.x+25;x<r.x+r.w-20;x+=70){box(x,r.y+40,30,5,'#39494d');box(x+3,r.y+41,6,3,'#83d5c9')} }
function walls(r){box(r.x-10,r.y-10,r.w+20,r.h+20,'#071118');box(r.x-8,r.y-8,r.w+16,r.h+16,'#586d78');box(r.x-5,r.y-5,r.w+10,r.h+10,'#101c24');floor(r.x,r.y,r.w,r.h);
for(let xx=r.x+5;xx<r.x+r.w-5;xx+=27){box(xx,r.y-6,19,5,'#738a92');box(xx,r.y+r.h+1,19,4,'#536d77')}
for(let yy=r.y+8;yy<r.y+r.h-8;yy+=29){box(r.x-6,yy,5,21,'#71838c');box(r.x+r.w+1,yy,5,21,'#71838c')}
wallDetails(r);box(r.x+8,r.y+8,r.w-16,27,'#071117');box(r.x+8,r.y+33,r.w-16,2,r.c);txt(r.name,r.x+18,r.y+25,r.c,12);box(r.x+r.w-23,r.y+17,9,9,color(states[r.id]||'blocked'));
}
function fixture(x,y,c){box(x-9,y-5,18,10,'#060f16');box(x-7,y-4,14,7,c);box(x-4,y-2,8,3,'#ddffec');glow(x,y,22,c+'35')}
function terminal(x,y,c,working,i){box(x-22,y-11,44,29,'#07141a');box(x-19,y-8,38,21,working?c:'#344e57');box(x-15,y-4,29,3,'#b7eff0');box(x-15,y+2,20,2,'#175361');box(x-4,y+18,8,5,'#657b7b');box(x-29,y+24,58,10,'#685c4c');box(x-32,y+34,64,4,'#292f32');if(working&&frame%90<40)box(x+12,y-5,3,3,'#fff')}
function agent(x,y,c,active,i){const bob=active?Math.round(Math.sin(frame*.09+i)*2):0;box(x-7,y+16,14,4,'#050b0e');box(x-4,y+4+bob,8,12,c);box(x-5,y-7+bob,10,11,'#c3d4d2');box(x-3,y-4+bob,2,2,'#071a20');box(x+2,y-4+bob,2,2,'#071a20');box(x-8,y+5+bob,3,8,'#8d9fa5');box(x+5,y+5+bob,3,8,'#8d9fa5')}
function drawRoom(r,i){walls(r);const s=states[r.id]||'blocked',active=s==='working';if(r.id==='job_hunter'){for(let k=0;k<3;k++){const x=r.x+54+k*72;terminal(x,r.y+52,r.c,active,k);agent(x+28,r.y+49,r.c,active,k)}}else{for(let k=0;k<6;k++){const x=r.x+51+(k%3)*((r.w-102)/2),y=r.y+64+Math.floor(k/3)*73;terminal(x,y,r.c,active,k);agent(x+27,y+24,r.c,active,k)}}if(r.id==='manager'){fixture(r.x+22,r.y+48,'#65e3d6');fixture(r.x+r.w-22,r.y+48,'#65e3d6');const x=r.x+r.w/2,y=r.y+118;glow(x,y,70,'#21c9d522');box(x-34,y-18,68,33,'#0c2630');stroke(x-34,y-18,68,33,'#78b6bb',2);txt('COMMAND',x,y+2,'#b6f8e9',10,'center')}else if(r.id!=='job_hunter'){fixture(r.x+r.w-26,r.y+54,r.c);box(r.x+r.w-38,r.y+43,23,33,'#09161d');stroke(r.x+r.w-38,r.y+43,23,33,'#506873');box(r.x+r.w-33,r.y+49,13,4,r.c);box(r.x+r.w-33,r.y+60,13,3,'#58747b')}
box(r.x+13,r.y+r.h-18,Math.min(170,r.w-26),12,'#0a161b');txt(s.replaceAll('_',' ').toUpperCase(),r.x+17,r.y+r.h-8,color(s),10);
if(selected===r.id){stroke(r.x-9,r.y-9,r.w+18,r.h+18,r.c,3);glow(r.x+r.w/2,r.y+2,45,r.c+'35')}}
function corridor(x,y,w,h){floor(x,y,w,h);stroke(x,y,w,h,'#64787c',3);for(let i=0;i<(w>h?w:h);i+=29){if(w>h){box(x+i,y+2,12,3,'#69a5a6');box(x+i,y+h-5,12,3,'#69a5a6')}else{box(x+2,y+i,3,12,'#69a5a6');box(x+w-5,y+i,3,12,'#69a5a6')}}}
function draw(){frame++;ctx.setTransform(1,0,0,1,0,0);box(0,0,W,H,'#030b12');for(let i=0;i<85;i++){const x=(i*167+43)%W,y=(i*89+61)%H;box(x,y,i%7===0?2:1,1,'#254451')}ctx.setTransform(zoom,0,0,zoom,panX*zoom,panY*zoom);
corridor(298,110,56,405);corridor(606,110,56,405);corridor(298,250,364,72);
rooms.forEach(drawRoom);
// Operational connections are shown as a network overlay, not a claim of live work.
ctx.save();ctx.globalAlpha=.85;ctx.setLineDash([4,8]);ctx.strokeStyle='#3a9996';ctx.lineWidth=1;for(const r of rooms){if(r.id==='manager')continue;const a=rooms[0];ctx.beginPath();ctx.moveTo(a.x+a.w/2,a.y+a.h+6);ctx.lineTo(r.x+r.w/2,r.y+r.h/2);ctx.stroke()}ctx.restore();
// Status beacons: blink only for departments recorded as working.
rooms.forEach(r=>{if(states[r.id]==='working'){const x=r.x+r.w-22,y=r.y+21;glow(x,y,16,'#62f5b955');if(frame%60<35)box(x-3,y-3,6,6,'#d5fff0')}});
for(let i=0;i<8;i++){const x=313+(i%4)*106,y=274+Math.floor(i/4)*22;box(x,y,7,7,i%2?'#83e6d0':'#f1bf70')}
ctx.setTransform(1,0,0,1,0,0);box(0,0,W,30,'#0c2227');box(0,29,W,2,'#3b8b83');txt('◈ MINION HQ  /  STATION COMMAND',15,20,'#a1f6c4',13);txt('GITHUB SNAPSHOT  •  NOT LIVE',W-16,20,'#e2bd81',11,'right');
box(0,H-28,W,28,'#0c2227');box(0,H-29,W,2,'#3b8b83');txt('TAP AN OFFICE TO INSPECT   •   DRAG TO PAN   •   + / − TO ZOOM',W/2,H-10,'#acd2d0',11,'center');
if(document.visibilityState!=='hidden')requestAnimationFrame(draw)}
function position(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width/zoom-panX,y:(e.clientY-b.top)*H/b.height/zoom-panY}}
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,px:panX,py:panY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>9)drag.moved=true;if(drag.moved){panX=drag.px+dx*W/canvas.getBoundingClientRect().width/zoom;panY=drag.py+dy*H/canvas.getBoundingClientRect().height/zoom}});
canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved){const p=position(e);const r=rooms.find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);if(r){selected=r.id;window.selectStationDepartment?.(r.id)}}drag=null});
canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.8,zoom+(e.deltaY<0?.1:-.1)))},{passive:false});
window.updateStationStates=s=>{for(const r of rooms)states[r.id]=s?.[r.id]||'blocked'};
window.focusStationDepartment=id=>{if(rooms.some(r=>r.id===id))selected=id};
document.getElementById('zoom-in')?.addEventListener('click',()=>zoom=Math.min(1.8,zoom+.15));
document.getElementById('zoom-out')?.addEventListener('click',()=>zoom=Math.max(.7,zoom-.15));
document.getElementById('station-fullscreen')?.addEventListener('click',()=>{const host=canvas.closest('.game-viewport');if(document.fullscreenElement)document.exitFullscreen();else host?.requestFullscreen?.()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')requestAnimationFrame(draw)});canvas.style.touchAction='none';draw();
})();