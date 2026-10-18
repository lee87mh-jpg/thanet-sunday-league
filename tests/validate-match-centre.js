"use strict";
/* Run: node tests/validate-match-centre.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const data=read("data/league-data.js"),renderer=read("site-v6.js"),matchScript=read("match-centre.js"),html=read("match.html");
const sb={window:{}};
vm.runInNewContext(data,sb);
const styles=read("match-layout-v2.css");
assert.ok(html.includes("match-layout-v2.css"),"Dedicated stylesheet missing");
assert.ok(!html.includes("club-profile.js"),"Unneeded club profile script present");
assert.ok(html.includes("Critical scoreline layout"),"Responsive fallback missing");
assert.ok(styles.includes(".match-page-scoreboard"),"Scoreboard rules missing");
assert.ok(styles.includes("grid-template-columns:minmax(0,1fr) 63px minmax(0,1fr)"),"Mobile columns missing");
assert.ok(styles.includes("object-fit:contain!important"),"Image fit missing");
const matches=sb.window.TSL_DATA.matches;
const required=["match-title","match-alert","match-home","match-away","match-score","match-content","match-facts","match-related"];
for(const m of matches){
  const els={};
  for(const x of html.matchAll(/\bid="([^"]+)"/g))
    els[x[1]]={innerHTML:"",textContent:"",hidden:true,href:"",setAttribute(){},getAttribute(){return "false"},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return[]}};
  const callbacks=[];
  const document={title:"",getElementById:id=>els[id]||null,
    querySelector:()=>({setAttribute(){}}),querySelectorAll:()=>[],
    addEventListener:(event,fn)=>{if(event==="DOMContentLoaded")callbacks.push(fn)}};
  const ctx=vm.createContext({window:{location:{search:"?match="+m.id}},document,URLSearchParams});
  vm.runInContext(data,ctx);
  vm.runInContext(renderer,ctx);
  vm.runInContext(matchScript,ctx);
  callbacks.forEach(fn=>fn());
  required.forEach(id=>assert.ok(els[id],id+" missing in template"));
  assert.equal(els["match-content"].hidden,false,m.id+" did not open");
  assert.ok(els["match-facts"].innerHTML.includes("Competition"),m.id+" facts empty");
  assert.ok(els["match-home"].innerHTML.includes("<strong>"),m.id+" home missing");
  assert.ok(els["match-away"].innerHTML.includes("<strong>"),m.id+" away missing");
  if(m.status==="final")assert.equal(els["match-score"].textContent,m.homeScore+" – "+m.awayScore);
  else assert.equal(els["match-score"].textContent,"VS");
}
const links=vm.createContext({window:{},document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return[]}}});
vm.runInContext(data,links);
vm.runInContext(renderer,links);
const firstFixture=vm.runInContext("miniFixture(SNAPSHOT.fixtures[0])",links);
const firstResult=vm.runInContext("resultMini(SNAPSHOT.results[0])",links);
assert.match(firstFixture,/match\.html\?match=fx-001/);
assert.match(firstResult,/match\.html\?match=rs-001/);
console.log("PASS: "+matches.length+" match pages and links from fixture/result cards.");
