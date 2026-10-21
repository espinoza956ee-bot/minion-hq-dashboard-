'use strict';
(()=>{
const canvas=document.getElementById('station-canvas'),host=document.getElementById('phaser-station');
if(!host||!window.Phaser)return;
const rooms=[
['product_factory','PRODUCT FACTORY',25,34,190,150,0x4ac99d],
['manager','MANAGER',238,34,164,150,0xe6bc75],
['quality_control','QUALITY CONTROL',425,34,190,150,0x65c7ef],
['research','RESEARCH',25,265,190,145,0x80c1a3],
['marketing','MARKETING',238,265,164,145,0xe8a5b5],
['publishing','PUBLISHING',425,265,190,145,0xa6b9ff]];
let current={},game,sceneRef,agents=[];
function block(g,x,y,w,h,color,alpha=1){g.fillStyle(color,alpha);g.fillRect(x,y,w,h)}
class Station extends Phaser.Scene{
 constructor(){super('Station')}
 create(){
 sceneRef=this;const g=this.add.graphics();
 block(g,0,0,640,448,0x05090f);
 for(let n=0;n<100;n++){const sx=(n*137+19)%640,sy=(n*89+43)%448;block(g,sx,sy,n%9===0?2:1,n%9===0?2:1,n%4===0?0x698ca0:0x324a63,.6)}
 block(g,8,16,624,417,0x0c151b,.8);
 for(let x=8;x<632;x+=16)for(let y=8;y<440;y+=16){
 block(g,x,y,15,15,(x+y)%32?0x263a35:0x2c4039);
 block(g,x,y,15,1,0x41564a,.65);block(g,x,y,1,15,0x152723,.7);
 }
 block(g,218,188,208,73,0x43554b);
 for(let x=225;x<425;x+=24){block(g,x,197,9,4,0x9fbf9e);block(g,x,248,9,4,0xc4a06c)}
 rooms.forEach(([id,name,x,y,w,h,color],i)=>{
 block(g,x-10,y-10,w+20,h+20,0x05090c);
 block(g,x-8,y-8,w+16,h+16,0x354149);
 block(g,x-5,y-5,w+10,h+10,0x101a1b);
 for(let k=0;k<Math.floor(w/22);k++){block(g,x+k*22,y-9,14,3,0x55636a);block(g,x+k*22,y+h+5,14,3,0x55636a)}
 for(let k=0;k<Math.floor(h/22);k++){block(g,x-9,y+k*22,3,14,0x55636a);block(g,x+w+5,y+k*22,3,14,0x55636a)}
 block(g,x,y,w,h,0x1b2428);
 for(let a=x+6;a<x+w-6;a+=16)for(let b=y+6;b<y+h-6;b+=16)block(g,a,b,15,15,(a+b)%32?0x283034:0x30363a);
 block(g,x-5,y-5,w+10,6,0x7d9185);block(g,x-5,y-5,6,h+10,0x7d9185);
 block(g,x+w-1,y-5,6,h+10,0x7d9185);block(g,x-5,y+h-1,w+10,6,0x7d9185);
 block(g,x+8,y+8,w-16,17,0x0a141b);
 block(g,x+10,y+29,w-20,1,0x57666a);
 for(let px=x+10;px<x+w-10;px+=32)for(let py=y+32;py<y+h-16;py+=32){block(g,px,py,2,2,0x66706b,.7);block(g,px+24,py+24,2,2,0x66706b,.5)}
 this.add.text(x+13,y+12,name,{fontFamily:'monospace',fontSize:'10px',color:'#b8e9d0'});
 for(let n=0;n<3;n++){block(g,x+14+n*15,y+32,12,21,0x172b29);block(g,x+17+n*15,y+35,6,11,color)}
 for(let n=0;n<3;n++){block(g,x+w-24,y+36+n*18,14,14,0x3c5750);block(g,x+w-20,y+39+n*18,7,5,0x77bb9c)}
 block(g,x+w/2-24,y+52,48,12,0x776d56);
 block(g,x+w/2-20,y+35,40,20,0x13262a);
 block(g,x+w/2-16,y+38,32,13,color,.5);
 for(let line=0;line<3;line++)block(g,x+w/2-13,y+40+line*4,24-line*5,1,0xb2f6c7,.85);
 block(g,x+w/2-18,y+66,36,8,0x615d50);
 block(g,x+14,y+h-40,27,23,0x665e4c);
 block(g,x+18,y+h-36,19,15,0x948360);
 block(g,x+w-42,y+h-41,28,24,0x34464b);
 block(g,x+w-39,y+h-38,22,3,0x748782);
 block(g,x+w-39,y+h-31,22,3,0x748782);
 block(g,x+w/2-17,y+h-5,34,11,0x0c1519);
 block(g,x+w/2-13,y+h-3,26,6,0x64757a);
 block(g,x+w/2-2,y+h-3,4,6,0xc9a563);
 const status=this.add.text(x+12,y+h-18,'WAITING',{fontFamily:'monospace',fontSize:'9px',color:'#b8cfc0'});
 const worker=this.add.container(x+w/2,y+96);
 const body=this.add.graphics();
 block(body,-8,5,16,15,i===1?0x775a8c:0x4c8390);
 block(body,-6,-5,12,12,0xcba487);block(body,-6,-6,12,4,0x303b32);
 block(body,-7,20,5,8,0x1d3038);block(body,3,20,5,8,0x1d3038);
 block(body,-12,7,4,13,0xb28d74);block(body,8,7,4,13,0xb28d74);
 worker.add(body);agents.push({id,worker,status,phase:i*1.5});
 const hit=this.add.zone(x+w/2,y+h/2,w,h).setInteractive({useHandCursor:true});
 hit.on('pointerdown',()=>window.selectStationDepartment?.(id));
 });
 this.add.text(228,221,'◈  CENTRAL TRANSIT  ◈',{fontFamily:'monospace',fontSize:'11px',color:'#b7e8c1'});
 this.courier=this.add.container(270,242);
 const p=this.add.graphics();block(p,-5,-9,10,8,0xc9aa8b);block(p,-7,0,14,13,0x7487a2);block(p,-5,13,4,7,0x22343d);block(p,1,13,4,7,0x22343d);this.courier.add(p);
 this.time.addEvent({delay:120,loop:true,callback:()=>{
 agents.forEach(a=>{const state=current[a.id]||'unknown';a.status.setText(state.toUpperCase().replaceAll('_',' '));a.worker.y+=state==='working'?Math.sin(this.time.now/220+a.phase)*.35:0});
 this.courier.x=270+Math.sin(this.time.now/1900)*95;
 }});
 }
}
try{
 game=new Phaser.Game({type:Phaser.CANVAS,parent:'phaser-station',width:640,height:448,backgroundColor:'#091316',pixelArt:true,render:{pixelArt:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Station]});
 host.hidden=false;if(canvas)canvas.hidden=true;
 window.updatePhaserStation=s=>{current=s||{}};
 const viewport=host.parentElement;
 let zoom=1;
 function applyZoom(){host.style.transform='scale('+zoom+')';host.style.transformOrigin='top center';viewport.style.overflow='auto'}
 document.getElementById('zoom-in')?.addEventListener('click',()=>{zoom=Math.min(2,zoom+.25);applyZoom()});
 document.getElementById('zoom-out')?.addEventListener('click',()=>{zoom=Math.max(1,zoom-.25);applyZoom()});
 document.getElementById('station-fullscreen')?.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else viewport.requestFullscreen?.()});
}catch(err){host.hidden=true;if(canvas)canvas.hidden=false}
})();