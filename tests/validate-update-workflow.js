"use strict";
/* Run: node tests/validate-update-workflow.js. Uses temporary copies only. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const cp=require("node:child_process");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const original=fs.readFileSync(path.join(root,"data/league-data.js"),"utf8");
const vmScope={window:{}};
vm.runInNewContext(original,vmScope);
const base=JSON.parse(JSON.stringify(vmScope.window.TSL_DATA));
const ref=base.matches.find(m=>m.status==="scheduled");
assert.ok(ref,"Need an existing fixture for test");
const stage=fs.mkdtempSync(path.join(os.tmpdir(),"tsl-update-test-"));
function init(){
  fs.rmSync(path.join(stage,"data"),{recursive:true,force:true});
  fs.rmSync(path.join(stage,"scripts"),{recursive:true,force:true});
  fs.rmSync(path.join(stage,"updates"),{recursive:true,force:true});
  for(const d of ["data","scripts","updates"])fs.mkdirSync(path.join(stage,d),{recursive:true});
  fs.writeFileSync(path.join(stage,"data/league-data.js"),original);
  fs.writeFileSync(path.join(stage,"data/update-history.json"),JSON.stringify({schemaVersion:1,batches:[]}));
  fs.copyFileSync(path.join(root,"scripts/league-update.js"),path.join(stage,"scripts/league-update.js"));
}
const proposal={
  batchId:"test-batch-20261025",
  verifiedOn:"2026-10-25",
  verifiedBy:"Test reviewer (not real publication)",
  sourceUrl:"https://fulltime.thefa.com/index.html?league=391033232",
  sourceMethod:"manual-review",
  notes:"Test source check only; scores here are synthetic.",
  standings:{},
  matches:[{id:ref.id,date:ref.date,homeId:ref.homeId,awayId:ref.awayId,competition:ref.competition,division:ref.division,status:"final",homeScore:2,awayScore:1}]
};
function run(mode,expectedPass){
  const r=cp.spawnSync(process.execPath,[path.join(stage,"scripts/league-update.js"),mode],{encoding:"utf8",cwd:stage});
  assert.equal(r.status===0,expectedPass,r.stdout+r.stderr);
  return r;
}
try{
  init();
  fs.writeFileSync(path.join(stage,"updates/pending.json"),JSON.stringify(proposal,null,2));
  run("--preview",true);
  assert.equal(fs.readFileSync(path.join(stage,"data/league-data.js"),"utf8"),original,"Preview modified the live dataset");
  run("--publish",true);
  const context={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(stage,"data/league-data.js"),"utf8"),context);
  const published=context.window.TSL_DATA;
  assert.equal(published.matches.find(m=>m.id===ref.id).status,"final");
  assert.equal(published.matches.find(m=>m.id===ref.id).homeScore,2);
  assert.equal(published.snapshotDate,"2026-10-25");
  assert.equal(published.verification.results,"2026-10-25");
  assert.equal(published.verification.first,"2026-10-18","A results-only update must not imply table verification");
  assert.equal(JSON.parse(fs.readFileSync(path.join(stage,"data/update-history.json"))).batches.length,1);
  run("--publish",false); // duplicates never publish twice
  init();
  const badSource={...proposal,sourceUrl:"https://example.com/league"};
  fs.writeFileSync(path.join(stage,"updates/pending.json"),JSON.stringify(badSource));
  run("--preview",false);
  init();
  const wrongClub={...proposal,matches:[{...proposal.matches[0],homeId:"not-a-real-club"}]};
  fs.writeFileSync(path.join(stage,"updates/pending.json"),JSON.stringify(wrongClub));
  run("--preview",false);
  init();
  const partialTable={...proposal,standings:{first:[base.standings.first[0]]},matches:[]};
  fs.writeFileSync(path.join(stage,"updates/pending.json"),JSON.stringify(partialTable));
  run("--preview",false);
  init();
  const noChanges={...proposal,matches:[]};
  fs.writeFileSync(path.join(stage,"updates/pending.json"),JSON.stringify(noChanges));
  run("--preview",false);
  console.log("PASS: manual preview is read-only; verified publish, audit trail, duplicate prevention, invalid source, club, table and empty update rejection.");
} finally{
  fs.rmSync(stage,{recursive:true,force:true});
}
