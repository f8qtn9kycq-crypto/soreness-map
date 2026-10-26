/* 原創體表位置示意；分區沿用 detailed-locations.js，不代表精確組織或臨床邊界。
 * 所有座標含左右鏡像後均在 640 × 420；anchor 與 path 使用同一座標系。
 * 每個選項只出現在一個視角；背景僅供輪廓參照，渲染端應設 pointer-events="none"。
 */
(function(root){
  'use strict';
  const WIDTH=640, HEIGHT=420;
  const polygon=points=>'M'+points.map(p=>p.join(',')).join(' L')+' Z';
  function build(region,side){
    const result={width:WIDTH,height:HEIGHT,backgrounds:[],labels:[],zones:[]};
    const label=(zh,en,x,y)=>result.labels.push({zh,en,x,y});
    const bg=points=>result.backgrounds.push({path:polygon(points)});
    const z=(id,points,anchor)=>result.zones.push({id,path:polygon(points),anchor});
    // 手掌／手背、足背／足底各自鏡像；只改局部輪廓，面板與標題位置固定。
    const local=(x,y=0,mirrorWidth=0)=>{
      const point=p=>[(mirrorWidth?mirrorWidth-p[0]:p[0])+x,p[1]+y];
      return {
        bg:p=>bg(p.map(point)),
        z:(id,p,a)=>z(id,p.map(point),point(a)),
        multi:(id,paths,a)=>result.zones.push({id,path:paths.map(p=>polygon(p.map(point))).join(' '),anchor:point(a)}),
        label:(zh,en,px,py)=>label(zh,en,px+x,py+y)
      };
    };
    const thumbLeft=side!=='L';
    const direction=left=>({zh:left?'左':'右',en:left?'left':'right'});
    // 以體表輪廓收窄的三段，並非矩形選項表格。
    function taperedBands(x, ids, title, english, kind){
      const p=local(x); p.label(title,english,90,40);
      const edges=kind==='neck'?[[59,121],[58,122],[48,132],[12,168]]:
        kind==='shoulder'?[[65,115],[39,141],[49,131],[65,115]]:
        [[33,147],[42,138],[55,125],[67,113]];
      const ys=[95,180,265,350];
      p.bg([[77,64],[103,64],...edges.map((e,i)=>[e[1],ys[i]]),[113,382],[67,382],...edges.map((e,i)=>[e[0],ys[i]]).reverse()]);
      ids.forEach((id,i)=>p.z(id,[[edges[i][0],ys[i]],[edges[i][1],ys[i]],[edges[i+1][1],ys[i+1]],[edges[i+1][0],ys[i+1]]],[90,(ys[i]+ys[i+1])/2]));
    }
    const builders={
      deltoid(){
        ['front','side'].forEach((face,i)=>taperedBands(85+i*310,['upper','middle','lower'].map(r=>`${r}-${face}`),face==='front'?'肩前側':'肩外側',face==='front'?'Front shoulder':'Outer shoulder','shoulder'));
      },
      adductors(){
        ['front','inner','back'].forEach((face,i)=>taperedBands(15+i*210,['upper','middle','lower'].map(r=>`${r}-${face}`),['大腿偏前','大腿內側面','大腿偏後'][i],['Toward front','Inner surface','Toward back'][i],'thigh'));
      },
      jNeck(){
        ['front','side','back'].forEach((face,i)=>taperedBands(15+i*210,['upper','middle','lower'].map(r=>`${r}-${face}`),['頸前側','頸側面','頸後側'][i],['Front neck','Side neck','Back neck'][i],'neck'));
      },
      hipFlexor(){
        label('髖前側・上方為骨盆','Front hip · pelvis above',320,38);
        const p=local(150); p.bg([[30,70],[265,70],[284,145],[274,240],[235,373],[90,373],[58,240],[30,180]]);
        p.z('crease-inner',[[35,144],[112,164],[121,225],[67,245],[48,204]],[83,194]);
        p.z('crease-center',[[116,165],[190,160],[192,226],[125,225]],[154,194]);
        p.z('crease-outer',[[194,159],[280,139],[273,207],[250,242],[196,226]],[235,192]);
        p.z('below',[[70,250],[124,232],[192,233],[248,250],[218,345],[98,345]],[158,285]);
        label('靠身體中央','Toward body center',205,395); label('靠髖外側','Toward outer hip',430,395);
      },
      rotator(){
        label('肩後側','Back of shoulder',320,38);
        const p=local(130); p.bg([[35,85],[210,70],[290,111],[335,173],[310,343],[252,369],[235,275],[60,285]]);
        p.z('upper',[[65,97],[198,88],[237,116],[225,161],[65,161]],[143,128]);
        p.z('center',[[65,166],[225,166],[232,228],[65,228]],[143,197]);
        p.z('lower',[[65,233],[233,233],[239,278],[179,307],[65,282]],[148,260]);
        p.z('outer',[[245,121],[278,125],[318,176],[297,325],[259,344],[245,265],[236,174]],[277,218]);
        label('靠肩胛側','Toward shoulder blade',240,382); label('靠上臂外側','Toward outer arm',455,382);
      },
      achilles(){
        label('腳跟後側','Back of heel',320,38); const p=local(170);
        p.bg([[91,64],[208,64],[215,184],[252,267],[241,338],[207,366],[90,366],[56,338],[45,267],[84,184]]);
        p.z('above',[[94,91],[205,91],[210,181],[225,231],[75,231],[88,181]],[150,159]);
        p.z('inner',[[74,237],[110,237],[110,343],[80,339],[61,305],[60,271]],[88,288]);
        p.z('back',[[116,237],[183,237],[183,349],[116,349]],[150,290]);
        p.z('outer',[[189,237],[226,237],[240,271],[237,307],[220,339],[189,343]],[212,288]);
        label('內側','Medial',250,394); label('外側','Lateral',390,394);
      },
      jSI(){
        label('骨盆後側・單側放大','Back pelvis · one side',320,38); const p=local(140);
        p.bg([[40,86],[200,65],[300,115],[335,242],[292,350],[207,373],[59,331],[30,211]]);
        p.z('upper',[[65,108],[190,91],[222,127],[218,171],[64,171]],[142,136]);
        p.z('middle',[[65,176],[218,176],[218,239],[65,239]],[142,207]);
        p.z('lower',[[65,244],[218,244],[220,326],[194,345],[65,310]],[143,281]);
        p.z('outer',[[230,119],[280,139],[310,240],[278,326],[231,342],[226,239]],[263,239]);
        label('靠背中央','Toward back center',245,399); label('靠髖外側','Toward outer hip',440,399);
      },
      jShoulder(){
        const a=local(15),b=local(225),c=local(435);
        [a,b,c].forEach((p,i)=>{p.label(['肩前方與肩頂','肩外側','肩後方'][i],['Front & top','Outer shoulder','Back shoulder'][i],90,38);p.bg([[15,119],[67,83],[111,84],[157,118],[169,206],[146,351],[59,351],[49,207],[16,196]]);});
        a.z('top',[[31,120],[73,96],[109,97],[145,123],[148,164],[47,164]],[97,131]);
        a.z('front',[[49,171],[149,171],[158,209],[139,293],[65,293],[58,212]],[105,225]);
        b.z('outer',[[55,122],[110,104],[146,131],[157,208],[138,309],[66,309],[56,215]],[107,216]);
        c.z('back',[[40,135],[74,103],[110,104],[147,134],[155,210],[137,299],[66,299],[57,212]],[106,215]);
      },
      jElbow(){
        const a=local(75),b=local(385); a.label('肘前方・內外側','Front elbow & sides',90,38);b.label('肘後尖端','Back elbow tip',90,38);
        [a,b].forEach(p=>p.bg([[53,72],[137,72],[149,172],[161,215],[144,258],[128,370],[56,370],[40,253],[31,215],[43,172]]));
        a.z('front',[[66,169],[128,169],[139,210],[127,251],[65,251],[54,211]],[96,210]);
        a.z('inner',[[41,175],[60,175],[48,210],[60,253],[40,247],[29,216]],[43,214]);
        a.z('outer',[[134,175],[151,181],[164,215],[146,249],[133,252],[145,211]],[150,214]);
        b.z('back',[[58,163],[132,163],[150,212],[131,267],[59,267],[42,212]],[96,216]);
        a.label('內','Medial',25,292);a.label('外','Lateral',163,292);
      },
      jWrist(){
        const a=local(75,0,thumbLeft?0:190),b=local(385,0,thumbLeft?190:0);
        a.label('掌側・拇指在'+direction(thumbLeft).zh,'Palm · thumb '+direction(thumbLeft).en,95,38);
        b.label('手背側・拇指在'+direction(!thumbLeft).zh,'Back · thumb '+direction(!thumbLeft).en,95,38);
        [a,b].forEach(p=>p.bg([[54,363],[137,363],[129,245],[153,173],[145,95],[117,72],[56,74],[35,115],[36,180],[62,245]]));
        a.z('palm',[[67,218],[122,218],[127,282],[61,282]],[94,249]);
        a.z('thumb',[[44,197],[62,212],[57,286],[35,286],[35,245]],[47,250]);
        a.z('little',[[128,212],[146,197],[155,245],[155,286],[132,286]],[141,250]);
        b.z('back',[[58,212],[130,212],[139,282],[51,282]],[95,249]);
      },
      jHand(){
        const a=local(32,0,thumbLeft?0:254),b=local(350,0,thumbLeft?254:0);
        a.label('手掌・拇指在'+direction(thumbLeft).zh,'Palm · thumb '+direction(thumbLeft).en,127,36);
        b.label('手背・拇指在'+direction(!thumbLeft).zh,'Back · thumb '+direction(!thumbLeft).en,127,36);
        // 五指輪廓依長短、方向辨認；手指選項集中在掌側視角避免重複ID。
        const digits={
          thumb:[[46,239],[23,199],[12,204],[12,223],[40,265],[48,264]],
          index:[[68,199],[66,91],[73,77],[87,78],[94,91],[96,196]],
          middle:[[105,194],[104,62],[111,49],[126,49],[134,63],[135,195]],
          ring:[[145,198],[145,80],[152,66],[167,68],[174,81],[174,204]],
          little:[[184,212],[185,124],[193,112],[207,116],[212,130],[211,243]]
        };
        [a,b].forEach(p=>{p.bg([[63,194],[95,190],[135,189],[176,201],[212,217],[210,281],[188,319],[180,366],[92,366],[85,320],[47,278],[45,245]]);Object.values(digits).forEach(points=>p.bg(points));});
        Object.entries(digits).forEach(([id,points])=>a.z(id,points,({thumb:[34,232],index:[80,133],middle:[120,119],ring:[160,139],little:[198,168]})[id]));
        a.z('palm-thumb',[[62,207],[99,205],[101,307],[86,311],[55,275],[52,245]],[78,254]);
        a.z('palm-center',[[106,205],[148,207],[148,314],[107,308]],[127,259]);
        a.z('palm-little',[[154,212],[178,214],[205,231],[202,278],[183,311],[154,314]],[177,261]);
        b.z('back',[[65,205],[98,202],[135,202],[174,213],[204,229],[201,277],[180,312],[91,312],[56,273],[53,244]],[129,257]);
      },
      jHip(){
        const a=local(15),b=local(225),c=local(435);
        [a,b,c].forEach((p,i)=>{p.label(['髖前側','髖外側','髖後側'][i],['Front hip','Outer hip','Back hip'][i],90,38);p.bg([[32,76],[142,76],[163,150],[158,248],[129,367],[54,367],[30,247],[19,151]]);});
        a.z('front-inner',[[32,166],[84,183],[84,272],[48,272],[32,237]],[60,224]);
        a.z('front',[[90,183],[148,164],[148,232],[129,290],[90,276]],[116,228]);
        b.z('outer',[[50,148],[117,126],[147,167],[145,246],[123,302],[63,302],[43,239]],[94,220]);
        c.z('back',[[38,142],[132,135],[150,178],[143,252],[120,299],[60,299],[36,236]],[94,219]);
        a.label('內側','Medial',40,397);a.label('外側','Lateral',143,397);
      },
      jKnee(){
        const a=local(68),b=local(383);a.label('膝前方・內外側','Front knee & sides',95,38);b.label('膝後方','Back knee',95,38);
        [a,b].forEach(p=>p.bg([[37,70],[153,70],[139,156],[155,210],[139,260],[130,372],[60,372],[49,262],[34,210],[51,155]]));
        a.z('above',[[58,111],[132,111],[132,167],[58,167]],[95,141]);
        a.z('front',[[65,173],[125,173],[137,211],[124,249],[66,249],[54,211]],[95,211]);
        a.z('below',[[64,255],[126,255],[129,315],[60,315]],[95,282]);
        a.z('inner',[[47,171],[59,174],[47,211],[59,247],[46,254],[28,212]],[38,212]);
        a.z('outer',[[132,174],[145,171],[163,212],[145,254],[130,247],[143,211]],[153,212]);
        b.z('back',[[57,167],[133,167],[146,211],[130,264],[59,264],[43,211]],[95,213]);
        a.label('內','Medial',28,346);a.label('外','Lateral',161,346);
      },
      jAnkle(){
        const a=local(68),b=local(383);a.label('踝前方・內外踝','Front & ankle bones',95,38);b.label('踝後側','Back ankle',95,38);
        [a,b].forEach(p=>p.bg([[59,70],[136,70],[136,222],[153,254],[159,292],[144,351],[53,351],[35,292],[39,252],[57,220]]));
        a.z('front',[[66,203],[128,203],[133,285],[61,285]],[97,247]);
        a.z('inner',[[40,234],[59,229],[55,289],[37,309],[27,277]],[43,267]);
        a.z('outer',[[135,229],[154,234],[168,277],[157,309],[139,289]],[152,267]);
        b.z('back',[[64,203],[129,203],[142,285],[131,321],[61,321],[49,285]],[96,260]);
        a.label('內','Medial',33,389);a.label('外','Lateral',158,389);
      },
      jFoot(){
        const a=local(45,0,thumbLeft?0:230),b=local(355,0,thumbLeft?230:0);
        a.label('足背・拇趾在'+direction(thumbLeft).zh,'Top · big toe '+direction(thumbLeft).en,115,38);
        b.label('腳底・拇趾在'+direction(!thumbLeft).zh,'Sole · big toe '+direction(!thumbLeft).en,115,38);
        const foot=[[54,153],[179,153],[194,193],[185,232],[154,286],[153,339],[136,370],[96,376],[68,354],[62,320],[73,273],[56,234],[40,198]];
        const big=[[48,148],[41,111],[43,91],[56,81],[74,86],[81,105],[82,148]];
        const toes=[[[88,143],[86,85],[93,74],[107,77],[113,92],[114,145]],[[119,145],[118,92],[125,84],[138,86],[145,102],[145,148]],[[150,150],[148,108],[155,100],[168,103],[175,117],[176,153]],[[181,157],[180,128],[187,121],[199,129],[205,144],[201,168]]];
        [a,b].forEach(p=>{p.bg(foot);p.bg(big);toes.forEach(t=>p.bg(t));});
        a.z('big-toe',big,[60,116]);
        // 其餘四趾共用同一個選項；局部鏡像同時套用所有閉合區域與anchor。
        a.multi('lesser-toes',toes,[100,110]);
        a.z('top',[[56,159],[173,159],[185,195],[176,229],[144,281],[144,327],[128,350],[100,354],[80,336],[82,295],[87,273],[66,229],[50,196]],[116,221]);
        b.z('sole-front',[[55,160],[174,160],[185,193],[176,228],[61,228],[48,196]],[116,194]);
        b.z('arch-inner',[[63,234],[111,234],[111,304],[78,313],[84,274]],[94,268]);
        b.z('sole-outer',[[117,234],[174,234],[148,281],[146,315],[117,305]],[138,265]);
        b.z('heel-sole',[[77,320],[113,311],[145,322],[143,339],[130,360],[100,366],[78,349],[72,334]],[109,340]);
      }
    };
    if(!region||!builders[region.id])return null;
    builders[region.id]();
    // 左右只改圖形，標題不翻轉；掌／背、拇／小指等地標隨圖形一起移位。
    if(side==='R'&&!['jHand','jWrist','jFoot'].includes(region.id)){
      result.backgrounds.forEach(item=>{item.transform='translate(640 0) scale(-1 1)';});
      result.zones.forEach(item=>{item.transform='translate(640 0) scale(-1 1)';item.anchor=[WIDTH-item.anchor[0],item.anchor[1]];});
      result.labels.forEach(item=>{item.x=WIDTH-item.x;});
      // 原先「在左」的視角提示須同步，文字本身維持可讀。
      result.labels.forEach(item=>{item.zh=item.zh.replace('在左','在右');item.en=item.en.replace(' left',' right');});
    }
    return result;
  }
  const api={build};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.DETAIL_REGION_DIAGRAMS=api;
})(typeof window==='object'?window:globalThis);
