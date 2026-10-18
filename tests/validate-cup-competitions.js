"use strict";
/* Run: node tests/validate-cup-competitions.js */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx=vm.createContext({window:{},document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return[]}}});
vm.runInContext(read("data/league-data.js"),ctx);
vm.runInContext(read("site-v9.js"),ctx);
const db=ctx.window.TSL_DATA;
const cups=db.competitions.filter(c=>c.kind==="cup");
assert.equal(new Set(db.competitions.map(c=>c.id)).size,db.competitions.length);
assert.ok(cups.some(c=>c.id==="first-division-cup"&&c.verification.includes("pending")));
assert.ok(cups.some(c=>c.id==="second-division-cup"&&c.verification.includes("pending")));
assert.ok(cups.some(c=>c.id==="kent-sunday-junior-cup"));
assert.ok(cups.some(c=>c.id==="kent-county-cup-unassigned"));
const competitionIds=new Set(db.competitions.map(c=>c.id));
for(const m of db.matches){
 assert.ok(competitionIds.has(m.competitionId),"Unknown competition "+m.id);
 const c=db.competitions.find(c=>c.id===m.competitionId);
 assert.equal(c.kind,m.competition,"Wrong competition category: "+m.id);
 assert.equal(c.division,m.division,"Wrong division: "+m.id);
}
const check=code=>vm.runInContext(code,ctx);
assert.equal(check('filteredMatches("scheduled","first","league-first","").length'),11);
assert.equal(check('filteredMatches("scheduled","second","league-second","").length'),0);
assert.equal(check('filteredMatches("final","all","kent-county-cup-unassigned","").length'),6);
assert.equal(check('filteredMatches("final","first","kent-county-cup-unassigned","").length'),0);
assert.equal(check('filteredMatches("final","first","league-first","").length'),11);
assert.equal(check('filteredMatches("final","all","first-division-cup","").length'),0);
assert.equal(check('filteredMatches("scheduled","all","all","afc-manston").length'),2);
assert.ok(check("selectOptions()").includes("First Division Cup (2026/27 pending)"));
for(const page of ["fixtures.html","results.html","cups.html","cup.html"]){
 const html=read(page);
 assert.ok(html.includes("site-v9.js"),page+" does not load cup-aware site renderer");
 assert.ok(html.includes("cup-layout.css"),page+" lacks styling");
}
const fixture=read("fixtures.html"),result=read("results.html"),cupsHTML=read("cups.html");
for(const id of ["fixture-division","fixture-competition","fixture-team"])assert.ok(fixture.includes('id="'+id+'"'),"Missing "+id);
for(const id of ["results-division","results-competition"])assert.ok(result.includes('id="'+id+'"'),"Missing "+id);
assert.ok(cupsHTML.includes('id="cup-competitions"'));
assert.ok(read("cup.html").includes("cup-detail.js"));
console.log("PASS: central competition registry, county-cup separation, per-division filters, 11 fixtures and 17 results.");
