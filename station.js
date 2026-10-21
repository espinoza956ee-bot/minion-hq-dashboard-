'use strict';
(()=>{
const canvas=document.getElementById('station-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=640,H=448;
const rooms=[
{id:'manager',name:'MANAGER',x:239,y:36,w:162,h:112},
{id:'product_factory',name:'PRODUCT FACTORY',x:27,y:36,w:192,h:154},
{id:'quality_control',name:'QUALITY CONTROL',x:421,y:36,w:192,h:154},
{id:'research',name:'RESEARCH',x:27,y:256,w:192,h:154},
{id:'marketing',name:'MARKETING',x:239,y:282,w:162,h:128},
{id:'publishing',name:'PUBLISHING',x:421,y:256,w:192,h:154}
];
let states={},tick=0;
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function label(s,x,y,color='#c9e6cf',size=9){ctx.fillStyle=color;ctx.font='bold '+size+'px monospace';ctx.fillText(s,x,y)}
function floor(x,y,w,h){rect(x,y,w,h,'#26342f');for(let i=x;i<x+w;i+=16)for(let j=y;j<y+h;j+=16){rect(i,j,15,15,((i+j)/16)%2?'#263730':'#2d3d35');rect(i,j,1,15,'#172722');rect(i,j,15,1,'#405045')}}
function terminal(x,y,active){rect(x-2,y-3,36,25,'#0c1318');rect(x,y,32,19,active?'#155f50':'#243d43');rect(x+3,y+3,26,11,active?'#4df5a4':'#558b83');rect(x+8,y+19,16,4,'#7c8580');rect(x-5,y+23,42,7,'#6e6655');rect(x-3,y+30,5,10,'#514d44');rect(x+31,y+30,5,10,'#514d44')}
function person(x,y,active,t){const sway=active?Math.round(Math.sin(t/10)*3):0;rect(x+5+sway,y,8,7,'#b9a58c');rect(x+3+sway,y+7,12,11,'#547b8c');rect(x+2+sway,y+18,5,7,'#202c36');rect(x+11+sway,y+18,5,7,'#202c36');rect(x+1+sway,y+9,3,8,'#c6a589');rect(x+15+sway,y+9,3,8,'#c6a589')}
function drawRoom(r){const active=states[r.id]==='working';floor(r.x,r.y,r.w,r.h);rect(r.x-5,r.y-5,r.w+10,7,'#77877d');rect(r.x-5,r.y-5,7,r.h+10,'#77877d');rect(r.x+r.w-2,r.y-5,7,r.h+10,'#77877d');rect(r.x-5,r.y+r.h-2,r.w+10,7,'#77877d');rect(r.x+6,r.y+5,r.w-12,17,'#121f1c');label(r.name,r.x+11,r.y+17,active?'#80ffc0':'#b1c9b5');rect(r.x+12,r.y+31,20,14,'#555f55');rect(r.x+r.w-34,r.y+31,20,14,'#555f55');terminal(r.x+r.w/2-16,r.y+36,active);person(r.x+r.w/2-8,r.y+87,active,tick);rect(r.x+r.w/2-12,r.y+r.h-4,24,9,'#2d3d35');rect(r.x+8,r.y+r.h-22,r.w-16,13,'#14221e');label((states[r.id]||'unknown').toUpperCase().replaceAll('_',' '),r.x+12,r.y+r.h-12,active?'#57ffc1':'#9baea5',8)}
function draw(){tick++;rect(0,0,W,H,'#0c1517');floor(12,12,W-24,H-24);for(let y=0;y<H;y+=16){rect(0,y,8,8,'#344940');rect(W-8,y,8,8,'#344940')}rect(224,166,192,100,'#3a4c43');for(let y=170;y<264;y+=16){rect(230,y,180,1,'#6b806d')}rect(302,162,36,114,'#202e29');rect(316,178,8,75,'#66aa83');rooms.forEach(drawRoom);rect(238,426,165,13,'#15221e');label('MINION HQ // OWNER CONTROL',247,436,'#6dbb91',9);requestAnimationFrame(draw)}
canvas.addEventListener('click',e=>{const bounds=canvas.getBoundingClientRect();const x=(e.clientX-bounds.left)*W/bounds.width,y=(e.clientY-bounds.top)*H/bounds.height;const r=rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(r&&typeof window.selectStationDepartment==='function')window.selectStationDepartment(r.id)});
window.updateStationStates=s=>{states=s||{}};
draw();
})();