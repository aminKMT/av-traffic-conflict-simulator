"use strict";

// ---------- DOM and formatting helpers ----------
const $ = (id) => document.getElementById(id);
const canvas = $("simCanvas");
const ctx = canvas.getContext("2d");
const numericIds = ["duration","timeStep","zoneX","zoneY","zoneW","zoneH","petThreshold","avX","avY","avSpeed","avHeading","avAccel","avDelay","avLength","avWidth","otherX","otherY","otherSpeed","otherHeading","otherAccel","otherDelay","otherLength","otherWidth"];
const fmt = (v, digits=2) => Number.isFinite(v) ? v.toFixed(digits) : "—";
const timeText = (v) => Number.isFinite(v) ? `${v.toFixed(2)} s` : "—";
const pointText = (p) => `(${fmt(p.x)}, ${fmt(p.y)}) m`;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const radians = (deg) => deg * Math.PI / 180;

const DIMENSIONS = {
  vehicle: { length: 4.5, width: 1.8, label: "Passenger vehicle" },
  bicycle: { length: 1.8, width: 0.7, label: "Bicycle" },
  pedestrian: { length: 0.6, width: 0.6, label: "Pedestrian" }
};

let config = null;
let state = null;
let running = false;
let lastFrame = 0;
let accumulator = 0;
let renderScale = 10;

function readNumber(id) { return Number($(id).value); }

function readInputs() {
  return {
    duration: readNumber("duration"), timeStep: readNumber("timeStep"), playback: readNumber("playback"),
    petThreshold: readNumber("petThreshold"), otherType: $("otherType").value,
    zone: { x: readNumber("zoneX"), y: readNumber("zoneY"), w: readNumber("zoneW"), h: readNumber("zoneH") },
    av: readObject("av", "av"), other: readObject("other", $("otherType").value)
  };
}

function readObject(prefix, type) {
  return { type, x: readNumber(prefix+"X"), y: readNumber(prefix+"Y"), speed: readNumber(prefix+"Speed"),
    heading: readNumber(prefix+"Heading"), accel: readNumber(prefix+"Accel"), delay: readNumber(prefix+"Delay"),
    length: readNumber(prefix+"Length"), width: readNumber(prefix+"Width") };
}

function validate(c) {
  const errors = [];
  if (numericIds.some(id => !Number.isFinite(readNumber(id)))) errors.push("All numerical inputs must contain valid numbers.");
  if (c.duration <= 0) errors.push("Simulation duration must be greater than zero.");
  if (c.timeStep <= 0 || c.timeStep > 0.5) errors.push("Physics time step must be greater than 0 and no more than 0.5 s.");
  if (c.zone.w <= 0 || c.zone.h <= 0 || c.av.length <= 0 || c.av.width <= 0 || c.other.length <= 0 || c.other.width <= 0) errors.push("Object and conflict-zone dimensions must be positive.");
  if (c.av.speed < 0 || c.other.speed < 0 || c.av.delay < 0 || c.other.delay < 0) errors.push("Speeds and start delays cannot be negative.");
  if (c.av.speed === 0 && c.other.speed === 0) errors.push("Both objects have zero speed; the scenario cannot develop.");
  const horizon = c.duration + Math.max(c.av.delay,c.other.delay);
  if (!pathReachesZone(c.av,c.zone,horizon)) errors.push("Warning: the AV trajectory does not intersect the conflict zone.");
  if (!pathReachesZone(c.other,c.zone,horizon)) errors.push("Warning: the selected road-user trajectory does not intersect the conflict zone.");
  return errors;
}

function showValidation(messages) {
  const box = $("validation");
  box.hidden = messages.length === 0;
  box.innerHTML = messages.map(m => `<div>• ${m}</div>`).join("");
}

// ---------- Geometry and collision detection ----------
function velocity(o) { const a=radians(o.heading); return {x:o.speed*Math.cos(a), y:o.speed*Math.sin(a)}; }
function centerDistance(a,b) { return Math.hypot(a.x-b.x,a.y-b.y); }

function obb(o) {
  const a=radians(o.heading), ux={x:Math.cos(a),y:Math.sin(a)}, uy={x:-Math.sin(a),y:Math.cos(a)};
  return {c:{x:o.x,y:o.y}, axes:[ux,uy], half:[o.length/2,o.width/2]};
}

