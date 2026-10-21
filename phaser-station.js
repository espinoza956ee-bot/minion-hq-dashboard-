'use strict';
(()=>{
const host=document.getElementById('phaser-station'),fallback=document.getElementById('station-canvas');
if(!host||!window.Phaser)return;
const rooms=[
{id:'manager',name:'COMMAND',x:242,y:16,w:156,h:148,accent:0xd6b47b},
{id:'product_factory',name:'FABRICATION',x:22,y:155,w:188,h:150,accent:0x6dc9b0},
{id:'quality_control',name:'INSPECTION',x:430,y:155,w:188,h:150,accent:0x74c7df},
{id:'research',name:'RESEARCH',x:22,y:319,w:188,h:111,accent:0x98c0a0},
{id:'marketing',name:'MARKETING',x:242,y:319,w:156,h:111,accent:0xc58ba6},
{id:'publishing',name:'DISPATCH',x:430,y:319,w:188,h:111,accent:0xaaa3e8}
];
let states={},sceneRef=null,zoom=1,game;
const rgb=n=>'#'+n.toString(16).padStart(6,'0');
function fill(g,x,y,w,h,c,a=1){g.fillStyle(c,a);g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function line(g,x1,y1,x2,y2,c=0x67737b,w=1){g.lineStyle(w,c);g.lineBetween(x1,y1,x2,y2)}
function text(scene,t,x,y,size=8,color='#a9c4c3'){return scene.add.text(x,y,t,{fontFamily:'monospace',fontSize:size+'px',color,resolution:2})}
function roomFloor(g,r){
 const {x,y,w,h}=r;
 fill(g,x-7,y-7,w+14,h+14,0x0b1117);
 fill(g,x-4,y-4,w+8,h+8,0x39424a);
 fill(g,x,y,w,h,0x22272c);
 for(let a=x+3;a<x+w-2;a+=19)for(let b=y+3;b<y+h-2;b+=19){
  fill(g,a,b,18,18,(Math.floor(a/19)+Math.floor(b/19))%2?0x2c2e32:0x26292d);
  fill(g,a+1,b+1,16,1,0x404348,.7);
  fill(g,a+2,b+2,1,1,0x81817b,.55);
  fill(g,a+15,b+15,1,1,0x7b756d,.4);
 }
 for(let i=0;i<w;i+=20){fill(g,x+i,y-6,12,4,0x56616b);fill(g,x+i,y+h+2,12,4,0x56616b)}
 for(let i=0;i<h;i+=20){fill(g,x-6,y+i,4,12,0x56616b);fill(g,x+w+2,y+i,4,12,0x56616b)}
 fill(g,x,y, w,4,0x747b7d);fill(g,x,y,4,h,0x5a6267);
 fill(g,x+w-4,y,4,h,0x555e64);fill(g,x,y+h-4,w,4,0x444c53);
 // Small colored room lamps and industrial fixtures.
 for(let a=x+14;a<x+w-10;a+=49){fill(g,a,y+7,17,5,0x101b1e);fill(g,a+3,y+8,11,2,r.accent,.7)}
}
function monitor(g,x,y,color){fill(g,x-3,y-3,39,28,0x0d1117);fill(g,x,y,33,19,0x1a3437);fill(g,x+3,y+3,27,12,color,.55);for(let i=0;i<3;i++)fill(g,x+5,y+5+i*3,20-i*4,1,0xb5e2d1,.7);fill(g,x+13,y+19,8,4,0x646b6c);fill(g,x-6,y+23,45,5,0x6c6253)}
function crate(g,x,y){fill(g,x+2,y+3,22,19,0x12171a);fill(g,x,y,22,19,0x695f50);fill(g,x+3,y+3,16,13,0x8b785d);fill(g,x+9,y+3,3,13,0x564c40);fill(g,x+3,y+8,16,2,0x564c40)}
function plant(g,x,y){fill(g,x+5,y+12,11,10,0x74614b);fill(g,x+3,y+10,15,4,0xb18b65);fill(g,x+8,y,4,12,0x3c7d61);fill(g,x+3,y+3,7,8,0x478e69);fill(g,x+12,y+2,7,10,0x559b70)}
function shelves(g,x,y){for(let i=0;i<3;i++){fill(g,x,y+i*15,34,12,0x101c22);fill(g,x+3,y+2+i*15,28,7,0x43565b);for(let j=0;j<3;j++)fill(g,x+5+j*9,y+3+i*15,5,5,(i+j)%2?0x819588:0xb29c76)}}
function detail(g,r){
 const x=r.x,y=r.y,w=r.w,h=r.h;
 shelves(g,x+9,y+28);monitor(g,x+w-62,y+31,r.accent);
 fill(g,x+w/2-32,y+78,64,9,0x5c5245);fill(g,x+w/2-28,y+74,56,5,0x9c8767);
 if(r.id==='manager'){monitor(g,x+55,y+29,r.accent);fill(g,x+58,y+109,41,15,0x394a50);plant(g,x+14,y+111)}
 if(r.id==='product_factory'){crate(g,x+11,y+h-44);crate(g,x+39,y+h-44);fill(g,x+120,y+90,45,23,0x4e6264);fill(g,x+125,y+95,35,13,0x8d9c95)}
 if(r.id==='quality_control'){fill(g,x+11,y+84,53,29,0x18282b);for(let i=0;i<5;i++)fill(g,x+16,y+89+i*4,40-i*5,1,0x69d6ad);crate(g,x+w-39,y+h-40)}
 if(r.id==='research'){plant(g,x+13,y+h-33);shelves(g,x+w-49,y+38)}
 if(r.id==='marketing'){fill(g,x+10,y+40,30,30,0x645747);fill(g,x+14,y+44,22,22,0x23383e);plant(g,x+w-33,y+h-37)}
 if(r.id==='publishing'){crate(g,x+11,y+h-34);crate(g,x+40,y+h-34);shelves(g,x+w-48,y+37)}
}
function sprite(scene,x,y,color){
 const c=scene.add.container(x,y),g=scene.add.graphics();
 fill(g,-7,23,15,3,0x10171b,.7);fill(g,-5,-8,11,12,0xc2a18a);fill(g,-5,-10,11,4,0x35383a);
 fill(g,-6,4,13,15,color);fill(g,-10,5,4,13,0xb08e7c);fill(g,7,5,4,13,0xb08e7c);
 fill(g,-5,19,4,7,0x232c35);fill(g,2,19,4,7,0x232c35);
 fill(g,-3,-3,2,2,0x27333b);fill(g,2,-3,2,2,0x27333b);
 c.add(g);return c;
}
class Station extends Phaser.Scene{
 constructor(){super('Station')}
 create(){
 sceneRef=this;const g=this.add.graphics();
 fill(g,0,0,640,448,0x03070d);
 for(let i=0;i<140;i++){const x=(i*137+41)%640,y=(i*211+19)%448;fill(g,x,y,i%11===0?2:1,1,i%3?0x4a5870:0x758b9c,.4)}
 // A cross-shaped pressure hull, rather than six disconnected squares.
 fill(g,208,158,224,157,0x0d151c);fill(g,210,168,220,139,0x31373a);
 fill(g,230,155,180,167,0x272b30);
 for(let x=228;x<414;x+=19)for(let y=174;y<310;y+=19){fill(g,x,y,18,18,0x292d31);fill(g,x+1,y+1,16,1,0x4d5051,.6)}
 for(let y=168;y<311;y+=21){fill(g,215,y,5,13,0x58656a);fill(g,420,y,5,13,0x58656a)}
 rooms.forEach(r=>{roomFloor(g,r);detail(g,r)});
 // Connected pressure doors and walkway markings.
 for(const [x,y,wide] of [[210,224,false],[430,224,false],[313,164,true],[313,314,true],[210,355,false],[430,355,false]]){
  if(wide){fill(g,x-16,y-7,34,14,0x121c22);fill(g,x-13,y-4,28,8,0x59686b);fill(g,x-2,y-4,4,8,0xe0b86d)}
  else{fill(g,x-7,y-15,14,32,0x111d22);fill(g,x-4,y-12,8,26,0x56666a);fill(g,x-4,y-2,8,4,0xe0b86d)}
 }
 for(let i=0;i<6;i++){fill(g,247+i*26,211,13,3,0x9c845a);fill(g,247+i*26,284,13,3,0x607e79)}
 this.add.text(245,238,'MINION HQ / TRANSIT',{fontFamily:'monospace',fontSize:'10px',color:'#a9bcb2'});
 this.agents=[];
 rooms.forEach((r,i)=>{
  const worker=sprite(this,r.x+r.w/2,r.y+Math.min(104,r.h-27),i===0?0x568f82:i===1?0x7c617f:i===2?0x577f91:0x597781);
  const title=text(this,r.name,r.x+11,r.y+12,10,'#d1ded4');
  const status=text(this,'WAITING',r.x+11,r.y+r.h-18,8,'#9eb8ae');
  const hit=this.add.zone(r.x+r.w/2,r.y+r.h/2,r.w,r.h).setInteractive({useHandCursor:true});
  hit.on('pointerdown',()=>window.selectStationDepartment?.(r.id));
  this.agents.push({id:r.id,worker,status,base:worker.y,phase:i*1.7});
 });
 this.courier=sprite(this,316,268,0x8390a0);
 this.time.addEvent({delay:100,loop:true,callback:()=>{
  for(const a of this.agents){const s=states[a.id]||'unknown';a.status.setText(s.toUpperCase().replaceAll('_',' '));a.status.setColor(s==='working'?'#81e8bb':s==='blocked'||s==='failed'?'#e6a08e':'#9eb8ae');a.worker.y=a.base+(s==='working'?Math.sin(this.time.now/180+a.phase)*2:0)}
  this.courier.x=316+Math.sin(this.time.now/2000)*50;
 }});
 }
}
try{
 game=new Phaser.Game({type:Phaser.CANVAS,parent:host,width:640,height:448,backgroundColor:'#03070d',pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Station]});
 host.hidden=false;if(fallback)fallback.hidden=true;
 window.updatePhaserStation=s=>{states=s||{}};
 const viewport=host.parentElement;
 const setZoom=()=>{host.style.transform='scale('+zoom+')';host.style.transformOrigin='center center';viewport.style.overflow='auto'};
 document.getElementById('zoom-in')?.addEventListener('click',()=>{zoom=Math.min(2.5,zoom+.25);setZoom()});
 document.getElementById('zoom-out')?.addEventListener('click',()=>{zoom=Math.max(1,zoom-.25);setZoom()});
 document.getElementById('station-fullscreen')?.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else viewport.requestFullscreen?.()});
}catch(e){host.hidden=true;if(fallback)fallback.hidden=false;console.error('Station failed',e)}
})();