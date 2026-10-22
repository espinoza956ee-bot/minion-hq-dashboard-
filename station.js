'use strict';
(()=>{
const canvas=document.getElementById('station-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d');const W=960,H=620;canvas.width=W;canvas.height=H;
const rooms=[
{id:'manager',name:'MANAGER HQ',x:355,y:35,w:250,h:170,color:'#e6bd68'},
{id:'research',name:'RESEARCH',x:52,y:66,w:245,h:174,color:'#a993ff'},
{id:'marketing',name:'MARKETING',x:663,y:66,w:245,h:174,color:'#fa88b6'},
{id:'product_factory',name:'PRODUCT FACTORY',x:52,y:347,w:245,h:208,color:'#ffc16e'},
{id:'quality_control',name:'QUALITY CONTROL',x:355,y:349,w:250,h:206,color:'#78e6b5'},
{id:'publishing',name:'PUBLISHING',x:663,y:348,w:245,h:208,color:'#84b8ff'},
{id:'job_hunter',name:'CLIENT ACQUISITION',x:355,y:240,w:250,h:76,color:'#9bdaf6'}];
const states={};let selected='manager',zoom=1,panX=0,panY=0,drag=null,phase=0;
const stateColor=s=>({working:'#48f6c6',completed:'#69c7ff',pending_review:'#ffcc76',idle:'#8699a9',blocked:'#ff8b8b',failed:'#ff6868'})[s]||'#8598a8';
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function line(x,y,x2,y2,c,w=2){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
function text(t,x,y,color='#d8e8e7',size=12,align='left'){ctx.font='bold '+size+'px monospace';ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(t,x,y)}
function screen(x,y,c,lit){rect(x-18,y-12,36,23,'#060f14');rect(x-15,y-9,30,16,lit?c:'#34464b');rect(x-11,y-6,21,2,'#c4f5e7');rect(x-11,y-1,14,2,'#1e5960');rect(x-2,y+11,4,7,'#50636c')}
function worker(x,y,c,active,i){let bob=active?Math.sin(phase/16+i*2)*2:0;rect(x-7,y+12,14,5,'#05090d');rect(x-5,y+3+bob,10,10,c);rect(x-5,y-7+bob,10,10,'#b5c4c3');rect(x-3,y-4+bob,2,2,'#111b20');rect(x+2,y-4+bob,2,2,'#111b20');rect(x-7,y+3+bob,3,9,'#5a6d70');rect(x+4,y+3+bob,3,9,'#5a6d70')}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function cabinet(x,y,c){rect(x,y,24,30,'#0a1117');rect(x+3,y+3,18,23,'#34444c');rect(x+6,y+7,12,3,c);rect(x+6,y+14,12,2,'#799195');rect(x+6,y+20,12,2,'#799195')}
function drawRoom(r,i){
const s=states[r.id]||'blocked',active=s==='working';
rect(r.x-11,r.y-11,r.w+22,r.h+22,'#080e15');rect(r.x-8,r.y-8,r.w+16,r.h+16,'#7c9295');rect(r.x-6,r.y-6,r.w+12,r.h+12,'#56666a');rect(r.x-3,r.y-3,r.w+6,r.h+6,'#172127');rect(r.x,r.y,r.w,r.h,'#172322');for(let yy=r.y+36;yy<r.y+r.h-12;yy+=29){rect(r.x+5,yy,8,22,'#61747a');rect(r.x+r.w-13,yy,8,22,'#61747a')}
for(let x=r.x+12;x<r.x+r.w;x+=24)for(let y=r.y+34;y<r.y+r.h;y+=24){rect(x,y,22,22,((x+y)/24|0)%2?'#202d2a':'#1d2827');rect(x+20,y+20,2,2,'#2f403a')}
for(let x=r.x+5;x<r.x+r.w-5;x+=28){rect(x,r.y+3,22,6,'#394846');rect(x,r.y+r.h-8,22,6,'#394846')}
for(let y=r.y+10;y<r.y+r.h-8;y+=28){rect(r.x+2,y,6,21,'#455352');rect(r.x+r.w-8,y,6,21,'#455352')}
for(let x=r.x+18;x<r.x+r.w-18;x+=45){rect(x,r.y+4,22,3,'#789398');rect(x+4,r.y+r.h-7,13,2,'#6e878b')}rect(r.x+10,r.y+9,r.w-20,22,'#071314');rect(r.x+10,r.y+29,r.w-20,2,r.color);
text(r.name,r.x+19,r.y+25,r.color,13);rect(r.x+r.w-25,r.y+15,9,9,stateColor(s));
const usable=r.h-55;const rows=usable<95?1:2;const count=rows===1?3:6;
for(let n=0;n<count;n++){const col=n%3,row=Math.floor(n/3),px=r.x+53+col*(r.w-106)/2,py=r.y+60+row*72;
rect(px-31,py+14,62,19,'#101a20');rect(px-29,py+16,58,15,'#39413b');rect(px-27,py+14,54,5,'#6d6352');screen(px,py,r.color,active||s==='completed');worker(px+22,py+25,r.color,active,n+i)}
if(r.id==='manager'){const cx=r.x+r.w/2;glow(cx,r.y+105,60,'#237e7e33');rect(cx-38,r.y+93,76,46,'#0b1c25');rect(cx-33,r.y+98,66,34,'#21444c');rect(cx-26,r.y+103,52,20,'#061820');text('COMMAND',cx,r.y+117,'#b9f8e7',11,'center');rect(cx-12,r.y+75,24,18,'#4b6670');rect(cx-8,r.y+77,16,12,'#66dfed');rect(cx-32,r.y+r.h-27,64,9,'#a88b5c')}else{cabinet(r.x+r.w-42,r.y+39,r.color)}
if(selected===r.id){ctx.strokeStyle=r.color;ctx.lineWidth=4;ctx.strokeRect(r.x-7,r.y-7,r.w+14,r.h+14)}
}
function corridor(x,y,w,h){rect(x,y,w,h,'#303c3b');for(let xx=x;xx<x+w;xx+=25)for(let yy=y;yy<y+h;yy+=25){ctx.strokeStyle='#4b5956';ctx.lineWidth=1;ctx.strokeRect(xx,yy,25,25)}}
function draw(){
phase++;ctx.setTransform(1,0,0,1,0,0);rect(0,0,W,H,'#050b10');ctx.setTransform(zoom,0,0,zoom,panX*zoom,panY*zoom);for(let i=0;i<80;i++){let x=(i*157)%W,y=(i*83)%H;rect(x,y,1,1,'#45616a')}
corridor(297,105,66,390);corridor(605,105,58,390);corridor(297,242,366,75);for(let x=315;x<645;x+=35){rect(x,260,10,3,'#7bd8cf');rect(x,296,10,3,'#7bd8cf')}
rooms.forEach(drawRoom);
for(const r of rooms){let s=states[r.id]||'blocked';text(s.replaceAll('_',' ').toUpperCase(),r.x+15,r.y+r.h-13,stateColor(s),10)}
rect(0,0,W,28,'#0d2425');text('MINION HQ  /  STATION COMMAND',18,19,'#9bf3c6',14);text('GITHUB SNAPSHOT · NOT LIVE',W-18,19,'#d5b77e',11,'right');
rect(0,H-28,W,28,'#0d2425');text('TAP A ROOM TO INSPECT  •  MANAGER CONTROLS THE WORKFLOW',W/2,H-10,'#a8c7c3',11,'center');
requestAnimationFrame(draw)
}
function point(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width/zoom-panX,y:(e.clientY-b.top)*H/b.height/zoom-panY}}
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,px:panX,py:panY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>10)drag.moved=true;if(drag.moved){panX=drag.px+dx*W/canvas.getBoundingClientRect().width/zoom;panY=drag.py+dy*H/canvas.getBoundingClientRect().height/zoom}});
canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved){let p=point(e),r=rooms.find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);if(r){selected=r.id;window.selectStationDepartment?.(r.id)}}drag=null});
function resizeTransform(){ctx.setTransform(zoom,0,0,zoom,panX*zoom,panY*zoom)}
window.updateStationStates=s=>{Object.assign(states,s||{})};
document.getElementById('zoom-in')?.addEventListener('click',()=>{zoom=Math.min(1.6,zoom+.1);resizeTransform()});
document.getElementById('zoom-out')?.addEventListener('click',()=>{zoom=Math.max(.7,zoom-.1);resizeTransform()});
document.getElementById('station-fullscreen')?.addEventListener('click',()=>{let host=canvas.closest('.game-viewport');if(document.fullscreenElement)document.exitFullscreen();else host?.requestFullscreen?.()});
canvas.style.touchAction='none';canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.6,zoom+(e.deltaY<0?.1:-.1)))},{passive:false});draw();
})();