// Separating Axis Theorem for two oriented rectangles.
function obbOverlap(a,b) {
  for (const axis of [...a.axes,...b.axes]) {
    const ca=a.c.x*axis.x+a.c.y*axis.y, cb=b.c.x*axis.x+b.c.y*axis.y;
    const ra=a.half[0]*Math.abs(a.axes[0].x*axis.x+a.axes[0].y*axis.y)+a.half[1]*Math.abs(a.axes[1].x*axis.x+a.axes[1].y*axis.y);
    const rb=b.half[0]*Math.abs(b.axes[0].x*axis.x+b.axes[0].y*axis.y)+b.half[1]*Math.abs(b.axes[1].x*axis.x+b.axes[1].y*axis.y);
    if (Math.abs(cb-ca) > ra+rb+1e-8) return false;
  }
  return true;
}

function zoneObject(c) { return {x:c.zone.x,y:c.zone.y,heading:0,length:c.zone.w,width:c.zone.h}; }
function occupiesZone(o,c) { return obbOverlap(obb(o),obb(zoneObject(c))); }

function distanceToZone(o,z) {
  const dx=Math.max(Math.abs(o.x-z.x)-z.w/2-o.length/2,0);
  const dy=Math.max(Math.abs(o.y-z.y)-z.h/2-o.width/2,0);
  return Math.hypot(dx,dy);
}

function projectedObject(o, dt, now) {
  if (now+dt <= o.delay) return {...o};
  const moving=Math.max(0,now+dt-Math.max(now,o.delay));
  const speed=Math.max(0,o.speed+o.accel*moving);
  const avg=(o.speed+speed)/2, a=radians(o.heading);
  return {...o,x:o.x+avg*moving*Math.cos(a),y:o.y+avg*moving*Math.sin(a),speed};
}

function pathReachesZone(o,z,horizon) {
  for(let t=0;t<=horizon;t+=Math.max(.05,horizon/300)) if(occupiesZone(projectedObject({...o,delay:0},t,0),{zone:z})) return true;
  return false;
}

// TTC: propagate both 2D oriented footprints and find the first future SAT overlap.
function calculateTTC(a,b,now,horizon=20) {
  if (obbOverlap(obb(a),obb(b))) return 0;
  const sample=Math.min(.05,config.timeStep), end=Math.min(horizon,config.duration-now);
  let previous=0;
  for(let t=sample;t<=end+1e-8;t+=sample){
    const hit=obbOverlap(obb(projectedObject(a,t,now)),obb(projectedObject(b,t,now)));
    if(hit){
      let lo=previous,hi=t;
      for(let i=0;i<12;i++){const mid=(lo+hi)/2; if(obbOverlap(obb(projectedObject(a,mid,now)),obb(projectedObject(b,mid,now)))) hi=mid; else lo=mid;}
      return hi;
    }
    previous=t;
  }
  return null;
}

// Numerical closest-approach forecast used for the white canvas marker.
function predictMinimumPoint(a,b,now) {
  const end=Math.min(20,config.duration-now), sample=Math.max(.02,Math.min(.1,config.timeStep*2));
  let best={distance:centerDistance(a,b),x:(a.x+b.x)/2,y:(a.y+b.y)/2,time:now};
  for(let t=sample;t<=end+1e-8;t+=sample){
    const pa=projectedObject(a,t,now),pb=projectedObject(b,t,now),d=centerDistance(pa,pb);
    if(d<best.distance) best={distance:d,x:(pa.x+pb.x)/2,y:(pa.y+pb.y)/2,time:now+t};
  }
  return best;
}

// ---------- Simulation state and event recording ----------
function makeState(c) {
  return {time:0,av:{...c.av},other:{...c.other},collision:false,collisionTime:null,minSeparation:centerDistance(c.av,c.other),minPoint:{x:(c.av.x+c.other.x)/2,y:(c.av.y+c.other.y)/2},
    zone:{av:{inside:false,entry:null,exit:null},other:{inside:false,entry:null,exit:null}},pet:null,overlapOccupancy:false,finished:false};
}

function updateMotion(o, dt, t0) {
  const activeStart=Math.max(t0,o.delay), activeEnd=Math.max(activeStart,t0+dt);
  const moveDt=Math.max(0,activeEnd-activeStart);
  if(!moveDt) return;
  const nextSpeed=Math.max(0,o.speed+o.accel*moveDt), travel=(o.speed+nextSpeed)*.5*moveDt, a=radians(o.heading);
  o.x+=travel*Math.cos(a); o.y+=travel*Math.sin(a); o.speed=nextSpeed;
}

