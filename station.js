'use strict';
(()=>{
const canvas=document.getElementById('station-canvas');if(!canvas)return;
const c=canvas.getContext('2d');const W=960,H=620;canvas.width=W;canvas.height=H;
const buildings=[
{id:'manager',name:'MANAGER HQ',role:'Command & approvals',x:0,y:0,h:156,w:108,d:95,accent:'#48f9ff'},
{id:'product_factory',name:'PRODUCT FACTORY',role:'Digital products',x:-225,y:25,h:79,w:105,d:82,accent:'#ffb24d'},
{id:'quality_control',name:'QUALITY CONTROL',role:'Inspection',x:225,y:15,h:86,w:102,d:82,accent:'#61f4b6'},
{id:'research',name:'RESEARCH',role:'Ideas & trends',x:-230,y:-190,h:96,w:96,d:77,accent:'#9e8aff'},
{id:'marketing',name:'MARKETING',role:'Campaign studio',x:230,y:-190,h:78,w:100,d:82,accent:'#ff74cf'},
{id:'publishing',name:'PUBLISHING',role:'Release gate',x:-115,y:210,h:76,w:98,d:74,accent:'#83a9ff'},
{id:'job_hunter',name:'CLIENT ACQUISITION',role:'Opportunity desk',x:155,y:205,h:83,w:95,d:76,accent:'#ffdc73'}
];
let states={},selected='manager',zoom=1,panX=0,panY=0,frame=0,hit=[],drag=null;
function poly(points,fill,stroke){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
function line(a,b,color,width=2,dash=[]){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([])}
function txt(s,x,y,size=12,color='#e6faff',align='center'){c.font='bold '+size+'px system-ui, sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y)}
function iso(x,y,z=0){return [W/2+panX+(x-y)*.87*zoom,H*.43+panY+(x+y)*.42*zoom-z*zoom]}
function box(x,y,w,d,h,front,side,top){let a=iso(x-w/2,y-d/2),b=iso(x+w/2,y-d/2),cc=iso(x+w/2,y+d/2),dd=iso(x-w/2,y+d/2),at=iso(x-w/2,y-d/2,h),bt=iso(x+w/2,y-d/2,h),ct=iso(x+w/2,y+d/2,h),dt=iso(x-w/2,y+d/2,h);poly([dd,cc,ct,dt],front,'#2b628a');poly([b,cc,ct,bt],side,'#26567c');poly([at,bt,ct,dt],top,'#83b0d5');return {a,b,cc,dd,at,bt,ct,dt}}
function glow(x,y,r,color){let g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function tree(x,y){let [sx,sy]=iso(x,y);line([sx,sy],[sx,sy-18*zoom],'#254c4c',4*zoom);poly([[sx,sy-28*zoom],[sx-9*zoom,sy-13*zoom],[sx,sy-5*zoom],[sx+9*zoom,sy-13*zoom]],'#1ac4a2','#67fbe2');}
function building(b){let state=states[b.id]||'blocked',active=state==='working',isSelected=selected===b.id;
const base=iso(b.x,b.y),foot=box(b.x,b.y,b.w+20,b.d+20,7,'#152954','#0c244a','#213b6e');
glow(base[0],base[1],110*zoom,b.accent+'22');
let s=box(b.x,b.y,b.w,b.d,b.h,'#122d59','#091e43','#345b88');
for(let floor=0;floor<Math.floor(b.h/25);floor++){let z=18+floor*24;for(let j=-1;j<=1;j++){let p=iso(b.x+j*b.w/3,b.y+b.d/2+1,z);poly([[p[0]-9*zoom,p[1]-6*zoom],[p[0]+9*zoom,p[1]+3*zoom],[p[0]+9*zoom,p[1]+13*zoom],[p[0]-9*zoom,p[1]+4*zoom]],b.accent+'cc','#99ecff');glow(p[0],p[1],12*zoom,b.accent+'66')}}
for(let j=-1;j<=1;j++){let p=iso(b.x+b.w/2+1,b.y+j*b.d/3,27);poly([[p[0]-6*zoom,p[1]-9*zoom],[p[0]+6*zoom,p[1]-3*zoom],[p[0]+6*zoom,p[1]+13*zoom],[p[0]-6*zoom,p[1]+7*zoom]],b.accent,'#c5efff')}
let top=iso(b.x,b.y,b.h+6);poly([iso(b.x-b.w/3,b.y-b.d/3,b.h+2),iso(b.x+b.w/3,b.y-b.d/3,b.h+2),iso(b.x+b.w/3,b.y+b.d/3,b.h+2),iso(b.x-b.w/3,b.y+b.d/3,b.h+2)],'#18386a','#65d6ff');
if(b.id==='manager'){for(let i=0;i<5;i++){let p=iso(b.x-27+i*13,b.y,b.h+3);line(p,[p[0],p[1]-20*zoom],b.accent,2*zoom)}glow(top[0],top[1]-33*zoom,43*zoom,'#20c9ff88');poly([[top[0],top[1]-48*zoom],[top[0]+18*zoom,top[1]-28*zoom],[top[0],top[1]-8*zoom],[top[0]-18*zoom,top[1]-28*zoom]],'#22d8ff','#b8faff')}
else {let p=iso(b.x,b.y,b.h+4);line(p,[p[0],p[1]-19*zoom],b.accent,3*zoom);glow(p[0],p[1]-20*zoom,15*zoom,b.accent+'99')}
let label=iso(b.x,b.y,b.h+55),status=state.replaceAll('_',' ').toUpperCase();
if(isSelected){c.strokeStyle=b.accent;c.lineWidth=3;c.setLineDash([7,5]);c.beginPath();c.ellipse(base[0],base[1],70*zoom,30*zoom,0,0,Math.PI*2);c.stroke();c.setLineDash([])}
line([top[0],top[1]-38*zoom],[label[0],label[1]+10],b.accent+'bb',1.5);
txt(b.name,label[0],label[1],Math.max(9,12*zoom),'#ffffff');
txt(status,label[0],label[1]+15,Math.max(8,9*zoom),active?'#5fffc7':state==='completed'?'#8fffd7':state==='pending_review'?'#ffcd7b':'#a7b8dc');
hit.push({id:b.id,x:base[0],y:base[1]-b.h*zoom*.65,r:Math.max(40,80*zoom)});
}
function render(){frame++;c.clearRect(0,0,W,H);let bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#030b36');bg.addColorStop(.55,'#09116a');bg.addColorStop(1,'#35116b');c.fillStyle=bg;c.fillRect(0,0,W,H);
for(let i=0;i<95;i++){let x=(i*173+47)%W,y=(i*97+11)%H;c.fillStyle=i%5?'#5571c0':'#a3dfff';c.fillRect(x,y,i%7===0?2:1,1)}
glow(W/2,H*.85,380,'#bd25ff44');
for(let x=-390;x<=390;x+=38){let a=iso(x,-365),b=iso(x,365);line(a,b,'#9d4fe51c',1)}
for(let y=-365;y<=365;y+=38){line(iso(-390,y),iso(390,y),'#9d4fe51c',1)}
// Elevated road network and neon lanes
const roads=[[[0,0],[-225,25]],[[0,0],[225,15]],[[0,0],[-230,-190]],[[0,0],[230,-190]],[[0,0],[-115,210]],[[0,0],[155,205]]];
for(const [a,b] of roads){let p=iso(...a),q=iso(...b);line(p,q,'#101d54',27*zoom);line(p,q,'#2c50b0',22*zoom);line(p,q,'#ec55ff',2*zoom,[10*zoom,9*zoom]);line(p,q,'#3eeaff',1*zoom)}
for(let x=-340;x<350;x+=55)for(let y=-290;y<300;y+=60){if(Math.hypot(x,y)>105&&buildings.every(b=>Math.hypot(x-b.x,y-b.y)>88))tree(x+((y+300)%3)*7,y)}
hit=[];buildings.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(building);
c.fillStyle='#06133bde';c.fillRect(14,14,240,65);c.strokeStyle='#2789dc';c.strokeRect(14,14,240,65);
txt('MINION HQ  /  AI CITY',28,39,16,'#75f6ff','left');txt('GITHUB SNAPSHOT · NOT LIVE',28,60,10,'#a8c1ff','left');
txt('TAP A BUILDING TO INSPECT',W/2,H-17,12,'#d6e7ff');
requestAnimationFrame(render)}
function pick(e){let b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;return {x,y}}
canvas.addEventListener('pointerdown',e=>{drag={...pick(e),px:panX,py:panY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let p=pick(e),dx=p.x-drag.x,dy=p.y-drag.y;if(Math.abs(dx)+Math.abs(dy)>8)drag.moved=true;if(drag.moved){panX=drag.px+dx;panY=drag.py+dy}});
canvas.addEventListener('pointerup',e=>{if(!drag)return;let p=pick(e);if(!drag.moved){let found=hit.map(h=>({...h,dist:Math.hypot(p.x-h.x,p.y-h.y)})).filter(h=>h.dist<h.r).sort((a,b)=>a.dist-b.dist)[0];if(found){selected=found.id;window.selectStationDepartment?.(found.id)}}drag=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.8,zoom+(e.deltaY<0?.1:-.1)))},{passive:false});
window.updateStationStates=s=>{states=s||{}};
document.getElementById('zoom-in')?.addEventListener('click',()=>zoom=Math.min(1.8,zoom+.15));
document.getElementById('zoom-out')?.addEventListener('click',()=>zoom=Math.max(.65,zoom-.15));
document.getElementById('station-fullscreen')?.addEventListener('click',()=>{let v=canvas.closest('.game-viewport');if(document.fullscreenElement)document.exitFullscreen();else v?.requestFullscreen?.()});
render();
})();