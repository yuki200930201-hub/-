(function(){
'use strict';
const SIZE=36,TOTAL=SIZE*SIZE,CELL_SPACING=.55,CELL_SIZE=.53,KEY='english-town-3d-save-v2';
const BUILDINGS=[
{id:'park',name:'公園',emoji:'🌳',wood:1,coin:0,pop:2,cols:3,rows:3},
{id:'house',name:'家',emoji:'🏠',wood:2,coin:0,pop:5,serviceDemand:10,cols:2,rows:2},
{id:'cafe',name:'カフェ',emoji:'☕',wood:3,coin:2,pop:12,cols:2,rows:3},
{id:'tower',name:'ビル',emoji:'🏢',wood:5,coin:4,pop:25,serviceDemand:30,cols:2,rows:2},
{id:'factory',name:'工場',emoji:'🏭',wood:0,coin:0,pop:0,cols:2,rows:2,maxCount:3},
{id:'police_hq',name:'警察本部',emoji:'🏢',wood:8,coin:8,pop:0,cols:3,rows:3,coverage:12,coverageRank:3,coverageType:'police',policeCapacity:400},
{id:'police_station',name:'警察署',emoji:'🚔',wood:5,coin:4,pop:0,cols:2,rows:2,coverage:8,coverageRank:2,coverageType:'police',policeCapacity:200},
{id:'koban',name:'交番',emoji:'🚨',wood:2,coin:2,pop:0,cols:1,rows:1,coverage:4,coverageRank:1,coverageType:'police',policeCapacity:100},
{id:'clinic',name:'診療所',emoji:'🩺',wood:2,coin:2,pop:0,cols:2,rows:2,coverage:4,coverageRank:1,coverageType:'health',healthCapacity:100},
{id:'hospital',name:'病院',emoji:'🏥',wood:5,coin:5,pop:0,cols:3,rows:3,coverage:8,coverageRank:2,coverageType:'health',healthCapacity:200},
{id:'university_hospital',name:'大学病院',emoji:'🏨',wood:8,coin:8,pop:0,cols:4,rows:4,coverage:12,coverageRank:3,coverageType:'health',healthCapacity:400},
{id:'water_tower',name:'貯水塔',emoji:'🗼',wood:4,coin:3,pop:0,cols:2,rows:2,waterCapacity:100},
{id:'water_tank',name:'貯水槽',emoji:'🛢️',wood:6,coin:5,pop:0,cols:3,rows:3,waterCapacity:200},
{id:'pumping_station',name:'ポンプ場',emoji:'🚰',wood:8,coin:7,pop:0,cols:4,rows:4,waterCapacity:400},
{id:'wind_plant',name:'風力発電所',emoji:'🌬️',wood:4,coin:4,pop:0,cols:2,rows:2,powerCapacity:30},
{id:'coal_plant',name:'石炭発電所',emoji:'🏭',wood:6,coin:6,pop:0,cols:3,rows:3,powerCapacity:50},
{id:'large_wind_plant',name:'大型風力発電所',emoji:'🌪️',wood:7,coin:7,pop:0,cols:3,rows:3,powerCapacity:70},
{id:'solar_plant',name:'太陽光発電所',emoji:'☀️',wood:6,coin:5,pop:0,cols:3,rows:3,powerCapacity:80},
{id:'oil_plant',name:'石油発電所',emoji:'🛢️',wood:8,coin:8,pop:0,cols:3,rows:3,powerCapacity:100},
{id:'nuclear_plant',name:'原子力発電所',emoji:'⚛️',wood:12,coin:12,pop:0,cols:4,rows:4,powerCapacity:200},
{id:'fusion_plant',name:'核融合発電所',emoji:'✨',wood:16,coin:16,pop:0,cols:4,rows:4,powerCapacity:400}
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
let state={wood:4,coin:3,population:0,solved:0,grid:Array(TOTAL).fill(null),level:1,selected:null,current:null,answered:false,activeFactory:null};
let scene,camera,renderer,controls,raycaster,mouse,tiles=[],meshes=Array(TOTAL).fill(null),down={x:0,y:0};
let pendingAction=null;
let policeCoverageVisible=true,policeCoverageGroup=null,policeCoverageRanks=Array(TOTAL).fill(0);
let healthCoverageVisible=true,healthCoverageGroup=null,healthCoverageRanks=Array(TOTAL).fill(0);
let waterIndicatorsGroup=null,powerIndicatorsGroup=null;
function toast(s){const el=document.getElementById('toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1900)}
function showActionConfirm(title,message,details,confirmLabel,onConfirm){
pendingAction=onConfirm;
document.getElementById('confirmTitle').textContent=title;
document.getElementById('confirmMessage').textContent=message;
document.getElementById('confirmDetails').textContent=details;
document.getElementById('confirmAction').textContent=confirmLabel;
const panel=document.getElementById('actionConfirm');
panel.classList.add('open');
panel.setAttribute('aria-hidden','false');
}
function closeActionConfirm(){
const panel=document.getElementById('actionConfirm');
panel.classList.remove('open');
panel.setAttribute('aria-hidden','true');
pendingAction=null;
}
function runConfirmedAction(){
const action=pendingAction;
closeActionConfirm();
if(action)action();
}
function setMenuOpen(open){
const menu=document.getElementById('gameMenu'),toggle=document.getElementById('menuToggle');
menu.classList.toggle('open',open);menu.setAttribute('aria-hidden',String(!open));
toggle.setAttribute('aria-expanded',String(open));
}
function setFactoryQuizOpen(open){
const panel=document.getElementById('factoryQuizPanel');
panel.classList.toggle('open',open);
panel.setAttribute('aria-hidden',String(!open));
if(!open)state.activeFactory=null;
}
function startFactoryQuiz(anchor){
if(!Number.isInteger(anchor)||!state.grid[anchor]||state.grid[anchor].id!=='factory')return;
state.selected=null;
updateToolStatus();
setMenuOpen(false);
state.activeFactory=anchor;
nextQuiz();
document.getElementById('feedback').textContent='🏭 工場でクイズに挑戦！正解すると木材 +1、コイン +1をゲット！';
setFactoryQuizOpen(true);
}
function updateToolStatus(){
const el=document.getElementById('toolStatus');
const labels={road:'道路',park:'公園',house:'家',cafe:'カフェ',tower:'ビル',factory:'工場',water_tower:'貯水塔',water_tank:'貯水槽',pumping_station:'ポンプ場',solar_plant:'太陽光発電',wind_plant:'風力発電所',large_wind_plant:'大型風力発電所',oil_plant:'石油発電所',coal_plant:'石炭発電所',nuclear_plant:'原子力発電所',fusion_plant:'核融合発電所',bulldozer:'撤去'};
el.textContent=state.selected?'選択中：'+labels[state.selected]+' ｜ マップをタップしてね':'';
el.classList.toggle('show',!!state.selected);
}
function update(){
document.getElementById('wood').textContent=state.wood;document.getElementById('coin').textContent=state.coin;document.getElementById('population').textContent=state.population;document.getElementById('solved').textContent=state.solved;document.getElementById('level').textContent=state.level;document.getElementById('roads').textContent=state.grid.filter(x=>x&&x.id==='road').length;
const police=calculatePoliceSupply();const summary=document.getElementById('policeCoverageSummary');if(summary)summary.textContent='警察：供給済み需要 '+police.servedDemand+' / '+police.totalDemand+'（供給能力 '+police.capacity+'）';
const toggle=document.getElementById('coverageToggle');if(toggle)toggle.textContent='🛡️ 効果範囲表示：'+(policeCoverageVisible?'ON':'OFF');
const health=calculateHealthSupply();const healthSummary=document.getElementById('healthCoverageSummary');if(healthSummary)healthSummary.textContent='医療：供給済み需要 '+health.servedDemand+' / '+health.totalDemand+'（供給能力 '+health.capacity+'）';
const healthToggle=document.getElementById('healthCoverageToggle');if(healthToggle)healthToggle.textContent='🩺 医療範囲表示：'+(healthCoverageVisible?'ON':'OFF');
const water=calculateWaterSupply();const waterSummary=document.getElementById('waterSupplySummary');if(waterSummary)waterSummary.textContent='水道：供給済み需要 '+water.servedDemand+' / '+water.totalDemand+'（供給能力 '+water.capacity+'）';
const power=calculatePowerSupply();const powerSummary=document.getElementById('powerSupplySummary');if(powerSummary)powerSummary.textContent='電力：供給済み需要 '+power.servedDemand+' / '+power.totalDemand+'（供給能力 '+power.capacity+'）';
renderMenu();updateToolStatus();
}
function save(show){try{localStorage.setItem(KEY,JSON.stringify({wood:state.wood,coin:state.coin,population:state.population,solved:state.solved,grid:state.grid,level:state.level}));if(show)toast('💾 セーブしたよ！')}catch(e){toast('保存できませんでした')}}
function normalizeCell(item){
if(!item)return null;
const id=typeof item==='string'?item:item.id;
if(id==='occupied')return {id:'occupied',anchor:Number(item.anchor)};
if(id==='road')return {id:'road'};
const legacyPowerIds={'wind_farm':'wind_plant','gas_plant':'oil_plant'};
const normalizedId=legacyPowerIds[id]||id;
if(!BUILDINGS.some(b=>b.id===normalizedId))return null;
const seed=item&&typeof item==='object'&&Number.isFinite(item.seed)?item.seed:Math.floor(Math.random()*2147483646)+1;
return {id:normalizedId,seed};
}
function putMigratedCell(source,row,col,roadScale){
const item=normalizeCell(source);
if(!item||item.id==='occupied'||row>=SIZE||col>=SIZE)return;
const anchor=row*SIZE+col;
if(item.id==='road'){
for(let dr=0;dr<roadScale&&row+dr<SIZE;dr++)for(let dc=0;dc<roadScale&&col+dc<SIZE;dc++)state.grid[(row+dr)*SIZE+col+dc]={id:'road'};
return;
}
state.grid[anchor]=item;
const b=BUILDINGS.find(x=>x.id===item.id);
for(let dr=0;dr<b.rows&&row+dr<SIZE;dr++)for(let dc=0;dc<b.cols&&col+dc<SIZE;dc++){
if(dr===0&&dc===0)continue;
state.grid[(row+dr)*SIZE+col+dc]={id:'occupied',anchor};
}
}
function rebuildOccupancy(){
const saved=state.grid.slice();state.grid=Array(TOTAL).fill(null);
saved.forEach((item,i)=>{
if(!item||item.id==='occupied')return;
if(item.id==='road'){state.grid[i]={id:'road'};return;}
const b=BUILDINGS.find(x=>x.id===item.id);if(!b)return;
const row=Math.floor(i/SIZE),col=i%SIZE;if(row+b.rows>SIZE||col+b.cols>SIZE)return;
const cells=[];for(let dr=0;dr<b.rows;dr++)for(let dc=0;dc<b.cols;dc++)cells.push((row+dr)*SIZE+col+dc);
if(cells.some(index=>state.grid[index]))return;
state.grid[i]=item;cells.slice(1).forEach(index=>{state.grid[index]={id:'occupied',anchor:i};});
});
}
function load(){
try{
const d=JSON.parse(localStorage.getItem(KEY)||'null');
if(!d||!Array.isArray(d.grid))return;
state.wood=Math.max(0,Number(d.wood)||0);state.coin=Math.max(0,Number(d.coin)||0);
state.population=Math.max(0,Number(d.population)||0);state.solved=Math.max(0,Number(d.solved)||0);
state.level=Math.max(1,Number(d.level)||1);
if(d.grid.length===TOTAL){
state.grid=d.grid.map(normalizeCell);rebuildOccupancy();
}else if(d.grid.length===324){
state.grid=Array(TOTAL).fill(null);
d.grid.forEach((item,i)=>{if(item&&item.id!=='occupied')putMigratedCell(item,Math.floor(i/18)*2,(i%18)*2,2)});
}else if(d.grid.length===81){
state.grid=Array(TOTAL).fill(null);
d.grid.forEach((item,i)=>{if(item&&item.id!=='occupied')putMigratedCell(item,Math.floor(i/9)*4,(i%9)*4,4)});
}else if(d.grid.length===25){
state.grid=Array(TOTAL).fill(null);
d.grid.forEach((item,i)=>{if(item&&item.id!=='occupied')putMigratedCell(item,(Math.floor(i/5)+2)*4,((i%5)+2)*4,4)});
}
}catch(e){}
}
function renderMenu(){
const root=document.getElementById('buildings');root.className='building-menu-content';root.innerHTML='';
const groups=[
{name:'住宅',emoji:'🏠',ids:['house','tower']},
{name:'環境',emoji:'🌳',ids:['park']},
{name:'警察',emoji:'🚓',ids:['police_hq','police_station','koban']},
{name:'医療',emoji:'🏥',ids:['clinic','hospital','university_hospital']},
{name:'水道',emoji:'💧',ids:['water_tower','water_tank','pumping_station']},
{name:'発電',emoji:'⚡',ids:['wind_plant','coal_plant','large_wind_plant','solar_plant','oil_plant','nuclear_plant','fusion_plant']},
{name:'産業',emoji:'🏭',ids:['factory']},
{name:'道路',emoji:'🛣️',ids:['road']},
{name:'ツール',emoji:'🧰',ids:['bulldozer']}
];
const active=groups.find(group=>group.name===renderMenu.activeCategory);
function makeBuildButton(b){
const factoryCount=state.grid.filter(x=>x&&x.id==='factory').length;
const atLimit=b.id==='factory'&&factoryCount>=(b.maxCount||3);
const affordable=state.wood>=b.wood&&state.coin>=b.coin&&!atLimit;
const btn=document.createElement('button');
btn.className='build'+(state.selected===b.id?' selected':'')+(b.id==='road'?' road-tool':'');
btn.disabled=(!affordable&&state.selected!==b.id)||(atLimit&&state.selected!==b.id);
const detail=b.serviceDemand?'<small>需要 '+b.serviceDemand+'</small>':(b.policeCapacity?'<small>警察供給 '+b.policeCapacity+'</small>':(b.healthCapacity?'<small>医療供給 '+b.healthCapacity+'</small>':(b.waterCapacity?'<small>水道供給 '+b.waterCapacity+'</small>':(b.powerCapacity?'<small>電力供給 '+b.powerCapacity+'</small>':'<small>'+(b.id==='factory'?'設置 '+factoryCount+'/'+b.maxCount:'人口 +'+b.pop)+'</small>'))));
btn.innerHTML='<span class="emoji">'+b.emoji+'</span><strong>'+b.name+'</strong>'+(b.id==='factory'?'<small>無料</small>':'<small>🪵'+b.wood+'　🪙'+b.coin+'</small>')+(b.coverage?'<small>'+(b.coverageType==='health'?'🩺':'🛡️')+' 半径 '+b.coverage+'</small>':'')+(b.id==='road'?'<small>道路 1×1</small>':detail+'<small>敷地 '+b.cols+'×'+b.rows+'</small>');
btn.addEventListener('click',()=>{
state.selected=state.selected===b.id?null:b.id;
document.getElementById('guide').textContent=state.selected?(b.id==='road'?'道路ツール：小さな1マスずつ道路を敷こう！':'建物ツール：'+b.cols+'×'+b.rows+'マスの空き地を選んでね。道路への接続も必要だよ。'):'ツールを選んでマップをタップしよう。';
renderMenu.activeCategory=null;
renderMenu();updateToolStatus();setMenuOpen(false);
});
return btn;
}
if(!active){
const title=document.createElement('div');title.className='category-view-heading';title.textContent='建てたいもののカテゴリを選んでね';root.appendChild(title);
const picker=document.createElement('div');picker.className='category-picker';
groups.forEach(group=>{
const tile=document.createElement('button');tile.type='button';tile.className='category-picker-item';
tile.innerHTML='<span class="category-picker-icon">'+group.emoji+'</span><strong>'+group.name+'</strong><small>'+group.ids.length+'種類</small>';
tile.addEventListener('click',()=>{renderMenu.activeCategory=group.name;renderMenu();});
picker.appendChild(tile);
});
root.appendChild(picker);
}else{
const top=document.createElement('div');top.className='category-detail-top';
const back=document.createElement('button');back.type='button';back.className='category-back';back.textContent='‹ カテゴリ一覧';
back.addEventListener('click',()=>{renderMenu.activeCategory=null;renderMenu();});
const heading=document.createElement('div');heading.className='category-detail-heading';heading.innerHTML='<span>'+active.emoji+'</span><strong>'+active.name+'</strong><small>'+active.ids.length+'種類</small>';
top.append(back,heading);root.appendChild(top);
if(active.name==='ツール'){
const grid=document.createElement('div');grid.className='buildings category-buildings';
const erase=document.createElement('button');erase.className='build erase-tool'+(state.selected==='bulldozer'?' selected':'');
erase.innerHTML='<span class="emoji">🚜</span><strong>撤去</strong><small>費用なし</small><small>道路・建物を撤去</small>';
erase.addEventListener('click',()=>{
state.selected=state.selected==='bulldozer'?null:'bulldozer';
document.getElementById('guide').textContent=state.selected?'撤去ツール：マスをタップして道路や建物を取り除こう。':'ツールを選んでマップをタップしよう。';
renderMenu.activeCategory=null;renderMenu();updateToolStatus();setMenuOpen(false);
});
grid.appendChild(erase);root.appendChild(grid);
}else{
const grid=document.createElement('div');grid.className='buildings category-buildings';
groupItems(active).forEach(b=>grid.appendChild(makeBuildButton(b)));
root.appendChild(grid);
}
}
function groupItems(group){return group.ids.map(id=>id==='road'?ROAD:BUILDINGS.find(b=>b.id===id)).filter(Boolean)}
const systemInfoByCategory={'警察':'policeSystemInfo','医療':'healthSystemInfo','水道':'waterSystemInfo','発電':'powerSystemInfo'};
const visibleSystemInfo=systemInfoByCategory[renderMenu.activeCategory]||'';
document.querySelectorAll('.system-info-item').forEach(panel=>{panel.hidden=panel.id!==visibleSystemInfo;});
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
const w=range(.96,1.25)*.8,d=range(.9,1.22)*.8,h=range(.72,1.08);
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
if(id==='factory'){
const w=range(.88,1.02),d=range(.88,1.02),h=range(.72,.9),wall=pick([0x9aa8b5,0xb5b8ad,0x8d9ca5,0xc2b9a7]),trim=pick([0x586b78,0x687d88,0x8b6548]);
box(w,h,d,wall,.08+h/2);box(w+.08,.12,d+.08,trim,.08+h+.06);
box(w*.72,.28,.045,0x8bd0e8,.08+h*.58,0,d/2+.025);
box(w*.22,.38,.06,0x536575,.08+.19,0,d/2+.04);
const chimney=add(new THREE.Mesh(new THREE.BoxGeometry(.19,.58,.19),mat(0x7b8790)),w*.27,.08+h+.35,-d*.2);box(.25,.07,.25,0x59636c,.08+h+.67,w*.27,-d*.2);
box(w*.78,.09,d*.72,0xd5d9d8,.08+h+.12);
}
if(id==='police_hq'){
const w=1.62,d=1.62,h=1.02;box(w,h,d,0xe7edf4,.08+h/2);box(w+.08,.12,d+.08,0x315b83,.08+h+.06);box(w*.72,.38,.05,0x79c8e8,.08+h*.58,0,d/2+.03);box(w*.24,.48,.06,0x315b83,.08+.24,0,d/2+.04);box(w*.86,.08,d*.82,0xffffff,.08+h+.15);box(.36,.18,.08,0xf3d56a,.08+h+.26,0,d/2+.05);
}
if(id==='police_station'){
const w=1.02,d=1.02,h=.78;box(w,h,d,0xe5edf2,.08+h/2);box(w+.07,.11,d+.07,0x315b83,.08+h+.05);box(w*.68,.25,.045,0x7fc8e5,.08+h*.58,0,d/2+.025);box(w*.2,.36,.05,0x315b83,.08+.18,0,d/2+.04);box(w*.76,.07,d*.7,0xffffff,.08+h+.14);
}
if(id==='koban'){
const w=.46,d=.46,h=.62;box(w,h,d,0xf1f4f6,.08+h/2);box(w+.04,.09,d+.04,0x315b83,.08+h+.045);box(w*.72,.18,.035,0x74c7e6,.08+h*.55,0,d/2+.02);box(w*.2,.28,.04,0x315b83,.08+.14,0,d/2+.03);box(w*.84,.05,d*.8,0xffffff,.08+h+.12);
}
if(id==='clinic'){
const w=.9,d=.9,h=.66;box(w,h,d,0xf2f6f7,.08+h/2);box(w+.07,.10,d+.07,0x5cabbc,.08+h+.05);box(w*.68,.25,.04,0x8ed8e6,.08+h*.58,0,d/2+.025);box(w*.18,.32,.05,0x5cabbc,.08+.16,0,d/2+.04);box(.32,.09,.035,0xd94b55,.08+h+.12,0,d/2+.06);box(.09,.32,.035,0xd94b55,.08+h+.12,0,d/2+.06);
}
if(id==='hospital'){
const w=1.42,d=1.42,h=.9;box(w,h,d,0xf0f4f7,.08+h/2);box(w+.09,.12,d+.09,0x477eaa,.08+h+.06);box(w*.72,.3,.045,0x83c8e7,.08+h*.58,0,d/2+.025);box(w*.19,.38,.055,0x477eaa,.08+.19,0,d/2+.04);box(.42,.1,.04,0xd94b55,.08+h+.15,0,d/2+.065);box(.1,.35,.04,0xd94b55,.08+h+.15,0,d/2+.065);box(w*.7,.08,d*.72,0xffffff,.08+h+.15);
}
if(id==='university_hospital'){
const w=1.86,d=1.86,h=1.12;box(w,h,d,0xeaf0f5,.08+h/2);box(w*.42,.48,d*.92,0xdfe8ef,.08+h+.22,-w*.29,0);box(w*.42,.48,d*.92,0xdfe8ef,.08+h+.22,w*.29,0);box(w+.1,.13,d+.1,0x365f8d,.08+h+.06);box(w*.58,.34,.05,0x83c8e7,.08+h*.62,0,d/2+.03);box(w*.16,.42,.055,0x477eaa,.08+.21,0,d/2+.04);box(.5,.11,.04,0xd94b55,.08+h+.22,0,d/2+.065);box(.11,.4,.04,0xd94b55,.08+h+.22,0,d/2+.065);box(w*.82,.08,d*.78,0xffffff,.08+h+.15);
}
if(id==='water_tower'){
const baseMat=mat(0x6d8798),tankMat=mat(0x55b8df),roofMat=mat(0x2e83ad);
box(.78,.12,.78,0x8299a5,.14);
add(new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,.82,10),baseMat),0,.62,0);
add(new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.42,12),tankMat),0,1.25,0);
add(new THREE.Mesh(new THREE.ConeGeometry(.46,.2,12),roofMat),0,1.56,0);
box(.18,.08,.18,0xe5f8ff,.99,0,0);
}
if(id==='water_tank'){
box(1.48,.12,1.48,0x8799a2,.14);
for(const x of [-.38,.38]){
add(new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.72,14),mat(0x9db5c1)),x,.62,0);
const band=add(new THREE.Mesh(new THREE.TorusGeometry(.435,.025,6,18),mat(0x497c96)),x,.62,0);band.rotation.x=Math.PI/2;
}
box(.18,.22,.18,0x3d879f,1.12,0,0);
}
if(id==='pumping_station'){
const wall=mat(0xcbd8dc),trim=mat(0x477f99);
box(1.76,.82,1.55,0xcbd8dc,.52);box(1.84,.12,1.63,0x477f99,.99);
for(const x of [-.48,0,.48]){
add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.34,10),mat(0x55b8df)),x,1.19,.05);
add(new THREE.Mesh(new THREE.TorusGeometry(.17,.035,7,14),trim),x,1.39,.05);
}
box(.52,.25,.08,0x55b8df,.48,0,.81);
box(.18,.18,.08,0xf3d46b,.5,0,.87);
}
if(id==='solar_plant'){
box(1.48,.08,1.48,0x586b72,.12);
for(let x=-.42;x<=.42;x+=.42){const panel=box(.34,.035,.9,0x1e5b88,.42,x,0);panel.rotation.z=-.18;for(let z=-.25;z<=.25;z+=.25)box(.35,.015,.025,0x7fc9ec,.445,x,z);}
box(.12,.3,.12,0x8b9ba5,.25,0,0);
}
if(id==='wind_plant'||id==='large_wind_plant'){
const large=id==='large_wind_plant',towerMat=mat(0xe6edf2),bladeMat=mat(0xffffff);
add(new THREE.Mesh(new THREE.CylinderGeometry(.08,.13,large?1.8:1.35,8),towerMat),0,large?1: .77,0);
const hub=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),mat(0xd5e0e7));hub.position.set(0,large?1.95:1.48,0);g.add(hub);
for(let n=0;n<3;n++){const blade=add(new THREE.Mesh(new THREE.BoxGeometry(.09,large?1.12:.75,.045),bladeMat),0,large?2.42:1.83,0);blade.rotation.z=n*2*Math.PI/3;}
box(.42,.08,.42,0x738b99,.15);
}
if(id==='oil_plant'){
box(1.7,.72,1.55,0x8d9ba4,.48);box(1.78,.12,1.63,0x465c69,.9);
for(let x of [-.48,0,.48]){add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,.5,10),mat(0x6f8794)),x,1.15,-.15);box(.24,.12,.24,0x536875,1.42,x,-.15);}
add(new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.62,10),mat(0x657985)),.48,1.25,.42);
box(.65,.26,.42,0x384f5c,1.1,-.35,.42);box(.48,.08,.08,0xf0c35e,1.26,-.35,.65);
}
if(id==='coal_plant'){
box(1.72,.78,1.55,0x87949c,.48);box(1.8,.13,1.63,0x505f69,.92);
for(let x of [-.48,0,.48]){add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.17,.72,9),mat(0x778791)),x,1.35,-.4);box(.28,.07,.28,0x4d5b65,1.72,x,-.4);}
box(.55,.36,.45,0x6c7e88,1.2,.42,.38);box(.45,.08,.08,0xf0c35e,1.4,.42,.62);
}
if(id==='nuclear_plant'){
box(1.82,.18,1.82,0x8798a2,.16);
const dome=add(new THREE.Mesh(new THREE.SphereGeometry(.62,16,10,0,Math.PI*2,0,Math.PI/2),mat(0xdce6ed)),0,.28,0);dome.scale.y=.8;
box(.78,.56,.6,0x8a9da8,.5,.55,-.38);box(.6,.08,.08,0x6a7f8b,.8,.55,-.38);
box(.32,.18,.12,0xd94b55,.82,0,.66);box(.08,.36,.12,0xd94b55,.82,0,.66);
}
if(id==='fusion_plant'){
box(1.82,.18,1.82,0x536f88,.16);
const core=add(new THREE.Mesh(new THREE.TorusGeometry(.5,.2,12,24),mat(0x62d9ef)),0,.72,0);core.rotation.x=Math.PI/2;
add(new THREE.Mesh(new THREE.SphereGeometry(.28,14,10),mat(0x8ff3ff)),0,.72,0);
for(let n=0;n<3;n++){const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.72,.035,8,24),mat(0x83c9f5)),0,.72,0);ring.rotation.set(n*Math.PI/3,.3,0);}
box(.7,.5,.62,0x7894aa,.48,.55,-.4);box(.55,.08,.08,0x3d5d76,.76,.55,-.4);
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
const spec=BUILDINGS.find(b=>b.id===id),base={park:[1.58,1.58],house:[1.37,1.34],cafe:[1.56,1.45],tower:[1.14,1.14],factory:[1.1,1.1],police_hq:[1.7,1.7],police_station:[1.1,1.1],koban:[.52,.52],clinic:[.9,.9],hospital:[1.42,1.42],university_hospital:[1.86,1.86],water_tower:[.96,.96],water_tank:[1.48,1.48],pumping_station:[1.84,1.63],solar_plant:[1.48,1.48],wind_plant:[.75,.75],large_wind_plant:[.75,.75],oil_plant:[1.7,1.55],coal_plant:[1.72,1.55],nuclear_plant:[1.82,1.82],fusion_plant:[1.82,1.82]}[id];
g.scale.set(spec.cols*CELL_SPACING*.9/base[0],1,spec.rows*CELL_SPACING*.9/base[1]);
return g;
}
function isRoad(i){return !!state.grid[i]&&state.grid[i].id==='road'}
function makeRoad(i){
const row=Math.floor(i/SIZE),col=i%SIZE,g=new THREE.Group();
// 道路の舗装面をマス目タイルの表示面と同じ寸法にする。
const roadSize=CELL_SPACING;
const asphalt=new THREE.Mesh(new THREE.BoxGeometry(roadSize,.14,roadSize),new THREE.MeshStandardMaterial({color:0x58616b,roughness:.95}));
asphalt.position.y=.08;asphalt.receiveShadow=true;asphalt.castShadow=true;g.add(asphalt);
const directions={left:col>0&&isRoad(i-1),right:col<SIZE-1&&isRoad(i+1),up:row>0&&isRoad(i-SIZE),down:row<SIZE-1&&isRoad(i+SIZE)};
const horizontal=directions.left||directions.right||(!directions.up&&!directions.down);
const vertical=directions.up||directions.down;
const paint=new THREE.MeshStandardMaterial({color:0xffdf83,roughness:.8});
function dash(alongX){
const markLength=roadSize*.42,markWidth=roadSize*.055;
const mark=new THREE.Mesh(new THREE.BoxGeometry(alongX?markLength:markWidth,.012,alongX?markWidth:markLength),paint);
mark.position.set(0,.158,0);g.add(mark);
}
if(horizontal)dash(true);
if(vertical)dash(false);
return g;
}
function calculatePoliceCoverage(){
const ranks=Array(TOTAL).fill(0);
state.grid.forEach((item,anchor)=>{
if(!item||item.id==='occupied')return;
const police=BUILDINGS.find(b=>b.id===item.id&&b.coverage&&b.coverageType==='police');
if(!police)return;
const row=Math.floor(anchor/SIZE),col=anchor%SIZE;
const centerRow=row+(police.rows-1)/2,centerCol=col+(police.cols-1)/2;
const reach=Math.ceil(police.coverage);
for(let r=Math.max(0,Math.floor(centerRow-reach));r<=Math.min(SIZE-1,Math.ceil(centerRow+reach));r++){
for(let c=Math.max(0,Math.floor(centerCol-reach));c<=Math.min(SIZE-1,Math.ceil(centerCol+reach));c++){
if(Math.hypot(r-centerRow,c-centerCol)<=police.coverage){const index=r*SIZE+c;ranks[index]=Math.max(ranks[index],police.coverageRank);}
}
}
});
return ranks;
}
function calculateHealthCoverage(){
const ranks=Array(TOTAL).fill(0);
state.grid.forEach((item,anchor)=>{
if(!item||item.id==='occupied')return;
const facility=BUILDINGS.find(b=>b.id===item.id&&b.coverage&&b.coverageType==='health');
if(!facility)return;
const row=Math.floor(anchor/SIZE),col=anchor%SIZE;
const centerRow=row+(facility.rows-1)/2,centerCol=col+(facility.cols-1)/2;
const reach=Math.ceil(facility.coverage);
for(let r=Math.max(0,Math.floor(centerRow-reach));r<=Math.min(SIZE-1,Math.ceil(centerRow+reach));r++){
for(let c=Math.max(0,Math.floor(centerCol-reach));c<=Math.min(SIZE-1,Math.ceil(centerCol+reach));c++){
if(Math.hypot(r-centerRow,c-centerCol)<=facility.coverage){const index=r*SIZE+c;ranks[index]=Math.max(ranks[index],facility.coverageRank);}
}
}
});
return ranks;
}
function calculateDemandSupply(capacityKey,coverageType){
const facilities=[],homes=[];
state.grid.forEach((item,anchor)=>{
if(!item||item.id==='occupied')return;
const building=BUILDINGS.find(b=>b.id===item.id);if(!building)return;
const row=Math.floor(anchor/SIZE),col=anchor%SIZE,centerRow=row+(building.rows-1)/2,centerCol=col+(building.cols-1)/2;
if(building[capacityKey])facilities.push({row:centerRow,col:centerCol,capacity:building[capacityKey],coverage:building.coverage||null,coverageType:building.coverageType||null,remaining:building[capacityKey]});
if(building.serviceDemand)homes.push({anchor,row:centerRow,col:centerCol,demand:building.serviceDemand});
});
const capacity=facilities.reduce((sum,facility)=>sum+facility.capacity,0);
const totalDemand=homes.reduce((sum,home)=>sum+home.demand,0);
const orderedHomes=homes.map(home=>{
const candidates=facilities.map((facility,index)=>({index,distance:Math.hypot(home.row-facility.row,home.col-facility.col),facility}))
.filter(candidate=>!coverageType||(candidate.facility.coverageType===coverageType&&candidate.distance<=candidate.facility.coverage))
.sort((a,b)=>a.distance-b.distance||a.index-b.index);
return {...home,candidates,nearestDistance:candidates.length?candidates[0].distance:Infinity};
}).sort((a,b)=>a.nearestDistance-b.nearestDistance||a.anchor-b.anchor);
const servedAnchors=new Set();let servedDemand=0;
orderedHomes.forEach(home=>{
for(const candidate of home.candidates){
const facility=facilities[candidate.index];
if(facility.remaining>=home.demand){
facility.remaining-=home.demand;servedAnchors.add(home.anchor);servedDemand+=home.demand;break;
}
}
});
return {servedDemand,totalDemand,capacity,servedAnchors,servedHomes:servedAnchors.size,totalHomes:homes.length};
}
function calculateWaterSupply(){return calculateDemandSupply('waterCapacity',null)}
function calculatePowerSupply(){return calculateDemandSupply('powerCapacity',null)}
function calculatePoliceSupply(){return calculateDemandSupply('policeCapacity','police')}
function calculateHealthSupply(){return calculateDemandSupply('healthCapacity','health')}
function refreshPowerIndicators(){
if(!scene)return;if(powerIndicatorsGroup){scene.remove(powerIndicatorsGroup);powerIndicatorsGroup=null;}const supply=calculatePowerSupply();powerIndicatorsGroup=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:0xffd447});const sphere=new THREE.SphereGeometry(.075,10,8),cone=new THREE.ConeGeometry(.07,.14,8);supply.servedAnchors.forEach(anchor=>{const tile=tiles[anchor];if(!tile)return;const marker=new THREE.Group();const top=new THREE.Mesh(cone,mat);top.position.y=.1;marker.add(top);const dot=new THREE.Mesh(sphere,mat);dot.position.y=.02;marker.add(dot);marker.position.set(tile.position.x+.18,1.85,tile.position.z+.18);powerIndicatorsGroup.add(marker);});scene.add(powerIndicatorsGroup);
}
function refreshWaterIndicators(){
if(!scene)return;
if(waterIndicatorsGroup){scene.remove(waterIndicatorsGroup);waterIndicatorsGroup=null;}
const supply=calculateWaterSupply();
waterIndicatorsGroup=new THREE.Group();
const waterMat=new THREE.MeshBasicMaterial({color:0x168fce});
const dropBall=new THREE.SphereGeometry(.075,10,8),dropTip=new THREE.ConeGeometry(.07,.14,10);
supply.servedAnchors.forEach(anchor=>{
const tile=tiles[anchor];if(!tile)return;
const marker=new THREE.Group();
const ball=new THREE.Mesh(dropBall,waterMat);ball.position.y=.02;marker.add(ball);
const tip=new THREE.Mesh(dropTip,waterMat);tip.position.y=.105;marker.add(tip);
const row=Math.floor(anchor/SIZE),col=anchor%SIZE;
const offset=(2-1)*CELL_SPACING/2;
marker.position.set(tile.position.x+offset+.18,1.9,tile.position.z+offset+.18);
marker.renderOrder=5;waterIndicatorsGroup.add(marker);
});
scene.add(waterIndicatorsGroup);
}
function refreshPoliceCoverage(){
if(!scene||!tiles.length)return;
if(policeCoverageGroup){scene.remove(policeCoverageGroup);policeCoverageGroup=null;}
policeCoverageRanks=calculatePoliceCoverage();
if(!policeCoverageVisible)return;
policeCoverageGroup=new THREE.Group();
const materials={
1:new THREE.MeshBasicMaterial({color:0x5da9e8,transparent:true,opacity:.28,depthWrite:false}),
2:new THREE.MeshBasicMaterial({color:0x43b58b,transparent:true,opacity:.28,depthWrite:false}),
3:new THREE.MeshBasicMaterial({color:0xe6ad45,transparent:true,opacity:.30,depthWrite:false})
};
const planeGeometry=new THREE.PlaneGeometry(CELL_SIZE*.96,CELL_SIZE*.96);
policeCoverageRanks.forEach((rank,i)=>{
if(!rank)return;
const tile=tiles[i],overlay=new THREE.Mesh(planeGeometry,materials[rank]);
overlay.rotation.x=-Math.PI/2;overlay.position.set(tile.position.x,.073,tile.position.z);overlay.renderOrder=2;policeCoverageGroup.add(overlay);
});
scene.add(policeCoverageGroup);
}
function refreshHealthCoverage(){
if(!scene||!tiles.length)return;
if(healthCoverageGroup){scene.remove(healthCoverageGroup);healthCoverageGroup=null;}
healthCoverageRanks=calculateHealthCoverage();
if(!healthCoverageVisible)return;
healthCoverageGroup=new THREE.Group();
const materials={
1:new THREE.MeshBasicMaterial({color:0x55c4d2,transparent:true,opacity:.30,depthWrite:false}),
2:new THREE.MeshBasicMaterial({color:0x4c91d8,transparent:true,opacity:.30,depthWrite:false}),
3:new THREE.MeshBasicMaterial({color:0x9876d4,transparent:true,opacity:.32,depthWrite:false})
};
const planeGeometry=new THREE.PlaneGeometry(CELL_SIZE*.96,CELL_SIZE*.96);
healthCoverageRanks.forEach((rank,i)=>{
if(!rank)return;
const tile=tiles[i],overlay=new THREE.Mesh(planeGeometry,materials[rank]);
overlay.rotation.x=-Math.PI/2;overlay.position.set(tile.position.x,.078,tile.position.z);overlay.renderOrder=3;healthCoverageGroup.add(overlay);
});
scene.add(healthCoverageGroup);
}
function sync(){
for(let i=0;i<TOTAL;i++){
const item=state.grid[i];
if(meshes[i]&&(!item||item.id==='occupied'||item.id==='road')){scene.remove(meshes[i]);meshes[i]=null;}
}
state.grid.forEach((item,i)=>{
if(!item||item.id==='occupied'||meshes[i])return;
const id=item.id,p=tiles[i].position;
const m=id==='road'?makeRoad(i):makeBuilding(id,item.seed||i+1);
const spec=BUILDINGS.find(b=>b.id===id);const offset=id==='road'?0:(spec.cols-1)*CELL_SPACING/2;
m.position.set(p.x+offset,.08,p.z+offset);
const target=id==='road'?1:1.3;
m.userData.targetScale=target;
m.userData.cellIndex=i;
m.userData.buildingId=id;
// 道路は最初から1マス分の実寸で表示し、出現アニメーションで縮んで見える状態を避ける。
if(id==='road')m.scale.set(1,1,1);else m.scale.set(.02,.02,.02);
scene.add(m);meshes[i]=m;
});
refreshPoliceCoverage();
refreshHealthCoverage();
refreshWaterIndicators();
refreshPowerIndicators();
}
function init3D(){
const el=document.getElementById('world'),w=el.clientWidth,h=el.clientHeight;scene=new THREE.Scene();scene.fog=new THREE.Fog(0xcceeff,28,55);camera=new THREE.PerspectiveCamera(44,w/h,.1,120);camera.position.set(12,14,15);
renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;el.appendChild(renderer.domElement);
controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.08;controls.minDistance=6;controls.maxDistance=38;
scene.add(new THREE.HemisphereLight(0xffffff,0x8bbd82,1.05));const sun=new THREE.DirectionalLight(0xfff2d6,.9);sun.position.set(8,16,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const ground=new THREE.Mesh(new THREE.BoxGeometry(20.5,.5,20.5),new THREE.MeshStandardMaterial({color:0x789581}));ground.position.y=-.34;ground.receiveShadow=true;scene.add(ground);
const offset=(SIZE-1)*CELL_SPACING/2;
for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const i=r*SIZE+c;const tile=new THREE.Mesh(new THREE.BoxGeometry(CELL_SIZE,.12,CELL_SIZE),new THREE.MeshStandardMaterial({color:0xb8c4b5,roughness:.95}));tile.position.set(c*CELL_SPACING-offset,0,r*CELL_SPACING-offset);tile.userData.index=i;tile.receiveShadow=true;scene.add(tile);tiles.push(tile)}
raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;const rect=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-rect.left)/rect.width*2-1;mouse.y=-((e.clientY-rect.top)/rect.height*2-1);raycaster.setFromCamera(mouse,camera);const buildingHits=raycaster.intersectObjects(meshes.filter(Boolean),true);if(state.selected!=='bulldozer'&&buildingHits.length){let root=buildingHits[0].object;while(root&&root!==scene&&!Number.isInteger(root.userData.cellIndex))root=root.parent;if(root&&root!==scene&&root.userData.buildingId==='factory'){state.selected=null;updateToolStatus();startFactoryQuiz(root.userData.cellIndex);return;}}const hit=raycaster.intersectObjects(tiles)[0];if(hit){const index=hit.object.userData.index;if(state.selected!=='bulldozer'){const anchor=resolveAnchor(index);if(anchor>=0&&state.grid[anchor]&&state.grid[anchor].id==='factory'){state.selected=null;updateToolStatus();startFactoryQuiz(anchor);return;}}place(index)}});
window.addEventListener('resize',()=>{const ww=el.clientWidth,hh=el.clientHeight;camera.aspect=ww/hh;camera.updateProjectionMatrix();renderer.setSize(ww,hh)});
sync();(function animate(){requestAnimationFrame(animate);meshes.forEach(m=>{if(m&&m.scale.x<(m.userData.targetScale||1)-.005){const target=m.userData.targetScale||1;m.scale.x+=(target-m.scale.x)*.14;m.scale.y+=(1-m.scale.y)*.14;m.scale.z+=(target-m.scale.z)*.14}});controls.update();renderer.render(scene,camera)})();
}
function hasAdjacentRoad(i,b){
const row=Math.floor(i/SIZE),col=i%SIZE;
if(row+b.rows>SIZE||col+b.cols>SIZE)return false;
for(let c=col;c<col+b.cols;c++){
if(row>0&&isRoad((row-1)*SIZE+c))return true;
if(row+b.rows<SIZE&&isRoad((row+b.rows)*SIZE+c))return true;
}
for(let r=row;r<row+b.rows;r++){
if(col>0&&isRoad(r*SIZE+col-1))return true;
if(col+b.cols<SIZE&&isRoad(r*SIZE+col+b.cols))return true;
}
return false;
}
function resolveAnchor(i){
const item=state.grid[i];
if(item&&item.id==='occupied')return Number.isInteger(item.anchor)?item.anchor:-1;
return item?i:-1;
}
function clearBuilding(anchor){
for(let index=0;index<TOTAL;index++){
const item=state.grid[index];
if(index===anchor||(item&&item.id==='occupied'&&item.anchor===anchor))state.grid[index]=null;
}
}
function place(i){
if(!state.selected){toast('まずツールを選んでね！');return;}
if(state.selected==='bulldozer'){
const anchor=resolveAnchor(i);
if(anchor<0){toast('ここには撤去するものがないよ');return;}
const item=state.grid[anchor];
if(item.id==='road'){
const refundWood=Math.floor((ROAD.wood||0)/2),refundCoin=Math.floor((ROAD.coin||0)/2);
showActionConfirm('道路を撤去しますか？','この道路を撤去してもいい？','返金：木材 +'+refundWood+' ／ コイン +'+refundCoin,'撤去する',()=>demolishAt(anchor));
}else{
const b=BUILDINGS.find(x=>x.id===item.id);
if(!b){toast('この場所は撤去できないよ');return;}
const refundWood=Math.floor((b.wood||0)/2),refundCoin=Math.floor((b.coin||0)/2);
showActionConfirm(b.name+'を撤去しますか？','この建物を撤去してもいい？','返金：木材 +'+refundWood+' ／ コイン +'+refundCoin,'撤去する',()=>demolishAt(anchor));
}
return;
}
if(state.grid[i]){toast('そこにはもう何かあるよ！');return;}
if(state.selected==='road'){
if(state.coin<ROAD.coin){toast('コインが足りないよ！英語クイズに挑戦しよう');return;}
showActionConfirm('道路を敷きますか？','このマスに道路を建設してもいい？','費用：コイン '+ROAD.coin,'建設する',()=>buildRoadAt(i));
return;
}
const b=BUILDINGS.find(x=>x.id===state.selected);if(!b)return;
if(b.id==='factory'&&state.grid.filter(x=>x&&x.id==='factory').length>=(b.maxCount||3)){toast('工場は最大3個までだよ！');return;}
const row=Math.floor(i/SIZE),col=i%SIZE;
if(row+b.rows>SIZE||col+b.cols>SIZE){toast('建物の'+b.cols+'×'+b.rows+'マスがマップ内に収まる場所を選んでね');return;}
const footprint=[];
for(let dr=0;dr<b.rows;dr++)for(let dc=0;dc<b.cols;dc++)footprint.push((row+dr)*SIZE+col+dc);
if(footprint.some(index=>state.grid[index])){toast('建物は'+b.cols+'×'+b.rows+'マス必要だよ。空いている場所を選んでね！');return;}
if(!hasAdjacentRoad(i,b)){toast('建物の'+b.cols+'×'+b.rows+'マスの外周に道路をつなげよう！');return;}
if(state.wood<b.wood||state.coin<b.coin){toast('資源が足りないよ！クイズに挑戦しよう');return;}
const cost=b.id==='factory'?'費用：無料':'費用：木材 '+b.wood+' ／ コイン '+b.coin;
showActionConfirm(b.name+'を建設しますか？','この場所に'+b.name+'を建ててもいい？',cost+'　｜　敷地 '+b.cols+'×'+b.rows,'建設する',()=>buildBuildingAt(i,b));
}
function buildRoadAt(i){
if(state.grid[i]){toast('そこにはもう何かあるよ！');return;}
if(state.coin<ROAD.coin){toast('コインが足りないよ！英語クイズに挑戦しよう');return;}
state.coin-=ROAD.coin;state.grid[i]={id:'road'};
toast('🛣️ 道路を敷いたよ！');
sync();update();save(false);
}
function buildBuildingAt(i,b){
if(state.grid[i]){toast('そこにはもう何かあるよ！');return;}
if(state.selected!==b.id){toast('建築ツールを選び直してね');return;}
if(b.id==='factory'&&state.grid.filter(x=>x&&x.id==='factory').length>=(b.maxCount||3)){toast('工場は最大3個までだよ！');return;}
const row=Math.floor(i/SIZE),col=i%SIZE;
if(row+b.rows>SIZE||col+b.cols>SIZE){toast('建物の'+b.cols+'×'+b.rows+'マスがマップ内に収まらないよ');return;}
const footprint=[];
for(let dr=0;dr<b.rows;dr++)for(let dc=0;dc<b.cols;dc++)footprint.push((row+dr)*SIZE+col+dc);
if(footprint.some(index=>state.grid[index])){toast('その場所はもう使われているよ');return;}
if(!hasAdjacentRoad(i,b)){toast('建物の外周に道路をつなげてね');return;}
if(state.wood<b.wood||state.coin<b.coin){toast('資源が足りなくなったよ');return;}
state.wood-=b.wood;state.coin-=b.coin;state.population+=b.pop;
const seed=Math.floor(Math.random()*2147483646)+1;
state.grid[i]={id:b.id,seed};
footprint.slice(1).forEach(index=>{state.grid[index]={id:'occupied',anchor:i};});
const lv=Math.floor(state.population/15)+1;
if(lv>state.level){state.level=lv;toast('🎉 街がレベル '+lv+' にアップ！');}
else toast(b.name+'を'+b.cols+'×'+b.rows+'マスで建てたよ！');
sync();update();save(false);
}
function demolishAt(anchor){
if(!Number.isInteger(anchor)||!state.grid[anchor]||state.grid[anchor].id==='occupied'){toast('撤去する建物が見つからないよ');return;}
const item=state.grid[anchor];
if(item.id==='road'){
const refundCoin=Math.floor((ROAD.coin||0)/2),refundWood=Math.floor((ROAD.wood||0)/2);
state.coin+=refundCoin;state.wood+=refundWood;state.grid[anchor]=null;
toast('道路を撤去！ 木材 +'+refundWood+'、コイン +'+refundCoin+'（半額返金）');
}else{
const b=BUILDINGS.find(x=>x.id===item.id);
if(!b){toast('この建物は撤去できないよ');return;}
if(state.activeFactory===anchor)state.activeFactory=null;
state.population=Math.max(0,state.population-b.pop);
const refundWood=Math.floor((b.wood||0)/2),refundCoin=Math.floor((b.coin||0)/2);
state.wood+=refundWood;state.coin+=refundCoin;
clearBuilding(anchor);toast('建物を撤去！ 木材 +'+refundWood+'、コイン +'+refundCoin+'（半額返金）');
}
state.level=Math.max(1,Math.floor(state.population/15)+1);
sync();update();save(false);
}
function nextQuiz(){state.answered=false;state.current=QUIZ[Math.floor(Math.random()*QUIZ.length)];document.getElementById('question').textContent=state.current[0];document.getElementById('feedback').textContent='正しい意味を選んでね！';document.getElementById('next').disabled=true;const root=document.getElementById('answers');root.innerHTML='';state.current[2].slice().sort(()=>Math.random()-.5).forEach(opt=>{const b=document.createElement('button');b.className='answer';b.textContent=opt;b.addEventListener('click',()=>answer(opt,b));root.appendChild(b)})}
function answer(opt,btn){if(state.answered||!Number.isInteger(state.activeFactory)||!state.grid[state.activeFactory]||state.grid[state.activeFactory].id!=='factory')return;state.answered=true;const ok=opt===state.current[1];document.querySelectorAll('.answer').forEach(b=>{b.disabled=true;if(b.textContent===state.current[1])b.classList.add('correct')});if(ok){state.solved++;const atFactory=Number.isInteger(state.activeFactory)&&state.grid[state.activeFactory]&&state.grid[state.activeFactory].id==='factory';if(atFactory){state.wood++;state.coin++;document.getElementById('feedback').textContent='🎉 工場で正解！ '+state.current[0]+' = '+state.current[1]+'　木材 +1、コイン +1をゲット！';}else{document.getElementById('feedback').textContent='正解！報酬を受け取るには、街の工場をタップしてクイズに挑戦しよう。';}}else{btn.classList.add('wrong');document.getElementById('feedback').textContent='おしい！ 正解は「'+state.current[1]+'」だよ。次も挑戦しよう！'}document.getElementById('next').disabled=false;update();save(false)}
document.getElementById('speak').addEventListener('click',()=>{if(!state.current)return;if(!('speechSynthesis'in window)){toast('このブラウザでは発音機能を使えません');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(state.current[0]);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)});
document.getElementById('next').addEventListener('click',nextQuiz);document.getElementById('save').addEventListener('click',()=>save(true));
document.getElementById('menuToggle').addEventListener('click',()=>setMenuOpen(!document.getElementById('gameMenu').classList.contains('open')));
document.getElementById('closeMenu').addEventListener('click',()=>setMenuOpen(false));
document.getElementById('coverageToggle').addEventListener('click',()=>{policeCoverageVisible=!policeCoverageVisible;refreshPoliceCoverage();update();});
document.getElementById('healthCoverageToggle').addEventListener('click',()=>{healthCoverageVisible=!healthCoverageVisible;refreshHealthCoverage();update();});

document.getElementById('cancelAction').addEventListener('click',closeActionConfirm);
document.getElementById('confirmAction').addEventListener('click',runConfirmedAction);
document.getElementById('actionConfirm').addEventListener('click',e=>{if(e.target.id==='actionConfirm')closeActionConfirm()});
document.getElementById('closeFactoryQuiz').addEventListener('click',()=>setFactoryQuizOpen(false));
document.getElementById('factoryQuizPanel').addEventListener('click',e=>{if(e.target.id==='factoryQuizPanel')setFactoryQuizOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeActionConfirm();setMenuOpen(false);setFactoryQuizOpen(false)}});
document.getElementById('reset').addEventListener('click',()=>{if(!confirm('街とセーブデータを最初からにする？'))return;localStorage.removeItem(KEY);state.wood=4;state.coin=3;state.population=0;state.solved=0;state.level=1;state.grid=Array(TOTAL).fill(null);state.selected=null;state.activeFactory=null;setFactoryQuizOpen(false);meshes.forEach(m=>{if(m)scene.remove(m)});meshes=Array(TOTAL).fill(null);sync();update();save(false);toast('新しい街をスタート！')});
load();update();init3D();save(false);
})();