function recordZone(name, inside, t) {
  const z=state.zone[name];
  if(inside && !z.inside && z.entry===null) z.entry=t;
  if(!inside && z.inside && z.entry!==null && z.exit===null) z.exit=t;
  z.inside=inside;
}

function updatePET() {
  const a=state.zone.av,b=state.zone.other;
  if((a.inside&&b.inside) || state.collision) { state.overlapOccupancy=true; state.pet=0; return; }
  if(a.entry!==null && b.entry!==null && a.exit!==null && b.exit!==null){
    const firstExit=Math.min(a.exit,b.exit), secondEntry=a.exit<=b.exit?b.entry:a.entry;
    state.pet=Math.max(0,secondEntry-firstExit);
    if(secondEntry<firstExit) state.overlapOccupancy=true;
  }
}

function physicsStep(dt) {
  if(state.finished) return;
  const t0=state.time;
  // Adaptive substeps cap displacement to one quarter of the smallest footprint dimension.
  const vmax=Math.max(state.av.speed,state.other.speed,0.01), minDim=Math.min(state.av.width,state.other.width,state.av.length,state.other.length);
  const maxSub=Math.min(config.timeStep,0.02,Math.max(.001,minDim/(4*vmax)));
  const pieces=Math.ceil(dt/maxSub), sub=dt/pieces;
  for(let i=0;i<pieces;i++){
    updateMotion(state.av,sub,state.time); updateMotion(state.other,sub,state.time); state.time+=sub;
    const avIn=occupiesZone(state.av,config), otherIn=occupiesZone(state.other,config);
    recordZone("av",avIn,state.time); recordZone("other",otherIn,state.time);
    if(!state.collision && obbOverlap(obb(state.av),obb(state.other))){state.collision=true;state.collisionTime=state.time;}
    const sep=centerDistance(state.av,state.other);
    if(sep<state.minSeparation){state.minSeparation=sep;state.minPoint={x:(state.av.x+state.other.x)/2,y:(state.av.y+state.other.y)/2};}
    updatePET();
    if(state.time>=config.duration-1e-8){state.time=config.duration;state.finished=true;running=false;break;}
  }
}

function classification() {
  if(state.collision) return {text:"Collision",cls:"collision"};
  if(state.pet!==null && state.pet>0 && state.pet<config.petThreshold) return {text:"Near conflict",cls:"near"};
  if(state.pet!==null && state.pet>=config.petThreshold) return {text:"Safe passage",cls:"safe"};
  if(state.finished && (state.zone.av.entry===null || state.zone.other.entry===null)) return {text:"No shared conflict",cls:"safe"};
  if(state.finished) return {text:"Safe passage",cls:"safe"};
  return {text:"Simulation incomplete",cls:"incomplete"};
}

// ---------- Canvas rendering ----------
function resizeCanvas(){const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render();}
function worldToScreen(x,y){const r=canvas.getBoundingClientRect();return {x:r.width/2+(x-config.zone.x)*renderScale,y:r.height/2-(y-config.zone.y)*renderScale};}

