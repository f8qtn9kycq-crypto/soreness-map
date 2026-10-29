const test=require('node:test'),assert=require('node:assert/strict'),T=require('../assets/freehand-trend.js');
const loc={regions:['lowerLeg'],side:'R',surface:'outer'};
const e=(date,values)=>({date,strokes:values.map((severity,i)=>({id:date+'-'+i,location:loc,part:null,severity}))});
test('直接產生位置卡與上次差異，不需手動選部位',()=>{const[c]=T.build([e('2026-10-25',[7]),e('2026-10-27',[4])],7,'2026-10-28');assert.equal(c.delta,-3);assert.equal(c.high,4);assert.equal(c.points.length,2);assert.equal(c.days,2);});
test('單筆、同日多筆不平均或假造方向',()=>{let[c]=T.build([e('2026-10-28',[0])],7,'2026-10-28');assert.equal(c.low,0);assert.equal(c.delta,null);[c]=T.build([e('2026-10-27',[6]),e('2026-10-28',[2,8])],7,'2026-10-28');assert.equal(c.low,2);assert.equal(c.high,8);assert.equal(c.delta,null);assert.equal(c.points.length,3);});
test('日期缺值不補零，排除未評分、未定位、未來及區間外',()=>{const input=[e('2026-10-20',[5]),e('2026-10-25',[null]),e('2026-10-29',[3]),{date:'2026-10-28',strokes:[{id:'x',severity:4,part:null}]}];assert.deepEqual(T.build(input,7,'2026-10-28'),[]);});
test('手動舊部位與自動體表位置分開，區域順序不造成重複卡',()=>{const a=e('2026-10-28',[3]);a.strokes.push({id:'manual',part:'calf.R',severity:5});assert.equal(T.build([a],7,'2026-10-28').length,2);assert.equal(T.locationKey({...loc,regions:['thigh','knee']}),T.locationKey({...loc,regions:['knee','thigh']}));});
