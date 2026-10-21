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
function person(x,y,active,t,uniform='#547b8c'){
 const sway=active?Math.round(Math.sin(t/13)*2):0,step=active?Math.round(Math.sin(t/8)*2):0;
 rect(x+1,y+24,19,4,'#101b1c');rect(x+5+sway,y,9,3,'#27332d');
 rect(x+4+sway,y+3,11,8,'#c5a182');rect(x+5+sway,y+4,3,2,'#e5c6a0');
 rect(x+6+sway,y+10,8,2,'#765748');rect(x+3+sway,y+12,14,11,uniform);
 rect(x+3+sway,y+12,3,9,'#88a6a6');rect(x+14+sway,y+12,3,9,'#203b45');
 rect(x+1+sway,y+13,3,9,'#c5a182');rect(x+17+sway,y+13,3,9,'#c5a182');
 rect(x+4+sway,y+23,5,4+step,'#1a2732');rect(x+12+sway,y+23,5,4-step,'#1a2732')
}
function furniture(r,active){
 const x=r.x,y=r.y,w=r.w,h=r.h;
 // Bulkheads, equipment racks, consoles, pipes, and illuminated floor details.
 for(let i=0;i<3;i++){
   const px=x+13+i*14;
   rect(px,y+27,11,20,'#101c1e');rect(px+2,y+29,7,12,i===1?'#58cfa0':'#547a70');
   rect(px+2,y+43,7,2,'#e2bb65');
 }
 for(let i=0;i<3;i++){
   rect(x+w-19,y+29+i*17,11,14,'#394f4c');
   rect(x+w-16,y+32+i*17,5,3,active?'#64ffaf':'#7b9588');
 }
 rect(x+11,y+h-41,29,14,'#59695c');rect(x+13,y+h-38,25,8,'#192e29');
 rect(x+w-43,y+h-42,30,15,'#384a47');
 rect(x+w-39,y+h-39,7,7,'#c2a267');rect(x+w-28,y+h-39,7,7,'#6fbd9d');
 for(let i=0;i<3;i++){rect(x+53+i*11,y+29,6,3,'#a38d5e')}
 rect(x+4,y+4,3,11,'#b5c7a5');rect(x+w-7,y+4,3,11,'#b5c7a5');
}
function light(x,y,shade='#77e3ac'){rect(x-8,y-3,16,7,'#15231e');rect(x-5,y-2,10,3,shade);rect(x-3,y+1,6,2,'#4d866c')}
function crate(x,y){rect(x+2,y+3,24,18,'#111b1c');rect(x,y,24,18,'#73674c');rect(x+3,y+3,18,12,'#9c8960');rect(x+10,y+3,3,12,'#655a46');rect(x+3,y+8,18,3,'#655a46')}
function plant(x,y){rect(x+4,y+13,12,10,'#735f4d');rect(x+2,y+10,16,4,'#aa8963');rect(x+8,y+1,4,12,'#316f52');rect(x+3,y+4,6,8,'#47946b');rect(x+11,y+3,6,9,'#57a877')}
function roomDetail(r,active){
 const x=r.x,y=r.y,w=r.w,h=r.h;
 light(x+18,y+10);light(x+w-18,y+10);
 if(r.id==='manager'){rect(x+53,y+28,57,8,'#725c42');rect(x+57,y+30,49,4,'#ac9871');rect(x+20,y+62,20,19,'#435f5b');rect(x+123,y+62,20,19,'#435f5b');plant(x+w-32,y+h-55)}
 if(r.id==='product_factory'){for(let i=0;i<3;i++){crate(x+13+i*31,y+h-67)}rect(x+115,y+28,57,7,'#6c7b74');for(let i=0;i<4;i++)rect(x+120+i*12,y+30,7,4,'#b2bdab')}
 if(r.id==='quality_control'){rect(x+13,y+65,48,27,'#576b67');rect(x+16,y+68,42,21,'#1e3b35');for(let i=0;i<4;i++)rect(x+20,y+71+i*4,30,1,'#6adca3');rect(x+w-49,y+h-67,33,24,'#394d4c')}
 if(r.id==='research'){plant(x+13,y+h-62);rect(x+w-62,y+28,39,35,'#3c514b');for(let i=0;i<4;i++)rect(x+w-58,y+31+i*8,30,3,i===1?'#8bca99':'#748c7c')}
 if(r.id==='marketing'){rect(x+13,y+38,26,34,'#8e715b');rect(x+17,y+43,18,24,'#293d3b');rect(x+22,y+48,8,13,'#ddbb77');plant(x+w-36,y+h-56)}
 if(r.id==='publishing'){crate(x+12,y+h-70);crate(x+43,y+h-70);rect(x+w-66,y+30,42,32,'#273e3c');rect(x+w-62,y+34,34,24,active?'#48a780':'#496c67')}
}
function drawRoom(r){const active=states[r.id]==='working';floor(r.x,r.y,r.w,r.h);rect(r.x-5,r.y-5,r.w+10,7,'#77877d');rect(r.x-5,r.y-5,7,r.h+10,'#77877d');rect(r.x+r.w-2,r.y-5,7,r.h+10,'#77877d');rect(r.x-5,r.y+r.h-2,r.w+10,7,'#77877d');rect(r.x+6,r.y+5,r.w-12,17,'#121f1c');label(r.name,r.x+11,r.y+17,active?'#80ffc0':'#b1c9b5');rect(r.x+12,r.y+31,20,14,'#555f55');rect(r.x+r.w-34,r.y+31,20,14,'#555f55');furniture(r,active);roomDetail(r,active);terminal(r.x+r.w/2-16,r.y+36,active);person(r.x+r.w/2-8,r.y+87,active,tick,r.id==='manager'?'#6b557f':r.id==='quality_control'?'#54856b':'#547b8c');rect(r.x+r.w/2-12,r.y+r.h-4,24,9,'#2d3d35');rect(r.x+8,r.y+r.h-22,r.w-16,13,'#14221e');label((states[r.id]||'unknown').toUpperCase().replaceAll('_',' '),r.x+12,r.y+r.h-12,active?'#57ffc1':'#9baea5',8)}
function draw(){tick++;rect(0,0,W,H,'#0c1517');floor(12,12,W-24,H-24);for(let y=0;y<H;y+=16){rect(0,y,8,8,'#344940');rect(W-8,y,8,8,'#344940')}rect(224,166,192,100,'#3a4c43');for(let y=170;y<264;y+=16){rect(230,y,180,1,'#6b806d')}rect(302,162,36,114,'#202e29');rect(316,178,8,75,'#66aa83');
// Central passage: doorways, floor lights, pipes and animated courier.
// Courier is visual navigation only; it does not imply a real task transfer.
for(let y=178;y<253;y+=16){rect(278,y,5,8,'#a5bd7b');rect(358,y,5,8,'#a5bd7b')}
for(let x=230;x<410;x+=23){rect(x,199,9,4,'#c6a15d');rect(x,239,9,4,'#8ebc9a')}
const walkerX=250+Math.round((Math.sin(tick/85)+1)*69);
person(walkerX,211,false,tick);
rooms.forEach(drawRoom);rect(238,426,165,13,'#15221e');label('MINION HQ // OWNER CONTROL',247,436,'#6dbb91',9);requestAnimationFrame(draw)}
canvas.addEventListener('click',e=>{const bounds=canvas.getBoundingClientRect();const x=(e.clientX-bounds.left)*W/bounds.width,y=(e.clientY-bounds.top)*H/bounds.height;const r=rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(r&&typeof window.selectStationDepartment==='function')window.selectStationDepartment(r.id)});
window.updateStationStates=s=>{states=s||{}};
draw();
})();