function drawGrid(){const r=canvas.getBoundingClientRect(),step=5*renderScale,origin=worldToScreen(config.zone.x,config.zone.y);ctx.save();ctx.strokeStyle="#142b3e";ctx.lineWidth=1;for(let x=origin.x%step;x<r.width;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,r.height);ctx.stroke()}for(let y=origin.y%step;y<r.height;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(r.width,y);ctx.stroke()}ctx.restore()}
function drawRoads(){const r=canvas.getBoundingClientRect(),c=worldToScreen(config.zone.x,config.zone.y);ctx.save();ctx.fillStyle="#10283b";ctx.fillRect(0,c.y-48,r.width,96);ctx.fillRect(c.x-48,0,96,r.height);ctx.strokeStyle="#375067";ctx.setLineDash([14,12]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,c.y);ctx.lineTo(r.width,c.y);ctx.moveTo(c.x,0);ctx.lineTo(c.x,r.height);ctx.stroke();ctx.restore()}
function drawZone(){const p=worldToScreen(config.zone.x,config.zone.y),w=config.zone.w*renderScale,h=config.zone.h*renderScale;ctx.save();ctx.fillStyle="rgba(34,211,238,.09)";ctx.strokeStyle="#22d3ee";ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.fillRect(p.x-w/2,p.y-h/2,w,h);ctx.strokeRect(p.x-w/2,p.y-h/2,w,h);ctx.setLineDash([]);ctx.fillStyle="#65e8fa";ctx.font="700 9px system-ui";ctx.fillText("CONFLICT ZONE",p.x-w/2,p.y-h/2-7);ctx.restore()}
function drawTrajectory(o,color){const p=worldToScreen(o.x,o.y),a=radians(o.heading);ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.45;ctx.setLineDash([7,7]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x-600*Math.cos(a),p.y+600*Math.sin(a));ctx.lineTo(p.x+600*Math.cos(a),p.y-600*Math.sin(a));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;const ex=p.x+55*Math.cos(a),ey=p.y-55*Math.sin(a);ctx.fillStyle=color;ctx.translate(ex,ey);ctx.rotate(-a);ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.restore()}
function footprintCorners(o){const box=obb(o);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy])=>({x:box.c.x+sx*box.half[0]*box.axes[0].x+sy*box.half[1]*box.axes[1].x,y:box.c.y+sx*box.half[0]*box.axes[0].y+sy*box.half[1]*box.axes[1].y}));}
function drawObject(o,color,label){const corners=footprintCorners(o).map(p=>worldToScreen(p.x,p.y));ctx.save();ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle="rgba(255,255,255,.65)";ctx.lineWidth=1;ctx.stroke();const p=worldToScreen(o.x,o.y),a=radians(o.heading);ctx.translate(p.x,p.y);ctx.rotate(-a);ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(o.length*renderScale*.34,0);ctx.lineTo(o.length*renderScale*.1,-Math.max(2,o.width*renderScale*.18));ctx.lineTo(o.length*renderScale*.1,Math.max(2,o.width*renderScale*.18));ctx.closePath();ctx.fill();ctx.restore();ctx.save();ctx.fillStyle="#d9e7f5";ctx.font="700 9px system-ui";ctx.fillText(label,p.x+8,p.y-9);ctx.restore()}
function drawMinPoint(){const m=state.predictedMinPoint||state.minPoint;if(!m)return;const p=worldToScreen(m.x,m.y);ctx.save();ctx.strokeStyle="rgba(255,255,255,.8)";ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#d9e7f5";ctx.font="700 8px system-ui";ctx.fillText(`MIN @ ${fmt(m.time||state.time,1)} s`,p.x+10,p.y-8);ctx.restore()}
function render(){if(!config||!state)return;const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);drawGrid();drawRoads();drawZone();drawTrajectory(state.av,"#2f7df6");drawTrajectory(state.other,"#f59e0b");drawMinPoint();drawObject(state.av,"#2f7df6","AV");drawObject(state.other,"#f59e0b",DIMENSIONS[config.otherType].label);}

// ---------- Output panel ----------
function updateResults(){
  const ttc=state.collision?0:calculateTTC(state.av,state.other,state.time);
  state.predictedMinPoint=predictMinimumPoint(state.av,state.other,state.time);
  $("clock").textContent=timeText(state.time); $("avPos").textContent=pointText(state.av); $("otherPos").textContent=pointText(state.other);
  $("distance").textContent=`${fmt(centerDistance(state.av,state.other))} m`;
  $("zoneDistance").textContent=`${fmt(distanceToZone(state.av,config.zone))} / ${fmt(distanceToZone(state.other,config.zone))} m`;
  $("avZoneTimes").textContent=`${timeText(state.zone.av.entry)} / ${timeText(state.zone.av.exit)}`; $("otherZoneTimes").textContent=`${timeText(state.zone.other.entry)} / ${timeText(state.zone.other.exit)}`;
  $("minSep").textContent=`Minimum center separation: ${fmt(state.minSeparation)} m`;
  if(state.collision){$("ttc").textContent="Collision detected — TTC = 0.00 s";$("predictedCollision").textContent=`Collision time: ${timeText(state.collisionTime)}`;}
  else if(ttc!==null){$("ttc").textContent=`${ttc.toFixed(2)} s`;$("predictedCollision").textContent=`Predicted collision time: ${(state.time+ttc).toFixed(2)} s`;}
  else{$("ttc").textContent="No predicted collision";$("predictedCollision").textContent="Predicted collision: —";}
  if(state.pet===0) $("pet").textContent="0.00 s — Collision or overlapping occupancy";
  else if(state.pet!==null) $("pet").textContent=`${state.pet.toFixed(2)} s`;
  else if(state.finished&&(state.zone.av.entry===null||state.zone.other.entry===null)) $("pet").textContent="Not applicable";
  else $("pet").textContent="Pending";
  $("collisionStatus").textContent=state.collision?"Collision detected":"No collision";
  const c=classification(), badge=$("classification");badge.textContent=c.text;badge.className=`classification ${c.cls}`;
  const risk=$("riskBadge");
  if(state.collision||ttc!==null){risk.className="risk-badge red";risk.querySelector("span").textContent=state.collision?"Collision detected":"Collision predicted";}
  else if(state.pet!==null&&state.pet<config.petThreshold){risk.className="risk-badge yellow";risk.querySelector("span").textContent="Near conflict";}
  else{risk.className="risk-badge green";risk.querySelector("span").textContent="No conflict predicted";}
}

