"use strict";
/** All club names, crests, standings and match records come from data/league-data.js. */
const LEAGUE=window.TSL_DATA;
if(!LEAGUE||LEAGUE.schemaVersion!==1) throw new Error("Canonical league data missing");
const CLUBS_BY_ID=Object.fromEntries(LEAGUE.clubs.map(c=>[c.id,c]));
const CLUBS_BY_NAME=Object.fromEntries(LEAGUE.clubs.map(c=>[c.name,c]));
const clubName=id=>CLUBS_BY_ID[id]?.name||"Unlisted club";
function matchesForClub(clubId){return LEAGUE.matches.filter(m=>m.homeId===clubId||m.awayId===clubId);}
const SNAPSHOT={
 date:"18 October 2026",season:LEAGUE.season,
 table:LEAGUE.standings.first.map(r=>[clubName(r.clubId),r.played,r.won,r.drawn,r.lost,r.goalsFor,r.goalsAgainst,r.points]),
 secondClubs:LEAGUE.clubs.filter(c=>c.division==="second").map(c=>c.name),
 fixtures:LEAGUE.matches.filter(m=>m.status==="scheduled").map(m=>[m.date,clubName(m.homeId),clubName(m.awayId)]),
 results:LEAGUE.matches.filter(m=>m.status==="final").map(m=>[m.date,clubName(m.homeId),clubName(m.awayId),m.homeScore,m.awayScore,m.competition])
};
const el = (id) => document.getElementById(id);
const safe = (s) => String(s).replace(/[&<>"']/g, (x) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
function prettyDate(ymd,format="short") {
  const d=new Date(ymd+"T12:00:00");
  return new Intl.DateTimeFormat("en-GB",format==="full"?{weekday:"long",day:"numeric",month:"long",year:"numeric"}:{weekday:"short",day:"numeric",month:"short" }).format(d);
}
function initials(s) {return s.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();}
const CLUB_BADGES=Object.fromEntries(LEAGUE.clubs.filter(c=>c.badge).map(c=>[c.name,c.badge]));
function teamBadge(name,size="sm"){const file=CLUB_BADGES[name];return file?'<span class="badge-icon badge-'+size+'"><img src="./'+file+'" alt="'+safe(name)+' crest" loading="lazy" decoding="async"></span>':'<span class="team-circle" aria-hidden="true">'+safe(initials(name))+'</span>';}
function profileHref(name){const c=CLUBS_BY_NAME[name];return c&&c.division?"./club.html?club="+encodeURIComponent(c.profileSlug):null;}
function clubInline(name,size="xs"){
 const body=teamBadge(name,size)+'<span>'+safe(name)+'</span>',url=profileHref(name);
 return url?'<a class="badge-table-club club-profile-link" href="'+url+'" aria-label="View '+safe(name)+' profile">'+body+'</a>':'<span class="badge-table-club">'+body+'</span>';
}
function badgeTeam(name,size="sm",side="home"){
 const body=teamBadge(name,size)+'<span>'+safe(name)+'</span>',url=profileHref(name);
 return url?'<a class="badge-team '+side+' club-profile-link" href="'+url+'" aria-label="View '+safe(name)+' profile">'+body+'</a>':'<span class="badge-team '+side+'">'+body+'</span>';
}
function miniFixture(m){return '<div class="small-match"><span class="team">'+badgeTeam(m[1],"xs","home")+'</span><span class="vs">VS</span><span class="team">'+badgeTeam(m[2],"xs","away")+'</span></div>';}
function tableHTML(rows,cutoff){
 if(!rows.length)return '<div class="empty">Second Division standings are awaiting a confirmed FA Full-Time feed. <a href="https://fulltime.thefa.com/index.html?league=391033232" target="_blank" rel="noopener noreferrer">View the current official table ↗</a></div>';
 const items=typeof cutoff==="number"?rows.slice(0,cutoff):rows;
 return '<table class="standings"><thead><tr><th scope="col">Pos</th><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GF</th><th scope="col">GA</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead><tbody>'
 +items.map((r,i)=>'<tr><td><span class="position-pill">'+(i+1)+'</span></td><td>'+clubInline(r[0],"xs")+'</td>'
 +r.slice(1,7).map(v=>'<td>'+v+'</td>').join('')+'<td>'+(r[5]-r[6]>0?'+':'')+(r[5]-r[6])+'</td><td>'+r[7]+'</td></tr>').join('')+'</tbody></table>';
}
function resultMini(r){return '<div class="result-mini"><span class="date-small">'+prettyDate(r[0])+' · '+(r[5]==="cup"?"Cup":"League")+'</span><div class="teams-small"><strong class="badge-mini-home">'+badgeTeam(r[1],"xs","home")+'</strong><span class="score-mini">'+r[3]+' – '+r[4]+'</span><strong class="badge-mini-away">'+badgeTeam(r[2],"xs","away")+'</strong></div></div>';}
function matchCard(m,isResult){
 const date=prettyDate(m[0],"full");
 return '<article class="match-card"><div class="match-meta"><span>'+safe(date)+'</span><b>'+(isResult?(m[5]==="cup"?"CUP":"LEAGUE"):"FIRST DIVISION")+'</b></div><div class="match-row"><strong class="badge-match-home">'+badgeTeam(m[1],"sm","home")+'</strong><span class="score'+(isResult?'':' vs')+'">'+(isResult?m[3]+' – '+m[4]:'VS')+'</span><strong class="badge-match-away">'+badgeTeam(m[2],"sm","away")+'</strong></div><div class="match-bottom">'+(isResult?'Final score · 18 Oct data snapshot':'Kick-off time and venue on FA Full-Time')+'</div></article>';
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
 el("clubs-grid").innerHTML=list.map(name=>{
 const body=teamBadge(name,"lg")+'<span>'+safe(name)+'<small>'+(division==="first"?"First Division":"Second Division — confirm with league")+'</small></span>';
 const url=profileHref(name);
 return url?'<a class="club-card club-profile-link" href="'+url+'" aria-label="View '+safe(name)+' profile">'+body+'<span class="club-go" aria-hidden="true">↗</span></a>':'<div class="club-card">'+body+'</div>';
 }).join("");
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
    heroFixtures.innerHTML=near.map(miniFixture).join("");
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


// Upgrade any legacy hash navigation left by a cached home-page template.
document.addEventListener("DOMContentLoaded",()=>{
  const routes=new Set(["home","tables","fixtures","results","cups","clubs","news","about"]);
  document.querySelectorAll("header .nav a, footer a, .logo").forEach(link=>{
    const original=link.getAttribute("href")||"";
    const slug=original.startsWith("#")?original.slice(1):"";
    if(routes.has(slug))link.setAttribute("href","./"+(slug==="home"?"index":slug)+".html");
  });
});
