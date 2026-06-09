import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "";

// flags for the side-bet icons + live score teams
const FLAG = {
  "Mexico":"🇲🇽","South Korea":"🇰🇷","South Africa":"🇿🇦","Czechia":"🇨🇿","Canada":"🇨🇦",
  "Switzerland":"🇨🇭","Qatar":"🇶🇦","Bosnia-Herzegovina":"🇧🇦","Brazil":"🇧🇷","Morocco":"🇲🇦",
  "Scotland":"🏴","Haiti":"🇭🇹","United States":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺",
  "Türkiye":"🇹🇷","Germany":"🇩🇪","Ecuador":"🇪🇨","Ivory Coast":"🇨🇮","Curaçao":"🇨🇼",
  "Netherlands":"🇳🇱","Japan":"🇯🇵","Tunisia":"🇹🇳","Sweden":"🇸🇪","Belgium":"🇧🇪","Iran":"🇮🇷",
  "Egypt":"🇪🇬","New Zealand":"🇳🇿","Spain":"🇪🇸","Uruguay":"🇺🇾","Saudi Arabia":"🇸🇦",
  "Cape Verde":"🇨🇻","France":"🇫🇷","Senegal":"🇸🇳","Norway":"🇳🇴","Iraq":"🇮🇶","Argentina":"🇦🇷",
  "Austria":"🇦🇹","Algeria":"🇩🇿","Jordan":"🇯🇴","Portugal":"🇵🇹","Colombia":"🇨🇴",
  "Uzbekistan":"🇺🇿","DR Congo":"🇨🇩","England":"🏴","Croatia":"🇭🇷","Panama":"🇵🇦","Ghana":"🇬🇭",
};

const C = { ink:"#0E1B2A", paper:"#F4EFE6", grass:"#0B6E4F", grassDk:"#084d37",
  gold:"#E8B53A", red:"#C8472E", line:"#d8cfbf", mute:"#6b7d72", live:"#C8472E" };
const F_DISP = "'Bebas Neue','Arial Narrow',sans-serif";
const F_BODY = "'DM Sans',system-ui,sans-serif";