// ---------- Controls, presets, and animation loop ----------
const EXAMPLES={
  collision:{otherType:"vehicle",duration:10,av:{x:-30,y:0,speed:8,heading:0,delay:0,length:4.5,width:1.8},other:{x:0,y:-30,speed:8,heading:90,delay:0,length:4.5,width:1.8}},
  near:{otherType:"bicycle",duration:12,av:{x:-30,y:0,speed:8,heading:0,delay:0,length:4.5,width:1.8},other:{x:0,y:-27.5,speed:5,heading:90,delay:0,length:1.8,width:.7}},
  safe:{otherType:"pedestrian",duration:16,av:{x:-30,y:0,speed:8,heading:0,delay:0,length:4.5,width:1.8},other:{x:0,y:-18,speed:1.5,heading:90,delay:0,length:.6,width:.6}},
  noshared:{otherType:"bicycle",duration:12,av:{x:-30,y:0,speed:8,heading:0,delay:0,length:4.5,width:1.8},other:{x:20,y:-25,speed:5,heading:90,delay:0,length:1.8,width:.7}}
};

function setObject(prefix,o){$(prefix+"X").value=o.x;$(prefix+"Y").value=o.y;$(prefix+"Speed").value=o.speed;$(prefix+"Heading").value=o.heading;$(prefix+"Accel").value=o.accel||0;$(prefix+"Delay").value=o.delay||0;$(prefix+"Length").value=o.length;$(prefix+"Width").value=o.width;}
function loadExample(name){const e=EXAMPLES[name];$("otherType").value=e.otherType;$("duration").value=e.duration;$("timeStep").value=.02;$("zoneX").value=0;$("zoneY").value=0;$("zoneW").value=5;$("zoneH").value=5;setObject("av",e.av);setObject("other",e.other);syncTypeLabel(false);resetSimulation();}
function syncTypeLabel(resetDimensions=true){const t=$("otherType").value,d=DIMENSIONS[t];$("otherSettingsTitle").textContent=d.label;$("legendOther").textContent=d.label;if(resetDimensions){$("otherLength").value=d.length;$("otherWidth").value=d.width;}resetSimulation();}
function resetSimulation(){running=false;accumulator=0;config=readInputs();const errors=validate(config);showValidation(errors);state=makeState(config);updateResults();render();}
function start(){config=readInputs();const errors=validate(config),blocking=errors.filter(e=>!e.startsWith("Warning:"));showValidation(errors);if(blocking.length)return;if(!state||state.finished||Math.abs(state.time)>1e-8)resetSimulation();running=true;lastFrame=performance.now();requestAnimationFrame(loop);}
function loop(now){if(!running)return;const realDt=Math.min((now-lastFrame)/1000,.15)*config.playback;lastFrame=now;accumulator+=realDt;while(accumulator>=config.timeStep){physicsStep(config.timeStep);accumulator-=config.timeStep;}updateResults();render();if(running)requestAnimationFrame(loop);}
function stepForward(){if(running)return;config=readInputs();const errors=validate(config),blocking=errors.filter(e=>!e.startsWith("Warning:"));showValidation(errors);if(blocking.length)return;if(!state||state.finished)state=makeState(config);physicsStep(Math.min(config.timeStep,config.duration-state.time));updateResults();render();}

$("play").addEventListener("click",start);$("pause").addEventListener("click",()=>running=false);$("reset").addEventListener("click",resetSimulation);$("step").addEventListener("click",stepForward);$("loadExample").addEventListener("click",()=>loadExample($("exampleSelect").value));$("otherType").addEventListener("change",()=>syncTypeLabel(true));$("resetDefaults").addEventListener("click",()=>loadExample("collision"));window.addEventListener("resize",resizeCanvas);
numericIds.forEach(id=>$(id).addEventListener("change",()=>{if(!running)resetSimulation()}));

config=readInputs();state=makeState(config);showValidation(validate(config));resizeCanvas();updateResults();
