"use strict";
/**
 * Individual club profiles. URL: club.html?club=<stable profileSlug>
 * Everything is calculated from data/league-data.js. No invented fixtures,
 * manager, ground, league form, or contact details.
 */
(function () {
  const byId=(id)=>document.getElementById(id);
  const clubById=Object.fromEntries(window.TSL_DATA.clubs.map(c=>[c.id,c]));
  const clean=(s)=>String(s==null?"":s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const dateLabel=(date)=>new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  const empty=(message)=>'<p class="profile-empty">'+clean(message)+'</p>';
  const name=(id)=>clubById[id]?.name||"Club not listed";
  const main=()=>window.TSL_DATA;

  function crest(club) {
    if(club.badge) return '<img src="./'+clean(club.badge)+'" alt="" loading="eager" decoding="async">';
    return '<span class="profile-fallback-letters">'+clean(initials(club.name))+'</span>';
  }
  function matchHTML(match) {
    const finished=match.status==="final";
    const result=finished?String(match.homeScore)+" – "+String(match.awayScore):"VS";
    const type=match.competition==="cup"?"Cup":"League";
    return '<article class="profile-match">'+
      '<div class="profile-match-meta"><span>'+clean(dateLabel(match.date))+'</span><span>'+type+'</span></div>'+
      '<div class="profile-match-line">'+
        '<span class="profile-team-home">'+badgeTeam(name(match.homeId),"xs","home")+'</span>'+
        '<span class="profile-match-score'+(finished?' final':'')+'">'+result+'</span>'+
        '<span class="profile-team-away">'+badgeTeam(name(match.awayId),"xs","away")+'</span>'+
      '</div></article>';
  }
  function resultsFor(clubId,kind) {
    return main().matches.filter(m=>(m.homeId===clubId||m.awayId===clubId)&&m.status===kind)
      .slice().sort((a,b)=>kind==="scheduled"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
  }
  function renderStats(club) {
    const table=main().standings[club.division]||[];
    const ix=table.findIndex(x=>x.clubId===club.id);
    const rec=table[ix];
    if(!rec) {
      return '<div class="profile-stat-unavailable"><strong>No confirmed standings yet</strong><span>The Second Division league table is awaiting verified data. This club\'s position and statistics are not available.</span></div>';
    }
    const gd=rec.goalsFor-rec.goalsAgainst;
    return [
      {value:String(ix+1),label:"League position"},
      {value:String(rec.played),label:"Played"},
      {value:String(rec.points),label:"Points"},
      {value:(gd>0?"+":"")+String(gd),label:"Goal difference"}
    ].map(x=>'<div class="profile-stat"><strong>'+x.value+'</strong><span>'+x.label+'</span></div>').join('');
  }
  function renderForm(id) {
    const games=resultsFor(id,"final").filter(m=>m.competition==="league").slice(0,5);
    if(!games.length) return empty("No league results are available for this club in the saved snapshot.");
    const buttons=games.map(m=>{
      const own=m.homeId===id?m.homeScore:m.awayScore;
      const other=m.homeId===id?m.awayScore:m.homeScore;
      const tag=own>other?"W":own<other?"L":"D";
      const opponent=name(m.homeId===id?m.awayId:m.homeId);
      const full=tag==="W"?"Win":tag==="L"?"Loss":"Draw";
      return '<span class="form-chip form-'+tag.toLowerCase()+'" title="'+clean(full+" vs "+opponent)+'" aria-label="'+clean(full+" against "+opponent)+'">'+tag+'</span>';
    }).join("");
    return '<div class="form-row">'+buttons+'</div><p class="form-summary">Most recent recorded league result first · '+games.length+' match'+(games.length===1?"":"es")+' available.</p>';
  }
  function renderDetails(club) {
    const ground=club.homeGround?clean(club.homeGround):"Not yet confirmed";
    const website=club.website && /^https:\/\//i.test(club.website)?'<a href="'+clean(club.website)+'" target="_blank" rel="noopener noreferrer">Club website ↗</a>':"Not yet supplied";
    const division=main().divisionLabels[club.division]||"Division not confirmed";
    return '<dl class="club-facts"><div><dt>Division</dt><dd>'+clean(division)+'</dd></div><div><dt>Home ground</dt><dd>'+ground+'</dd></div><div><dt>Website</dt><dd>'+website+'</dd></div></dl>';
  }
  function showClub() {
    const id=new URLSearchParams(window.location.search).get("club");
    const club=main().clubs.find(c=>c.profileSlug===id && (c.division==="first"||c.division==="second"));
    if(!club) {
      byId("profile-title").textContent="Club not found";
      byId("profile-breadcrumb").textContent="Club not found";
      byId("profile-status").innerHTML='<p>This club profile is not available. <a href="./clubs.html">View the club directory ↗</a></p>';
      document.title="Club not found | Thanet Sunday Football League";
      return;
    }
    document.title=club.name+" | Thanet Sunday Football League";
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute("content",club.name+": fixtures, results, recorded form and 2026/27 league standings (18 October 2026 snapshot).");
    byId("profile-title").textContent=club.name;
    byId("profile-breadcrumb").textContent=club.name;
    byId("profile-division").textContent=main().divisionLabels[club.division]||"League club";
    byId("profile-crest").innerHTML=crest(club);
    byId("profile-stats").innerHTML=renderStats(club);

    const scheduled=resultsFor(club.id,"scheduled").slice(0,5);
    const finished=resultsFor(club.id,"final").slice(0,5);
    byId("profile-fixtures").innerHTML=scheduled.length?scheduled.map(matchHTML).join(""):empty("No upcoming fixtures for this club in the saved schedule. Check FA Full-Time for updates.");
    byId("profile-results").innerHTML=finished.length?finished.map(matchHTML).join(""):empty("No match results for this club in the saved snapshot.");
    byId("profile-form").innerHTML=renderForm(club.id);
    byId("profile-details").innerHTML=renderDetails(club);
    byId("profile-content").hidden=false;
    byId("profile-status").hidden=true;
  }
  document.addEventListener("DOMContentLoaded",showClub);
})();