export default function App(){
  const [tab,setTab] = useState("standings");   // standings | scores
  const [board,setBoard] = useState(null);
  const [live,setLive] = useState(null);
  const [err,setErr] = useState(null);

  async function load(){
    try{
      const [s,l] = await Promise.all([
        fetch(`${API}/scores`).then(r=>r.json()),
        fetch(`${API}/live`).then(r=>r.json()),
      ]);
      setBoard(s); setLive(l); setErr(null);
    }catch(e){ setErr("Couldn't reach the server. Pull to retry."); }
  }
  useEffect(()=>{ load(); const t=setInterval(load, 60*1000); return ()=>clearInterval(t); },[]);

  return (
    <div style={{fontFamily:F_BODY,color:C.ink,background:C.paper,minHeight:"100vh",
      maxWidth:430,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes blink{50%{opacity:.35}} .livedot{animation:blink 1.4s infinite}`}</style>

      {/* header */}
      <div style={{padding:"18px 16px 10px",textAlign:"center"}}>
        <div style={{fontFamily:F_DISP,fontSize:34,letterSpacing:1,lineHeight:.9}}>TLFKATL</div>
        <div style={{color:C.grass,fontWeight:700,letterSpacing:2.5,fontSize:11,marginTop:3}}>WORLD CUP 2026</div>
      </div>

      {/* tabs */}
      <div style={{display:"flex",gap:8,padding:"0 16px 12px",position:"sticky",top:0,
        background:C.paper,zIndex:5}}>
        {[["standings","Leaderboard"],["scores","Live Scores"]].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            flex:1,padding:"11px",borderRadius:11,border:`1.5px solid ${tab===k?C.grass:C.line}`,
            background:tab===k?C.grass:"#fff",color:tab===k?"#fff":C.ink,fontWeight:700,
            fontSize:14,fontFamily:F_BODY,cursor:"pointer"}}>{lbl}</button>
        ))}
      </div>

      <div style={{padding:"0 16px 40px"}}>
        {err && <div style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:12,
          padding:16,color:C.red,fontSize:14}}>{err}</div>}

        {tab==="standings" && <Leaderboard board={board} />}
        {tab==="scores" && <LiveScores live={live} />}
      </div>
    </div>
  );
}

function Leaderboard({board}){
  if(!board) return <Loading label="Loading standings…" />;
  const rows = board.leaderboard || [];
  // daily mover: highest single points value gets the flame (snapshot proxy until deltas exist)
  const topPts = Math.max(...rows.map(r=>r.points), 0);
  const anyPoints = topPts>0;

  return (
    <div>
      {!anyPoints && (
        <div style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:12,
          padding:16,fontSize:13.5,color:C.mute,marginBottom:12,lineHeight:1.5}}>
          Everyone's locked in at zero. Points start moving when the first games kick off June 11.
        </div>
      )}
      {rows.map((r,i)=>(
        <div key={r.username} style={{display:"flex",alignItems:"center",gap:11,
          background:"#fff",border:`1px solid ${C.line}`,borderRadius:13,padding:"11px 13px",marginBottom:8}}>
          <div style={{fontFamily:F_DISP,fontSize:26,minWidth:30,textAlign:"center",
            color:i===0?C.gold:i===1?"#9aa5a0":i===2?"#b08d57":C.mute}}>{i+1}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14.5,whiteSpace:"nowrap",overflow:"hidden",
              textOverflow:"ellipsis"}}>
              {r.username}{anyPoints && r.points===topPts && <span title="top scorer"> 🔥</span>}
            </div>
            <div style={{fontSize:12,color:C.mute,marginTop:2,display:"flex",gap:9}}>
              <span title="dark horse">🐴 {FLAG[r.darkhorse]||"—"}</span>
              <span title="flop">💀 {FLAG[r.flop]||"—"}</span>
              <span title="golden boot" style={{whiteSpace:"nowrap",overflow:"hidden",
                textOverflow:"ellipsis",maxWidth:120}}>👟 {r.goldenboot||"—"}</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:F_DISP,fontSize:28,lineHeight:.9,color:C.grass}}>{r.points}</div>
            <div style={{fontSize:10,color:C.mute,letterSpacing:.5}}>PTS</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveScores({live}){
  if(!live) return <Loading label="Loading scores…" />;
  const matches = (live.matches||[]).slice().sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));

  // group by calendar day
  const days = {};
  for(const m of matches){
    const d = new Date(m.datetime).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
    (days[d] = days[d] || []).push(m);
  }
  const live_now = matches.filter(m=>m.status==="in_progress");

  return (
    <div>
      {live_now.length>0 && (
        <div style={{fontSize:12,fontWeight:700,color:C.live,letterSpacing:1,marginBottom:8}}>
          <span className="livedot">●</span> {live_now.length} LIVE NOW
        </div>
      )}
      {Object.entries(days).map(([day,ms])=>(
        <div key={day} style={{marginBottom:18}}>
          <div style={{fontFamily:F_DISP,fontSize:20,letterSpacing:.5,color:C.mute,marginBottom:8}}>{day}</div>
          {ms.map(m=>{
            const playing = m.status==="in_progress";
            const done = m.status==="completed";
            const t = new Date(m.datetime).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
            return (
              <div key={m.gid} style={{background:"#fff",border:`1px solid ${playing?C.live:C.line}`,
                borderRadius:12,padding:"10px 13px",marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.mute,letterSpacing:.5}}>GRP {m.group}</span>
                  {playing ? <span style={{fontSize:11,color:C.live,fontWeight:700}}><span className="livedot">●</span> LIVE</span>
                    : done ? <span style={{fontSize:11,color:C.mute}}>FT</span>
                    : <span style={{fontSize:11,color:C.mute}}>{t}</span>}
                </div>
                <Row team={m.home} flag={FLAG[m.home]} score={m.homeScore} show={playing||done}/>
                <Row team={m.away} flag={FLAG[m.away]} score={m.awayScore} show={playing||done}/>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Row({team,flag,score,show}){
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}>
      <span style={{fontSize:14,fontWeight:600}}>{flag} {team}</span>
      <span style={{fontFamily:F_DISP,fontSize:22,color:show?C.ink:"transparent"}}>{show?(score??0):"–"}</span>
    </div>
  );
}

function Loading({label}){
  return <div style={{textAlign:"center",padding:"50px 0",color:C.mute,fontSize:14}}>{label}</div>;
}
