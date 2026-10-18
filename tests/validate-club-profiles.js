"use strict";
/* Run from repository root: node tests/validate-club-profiles.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const file=p=>fs.readFileSync(path.join(root,p),"utf8");
const dataset=file("data/league-data.js");
const renderer=file("site-v6.js");
const profile=file("club-profile.js");
const html=file("club.html");
const members=[];
const master={window:{}};
vm.runInNewContext(dataset,master);
members.push(...master.window.TSL_DATA.clubs.filter(c=>c.division==="first"||c.division==="second"));
assert.equal(members.length,22,"Unexpected registered league club count");
for(const c of members){
 const els={};
 for(const match of html.matchAll(/\bid="([^"]+)"/g)){
   els[match[1]]={innerHTML:"",textContent:"",hidden:false,value:"",classList:{add(){},remove(){},toggle(){}},setAttribute(){},getAttribute(){return"false"},addEventListener(){},querySelectorAll(){return[]}};
 }
 const listeners=[];
 const document={
   title:"",
   getElementById:id=>els[id]||null,
   querySelector:()=>({setAttribute(){}}),
   querySelectorAll:()=>[],
   addEventListener:(name,fn)=>{if(name==="DOMContentLoaded")listeners.push(fn);}
 };
 const ctx=vm.createContext({window:{location:{search:"?club="+c.profileSlug}},document,URLSearchParams,console});
 vm.runInContext(dataset,ctx);
 vm.runInContext(renderer,ctx);
 vm.runInContext(profile,ctx);
 for(const fn of listeners)fn();
 assert.equal(els["profile-title"].textContent,c.name,"Wrong profile "+c.name);
 assert.equal(els["profile-content"].hidden,false);
 assert.equal(els["profile-status"].hidden,true);
 for(const id of ["profile-stats","profile-fixtures","profile-results","profile-form","profile-details"]){
   assert.ok(els[id].innerHTML.length>0,c.name+" missing "+id);
 }
 if(c.division==="second"){
   assert.match(els["profile-stats"].innerHTML,/No confirmed standings/);
 }else{
   assert.match(els["profile-stats"].innerHTML,/League position/);
 }
}
const links=vm.createContext({window:{},document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return[]}}});
vm.runInContext(dataset,links);
vm.runInContext(renderer,links);
const tableHTML=vm.runInContext("tableHTML(SNAPSHOT.table,6)",links);
assert.match(tableHTML,/club\.html\?club=tws-cramptons-fc/);
const fixtureHTML=vm.runInContext("miniFixture(SNAPSHOT.fixtures[0])",links);
assert.match(fixtureHTML,/club\.html\?club=afc-manston/);
const cupGuest=vm.runInContext("profileHref('Cheriton AFC')",links);
assert.equal(cupGuest,null,"Outside opposition should not get a league profile link");
console.log("PASS: "+members.length+" shareable club profiles, data-driven stats, match sections and navigational links.");
