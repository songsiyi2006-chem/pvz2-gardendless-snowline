const gardenBetaNotice = (() => {
  const repository = 'https://github.com/songsiyi2006-chem/pvz2-gardendless-snowline';
  const upstream = 'https://github.com/Gzh0821/pvzg_site';
  const receipt = 'PvZ2_Snowline_PublicBeta_01_Notice';
  let notice;
  let introduced = false;
  const copy = {
    zh: ['装甲雪线与庭院工坊','公开测试版 0.1','用进阶改变植物的招式，在雪线挑战中检验你的阵容。','最高难度可选七株六阶植物，并增援一或两株自有植物。掷骰可以重新分配招式和专精。','这是免费的非官方同人改版。感谢 Gardendless 开发团队，感谢 EA 与 PopCap 创造了《植物大战僵尸》。','前往 GitHub 获取指南、观看实机演示，也欢迎用 AI 修改玩法并分享你的平衡方案。新增代码采用 MIT 许可证。','改版 GitHub 仓库','Gardendless 原作者','进入庭院','English'],
    en: ['Snowline Garden','Public beta 0.1','Grow a plant into a new role, then test your lineup in a Snowline expedition.','Start with seven rank-six plants and optionally bring one or two of your own. Roll the dice to shuffle skills and mastery assignments.','A free, unofficial fan modification. Thanks to the Gardendless team, and to EA and PopCap for Plants vs. Zombies.','Visit GitHub for the field guide and gameplay trailer. Use AI to customize the mechanics and share your balance changes. Original mod code is MIT licensed.','Mod repository','Gardendless creators','Enter the garden','简体中文']
  };
  function link(el,url) {
    el.href=url;
    el.target='_blank';el.rel='noopener noreferrer';
    el.onclick=e=>{if(window.electronAPI?.openUrl){e.preventDefault();window.electronAPI.openUrl(url);}};
  }
  function open(zh) {
    introduced=true;
    if(notice?.isConnected)return;
    notice=document.createElement('dialog');notice.id='snowline-beta-notice';
    notice.style.cssText='border:1px solid #93b7a7;border-radius:16px;background:#102e29;color:#edf3df;width:min(536px,84vw);padding:0;max-height:88vh;box-shadow:0 18px 80px #071c19bb;font:15px/1.55 "Microsoft YaHei",Segoe UI,sans-serif;text-align:left';
    const root=notice.attachShadow ? document.createElement('div') : notice;
    if(root!==notice)notice.append(root);
    root.innerHTML='<style>#snowline-beta-notice::backdrop{background:#071c19b8}.sn-shell{padding:22px 28px 24px}.sn-line,.sn-links{display:flex;align-items:center;justify-content:space-between;gap:12px}.sn-line{font-size:12px;color:#d9bd82;letter-spacing:.045em}.sn-shell h2{color:#f5f1dd;font-size:clamp(23px,4vw,33px);margin:12px 0 2px;line-height:1.2}.sn-shell p{margin:11px 0;color:#c6d7cf}.sn-shell .sn-lead{color:#f0dcaa;font-size:17px}.sn-links{justify-content:flex-start;flex-wrap:wrap;margin:16px 0}.sn-shell a{color:#c1ecdc;text-decoration:underline;text-underline-offset:4px}.sn-shell button{font:inherit;cursor:pointer}.sn-lang{color:#d1e0d6;background:transparent;border:1px solid #5b8074;border-radius:6px;padding:2px 7px}.sn-enter{background:#e7ce90;color:#122f27;border:0;border-radius:7px;padding:7px 21px;font-weight:700}</style><div class="sn-shell"><div class="sn-line"><b></b><button class="sn-lang" type="button"></button></div><h2 id="snowline-beta-title"></h2><p class="sn-lead"></p><p></p><p></p><p></p><div class="sn-links"><a></a><a></a></div><button type="button" class="sn-enter"></button></div>';
    const q=s=>root.querySelector(s),anchors=root.querySelectorAll('a');
    link(anchors[0],repository);link(anchors[1],upstream);
    function paint(){
      const t=copy[zh?'zh':'en'];notice.lang=zh?'zh-CN':'en';
      q('h2').textContent=t[0];q('b').textContent=t[1];
      root.querySelectorAll('p').forEach((p,i)=>p.textContent=t[i+2]);
      anchors[0].textContent=t[6];anchors[1].textContent=t[7];
      q('.sn-enter').textContent=t[8];q('.sn-lang').textContent=t[9];
    }
    paint();q('.sn-lang').onclick=()=>{zh=!zh;paint();};
    q('.sn-enter').onclick=()=>notice.close();
    notice.setAttribute('aria-labelledby','snowline-beta-title');
    notice.addEventListener('close',()=>{try{localStorage.setItem(receipt,'1')}catch{}notice.remove();});
    document.body.append(notice);notice.showModal();q('.sn-enter').focus();
  }
  function first(zh){
    if(introduced)return;
    try{if(localStorage.getItem(receipt)==='1')return;}catch{}
    open(zh);
  }
  return {open,first};
})();
