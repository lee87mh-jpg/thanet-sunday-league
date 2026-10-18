"use strict";
/** Cup details are only populated from the centrally verified competition registry. */
(function(){
 const db=window.TSL_DATA;
 const el=id=>document.getElementById(id);
 const dateLabel=d=>new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
 document.addEventListener("DOMContentLoaded",()=>{
   const slug=new URLSearchParams(window.location.search).get("competition");
   const cup=db.competitions?.find(c=>c.id===slug&&c.kind==="cup");
   if(!cup){
     el("cup-name").textContent="Cup not found";
     el("cup-crumb").textContent="Unavailable";
     el("cup-verification").textContent="No confirmed competition";
     el("cup-description").textContent="We could not find that competition. Return to the cups directory to choose a listed tournament.";
     document.title="Cup not found | Thanet Sunday Football League";
     return;
   }
   el("cup-name").textContent=cup.name;
   el("cup-crumb").textContent=cup.name;
   document.title=cup.name+" | Thanet Sunday Football League";
   const pending=cup.verification==="historical-name-pending-2026";
   el("cup-verification").textContent=pending?"2026/27 name awaiting confirmation":cup.verification==="confirmed-existence"?"Cup name established; ties unverified":"Cup tie names pending verification";
   const list=db.matches.filter(m=>m.competitionId===cup.id);
   const fixture=list.filter(m=>m.status==="scheduled").sort((a,b)=>a.date.localeCompare(b.date));
   const result=list.filter(m=>m.status==="final").sort((a,b)=>b.date.localeCompare(a.date));
   const description=pending?
     "This cup name appears in previous seasons' league coverage, but its official 2026/27 status, eligibility, draw and fixtures are not yet confirmed. No saved cup ties have been allocated to it without verification.":
     cup.verification==="unknown-cup-tie"?
     "These results were recorded only as cup matches in the saved FA Full-Time snapshot. Their specific cup competitions have not been identified; they are grouped here to avoid incorrect attribution.":
     "The saved competition details are being checked. Confirm the most recent information with FA Full-Time.";
   el("cup-description").textContent=description+" Saved data: "+dateLabel(db.snapshotDate)+".";
   const render=(rows,id,empty)=>el(id).innerHTML=rows.length?rows.map(m=>matchCard(matchDisplay(m),m.status==="final")).join(""):'<p class="cup-empty">'+empty+'</p>';
   render(fixture,"cup-fixtures","No confirmed fixtures are currently recorded for this competition.");
   render(result,"cup-match-results","No confirmed results are currently attributed to this competition.");
   el("cup-match-sections").hidden=false;
 });
})();
