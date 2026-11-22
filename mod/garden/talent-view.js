function gardenTalentView(container,player,selected,onSelect,onBuy){
  const {projects,byId,levels}=gardenTalents;
  const element=(tag,css,text)=>{const e=document.createElement(tag);if(css)e.className=css;if(text!==undefined)e.textContent=text;return e;};
  const pct=(p,rank)=>(p.step>0?'+':'')+Number((p.step*rank).toFixed(2))+p.unit;
  const art=(branch)=>{
    const c=element('canvas');c.width=c.height=72;c.setAttribute('aria-hidden','true');
    const g=c.getContext('2d');g.scale(2,2);
    const colors={'育种':['#315e53','#bdcb8b'],'生长':['#42714c','#a9c493'],'火力':['#76572c','#efc575'],'联合研究':['#375f65','#c4d9b5']}[branch];
    const grad=g.createLinearGradient(4,0,32,36);grad.addColorStop(0,colors[0]);grad.addColorStop(1,'#203e37');
    g.beginPath();g.arc(18,18,17,0,2*Math.PI);g.fillStyle=grad;g.fill();
    g.strokeStyle=colors[1];g.fillStyle=colors[1];g.lineWidth=1.3;g.lineCap='round';
    function leaf(x,y,ex,ey,bend){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+bend,y-9,ex,ey);g.quadraticCurveTo(ex+bend,ey+6,x,y);g.fill();}
    if(branch==='火力'){
      g.beginPath();g.arc(18,18,8,0,2*Math.PI);g.stroke();for(let i=0;i<4;i++){g.save();g.translate(18,18);g.rotate(i*Math.PI/2);g.beginPath();g.moveTo(0,-12);g.lineTo(0,-5);g.stroke();g.restore();}
      g.beginPath();g.arc(18,18,2.4,0,2*Math.PI);g.fill();
    }else{
      g.beginPath();g.moveTo(18,29);g.quadraticCurveTo(19,19,17,9);g.stroke();
      leaf(18,20,9,11,-4);leaf(18,16,26,8,2);
      if(branch==='生长'){for(const x of [10,15,22,26]){g.beginPath();g.moveTo(18,23);g.quadraticCurveTo(x,25,x,29);g.stroke();}}
      if(branch==='联合研究'){leaf(18,25,28,17,3);leaf(18,26,8,19,-4);}
    }
    return c;
  };
  const layout=element('div','talent-layout'),tree=element('section','talent-tree'),detail=element('section','talent-detail');
  tree.setAttribute('aria-label','天赋研究路线');detail.setAttribute('aria-live','polite');
  const branches=element('div','talent-branches');tree.append(branches);
  const node=p=>{
    const q=gardenTalents.quote(p.id,player),b=element('button','talent-node');b.type='button';b.dataset.talent=p.id;
    b.dataset.learned=String(q.rank>0);b.dataset.locked=String(q.missing.length>0);b.setAttribute('aria-pressed',String(selected===p.id));
    const progress=element('small','',q.rank+' / '+levels);b.append(element('b','',p.name),progress);b.onclick=()=>onSelect(p.id);return b;
  };
  for(const branch of ['育种','生长','火力']){
    const col=element('section','talent-branch'),h=element('h3','',branch);h.prepend(art(branch));col.append(h);
    for(const p of projects.filter(p=>p.branch===branch))col.append(node(p));branches.append(col);
  }
  const cap=element('div','talent-cap'),joint=projects[projects.length-1];cap.append(node(joint));tree.append(cap);
  const p=byId.get(selected)||projects[0],q=gardenTalents.quote(p.id,player),wallet=gardenChallengeRewards.wallet(player),home=gardenEconomy.read(player);
  const title=element('header');title.append(art(p.branch),element('h3','',p.name));detail.append(title,element('small','talent-branch-name',p.branch+' · '+q.rank+' / '+levels+' 级'));
  const effect=element('p','talent-effect',p.effect);detail.append(effect);
  const steps=element('ol','talent-steps');
  for(let rank=1;rank<=levels;rank++){const li=element('li');li.dataset.learned=String(q.rank>=rank);li.append(element('span','',rank+' 级'),element('b','',pct(p,rank)));steps.append(li);}
  detail.append(steps);
  if(p.needs){const requirement=element('p','talent-requires','前置研究　'+p.needs.map(id=>byId.get(id).name+' '+q.required+' 级').join('、'));detail.append(requirement);}
  if(q.price){
    const action=element('div','talent-action'),price=element('p','','本次消耗　'+q.price.points+' 升阶点 · '+q.price.coin+' 金币');
    const enough=home.points>=q.price.points&&wallet.coin>=q.price.coin,button=element('button','ops-confirm',q.missing.length?'前置未完成':!enough?'资源不足':'研究第 '+(q.rank+1)+' 级');
    button.type='button';button.dataset.research=p.id;button.disabled=!!q.missing.length||!enough;
    button.onclick=()=>onBuy(p.id,q.rank);action.append(price,button);detail.append(action);
  }else detail.append(element('p','talent-max','已完成全部研究'));
  layout.append(tree,detail);container.replaceChildren(layout);
}
