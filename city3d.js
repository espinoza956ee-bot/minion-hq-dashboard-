// MINION HQ immersive 3D city. Public read-only status visualization.
import * as THREE from 'https://esm.sh/three@0.169.0';
const host=document.querySelector('.game-viewport'), fallback=document.getElementById('station-canvas');
if(host&&fallback){
try{
const scene=new THREE.Scene();scene.background=new THREE.Color(0x100649);scene.fog=new THREE.FogExp2(0x0b1044,.00035);
const camera=new THREE.PerspectiveCamera(42,1,1,1400);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.65;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;cursor:grab';
host.append(renderer.domElement);fallback.style.display='none';
const ambient=new THREE.HemisphereLight(0x7caaff,0x1c0b35,2.2);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xb1d8ff,2.8);sun.position.set(-100,190,120);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-320;sun.shadow.camera.right=320;sun.shadow.camera.top=320;sun.shadow.camera.bottom=-320;scene.add(sun);
const neon=(c,p=1.8)=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
const mat=(c,m=.25,r=.5)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const asphalt=mat(0x141b48),sidewalk=mat(0x252a60),lawn=mat(0x102d3c),glass=neon(0x18bfff,.85);
const cube=(parent,w,h,d,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(800,800),mat(0x381268));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(850,34,0x3e47a8,0x34266c);grid.position.y=.08;scene.add(grid);
const road=(x,z,w,d)=>{cube(scene,w,.24,d,asphalt,x,.18,z);cube(scene,w-.8,.06,.32,neon(0xb342ff,.55),x,.35,z);for(let t=-Math.floor((w||d)/2)+10;t<(w||d)/2;t+=20){if(w>d)cube(scene,7,.06,.5,mat(0x5b7db7),x+t,.37,z);else cube(scene,.5,.06,7,mat(0x5b7db7),x,.37,z+t)}};
road(0,0,650,21);road(0,0,22,560);for(const z of [-195,195])road(0,z,610,16);for(const x of [-220,220])road(x,0,15,520);
const configs=[
{id:'manager',name:'MANAGER HQ',x:0,z:0,w:74,d:66,h:155,color:0x29dfff},
{id:'product_factory',name:'PRODUCT FACTORY',x:-125,z:-125,w:82,d:70,h:67,color:0xffbb50},
{id:'research',name:'RESEARCH',x:-285,z:-115,w:72,d:64,h:84,color:0xa38aff},
{id:'marketing',name:'MARKETING',x:130,z:-128,w:75,d:66,h:80,color:0xff5fb6},
{id:'quality_control',name:'QUALITY CONTROL',x:130,z:120,w:84,d:69,h:75,color:0x45ffae},
{id:'publishing',name:'PUBLISHING',x:-135,z:125,w:77,d:70,h:76,color:0x6b9cff},
{id:'job_hunter',name:'CLIENT ACQUISITION',x:290,z:125,w:75,d:65,h:61,color:0xffcf69}
];
const buildings=[],pickables=[],statusColors={working:0x42f5d4,completed:0x57e5a0,pending_review:0xffd26b,blocked:0xff6688,failed:0xff4466,idle:0x8398b3};
let statuses={},chosen='manager';
function label(text,width=512){const c=document.createElement('canvas');c.width=width;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#070e2bdd';ctx.fillRect(0,0,width,96);ctx.strokeStyle='#37d5ff';ctx.lineWidth=3;ctx.strokeRect(2,2,width-4,92);ctx.fillStyle='#e5faff';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(text,width/2,41);ctx.font='20px sans-serif';ctx.fillStyle='#78c8f0';ctx.fillText('TAP TO INSPECT',width/2,75);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(75,14,1);return s}
function makeBuilding(b){
const group=new THREE.Group();group.position.set(b.x,0,b.z);scene.add(group);
cube(group,b.w+19,2,b.d+19,sidewalk,0,1,0);
cube(group,b.w+12,.9,b.d+12,neon(b.color,.22),0,2.4,0);
cube(group,b.w,b.h,b.d,mat(0x152a59,.68,.3),0,b.h/2+3,0);
cube(group,b.w+6,3,b.d+6,mat(0x8198b8,.8,.24),0,b.h+4,0);
cube(group,b.w+2,1,b.d+2,neon(b.color,.6),0,b.h+6,0);
for(let floor=0;floor<Math.floor(b.h/16);floor++){
 const y=12+floor*16;
 for(let x=-b.w/2+9;x<b.w/2-4;x+=15)for(const z of [-b.d/2-.15,b.d/2+.15]){
 cube(group,8,9,.5,glass,x,y,z);
 cube(group,10,1,.9,mat(0x8eacdf),x,y+5,z)
 }
 for(let z=-b.d/2+10;z<b.d/2-4;z+=15)for(const x of [-b.w/2-.2,b.w/2+.2])cube(group,.5,9,8,neon(b.color,.6),x,y,z)
}
for(let x=-b.w/2+8;x<=b.w/2-8;x+=b.w-16)for(let z=-b.d/2+8;z<=b.d/2-8;z+=b.d-16)cube(group,3,b.h,3,mat(0x6a86ac,.85),x,b.h/2+3,z);
cube(group,17,21,1,neon(0x48eaff,.8),0,13,b.d/2+.7);
for(let x=-b.w/2+9;x<b.w/2-5;x+=17)cube(group,8,3,8,mat(0x364f77),x,b.h+8,0);
if(b.id==='manager'){
cube(group,18,22,18,mat(0x183e80),0,b.h+17,0);
const beacon=new THREE.Mesh(new THREE.IcosahedronGeometry(12,1),neon(0x27eaff,2.4));beacon.position.y=b.h+37;group.add(beacon);b.beacon=beacon;
const light=new THREE.PointLight(0x27eaff,75,125);light.position.set(0,b.h+35,0);group.add(light);
}
const sign=label(b.name);sign.position.set(0,b.h+30,0);group.add(sign);
const marker=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,8),neon(statusColors.idle));marker.position.set(0,b.h+17,0);group.add(marker);
b.marker=marker;b.group=group;buildings.push(b);
group.traverse(o=>{if(o.isMesh){o.userData.department=b.id;pickables.push(o)}});
}
configs.forEach(makeBuilding);
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cube(g,2,10,2,mat(0x674c5d),0,6,0);const crown=new THREE.Mesh(new THREE.ConeGeometry(8*s,20*s,6),mat(0x16a48f));crown.position.y=19*s;g.add(crown);const tip=new THREE.Mesh(new THREE.ConeGeometry(4*s,10*s,6),neon(0x19e2b6,.25));tip.position.y=28*s;g.add(tip)}
for(let x=-340;x<=340;x+=27)for(let z=-245;z<=245;z+=28){if(Math.abs(x)<24||Math.abs(z)<23||Math.abs(z-195)<20||Math.abs(z+195)<20||Math.abs(x-220)<18||Math.abs(x+220)<18)continue;if(configs.some(b=>Math.abs(x-b.x)<b.w/2+23&&Math.abs(z-b.z)<b.d/2+23))continue;if((Math.floor(x*13+z*7)%4+4)%4===0)tree(x,z,.65+((x+z+800)%4)*.09)}
for(let x=-320;x<=320;x+=50)for(const z of [-32,32,177,213,-177,-213]){const pole=cube(scene,1.5,19,1.5,mat(0x6073a1),x,10,z);const bulb=new THREE.Mesh(new THREE.SphereGeometry(3.5,8,8),neon(0x8eeaff,2));bulb.position.set(x,21,z);scene.add(bulb)}
const stars=new THREE.BufferGeometry(),pts=[];for(let i=0;i<450;i++)pts.push((Math.random()-.5)*1100,90+Math.random()*480,(Math.random()-.5)*1100);stars.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0x9a9cff,size:1.4})));
let azimuth=.65,elevation=.83,distance=760,target=new THREE.Vector3(0,32,0),down=null;
function updateCamera(){const ce=Math.cos(elevation);camera.position.set(target.x+distance*Math.sin(azimuth)*ce,target.y+distance*Math.sin(elevation),target.z+distance*Math.cos(azimuth)*ce);camera.lookAt(target)}
function resize(){const w=host.clientWidth||640,h=host.clientHeight||460;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}new ResizeObserver(resize).observe(host);resize();updateCamera();
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function selectAt(e){const r=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit){chosen=hit.object.userData.department;window.selectStationDepartment?.(chosen)}}
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,az:azimuth,el:elevation,moved:false};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>7)down.moved=true;if(down.moved){azimuth=down.az-dx*.006;elevation=Math.max(.25,Math.min(1.42,down.el+dy*.005));updateCamera()}});
renderer.domElement.addEventListener('pointerup',e=>{if(down&&!down.moved)selectAt(e);down=null});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(240,Math.min(1050,distance+e.deltaY*.55));updateCamera()},{passive:false});
document.getElementById('zoom-in')?.addEventListener('click',()=>{distance=Math.max(240,distance*.82);updateCamera()});
document.getElementById('zoom-out')?.addEventListener('click',()=>{distance=Math.min(1050,distance*1.2);updateCamera()});
window.update3DCityStates=s=>{statuses=s||{};for(const b of buildings){const color=statusColors[statuses[b.id]]||statusColors.blocked;b.marker.material=neon(color,1.2)}};
if(window.__minionSnapshotStates)window.update3DCityStates(window.__minionSnapshotStates);
let t=0;function animate(){requestAnimationFrame(animate);t+=.01;for(const b of buildings){if(b.beacon){b.beacon.rotation.y+=.009;b.beacon.position.y=b.h+37+Math.sin(t)*2}}renderer.render(scene,camera)}animate();
window.__minion3D=true;
}catch(err){console.error('3D city unavailable; retaining 2D fallback',err);fallback.style.display='block'}
}
