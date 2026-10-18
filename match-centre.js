"use strict";
/** Match centre: all facts come from one saved fixture/result in data/league-data.js. */
(function(){
  const db=window.TSL_DATA;
  const byId=id=>document.getElementById(id);
  const clean=value=>String(value==null?"":value).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const clubs=Object.fromEntries(db.clubs.map(c=>[c.id,c]));
  const name=id=>clubs[id]?.name||"Unknown club";
  const dateText=d=>new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const kind=m=>m.competition==="cup"?"Cup competition":"League";
  const detailsLink=(c)=>{
    const href=profileHref(c.name);
    const badge=c.badge?'<img src="./'+clean(c.badge)+'" loading="lazy" decoding="async" alt="">':'<span class="match-page-initials">'+clean(initials(c.name))+'</span>';
    const body='<span class="match-page-crest">'+badge+'</span><strong>'+clean(c.name)+'</strong>';
    return href?'<a class="match-club-link" href="'+href+'" aria-label="View '+clean(c.name)+' profile">'+body+'</a>':'<div class="match-club-link">'+body+'</div>';
  };
  const facts=match=>{
    const played=match.status==="final";
    const rows=[
      ["Competition",kind(match)+(match.competition==="league"&&match.division&&db.divisionLabels[match.division]?" · "+db.divisionLabels[match.division]:"")],
      ["Match date",dateText(match.date)]
    ];
    if(played){
      rows.push(["Final score",match.homeScore+" – "+match.awayScore]);
      // An unknown kick-off or ground is irrelevant to a completed scorecard.
      if(match.kickoff)rows.push(["Kick-off",match.kickoff]);
      if(match.venue)rows.push(["Venue",match.venue]);
      rows.push(["Status","Result recorded"]);
    }else{
      rows.push(["Kick-off",match.kickoff||"To be confirmed"]);
      rows.push(["Venue",match.venue||"To be confirmed"]);
      rows.push(["Status","Scheduled at the saved snapshot date"]);
    }
    rows.push(["Information source",db.source.name+" · snapshot "+db.snapshotDate.split("-").reverse().join("/")]);
    return '<dl class="match-facts">'+rows.map(x=>'<div><dt>'+clean(x[0])+'</dt><dd>'+clean(x[1])+'</dd></div>').join("")+'</dl>';
  };
  const relatedMatches=match=>{
    const other=db.matches.filter(m=>m.id!==match.id &&
      ((m.homeId===match.homeId&&m.awayId===match.awayId)||
       (m.homeId===match.awayId&&m.awayId===match.homeId)))
      .slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    if(!other.length)return '<p class="profile-empty">No other meetings between these clubs are recorded in this snapshot.</p>';
    return other.map(m=>{
      const score=m.status==="final"?clean(m.homeScore)+" – "+clean(m.awayScore):"VS";
      return '<article class="related-match"><div class="related-match-date">'+clean(dateText(m.date))+'</div>'+
        '<div class="related-match-row"><span>'+clean(name(m.homeId))+'</span>'+
        matchScoreLink(m.id,'<span class="match-page-related-score">'+score+'</span>',name(m.homeId),name(m.awayId),"match-score-mini")+
        '<span>'+clean(name(m.awayId))+'</span></div></article>';
    }).join("");
  };
  function start(){
    const matchId=new URLSearchParams(window.location.search).get("match");
    const match=db.matches.find(m=>m.id===matchId);
    if(!match){
      byId("match-title").textContent="Match not found";
      byId("match-alert").innerHTML='That match is not included in this saved record. <a href="./fixtures.html">Browse fixtures</a> or <a href="./results.html">results</a>.';
      byId("match-date-summary").textContent="No match details available";
      document.title="Match not found | Thanet Sunday Football League";
      return;
    }
    const home=clubs[match.homeId],away=clubs[match.awayId];
    if(!home||!away){
      byId("match-title").textContent="Match information unavailable";
      byId("match-alert").textContent="This fixture references an unknown club.";
      return;
    }
    const final=match.status==="final";
    const pageType=final?"Result":"Fixture";
    const back=final?"./results.html":"./fixtures.html";
    byId("match-title").textContent=pageType+" · "+db.season;
    byId("match-details-title").textContent=final?"Result details":"Fixture details";
    byId("match-competition").textContent="MATCH CENTRE · "+kind(match).toUpperCase();
    byId("match-home").innerHTML=detailsLink(home);
    byId("match-away").innerHTML=detailsLink(away);
    byId("match-score").textContent=final?match.homeScore+" – "+match.awayScore:"VS";
    byId("match-status").textContent=final?"Full-time":"Scheduled";
    byId("match-date-summary").textContent=dateText(match.date)+(final?"":(match.kickoff?" · "+match.kickoff:" · Kick-off to be confirmed"));
    byId("match-back-crumb").href=back;
    byId("match-back-crumb").textContent=final?"Results":"Fixtures";
    byId("match-return").href=back;
    byId("match-return").textContent=final?"← Back to results":"← Back to fixtures";
    byId("match-facts").innerHTML=facts(match);
    byId("match-related").innerHTML=relatedMatches(match);
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute("content",name(match.homeId)+" v "+name(match.awayId)+": "+kind(match)+" on "+dateText(match.date)+". Dated "+db.snapshotDate+" snapshot.");
    document.title=name(match.homeId)+" v "+name(match.awayId)+" | Thanet Sunday Football League";
    byId("match-alert").textContent="This page uses the 18 October 2026 snapshot. Check FA Full-Time for changes, times or postponed matches.";
    byId("match-content").hidden=false;
  }
  document.addEventListener("DOMContentLoaded",start);
})();
