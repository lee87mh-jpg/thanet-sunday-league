"use strict";
/* Run: node tests/validate-league-data.js */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root=path.resolve(__dirname,"..");
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"data/league-data.js"),"utf8"),sandbox);
const data=sandbox.window.TSL_DATA;
assert.equal(data.schemaVersion,1);
const ids=new Set(data.clubs.map(c=>c.id));
const names=new Set(data.clubs.map(c=>c.name));
assert.equal(ids.size,data.clubs.length,"Duplicate club ids");
assert.equal(names.size,data.clubs.length,"Duplicate club names");
for(const club of data.clubs){
  assert.match(club.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(club.profileSlug,club.id);
  assert.ok(["first","second",null].includes(club.division));
  if(club.badge){
    const full=path.join(root,club.badge);
    assert.ok(fs.existsSync(full),"Missing crest for "+club.name+": "+club.badge);
  }
}
for(const [division,rows] of Object.entries(data.standings)){
  assert.ok(division in data.divisionLabels,"Unknown division "+division);
  const ranked=new Set();
  for(const row of rows){
    assert.ok(ids.has(row.clubId),"Table references missing club: "+row.clubId);
    assert.ok(!ranked.has(row.clubId),"Club repeated in table: "+row.clubId);
    ranked.add(row.clubId);
    assert.equal(data.clubs.find(c=>c.id===row.clubId).division,division);
  }
}
const matchIds=new Set();
for(const m of data.matches){
  assert.ok(ids.has(m.homeId),"Unknown home club "+m.homeId);
  assert.ok(ids.has(m.awayId),"Unknown away club "+m.awayId);
  assert.notEqual(m.homeId,m.awayId,"Club cannot play itself");
  assert.ok(!matchIds.has(m.id),"Duplicate match id "+m.id);
  matchIds.add(m.id);
  assert.match(m.date,/^\d{4}-\d{2}-\d{2}$/);
  if(m.status==="final"){
    assert.ok(Number.isInteger(m.homeScore)&&Number.isInteger(m.awayScore),"Missing scores");
  }else{
    assert.equal(m.status,"scheduled","Unknown match status");
  }
}
console.log("PASS: "+data.clubs.length+" clubs, "+data.standings.first.length+" first-division standings, "+data.matches.length+" matches and badge paths valid.");
