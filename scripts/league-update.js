"use strict";
/**
 * Reviewed football updates for a static GitHub Pages site.
 * --preview: validate/diff only; --publish: update canonical data + audit history.
 * No web scraping, API credentials or third-party dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const p=relative=>path.join(root,relative);
const updateFile=p("updates/pending.json");
const canonicalFile=p("data/league-data.js");
const historyFile=p("data/update-history.json");
function fail(message){throw new Error("Update rejected: "+message);}
function iso(s){if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s)||new Date(s+"T12:00:00Z").toISOString().slice(0,10)!==s)fail("Invalid YYYY-MM-DD date: "+String(s));return s;}
function integer(n,field){if(!Number.isSafeInteger(n)||n<0)fail(field+" must be a non-negative integer");return n;}
function object(o,label){if(!o||typeof o!=="object"||Array.isArray(o))fail(label+" must be an object");return o;}
function keys(o,allowed,label){for(const key of Object.keys(o)){if(!allowed.includes(key))fail(label+": unexpected field "+key);}}
function copy(value){return JSON.parse(JSON.stringify(value));}
const context={window:{}};
vm.runInNewContext(fs.readFileSync(canonicalFile,"utf8"),context);
const original=copy(context.window.TSL_DATA);
const data=copy(original);
const batch=object(JSON.parse(fs.readFileSync(updateFile,"utf8")),"pending update");
const history=object(JSON.parse(fs.readFileSync(historyFile,"utf8")),"update history");
if(history.schemaVersion!==1||!Array.isArray(history.batches))fail("Update history is invalid");
keys(batch,["_instructions","batchId","verifiedOn","verifiedBy","sourceUrl","sourceMethod","notes","standings","matches"],"pending update");
if(typeof batch.batchId!=="string"||!/^[a-z0-9][a-z0-9-]{5,65}$/.test(batch.batchId))fail("Set a unique lower-case batchId of 6–66 characters");
if(history.batches.some(x=>x.batchId===batch.batchId))fail("Batch already published: "+batch.batchId);
iso(batch.verifiedOn);
if(batch.verifiedOn<original.snapshotDate)fail("Verification date predates saved snapshot");
if(typeof batch.verifiedBy!=="string"||batch.verifiedBy.trim().length<3||batch.verifiedBy.trim().length>120)fail("Enter the human reviewer and role in verifiedBy");
if(batch.sourceMethod!=="manual-review"&&batch.sourceMethod!=="authorised-admin-export")fail("sourceMethod must be manual-review or authorised-admin-export");
let src;
try{src=new URL(batch.sourceUrl);}catch{fail("sourceUrl must be a URL");}
if(src.protocol!=="https:"||src.hostname!=="fulltime.thefa.com"||src.pathname!=="/index.html"||src.searchParams.get("league")!=="391033232")fail("Use the official Thanet league Full-Time URL as sourceUrl");
if(typeof batch.notes!=="string"||batch.notes.trim().length<8)fail("Include a useful source verification note");
const ids=new Set(data.clubs.map(c=>c.id));
const competitions=new Map((data.competitions||[]).map(c=>[c.id,c]));
const divisionMembers=id=>new Set(data.clubs.filter(c=>c.division===id).map(c=>c.id));
let changedTables=0,changedMatches=0;
if(batch.standings!==undefined){
  object(batch.standings,"standings");
  keys(batch.standings,["first","second"],"standings");
  for(const [division,rows] of Object.entries(batch.standings)){
    if(!Array.isArray(rows)||rows.length<1)fail("A supplied division table must contain its entire verified table");
    const expected=divisionMembers(division),seen=new Set();
    const sanitized=rows.map((row,i)=>{
      object(row,"standings."+division+"["+i+"]");
      const fields=["clubId","played","won","drawn","lost","goalsFor","goalsAgainst","points"];
      keys(row,fields,"standings row");
      if(!expected.has(row.clubId))fail("Unknown or wrong-division club in table: "+row.clubId);
      if(seen.has(row.clubId))fail("Duplicate table club: "+row.clubId);
      seen.add(row.clubId);
      for(const k of fields.slice(1))integer(row[k],k);
      if(row.played!==row.won+row.drawn+row.lost)fail("Played must equal W+D+L for "+row.clubId);
      if(row.points>3*row.won+row.drawn)fail("Points exceed maximum for "+row.clubId);
      return Object.fromEntries(fields.map(k=>[k,row[k]]));
    });
    if(seen.size!==expected.size)fail(division+" table is incomplete: expected "+expected.size+" listed clubs, got "+seen.size+". Confirm division membership before replacing standings.");
    data.standings[division]=sanitized;
    changedTables++;
  }
}
if(batch.matches!==undefined){
  if(!Array.isArray(batch.matches))fail("matches must be an array");
  const incoming=new Set();
  for(const [i,row] of batch.matches.entries()){
    object(row,"matches["+i+"]");
    keys(row,["id","date","homeId","awayId","status","competition","division","competitionId","homeScore","awayScore","kickoff","venue"],"match "+i);
    if(typeof row.id!=="string"||!/^(fx|rs|m)-[a-zA-Z0-9-]{3,70}$/.test(row.id))fail("Supply a stable valid match ID (e.g. fx-001 or m-20261025-shrimpos-monkton)");
    if(incoming.has(row.id))fail("Duplicate match ID in pending update: "+row.id);
    incoming.add(row.id);
    iso(row.date);
    if(!ids.has(row.homeId)||!ids.has(row.awayId)||row.homeId===row.awayId)fail("Invalid club IDs in "+row.id);
    if(!["league","cup"].includes(row.competition))fail("Unknown competition for "+row.id);
    if(!["first","second",null].includes(row.division))fail("Invalid division for "+row.id);
    if(row.competition==="league"&&(row.division===null||data.clubs.filter(c=>c.division===row.division&&[row.homeId,row.awayId].includes(c.id)).length!==2))fail("League match division does not match both clubs: "+row.id);
    if(!["scheduled","final"].includes(row.status))fail("Use scheduled/final status for "+row.id);
    const existingIndex=data.matches.findIndex(m=>m.id===row.id);
    const prior=existingIndex>=0?data.matches[existingIndex]:null;
    if(prior && (prior.homeId!==row.homeId||prior.awayId!==row.awayId||prior.competition!==row.competition))fail("Existing match "+row.id+" has a changed club/competition; investigate rather than silently relink");
    if(prior&&prior.status==="final"&&row.status==="scheduled")fail("Cannot revert final result to scheduled for "+row.id);
    const competitionId=row.competitionId||prior?.competitionId;
    const competition=competitions.get(competitionId);
    if(!competition)fail("Missing or unrecognised competitionId for "+row.id);
    if(competition.kind!==row.competition)fail("Competition type mismatch for "+row.id);
    if(competition.division!==row.division)fail("Cup/league division does not match competition registry: "+row.id);
    if(competition.verification==="historical-name-pending-2026")fail("Cannot assign a fixture to unverified 2026/27 divisional cup: "+competition.name);

    const duplicate=data.matches.find(m=>m.id!==row.id&&m.date===row.date&&m.homeId===row.homeId&&m.awayId===row.awayId&&m.competition===row.competition);
    if(duplicate)fail("Possible duplicate match: "+row.id+" versus "+duplicate.id);
    const m={id:row.id,date:row.date,homeId:row.homeId,awayId:row.awayId,competition:row.competition,division:row.division,competitionId,status:row.status};
    if(row.kickoff!==undefined&&row.kickoff!==null){
      if(typeof row.kickoff!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.kickoff))fail("Kick-off must be HH:MM for "+row.id);
      m.kickoff=row.kickoff;
    }else m.kickoff=prior?.kickoff||null;
    if(row.venue!==undefined&&row.venue!==null){
      if(typeof row.venue!=="string"||row.venue.length>150)fail("Invalid venue for "+row.id);
      m.venue=row.venue.trim()||null;
    }else m.venue=prior?.venue||null;
    if(row.status==="final"){
      m.homeScore=integer(row.homeScore,"homeScore");
      m.awayScore=integer(row.awayScore,"awayScore");
    }else if(row.homeScore!==undefined||row.awayScore!==undefined)fail("Scheduled match may not include a final score for "+row.id);
    if(prior) data.matches[existingIndex]=m;
    else data.matches.push(m);
    changedMatches++;
  }
}
if(!changedMatches&&!changedTables)fail("No standings or match changes supplied; nothing to publish");
data.snapshotDate=batch.verifiedOn;
data.source={...data.source,name:"FA Full-Time",url:batch.sourceUrl,live:false,updateMethod:batch.sourceMethod,verifiedBy:batch.verifiedBy};
data.verification={...(data.verification||{first:"2026-10-18",second:null,fixtures:"2026-10-18",results:"2026-10-18"})};
for(const div of Object.keys(batch.standings||{}))data.verification[div]=batch.verifiedOn;
for(const m of batch.matches||{}){if(m.status==="final")data.verification.results=batch.verifiedOn;else data.verification.fixtures=batch.verifiedOn;}
history.batches.push({batchId:batch.batchId,verifiedOn:batch.verifiedOn,verifiedBy:batch.verifiedBy,sourceUrl:batch.sourceUrl,sourceMethod:batch.sourceMethod,notes:batch.notes.trim(),tableDivisions:Object.keys(batch.standings||{}),matchIds:(batch.matches||[]).map(m=>m.id)});
console.log("Reviewed by:",batch.verifiedBy);
console.log("Source:",batch.sourceUrl);
console.log("Verification date:",batch.verifiedOn);
console.log("Changes:",changedTables,"whole division table(s),",changedMatches,"fixture/result upserts.");
console.log("After update:",data.clubs.length,"clubs,",data.matches.filter(m=>m.status==="scheduled").length,"upcoming fixtures,",data.matches.filter(m=>m.status==="final").length,"results.");
const publish=process.argv.includes("--publish");
if(publish){
  const header='"use strict";\n/** Single canonical football dataset, changed only through reviewed updates. This is a dated snapshot, NOT a live FA feed. */\n';
  fs.writeFileSync(canonicalFile,header+"window.TSL_DATA=Object.freeze("+JSON.stringify(data,null,2)+");\n");
  fs.writeFileSync(historyFile,JSON.stringify(history,null,2)+"\n");
  console.log("PUBLISHED to working tree. Commit via the authorised GitHub Actions publish job.");
}else console.log("PREVIEW ONLY: no data files were changed.");
