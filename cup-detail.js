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
     "This name has been used for a divisional cup in earlier seasons, but we have not confirmed the official 2026/27 cup title, entry rules, draw or fixtures. No results are attributed to it without verification.":
     cup.verification==="confirmed-existence"?
     "This Kent FA cup competition is known by this name, but we have not individually verified whether the saved county-cup results belong to this specific tournament. Confirm all ties on FA Full-Time.":
     "The saved match results were marked as County Cup ties by FA Full-Time. Their exact county competitions have not been individually confirmed, so we keep them in this temporary category rather than inventing a cup name.";
   el("cup-description").textContent=description+" Saved data: "+dateLabel(db.snapshotDate)+".";
   const render=(rows,id,empty)=>el(id).innerHTML=rows.length?rows.map(m=>matchCard(matchDisplay(m),m.status==="final")).join(""):'<p class="cup-empty">'+empty+'</p>';
   render(fixture,"cup-fixtures","No confirmed fixtures are currently recorded for this competition.");
   render(result,"cup-match-results","No confirmed results are currently attributed to this competition.");
   el("cup-match-sections").hidden=false;
 });
})();
