"use strict";
/**
 * Publicly visible, dated snapshot taken from FA Full-Time on 18 October 2026.
 * DO NOT label data as live or automatically updated.
 * For ongoing updates: a league admin can supply official FA Full-Time
 * Media > Code Snippets embed code; obtain approval before using it.
 */
const SNAPSHOT = {
  date: "18 October 2026",
  season: "2026/27",
  table: [
    ["TWS Cramptons FC",4,4,0,0,31,1,12],
    ["Kings United FC",4,3,1,0,17,5,10],
    ["Monkton FC",5,3,1,1,10,8,10],
    ["Shrimpos FC",5,3,0,2,10,10,9],
    ["AFC Manston",4,2,1,1,11,5,7],
    ["St Lawrence Tavern FC",4,2,0,2,11,15,6],
    ["Frames United FC",4,1,1,2,7,6,4],
    ["Holman Carpentry FC",2,1,0,1,5,7,3],
    ["Red Arrows FC",4,1,0,3,10,15,3],
    ["Ramsgate Vale FC",4,1,0,3,4,11,3],
    ["Franklins FC",3,0,0,3,1,13,0],
    ["Sandwich Town FC",3,0,0,3,3,24,0]
  ],
  secondClubs: ["Longhead FC","Imperial Bar FC","Birchington FC","Garden Bar FC","Thanet Athletic FC","The Horse & Groom FC","East Kent FC","Minster FC","Sturry FC","St Nicholas at Wade FC"],
  fixtures: [
    ["2026-10-25","AFC Manston","Shrimpos FC"],
    ["2026-10-25","Monkton FC","Franklins FC"],
    ["2026-10-25","Ramsgate Vale FC","Sandwich Town FC"],
    ["2026-10-25","Red Arrows FC","Frames United FC"],
    ["2026-10-25","St Lawrence Tavern FC","Kings United FC"],
    ["2026-10-25","TWS Cramptons FC","Holman Carpentry FC"],
    ["2026-11-01","Frames United FC","AFC Manston"],
    ["2026-11-01","Kings United FC","Franklins FC"],
    ["2026-11-01","Monkton FC","Holman Carpentry FC"],
    ["2026-11-01","Shrimpos FC","TWS Cramptons FC"],
    ["2026-11-01","St Lawrence Tavern FC","Ramsgate Vale FC"]
  ],
  results: [
    ["2026-10-18","Shrimpos FC","Monkton FC",0,2,"league"],
    ["2026-10-18","Cheriton AFC","Ramsgate Vale FC",4,5,"cup"],
    ["2026-10-18","Frames United FC","Dover Knockabout AFC",0,5,"cup"],
    ["2026-10-18","Franklins FC","Couch to Premiership FC",1,0,"cup"],
    ["2026-10-18","Holman Carpentry FC","Hillborough FC",4,3,"cup"],
    ["2026-10-18","Sandwich Town FC","Roar FC",13,1,"cup"],
    ["2026-10-18","Shepherdswell Spartans FC","Red Arrows FC",4,0,"cup"],
    ["2026-10-11","Franklins FC","Red Arrows FC",0,7,"league"],
    ["2026-10-11","Holman Carpentry FC","Ramsgate Vale FC",2,1,"league"],
    ["2026-10-11","Kings United FC","AFC Manston",1,1,"league"],
    ["2026-10-11","Sandwich Town FC","Shrimpos FC",1,4,"league"],
    ["2026-10-11","St Lawrence Tavern FC","Frames United FC",0,3,"league"],
    ["2026-10-11","TWS Cramptons FC","Monkton FC",3,0,"league"],
    ["2026-10-04","Frames United FC","Kings United FC",2,3,"league"],
    ["2026-10-04","Franklins FC","Shrimpos FC",1,4,"league"],
    ["2026-10-04","Monkton FC","Sandwich Town FC",4,2,"league"],
    ["2026-10-04","Ramsgate Vale FC","TWS Cramptons FC",0,4,"league"]
  ]
};
const el = (id) => document.getElementById(id);
const safe = (s) => String(s).replace(/[&<>"']/g, (x) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
function prettyDate(ymd,format="short") {
  const d=new Date(ymd+"T12:00:00");
  return new Intl.DateTimeFormat("en-GB",format==="full"?{weekday:"long",day:"numeric",month:"long",year:"numeric"}:{weekday:"short",day:"numeric",month:"short" }).format(d);
}
function initials(s) {return s.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();}
function tableHTML(rows,cutoff) {
  if(!rows.length)return '<div class="empty">Second Division standings are awaiting a confirmed FA Full-Time feed. <a href="https://fulltime.thefa.com/index.html?league=391033232" target="_blank" rel="noopener noreferrer">View the current official table ↗</a></div>';
  const items=typeof cutoff==="number"?rows.slice(0,cutoff):rows;
  return '<table class="standings"><thead><tr><th scope="col">Pos</th><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GF</th><th scope="col">GA</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead><tbody>'+items.map((r,i)=>'<tr><td><span class="position-pill">'+(i+1)+'</span></td><td><span class="team-circle" aria-hidden="true">'+safe(initials(r[0]))+'</span>'+safe(r[0])+'</td>'+r.slice(1,7).map(v=>'<td>'+v+'</td>').join('')+'<td>'+(r[5]-r[6]>0?'+':'')+(r[5]-r[6])+'</td><td>'+r[7]+'</td></tr>').join('')+'</tbody></table>';
}
function resultMini(r) {
  return '<div class="result-mini"><span class="date-small">'+prettyDate(r[0])+' · '+(r[5]==="cup"?"Cup":"League")+'</span><div class="teams-small"><strong>'+safe(r[1])+'</strong><span class="score-mini">'+r[3]+' – '+r[4]+'</span><strong>'+safe(r[2])+'</strong></div></div>';
}
function matchCard(m,isResult) {
  const date=prettyDate(m[0],"full");
  return '<article class="match-card"><div class="match-meta"><span>'+safe(date)+'</span><b>'+(isResult?(m[5]==="cup"?"CUP":"LEAGUE"):"FIRST DIVISION")+'</b></div><div class="match-row"><strong>'+safe(m[1])+'</strong><span class="score'+(isResult?'':' vs')+'">'+(isResult?m[3]+' – '+m[4]:'VS')+'</span><strong>'+safe(m[2])+'</strong></div><div class="match-bottom">'+(isResult?'Final score · 18 Oct data snapshot':'Kick-off time and venue on FA Full-Time')+'</div></article>';
}
function renderFixtures(){
  const selected=el("fixture-team").value;
  const matches=SNAPSHOT.fixtures.filter(x=>!selected||x[1]===selected||x[2]===selected);
  el("fixtures-list").innerHTML=matches.length?matches.map(x=>matchCard(x,false)).join(""):'<div class="empty">No listed fixtures for this club in the snapshot. Check the latest FA Full-Time list for updates.</div>';
}
function renderResults(){
  const selected=el("results-competition").value;
  const matches=SNAPSHOT.results.filter(x=>selected==="all"||x[5]===selected);
  el("results-list").innerHTML=matches.map(x=>matchCard(x,true)).join("");
}
function renderClubs(division){
  const list=division==="first"?SNAPSHOT.table.map(x=>x[0]):SNAPSHOT.secondClubs;
  el("clubs-grid").innerHTML=list.map(name=>'<div class="club-card"><span class="team-circle" aria-hidden="true">'+safe(initials(name))+'</span><span>'+safe(name)+'<small>'+(division==="first"?"First Division":"Second Division — confirm with league")+'</small></span></div>').join("");
}
function renderTable(division){
  el("division-heading").textContent=division==="first"?"First Division":"Second Division";
  el("full-table").innerHTML=tableHTML(division==="first"?SNAPSHOT.table:[]);
  el("table-note").textContent=division==="first"?"League table snapshot verified on 18 October 2026. Positions and points may have changed.":"Second Division statistics are not included until the league provides a verified official feed.";
}
document.addEventListener("DOMContentLoaded",()=>{
  const year = el("year");
  if(year) year.textContent = new Date().getFullYear();

  // Each real page loads only its own widgets. Never assume the other pages' IDs exist.
  const overviewTable = el("overview-table");
  const overviewResults = el("overview-results");
  const cupResults = el("cup-results");
  if(overviewTable) overviewTable.innerHTML = tableHTML(SNAPSHOT.table,6);
  if(overviewResults) overviewResults.innerHTML = SNAPSHOT.results.slice(0,5).map(resultMini).join("");
  if(cupResults) cupResults.innerHTML = SNAPSHOT.results.filter(x=>x[5]==="cup").slice(0,5).map(resultMini).join("");

  const heroDate = el("hero-fixture-date"), heroFixtures = el("hero-fixtures");
  if(heroDate && heroFixtures && SNAPSHOT.fixtures.length){
    const near=SNAPSHOT.fixtures.slice(0,3);
    heroDate.textContent=prettyDate(near[0][0],"full").toUpperCase();
    heroFixtures.innerHTML=near.map(x=>'<div class="small-match"><span class="team">'+safe(x[1])+'</span><span class="vs">VS</span><span class="team">'+safe(x[2])+'</span></div>').join("");
  }

  const fixtureTeam = el("fixture-team");
  if(fixtureTeam && el("fixtures-list")){
    const teams=Array.from(new Set(SNAPSHOT.fixtures.flatMap(x=>[x[1],x[2]]))).sort();
    fixtureTeam.innerHTML='<option value="">All clubs</option>'+teams.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join("");
    fixtureTeam.addEventListener("change",renderFixtures);
    renderFixtures();
  }

  const resultSelect=el("results-competition");
  if(resultSelect && el("results-list")){
    resultSelect.addEventListener("change",renderResults);
    renderResults();
  }

  if(el("full-table")){
    renderTable("first");
    document.querySelectorAll("[data-division]").forEach(btn=>btn.addEventListener("click",()=>{
      document.querySelectorAll("[data-division]").forEach(x=>{
        x.classList.toggle("active",x===btn);
        x.setAttribute("aria-pressed",x===btn?"true":"false");
      });
      renderTable(btn.dataset.division);
    }));
  }

  if(el("clubs-grid")){
    renderClubs("first");
    document.querySelectorAll("[data-clubs]").forEach(btn=>btn.addEventListener("click",()=>{
      document.querySelectorAll("[data-clubs]").forEach(x=>{
        x.classList.toggle("active",x===btn);
        x.setAttribute("aria-pressed",x===btn?"true":"false");
      });
      renderClubs(btn.dataset.clubs);
    }));
  }

  const btn=el("menu-button"),nav=el("main-nav");
  if(btn && nav){
    const closeMenu=()=>{
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded","false");
    };
    btn.addEventListener("click",()=>{
      const open=btn.getAttribute("aria-expanded")!=="true";
      btn.setAttribute("aria-expanded",String(open));
      nav.classList.toggle("open",open);
    });
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
    document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu();});
  }
});
