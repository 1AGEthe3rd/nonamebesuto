
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const $=q=>document.querySelector(q),stage=$("#arena"),scoreEl=$("#score"),timeEl=$("#timer"),comboEl=$("#combo"),accuracyEl=$("#accuracy"),notice=$("#notice"),menu=$("#menu"),startButton=$("#start");
const roundLength=60;
let renderer;
try{
 renderer=new THREE.WebGLRenderer({canvas:stage,antialias:true,powerPreference:"high-performance"});
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 document.documentElement.classList.add("is-3d");
}catch(err){console.warn("WebGL is not available",err);$("#menu-text").textContent="Your browser could not start the 3D arena. Try a device and browser with WebGL enabled.";startButton.disabled=true;}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let score=0,shots=0,hits=0,combo=0,remaining=roundLength,active=false,lastShoot=0,best=0;
try{best=Number(localStorage.getItem("nnb-local-best-001"))||0;}catch{}
$("#best").textContent=String(best);
function updateHud(){scoreEl.firstChild.nodeValue=String(score);timeEl.firstChild.nodeValue=String(Math.ceil(remaining));comboEl.firstChild.nodeValue=String(combo);accuracyEl.firstChild.nodeValue=shots?Math.round(100*hits/shots)+"%":"—";timeEl.classList.toggle("danger",remaining<=10);}
function noticeHit(text){notice.textContent=text;notice.dataset.at=String(performance.now());$("#crosshair").classList.add("hit");}
function endRound(exited=false){
 if(!active)return;active=false;
 if(document.pointerLockElement===stage)document.exitPointerLock?.();
 try{if(score>best){best=score;localStorage.setItem("nnb-local-best-001",String(best));}}catch{best=Math.max(best,score);}
 $("#best").textContent=String(best);
 $("#menu-title").textContent=exited?"RUN ENDED":"ROUND COMPLETE";
 $("#menu-text").textContent="Score "+score+" · "+hits+"/"+shots+" hits · "+(shots?Math.round(hits/shots*100):0)+"% accuracy. This is a local prototype score, not an online leaderboard or verified earning result.";
 startButton.textContent="REPLAY 60 SEC";menu.hidden=false;updateHud();
}
$("#exit").addEventListener("click",()=>endRound(true));
if(renderer){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x02070b);scene.fog=new THREE.FogExp2(0x02070b,.024);
 const camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.06,150);camera.rotation.order="YXZ";camera.position.set(0,1.65,7.8);
 let yaw=0,pitch=0;
 scene.add(new THREE.HemisphereLight(0x7bd2b8,0x06101b,1.9));
 const mat=(c,em=0,intensity=0)=>new THREE.MeshStandardMaterial({color:c,metalness:.48,roughness:.42,emissive:em,emissiveIntensity:intensity});
 const dark=mat(0x101b22),walls=mat(0x111c28),mint=mat(0x0b573e,0x1bfd9c,.8),amber=mat(0xa87b41,0xffc77a,.45);
 const neon=new THREE.MeshBasicMaterial({color:0x1bfd9c});
 const add=(g,m,x,y,z)=>{const obj=new THREE.Mesh(g,m);obj.position.set(x,y,z);scene.add(obj);return obj;};
 const box=(w,h,d,x,y,z,m)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const light=(c,p,x,y,z,d=25)=>{const q=new THREE.PointLight(c,p,d,2);q.position.set(x,y,z);scene.add(q);};
 box(24,.4,42,0,-.26,-5,dark);box(24,12,.5,0,6,-25,walls);
 for(const x of [-12,12])box(.4,10,42,x,5,-5,walls);
 for(let z=-24;z<15;z+=3){box(23,.014,.045,0,.01,z,mint);}
 for(const x of [-11,-7,-3,1,5,9])box(.035,.013,41,x,.015,-5,mint);
 for(let z=-24;z<16;z+=8)for(let x of [-11,11]){box(.3,9,.3,x,4.5,z,mint);light(0x1bfd9c,12,x,6,z,12);}
 for(let x of [-9,-3,3,9]){
  const g=add(new THREE.TorusGeometry(1.9,.13,10,60),mint,x,4.7,-24.5);g.rotation.y=0;
  box(2.8,.12,.13,x,1.1,-24.1,amber);
 }
 box(8,.2,3,0,.22,9,amber);light(0x1bfd9c,80,0,6,-8,32);light(0xffad59,48,-8,7,-18,28);
 const planet=new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,2),new THREE.MeshStandardMaterial({color:0x0e403c,emissive:0x1b754d,emissiveIntensity:.6,metalness:.6,roughness:.32}));
 planet.position.set(0,8,-31);scene.add(planet);
 const stars=[],rand=(()=>{let seed=37;return()=>{seed=seed*16807%2147483647;return seed/2147483647;};})();
 for(let i=0;i<360;i++)stars.push((rand()-.5)*130,rand()*50+6,-30-rand()*120);
 const gstar=new THREE.BufferGeometry();gstar.setAttribute("position",new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(gstar,new THREE.PointsMaterial({color:0xbfe5db,size:.12})));
 // On-screen sci-fi blaster: cosmetic only. All hits use a central ray cast.
 const blaster=new THREE.Group();camera.add(blaster);scene.add(camera);
 const gunMat=mat(0x283b41,0x12342a,.2);
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.82,14),gunMat);barrel.rotation.x=Math.PI/2;barrel.position.set(.39,-.42,-.85);blaster.add(barrel);
 const body=new THREE.Mesh(new THREE.BoxGeometry(.31,.29,.52),dark);body.position.set(.39,-.52,-.5);blaster.add(body);
 const muzzle=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,9,24),neon);muzzle.position.set(.39,-.42,-1.28);blaster.add(muzzle);
 const flash=new THREE.PointLight(0x1bfd9c,0,3);flash.position.set(.39,-.42,-1.3);blaster.add(flash);
 const targets=[];const raycaster=new THREE.Raycaster();const center=new THREE.Vector2(0,0);
 const targetMat=new THREE.MeshStandardMaterial({color:0x80ffe0,emissive:0x1bfd9c,emissiveIntensity:1.1,metalness:.1,roughness:.2});
 const rimMat=new THREE.MeshBasicMaterial({color:0xffd27c,side:THREE.DoubleSide});
 function spawn(){
  if(!active||targets.length>=4)return;
  const x=(rand()-.5)*14,y=1.7+rand()*2.4,z=-7-rand()*13;
  const root=new THREE.Group();root.position.set(x,y,z);scene.add(root);
  const core=new THREE.Mesh(new THREE.SphereGeometry(.56,20,14),targetMat.clone());core.userData.target=true;root.add(core);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.78,.06,10,48),rimMat);root.add(rim);
  const pin=new THREE.Mesh(new THREE.OctahedronGeometry(.25),amber);pin.position.y=.89;root.add(pin);
  targets.push({root,mesh:core,x,y,z,phase:rand()*Math.PI*2,age:0,ttl:2.35+rand()*.9,speed:.75+rand()*1.4});
 }
 function clearTargets(){for(const t of targets){scene.remove(t.root);t.mesh.material.dispose();}targets.splice(0);}
 let lastTime=0;
 function shoot(){
  if(!active)return;
  const now=performance.now();if(now-lastShoot<150)return;lastShoot=now;shots++;
  flash.intensity=25;raycaster.setFromCamera(center,camera);
  const result=raycaster.intersectObjects(targets.map(t=>t.mesh),false);
  if(result.length){
   const target=targets.find(t=>t.mesh===result[0].object);
   if(target){hits++;combo++;const points=10+Math.min(combo-1,10)*2;score+=points;noticeHit("HIT  +"+points);scene.remove(target.root);target.mesh.material.dispose();targets.splice(targets.indexOf(target),1);}
  }else{combo=0;notice.textContent="MISS";notice.dataset.at=String(now);}
  updateHud();
 }
 let drag=null,keys=new Set();
 stage.addEventListener("pointerdown",e=>{
  if(!active)return;if(e.pointerType==="mouse"&&e.button!==0)return;
  if(e.pointerType==="mouse"){if(!document.pointerLockElement)stage.requestPointerLock?.().catch(()=>{});shoot();}
  else{drag={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);}
 });
 stage.addEventListener("pointermove",e=>{if(!active||!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.0032;pitch=clamp(pitch-(e.clientY-drag.y)*.003,-1.15,1.05);drag.x=e.clientX;drag.y=e.clientY;});
 stage.addEventListener("pointerup",()=>drag=null);stage.addEventListener("pointercancel",()=>drag=null);
 document.addEventListener("mousemove",e=>{if(document.pointerLockElement===stage&&active){yaw-=e.movementX*.0027;pitch=clamp(pitch-e.movementY*.0027,-1.15,1.05);}});
 document.addEventListener("keydown",e=>{
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if((e.code==="Space"||e.code==="Enter")&&active)shoot();
 });
 document.addEventListener("keyup",e=>keys.delete(e.code));
 addEventListener("blur",()=>keys.clear());
 $("#fire").addEventListener("pointerdown",e=>{e.preventDefault();shoot();});
 const stick={move:{x:0,y:0},look:{x:0,y:0}};
 for(const el of document.querySelectorAll(".joystick")){
  const name=el.dataset.joystick,knob=el.querySelector(".stick");let pointer=null;
  const getPos=e=>{
   const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.34),y=(e.clientY-r.top-r.height/2)/(r.height*.34),len=Math.max(1,Math.hypot(x,y));
   stick[name].x=x/len;stick[name].y=y/len;knob.style.transform="translate("+Math.round(stick[name].x*23)+"px,"+Math.round(stick[name].y*23)+"px)";
  };
  el.addEventListener("pointerdown",e=>{e.preventDefault();pointer=e.pointerId;el.setPointerCapture(pointer);getPos(e);});
  el.addEventListener("pointermove",e=>{if(pointer===e.pointerId)getPos(e);});
  const reset=e=>{if(pointer===e.pointerId){pointer=null;stick[name].x=stick[name].y=0;knob.style.transform="translate(0,0)";}};
  for(const type of ["pointerup","pointercancel","lostpointercapture"])el.addEventListener(type,reset);
 }
 function start(){
  score=shots=hits=combo=0;remaining=roundLength;lastShoot=0;lastTime=0;
  camera.position.set(0,1.65,7.8);yaw=pitch=0;clearTargets();menu.hidden=true;active=true;
  updateHud();for(let i=0;i<3;i++)spawn();
  if(matchMedia("(pointer:fine)").matches)stage.requestPointerLock?.().catch(()=>{});
 }
 startButton.addEventListener("click",start);
 const clock=new THREE.Clock();let cooldown=.3,prevFire=false;
 function update(){
  const dt=Math.min(clock.getDelta(),.06),tm=performance.now()*.001;
  const gp=[...(navigator.getGamepads?.()||[])].find(p=>p?.connected&&p.mapping==="standard")||[...(navigator.getGamepads?.()||[])].find(Boolean);
  const dead=x=>Math.abs(x)>.15?x:0;
  if(active){
   remaining=Math.max(0,remaining-dt);if(remaining<=0)endRound();
   if(active){
    const mx=clamp((keys.has("KeyD")||keys.has("ArrowRight")?1:0)-(keys.has("KeyA")||keys.has("ArrowLeft")?1:0)+stick.move.x+dead(gp?.axes?.[0]||0),-1,1);
    const mz=clamp((keys.has("KeyS")||keys.has("ArrowDown")?1:0)-(keys.has("KeyW")||keys.has("ArrowUp")?1:0)+stick.move.y+dead(gp?.axes?.[1]||0),-1,1);
    yaw-=stick.look.x*dt*2+dead(gp?.axes?.[2]||0)*dt*2.5;pitch=clamp(pitch-stick.look.y*dt*2-dead(gp?.axes?.[3]||0)*dt*2,-1.15,1.05);
    camera.rotation.set(pitch,yaw,0);
    const n=Math.max(1,Math.hypot(mx,mz));camera.position.x+=((Math.cos(yaw)*mx+Math.sin(yaw)*mz)/n)*dt*5;camera.position.z+=((-Math.sin(yaw)*mx+Math.cos(yaw)*mz)/n)*dt*5;
    camera.position.x=clamp(camera.position.x,-10,10);camera.position.z=clamp(camera.position.z,-1.5,11);
    const firing=!!gp?.buttons?.[0]?.pressed||!!gp?.buttons?.[7]?.pressed;if(firing&&!prevFire)shoot();prevFire=firing;
    cooldown-=dt;if(cooldown<=0){cooldown=.63+rand()*.24;spawn();}
    for(let i=targets.length-1;i>=0;i--){
     const t=targets[i];t.age+=dt;t.root.position.x=clamp(t.x+Math.sin(t.age*t.speed*2+t.phase)*1.5,-9,9);t.root.rotation.y+=dt*.4;
     if(t.age>t.ttl){scene.remove(t.root);t.mesh.material.dispose();targets.splice(i,1);}
    }
   }
  }else prevFire=!!gp?.buttons?.[0]?.pressed||!!gp?.buttons?.[7]?.pressed;
  flash.intensity=Math.max(0,flash.intensity-dt*200);planet.rotation.y+=dt*.09;planet.rotation.z=Math.sin(tm*.1)*.07;
  if(notice.dataset.at&&performance.now()-Number(notice.dataset.at)>630){notice.textContent="";$("#crosshair").classList.remove("hit");notice.dataset.at="";}
  if(active)updateHud();
  renderer.render(scene,camera);
 }
 renderer.setAnimationLoop(update);
 addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));});
}
