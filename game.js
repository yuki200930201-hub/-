(function(){
'use strict';
const SIZE=9,TOTAL=SIZE*SIZE,KEY='english-town-3d-save-v2';
const BUILDINGS=[
{id:'park',name:'公園',emoji:'🌳',wood:1,coin:0,pop:2},
{id:'house',name:'家',emoji:'🏠',wood:2,coin:0,pop:5},
{id:'cafe',name:'カフェ',emoji:'☕',wood:3,coin:2,pop:12},
{id:'tower',name:'ビル',emoji:'🏢',wood:5,coin:4,pop:25}
];
const ROAD={id:'road',name:'道路',emoji:'🛣️',wood:0,coin:1,pop:0};
const QUIZ=[
['apple','りんご',['りんご','みかん','ぶどう']],['book','本',['机','本','ペン']],['cat','ねこ',['いぬ','とり','ねこ']],['water','水',['火','水','風']],
['happy','うれしい',['かなしい','ねむい','うれしい']],['school','学校',['病院','学校','駅']],['friend','友だち',['友だち','先生','家族']],['morning','朝',['夜','昼','朝']],
['Thank you','ありがとう',['ありがとう','さようなら','ごめんなさい']],['Good luck','がんばって',['おやすみ','がんばって','はじめまして']],['city','街・都市',['村','街・都市','森']],['build','建てる',['壊す','建てる','走る']],
['beautiful','美しい',['美しい','忙しい','難しい']],['library','図書館',['病院','図書館','公園']],['journey','旅',['旅','料理','授業']],['careful','注意深い',['元気な','注意深い','静かな']],
['delicious','おいしい',['苦い','おいしい','冷たい']],['weather','天気',['季節','天気','時間']],['usually','たいてい',['時々','決して','たいてい']],['discover','発見する',['発見する','説明する','準備する']],
['environment','環境',['経験','環境','文化']],['improve','改善する',['改善する','想像する','招待する']],['culture','文化',['文化','自然','歴史']],['opportunity','機会',['理由','機会','結果']],
['comfortable','快適な',['快適な','複雑な','危険な']],['instead','その代わりに',['たとえば','その代わりに','さらに']],['prepare','準備する',['準備する','参加する','比較する']],['successful','成功した',['失敗した','成功した','有名な']]
];
let state={wood:4,coin:3,population:0,solved:0,grid:Array(TOTAL).fill(null),level:1,selected:null,current:null,answered:false};
let scene,camera,renderer,controls,raycaster,mouse,tiles=[],meshes=Array(TOTAL).fill(null),down={x:0,y:0};
function toast(s){const el=document.getElementById('toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
function update(){
document.getElementById('wood').textContent=state.wood;document.getElementById('coin').textContent=state.coin;document.getElementById('population').textContent=state.population;document.getElementById('solved').textContent=state.solved;document.getElementById('level').textContent=state.level;document.getElementById('roads').textContent=state.grid.filter(x=>x&&x.id==='road').length;
renderMenu();
}
function save(show){try{localStorage.setItem(KEY,JSON.stringify({wood:state.wood,coin:state.coin,population:state.population,solved:state.solved,grid:state.grid,level:state.level}));if(show)toast('💾 セーブしたよ！')}catch(e){toast('保存できませんでした')}}
function normalizeCell(item){
if(!item)return null;
const id=typeof item==='string'?item:item.id;
if(id==='road')return {id:'road'};
if(!BUILDINGS.some(b=>b.id===id))return null;
const seed=item&&typeof item==='object'&&Number.isFinite(item.seed)?item.seed:Math.floor(Math.random()*2147483646)+1;
return {id,seed};
}
function load(){
try{
const d=JSON.parse(localStorage.getItem(KEY)||'null');
if(!d||!Array.isArray(d.grid))return;
state.wood=Math.max(0,Number(d.wood)||0);state.coin=Math.max(0,Number(d.coin)||0);
state.population=Math.max(0,Number(d.population)||0);state.solved=Math.max(0,Number(d.solved)||0);
state.level=Math.max(1,Number(d.level)||1);
if(d.grid.length===TOTAL){state.grid=d.grid.map(normalizeCell)}
else if(d.grid.length===25){
state.grid=Array(TOTAL).fill(null);
d.grid.forEach((item,i)=>{const row=Math.floor(i/5)+2,col=(i%5)+2;state.grid[row*SIZE+col]=normalizeCell(item)});
}
}catch(e){}
}
function renderMenu(){
const root=document.getElementById('buildings');root.innerHTML='';
[...BUILDINGS,ROAD].forEach(b=>{
const affordable=state.wood>=b.wood&&state.coin>=b.coin;
const btn=document.createElement('button');
btn.className='build'+(state.selected===b.id?' selected':'')+(b.id==='road'?' road-tool':'');
btn.disabled=!affordable&&state.selected!==b.id;
btn.innerHTML='<span class="emoji">'+b.emoji+'</span><strong>'+b.name+'</strong><small>🪵'+b.wood+'　🪙'+b.coin+'</small>'+(b.id==='road'?'<small>道路を敷く</small>':'<small>人口 +'+b.pop+'</small>');
btn.addEventListener('click',()=>{
state.selected=state.selected===b.id?null:b.id;
document.getElementById('guide').textContent=state.selected?(b.id==='road'?'道路ツール：マスをタップして道路を敷こう！':'建物は道路に隣接するマスに建てよう！'):'ツールを選んでマップをタップしよう。';
renderMenu();
});
root.appendChild(btn);
});
const erase=document.createElement('button');
erase.className='build erase-tool'+(state.selected==='bulldozer'?' selected':'');
erase.innerHTML='<span class="emoji">🚜</span><strong>撤去</strong><small>費用なし</small><small>道路・建物を撤去</small>';
erase.addEventListener('click',()=>{
state.selected=state.selected==='bulldozer'?null:'bulldozer';
document.getElementById('guide').textContent=state.selected?'撤去ツール：マスをタップして道路や建物を取り除こう。':'ツールを選んでマップをタップしよう。';
renderMenu();
});
root.appendChild(erase);
}
function seededRandom(seed){
let x=(Number(seed)||1)>>>0;
return function(){x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
}
function makeBuilding(id,seed){
const g=new THREE.Group(),rand=seededRandom(seed),pick=a=>a[Math.floor(rand()*a.length)],range=(a,b)=>a+rand()*(b-a);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.78});
function box(w,h,d,c,y,x=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function add(mesh,x,y,z){mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh}
if(id==='park'){
box(1.58,.1,1.58,pick([0x4ade80,0x69ce83,0x8bd66f]),.08);
const count=1+Math.floor(rand()*3);
for(let i=0;i<count;i++){
const s=range(.68,.92),x=(i-(count-1)/2)*.48+range(-.07,.07),z=range(-.27,.27),trunkH=range(.36,.57)*s;
add(new THREE.Mesh(new THREE.CylinderGeometry(.07*s,.12*s,trunkH,7),mat(pick([0x92552d,0x79502f,0xa66a3e]))),x,.12+trunkH/2,z);
const shape=Math.floor(rand()*3),leafColor=pick([0x159447,0x238b55,0x57a83d,0x79b84a,0x287b48]);
let crown;
if(shape===0)crown=new THREE.Mesh(new THREE.SphereGeometry(.36*s,10,9),mat(leafColor));
else if(shape===1)crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.39*s,0),mat(leafColor));
else crown=new THREE.Mesh(new THREE.ConeGeometry(.39*s,.82*s,7),mat(leafColor));
add(crown,x,.12+trunkH+.22*s,z);
}
for(let i=0;i<3;i++){const flower=add(new THREE.Mesh(new THREE.SphereGeometry(.055,7,6),mat(pick([0xffe08a,0xffa6c8,0xffffff]))),range(-.62,.62),.17,range(-.62,.62));flower.scale.set(1,.55,1)}
}
if(id==='house'){
const w=range(.96,1.25),d=range(.9,1.22),h=range(.72,1.08);
const wall=pick([0xfff0c7,0xffd9bd,0xe9f3ff,0xe1f2d5,0xffe5ef,0xf1e5ff]),roofColor=pick([0xe76b58,0x9b5c42,0x4e718c,0x596b50,0x8557a2]);
box(w,h,d,wall,.08+h/2);
const roofStyle=Math.floor(rand()*3);
if(roofStyle===0){const roof=add(new THREE.Mesh(new THREE.ConeGeometry(w*.76,range(.42,.7),4),mat(roofColor)),0,.08+h+.2,0);roof.rotation.y=Math.PI/4}
else if(roofStyle===1){box(w+.12,.16,d+.12,roofColor,.08+h+.08);box(w*.72,.22,d*.72,pick([0xffd36b,0xe9a64d,0xe5eef4]),.08+h+.27)}
else{box(w+.12,.13,d+.12,roofColor,.08+h+.06);const cap=add(new THREE.Mesh(new THREE.ConeGeometry(w*.45,.38,4),mat(roofColor)),0,.08+h+.29,0);cap.rotation.y=Math.PI/4}
const windowColor=pick([0x78c9ed,0x8ad8d2,0x9bb9e8,0xfff2a8]);
for(const x of [-w*.25,w*.25]){const win=box(w*.19,h*.25,.035,windowColor,.08+h*.58,x,d/2+.025);box(w*.23,.035,.05,0xffffff,.08+h*.58+h*.14,x,d/2+.04)}
const door=box(w*.2,h*.42,.055,pick([0x8b5e45,0x6e5141,0x9b6846]),.08+h*.21,0,d/2+.04);
box(w*.28,.07,.12,roofColor,.08+h*.43,0,d/2+.07);
}
if(id==='cafe'){
const w=range(1.05,1.36),d=range(.95,1.25),h=range(.78,1.04);
const wall=pick([0xffdf9e,0xffefcf,0xd8eddf,0xf8d7df,0xd9eaff]),trim=pick([0x8b5b3d,0x5d7185,0xa65c51,0x527b61]);
box(w,h,d,wall,.08+h/2);box(w+.14,.14,d+.14,trim,.08+h+.08);
const awning=pick([0xe76b58,0x4b9fc8,0x6ba86e,0xb17ac7,0xe6a43c]);
box(w+.2,.12,.42,awning,.08+h-.04,0,d/2+.18);
for(let x=-w*.4;x<=w*.4;x+=w*.2){box(w*.095,.13,.43,pick([0xffffff,0xfff1d6]),.08+h-.035,x,d/2+.18)}
box(w*.64,.2,.07,pick([0xffffff,0xfff7dc,0x263b50]),.08+h+.28,0,d/2+.09);
const windowColor=pick([0x85cbed,0x94d9cf,0xfff0a8]);
for(const x of [-w*.32,w*.32])box(w*.2,h*.28,.04,windowColor,.08+h*.53,x,d/2+.025);
box(.24,.34,.055,trim,.08+.18,0,d/2+.05);
}
if(id==='tower'){
const floors=3+Math.floor(rand()*4),floorH=range(.38,.52),w=range(.82,1.14),d=range(.82,1.14),h=floors*floorH;
const facade=pick([0x5ab7dc,0x7394c8,0x7ab9aa,0x9d9cc9,0x8aa6bd,0x7cabbc]),glass=pick([0xe4f8ff,0xbce9f2,0xffe8a8]);
box(w,h,d,facade,.08+h/2);
for(let level=0;level<floors;level++){
const y=.08+level*floorH+floorH*.52;
box(w+.035,.045,d+.035,pick([0xffffff,0xd9e7ed,0xf5d99a]),y);
for(let x of [-w*.29,0,w*.29])box(w*.17,floorH*.42,.035,glass,y,x,d/2+.025);
}
box(w*.72,.18,d*.72,pick([0x267da8,0x4c6e88,0x526b5b,0x986a63]),.08+h+.09);
if(rand()>.45){const antenna=add(new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,range(.35,.75),6),mat(0x64748b)),0,.08+h+.48,0);antenna.castShadow=true}
}
g.rotation.y=Math.floor(rand()*4)*Math.PI/2;
return g;
}
function isRoad(i){return !!state.grid[i]&&state.grid[i].id==='road'}
function makeRoad(i){
const row=Math.floor(i/SIZE),col=i%SIZE,g=new THREE.Group();
const asphalt=new THREE.Mesh(new THREE.BoxGeometry(2.18,.14,2.18),new THREE.MeshStandardMaterial({color:0x58616b,roughness:.95}));
asphalt.position.y=.08;asphalt.receiveShadow=true;asphalt.castShadow=true;g.add(asphalt);
const directions={left:col>0&&isRoad(i-1),right:col<SIZE-1&&isRoad(i+1),up:row>0&&isRoad(i-SIZE),down:row<SIZE-1&&isRoad(i+SIZE)};
const horizontal=directions.left||directions.right||(!directions.up&&!directions.down);
const vertical=directions.up||directions.down;
const paint=new THREE.MeshStandardMaterial({color:0xffdf83,roughness:.8});
function dash(x,z,alongX){const mark=new THREE.Mesh(new THREE.BoxGeometry(alongX?.34:.055,.018,alongX?.055:.34),paint);mark.position.set(x,.158,z);g.add(mark)}
if(horizontal)for(const x of [-.72,-.18,.36,.9])dash(x,0,true);
if(vertical)for(const z of [-.72,-.18,.36,.9])dash(0,z,false);
return g;
}
function sync(){
for(let i=0;i<TOTAL;i++){
if(meshes[i]&&isRoad(i)){scene.remove(meshes[i]);meshes[i]=null;}
if(!state.grid[i]&&meshes[i]){scene.remove(meshes[i]);meshes[i]=null;}
}
state.grid.forEach((item,i)=>{
if(!item||meshes[i])return;
const id=item.id,p=tiles[i].position;
const m=id==='road'?makeRoad(i):makeBuilding(id,item.seed||i+1);
m.position.set(p.x,.08,p.z);m.scale.set(.02,.02,.02);scene.add(m);meshes[i]=m;
});
}
function init3D(){
const el=document.getElementById('world'),w=el.clientWidth,h=el.clientHeight;scene=new THREE.Scene();scene.fog=new THREE.Fog(0xcceeff,28,55);camera=new THREE.PerspectiveCamera(44,w/h,.1,120);camera.position.set(12,14,15);
renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.08;controls.minDistance=6;controls.maxDistance=38;
scene.add(new THREE.HemisphereLight(0xffffff,0x8bbd82,1.05));const sun=new THREE.DirectionalLight(0xfff2d6,.9);sun.position.set(8,16,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const ground=new THREE.Mesh(new THREE.BoxGeometry(22.5,.5,22.5),new THREE.MeshStandardMaterial({color:0x85d69a}));ground.position.y=-.34;ground.receiveShadow=true;scene.add(ground);
const offset=(SIZE-1)*2.2/2;
for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const i=r*SIZE+c;const tile=new THREE.Mesh(new THREE.BoxGeometry(2.18,.12,2.18),new THREE.MeshStandardMaterial({color:0xd9f99d,roughness:.9}));tile.position.set(c*2.2-offset,0,r*2.2-offset);tile.userData.index=i;tile.receiveShadow=true;scene.add(tile);tiles.push(tile)}
raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;const rect=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-rect.left)/rect.width*2-1;mouse.y=-((e.clientY-rect.top)/rect.height*2-1);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(tiles)[0];if(hit)place(hit.object.userData.index)});
window.addEventListener('resize',()=>{const ww=el.clientWidth,hh=el.clientHeight;camera.aspect=ww/hh;camera.updateProjectionMatrix();renderer.setSize(ww,hh)});
sync();(function animate(){requestAnimationFrame(animate);meshes.forEach(m=>{if(m&&m.scale.x<.995){m.scale.x+=(1-m.scale.x)*.14;m.scale.y+=(1-m.scale.y)*.14;m.scale.z+=(1-m.scale.z)*.14}});controls.update();renderer.render(scene,camera)})();
}
function hasAdjacentRoad(i){
const row=Math.floor(i/SIZE),col=i%SIZE;
return (col>0&&isRoad(i-1))||(col<SIZE-1&&isRoad(i+1))||(row>0&&isRoad(i-SIZE))||(row<SIZE-1&&isRoad(i+SIZE));
}
function place(i){
if(!state.selected){toast('まずツールを選んでね！');return;}
if(state.selected==='bulldozer'){
const item=state.grid[i];if(!item){toast('ここには撤去するものがないよ');return;}
if(item.id!=='road'){const b=BUILDINGS.find(x=>x.id===item.id);if(b)state.population=Math.max(0,state.population-b.pop);}
state.grid[i]=null;state.level=Math.max(1,Math.floor(state.population/15)+1);
toast((item.id==='road'?'道路':'建物')+'を撤去したよ');sync();update();save(false);return;
}
if(state.grid[i]){toast('そこにはもう何かあるよ！');return;}
if(state.selected==='road'){
if(state.coin<ROAD.coin){toast('コインが足りないよ！英語クイズに挑戦しよう');return;}
state.coin-=ROAD.coin;state.grid[i]={id:'road'};
toast('🛣️ 道路を敷いたよ！');
sync();update();save(false);return;
}
const b=BUILDINGS.find(x=>x.id===state.selected);if(!b)return;
if(!hasAdjacentRoad(i)){toast('建物は道路に隣接するマスに建てよう！');return;}
if(state.wood<b.wood||state.coin<b.coin){toast('資源が足りないよ！クイズに挑戦しよう');return;}
state.wood-=b.wood;state.coin-=b.coin;state.population+=b.pop;
state.grid[i]={id:b.id,seed:Math.floor(Math.random()*2147483646)+1};
const lv=Math.floor(state.population/15)+1;
if(lv>state.level){state.level=lv;toast('🎉 街がレベル '+lv+' にアップ！');}
else toast(b.name+'を建てたよ！道路に接続できたね');
sync();update();save(false);
}
function nextQuiz(){state.answered=false;state.current=QUIZ[Math.floor(Math.random()*QUIZ.length)];document.getElementById('question').textContent=state.current[0];document.getElementById('feedback').textContent='正しい意味を選んでね！';document.getElementById('next').disabled=true;const root=document.getElementById('answers');root.innerHTML='';state.current[2].slice().sort(()=>Math.random()-.5).forEach(opt=>{const b=document.createElement('button');b.className='answer';b.textContent=opt;b.addEventListener('click',()=>answer(opt,b));root.appendChild(b)})}
function answer(opt,btn){if(state.answered)return;state.answered=true;const ok=opt===state.current[1];document.querySelectorAll('.answer').forEach(b=>{b.disabled=true;if(b.textContent===state.current[1])b.classList.add('correct')});if(ok){state.wood++;state.coin++;state.solved++;document.getElementById('feedback').textContent='🎉 正解！ '+state.current[0]+' = '+state.current[1]+'　木材とコインを1つずつゲット！';}else{btn.classList.add('wrong');document.getElementById('feedback').textContent='おしい！ 正解は「'+state.current[1]+'」だよ。次も挑戦しよう！'}document.getElementById('next').disabled=false;update();save(false)}
document.getElementById('speak').addEventListener('click',()=>{if(!state.current)return;if(!('speechSynthesis'in window)){toast('このブラウザでは発音機能を使えません');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(state.current[0]);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)});
document.getElementById('next').addEventListener('click',nextQuiz);document.getElementById('save').addEventListener('click',()=>save(true));
document.getElementById('reset').addEventListener('click',()=>{if(!confirm('街とセーブデータを最初からにする？'))return;localStorage.removeItem(KEY);state.wood=4;state.coin=3;state.population=0;state.solved=0;state.level=1;state.grid=Array(TOTAL).fill(null);state.selected=null;meshes.forEach(m=>{if(m)scene.remove(m)});meshes=Array(TOTAL).fill(null);update();save(false);toast('新しい街をスタート！')});
load();update();init3D();nextQuiz();save(false);
})();
