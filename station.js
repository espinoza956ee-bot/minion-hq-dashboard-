'use strict';
(()=>{
const canvas=document.getElementById('station-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
const W=640,H=448;
const rooms=[
{id:'manager',name:'COMMAND / MANAGER',x:243,y:12,w:154,h:140,color:'#bfa578'},
{id:'product_factory',name:'FABRICATION',x:19,y:159,w:187,h:143,color:'#58a991'},
{id:'quality_control',name:'INSPECTION',x:434,y:159,w:187,h:143,color:'#70acc0'},
{id:'research',name:'RESEARCH',x:19,y:322,w:187,h:110,color:'#87ac95'},
{id:'marketing',name:'MARKETING',x:243,y:322,w:154,h:110,color:'#b986a3'},
{id:'publishing',name:'DISPATCH',x:434,y:322,w:187,h:110,color:'#a5a0c9'}
];let states={},tick=0;
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function txt(t,x,y,c='#b5c7c1',size=9){ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.fillText(t,x,y)}
function room(r){
const {x,y,w,h}=r;
rect(x-9,y-9,w+18,h+18,'#090f14');rect(x-6,y-6,w+12,h+12,'#485057');rect(x-3,y-3,w+6,h+6,'#1a2026');
rect(x,y,w,h,'#24292e');
for(let px=x+4;px<x+w-4;px+=18)for(let py=y+4;py<y+h-4;py+=18){rect(px,py,17,17,(Math.floor(px/18)+Math.floor(py/18))%2?'#2d3033':'#262b30');rect(px+2,py+2,13,1,'#414348');rect(px+2,py+2,1,1,'#79776e');rect(px+14,py+14,1,1,'#575c5a')}
for(let px=x+5;px<x+w;px+=23){rect(px,y-7,15,3,'#778087');rect(px,y+h+4,15,3,'#5e6a71')}
for(let py=y+5;py<y+h;py+=23){rect(x-7,py,3,15,'#778087');rect(x+w+4,py,3,15,'#5e6a71')}
rect(x,y,w,5,'#828b8b');rect(x,y,5,h,'#656e72');rect(x+w-5,y,5,h,'#56616a');rect(x,y+h-5,w,5,'#454f55');
rect(x+9,y+8,w-18,17,'#101b20');txt(r.name,x+14,y+20,'#c9d5cd',9);
for(let i=0;i<3;i++){rect(x+12+i*17,y+33,14,25,'#131d23');rect(x+15+i*17,y+36,8,14,r.color);rect(x+15+i*17,y+52,8,2,'#e4c37b')}
for(let i=0;i<3;i++){rect(x+w-21,y+36+i*17,13,13,'#405259');rect(x+w-18,y+39+i*17,7,3,'#87a69c')}
rect(x+w/2-21,y+37,42,26,'#111c22');rect(x+w/2-17,y+40,34,16,r.color);for(let i=0;i<3;i++)rect(x+w/2-14,y+43+i*4,26-i*6,1,'#d5e4c5');
rect(x+w/2-26,y+64,52,8,'#82725e');rect(x+w/2-19,y+72,38,5,'#5a5045');
rect(x+12,y+h-39,27,23,'#6e6250');rect(x+16,y+h-35,19,15,'#a28d6b');rect(x+23,y+h-35,3,15,'#5a4e42');
rect(x+w-42,y+h-39,28,22,'#3d5358');rect(x+w-39,y+h-35,22,3,'#758989');rect(x+w-39,y+h-28,22,3,'#758989');
const status=(states[r.id]||'unknown').toUpperCase().replaceAll('_',' ');
rect(x+8,y+h-22,w-16,15,'#131c22');txt(status,x+12,y+h-12,status==='WORKING'?'#83e1b7':'#b9c0b7',8);
const active=states[r.id]==='working',dy=active?Math.round(Math.sin(tick/11)*2):0;
const cx=x+w/2,cy=y+Math.min(99,h-34)+dy;
rect(cx-7,cy+21,16,3,'#11171c');rect(cx-5,cy-9,11,11,'#c1a087');rect(cx-5,cy-11,11,4,'#2b3539');rect(cx-6,cy+2,13,16,r.id==='manager'?'#79657f':'#587e87');rect(cx-9,cy+4,3,12,'#c1a087');rect(cx+7,cy+4,3,12,'#c1a087');rect(cx-5,cy+18,4,7,'#202b37');rect(cx+2,cy+18,4,7,'#202b37');
}
function draw(){
tick++;rect(0,0,W,H,'#050a12');
for(let i=0;i<130;i++){const x=(i*137+19)%640,y=(i*89+43)%448;rect(x,y,i%11===0?2:1,1,i%3===0?'#607185':'#303f57')}
rect(207,149,226,173,'#0b141b');rect(211,155,218,162,'#3e464a');
for(let x=214;x<429;x+=18)for(let y=157;y<319;y+=18){rect(x,y,17,17,(x+y)%3?'#2c3135':'#30353a');rect(x+1,y+1,15,1,'#545b5c')}
for(let y=163;y<315;y+=22){rect(208,y,5,13,'#667278');rect(428,y,5,13,'#667278')}
rooms.forEach(room);
for(const [x,y,vertical] of [[320,154,true],[320,320,true],[207,226,false],[433,226,false],[207,363,false],[433,363,false]]){
if(vertical){rect(x-19,y-6,38,12,'#0c151a');rect(x-15,y-3,30,6,'#7a8583');rect(x-2,y-3,4,6,'#e1bb74')}
else{rect(x-6,y-19,12,38,'#0c151a');rect(x-3,y-15,6,30,'#7a8583');rect(x-3,y-2,6,4,'#e1bb74')}
}
for(let i=0;i<6;i++){rect(240+i*27,210,12,3,'#aa9067');rect(240+i*27,290,12,3,'#64867d')}
txt('CENTRAL TRANSIT',269,247,'#b3c2ba',10);
const cx=320+Math.round(Math.sin(tick/85)*44),cy=268;
rect(cx-5,cy-7,10,10,'#c5a589');rect(cx-6,cy+3,12,13,'#7e91a0');rect(cx-4,cy+16,4,6,'#27313d');rect(cx+1,cy+16,4,6,'#27313d');
requestAnimationFrame(draw);
}
canvas.addEventListener('click',e=>{const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;const r=rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(r)window.selectStationDepartment?.(r.id)});
window.updateStationStates=s=>{states=s||{}};
document.getElementById('zoom-in')?.addEventListener('click',()=>{canvas.style.width=Math.min(200,Math.round(parseFloat(canvas.dataset.zoom||'100')+25))+'%';canvas.dataset.zoom=parseFloat(canvas.style.width)});
document.getElementById('zoom-out')?.addEventListener('click',()=>{canvas.style.width=Math.max(100,Math.round(parseFloat(canvas.dataset.zoom||'100')-25))+'%';canvas.dataset.zoom=parseFloat(canvas.style.width)});
document.getElementById('station-fullscreen')?.addEventListener('click',()=>{const v=canvas.closest('.game-viewport');if(document.fullscreenElement)document.exitFullscreen();else v?.requestFullscreen?.()});
draw();
})();