"use strict";
/** All club names, crests, standings and match records come from data/league-data.js. */
const LEAGUE=window.TSL_DATA;
if(!LEAGUE||LEAGUE.schemaVersion!==1) throw new Error("Canonical league data missing");
const CLUBS_BY_ID=Object.fromEntries(LEAGUE.clubs.map(c=>[c.id,c]));
const CLUBS_BY_NAME=Object.fromEntries(LEAGUE.clubs.map(c=>[c.name,c]));
const clubName=id=>CLUBS_BY_ID[id]?.name||"Unlisted club";
function matchesForClub(clubId){return LEAGUE.matches.filter(m=>m.homeId===clubId||m.awayId===clubId);}
const COMPETITIONS=LEAGUE.competitions||[];
const COMP_BY_ID=Object.fromEntries(COMPETITIONS.map(c=>[c.id,c]));
const MATCH_BY_ID=Object.fromEntries(LEAGUE.matches.map(m=>[m.id,m]));
function matchCompetition(m){return COMP_BY_ID[m.competitionId]||null;}
function competitionText(id){const c=COMP_BY_ID[id];return c?c.name:"Competition to confirm";}
function selectOptions(includeAll=true){
 return (includeAll?'<option value="all">All competitions</option>':'')+
 COMPETITIONS.map(c=>'<option value="'+safe(c.id)+'">'+safe(c.name)+(c.verification==="historical-name-pending-2026"?" (2026/27 pending)":"")+'</option>').join("");
}
function matchDisplay(m){return m.status==="final"?[m.date,clubName(m.homeId),clubName(m.awayId),m.homeScore,m.awayScore,m.competition,m.id]:[m.date,clubName(m.homeId),clubName(m.awayId),m.id];}
function filteredMatches(status,division,comp,team){
 return LEAGUE.matches.filter(m=>m.status===status &&
 (division==="all"||m.division===division) &&
 (comp==="all"||m.competitionId===comp) &&
 (!team||m.homeId===team||m.awayId===team))
 .slice().sort((a,b)=>status==="final"?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function renderMatchList(id,rows,empty){el(id).innerHTML=rows.length?rows.map(m=>matchCard(matchDisplay(m),m.status==="final")).join(""):'<p class="empty">'+safe(empty)+'</p>';}
function savedDate(date){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00"));}
function verifiedDate(section){return (LEAGUE.verification||{})[section]||LEAGUE.snapshotDate;}
const SNAPSHOT={
 date:savedDate(LEAGUE.snapshotDate),season:LEAGUE.season,
 table:LEAGUE.standings.first.map(r=>[clubName(r.clubId),r.played,r.won,r.drawn,r.lost,r.goalsFor,r.goalsAgainst,r.points]),
 secondClubs:LEAGUE.clubs.filter(c=>c.division==="second").map(c=>c.name),
 fixtures:LEAGUE.matches.filter(m=>m.status==="scheduled").slice().sort((a,b)=>a.date.localeCompare(b.date)).map(m=>[m.date,clubName(m.homeId),clubName(m.awayId),m.id]),
 results:LEAGUE.matches.filter(m=>m.status==="final").slice().sort((a,b)=>b.date.localeCompare(a.date)).map(m=>[m.date,clubName(m.homeId),clubName(m.awayId),m.homeScore,m.awayScore,m.competition,m.id])
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
function matchHref(id){return id&&LEAGUE.matches.some(m=>m.id===id)?"./match.html?match="+encodeURIComponent(id):null;}
function matchScoreLink(id,content,home,away,cls=""){
 const url=matchHref(id),label="View match details: "+home+" versus "+away;
 return url?'<a class="match-score-link '+cls+'" href="'+url+'" aria-label="'+safe(label)+'">'+content+'</a>':content;
}
function miniFixture(m){
 return '<div class="small-match"><span class="team">'+badgeTeam(m[1],"xs","home")+'</span>'+
 matchScoreLink(m[3],'<span class="vs">VS</span>',m[1],m[2],"match-score-mini")+
 '<span class="team">'+badgeTeam(m[2],"xs","away")+'</span></div>';
}
function tableHTML(rows,cutoff){
 if(!rows.length)return '<div class="empty">Second Division standings are awaiting a confirmed FA Full-Time feed. <a href="https://fulltime.thefa.com/index.html?league=391033232" target="_blank" rel="noopener noreferrer">View the current official table ↗</a></div>';
 const items=typeof cutoff==="number"?rows.slice(0,cutoff):rows;
 return '<table class="standings"><thead><tr><th scope="col">Pos</th><th scope="col">Club</th><th scope="col">P</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GF</th><th scope="col">GA</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead><tbody>'
 +items.map((r,i)=>'<tr><td><span class="position-pill">'+(i+1)+'</span></td><td>'+clubInline(r[0],"xs")+'</td>'
 +r.slice(1,7).map(v=>'<td>'+v+'</td>').join('')+'<td>'+(r[5]-r[6]>0?'+':'')+(r[5]-r[6])+'</td><td>'+r[7]+'</td></tr>').join('')+'</tbody></table>';
}
function resultMini(r){
 const score=matchScoreLink(r[6],'<span class="score-mini">'+r[3]+' – '+r[4]+'</span>',r[1],r[2],"match-score-mini");
 return '<div class="result-mini"><span class="date-small">'+prettyDate(r[0])+' · '+(r[5]==="cup"?"Cup":"League")+
 '</span><div class="teams-small"><strong class="badge-mini-home">'+badgeTeam(r[1],"xs","home")+'</strong>'+score+
 '<strong class="badge-mini-away">'+badgeTeam(r[2],"xs","away")+'</strong></div></div>';
}
function matchCard(m,isResult){
 const date=prettyDate(m[0],"full");
 const id=isResult?m[6]:m[3];
 const score=matchScoreLink(id,'<span class="score'+(isResult?'':' vs')+'">'+(isResult?m[3]+' – '+m[4]:'VS')+'</span>',m[1],m[2],"match-score-main");
 return '<article class="match-card"><div class="match-meta"><span>'+safe(date)+'</span><b>'+
 safe(competitionText((MATCH_BY_ID[id]||{}).competitionId))+
 '</b></div><div class="match-row"><strong class="badge-match-home">'+badgeTeam(m[1],"sm","home")+
 '</strong>'+score+'<strong class="badge-match-away">'+badgeTeam(m[2],"sm","away")+
 '</strong></div><div class="match-bottom">'+(isResult?'Final score · saved '+savedDate(verifiedDate("results")):'Kick-off time and venue: confirm on FA Full-Time')+
 ' <a class="match-details-link" href="'+matchHref(id)+'">Match details ↗</a></div></article>';
}
function renderFixtures(){
 const team=el("fixture-team")?.value||"";
 const division=el("fixture-division")?.value||"all";
 const competition=el("fixture-competition")?.value||"all";
 const rows=filteredMatches("scheduled",division,competition,team);
 renderMatchList("fixtures-list",rows,"No fixtures match these filters in the saved schedule. Check FA Full-Time for the latest information.");
 if(el("fixture-count"))el("fixture-count").textContent=rows.length+" fixtures found · saved snapshot";
}
function renderResults(){
 const division=el("results-division")?.value||"all";
 const competition=el("results-competition")?.value||"all";
 const rows=filteredMatches("final",division,competition,null);
 renderMatchList("results-list",rows,"No results match these filters in the saved record. Check FA Full-Time for the latest results.");
 if(el("results-count"))el("results-count").textContent=rows.length+" results found · saved snapshot";
}
function renderCups(){
 const root=el("cup-competitions");
 if(!root)return;
 const cups=COMPETITIONS.filter(c=>c.kind==="cup");
 root.innerHTML=cups.map(c=>{
  const count=LEAGUE.matches.filter(m=>m.competitionId===c.id).length;
  const pending=c.verification==="historical-name-pending-2026";
  const sub=pending?"Historical name — 2026/27 details awaiting confirmation":c.verification==="confirmed-existence"?"County competition confirmed; no individual ties verified yet":"County cup ties awaiting precise cup identification";
  return '<a class="cup-tile" href="./cup.html?competition='+encodeURIComponent(c.id)+'"><span class="cup-tile-top">KNOCKOUT FOOTBALL <span aria-hidden="true">↗</span></span><h3>'+safe(c.name)+'</h3><p>'+safe(sub)+'</p><span class="cup-tile-bottom">'+count+' match record'+(count===1?"":"s")+'</span></a>';
 }).join("");
 if(el("cup-results"))el("cup-results").innerHTML=LEAGUE.matches.filter(m=>m.competition==="cup"&&m.status==="final").slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(m=>resultMini(matchDisplay(m))).join("")||'<p class="empty">No saved cup results yet.</p>';
}
function renderClubs(division){
 const list=division==="first"?LEAGUE.clubs.filter(x=>x.division==="first").map(x=>x.name):SNAPSHOT.secondClubs;
 el("clubs-grid").innerHTML=list.map(name=>{
 const body=teamBadge(name,"lg")+'<span>'+safe(name)+'<small>'+(division==="first"?"First Division":"Second Division — confirm with league")+'</small></span>';
 const url=profileHref(name);
 return url?'<a class="club-card club-profile-link" href="'+url+'" aria-label="View '+safe(name)+' profile">'+body+'<span class="club-go" aria-hidden="true">↗</span></a>':'<div class="club-card">'+body+'</div>';
 }).join("");
}
function renderTable(division){
  el("division-heading").textContent=division==="first"?"First Division":"Second Division";
  el("full-table").innerHTML=tableHTML(division==="first"?SNAPSHOT.table:LEAGUE.standings.second.map(r=>[clubName(r.clubId),r.played,r.won,r.drawn,r.lost,r.goalsFor,r.goalsAgainst,r.points]));
  el("table-note").textContent=division==="first"?"First Division standings verified "+savedDate(verifiedDate("first"))+". Not live; positions may have changed.":LEAGUE.standings.second.length?"Second Division standings verified "+savedDate(verifiedDate("second"))+". Not live.":"Second Division statistics are not yet verified. Check official FA Full-Time updates.";
}
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-league-update]").forEach(node=>{
    const dates=LEAGUE.verification||{first:LEAGUE.snapshotDate,second:null,fixtures:LEAGUE.snapshotDate,results:LEAGUE.snapshotDate};
    const known=Object.values(dates).filter(Boolean).sort();
    const latest=known.length?known[known.length-1]:LEAGUE.snapshotDate;
    node.textContent="Latest saved update: "+savedDate(latest)+" · sections may have older data";
  });
  document.querySelectorAll("[data-first-table-date]").forEach(node=>node.textContent=savedDate(verifiedDate("first")).toUpperCase()+" SNAPSHOT");
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

  const fixtureTeam=el("fixture-team");
  if(fixtureTeam && el("fixtures-list")){
    fixtureTeam.innerHTML='<option value="">All clubs</option>'+LEAGUE.clubs.filter(c=>c.division).slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>'<option value="'+safe(c.id)+'">'+safe(c.name)+'</option>').join("");
    if(el("fixture-competition"))el("fixture-competition").innerHTML=selectOptions();
    for(const id of ["fixture-team","fixture-division","fixture-competition"])el(id)?.addEventListener("change",renderFixtures);
    renderFixtures();
  }
  if(el("results-list")){
    if(el("results-competition"))el("results-competition").innerHTML=selectOptions();
    for(const id of ["results-division","results-competition"])el(id)?.addEventListener("change",renderResults);
    renderResults();
  }
  renderCups();

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
