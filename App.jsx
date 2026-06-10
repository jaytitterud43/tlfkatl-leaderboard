import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "";

// ── shared data: groups, flags, pairings (mirrors backend) ──
const GROUPS = {
  A:["Mexico","South Korea","South Africa","Czechia"],
  B:["Canada","Switzerland","Qatar","Bosnia-Herzegovina"],
  C:["Brazil","Morocco","Scotland","Haiti"],
  D:["United States","Paraguay","Australia","Türkiye"],
  E:["Germany","Ecuador","Ivory Coast","Curaçao"],
  F:["Netherlands","Japan","Tunisia","Sweden"],
  G:["Belgium","Iran","Egypt","New Zealand"],
  H:["Spain","Uruguay","Saudi Arabia","Cape Verde"],
  I:["France","Senegal","Norway","Iraq"],
  J:["Argentina","Austria","Algeria","Jordan"],
  K:["Portugal","Colombia","Uzbekistan","DR Congo"],
  L:["England","Croatia","Panama","Ghana"],
};
const PAIRINGS = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
const GLETTERS = Object.keys(GROUPS);
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
function gamesFor(L){
  const t=GROUPS[L];
  return PAIRINGS.map(([i,j],idx)=>({id:`${L}${idx+1}`,home:t[i],away:t[j]}));
}

const C = { ink:"#0E1B2A", paper:"#F4EFE6", grass:"#0B6E4F", grassDk:"#084d37",
  gold:"#E8B53A", red:"#C8472E", line:"#d8cfbf", mute:"#6b7d72", live:"#C8472E" };
const F_DISP="'Bebas Neue','Arial Narrow',sans-serif";
const F_BODY="'DM Sans',system-ui,sans-serif";

export default function App(){
  const [tab,setTab] = useState("home");
  const [me,setMe] = useState(null);            // username string
  const [board,setBoard] = useState(null);
  const [live,setLive] = useState(null);
  const [allPicks,setAllPicks] = useState(null);

  // identity: remembered on device
  useEffect(()=>{ try{ const u=localStorage.getItem("tlfkatl_me"); if(u) setMe(u); }catch(e){} },[]);

  async function load(){
    try{
      const [s,l,p] = await Promise.all([
        fetch(`${API}/scores`).then(r=>r.json()),
        fetch(`${API}/live`).then(r=>r.json()),
        fetch(`${API}/picks`).then(r=>r.json()),
      ]);
      setBoard(s); setLive(l); setAllPicks(p);
    }catch(e){}
  }
  useEffect(()=>{ load(); const t=setInterval(load,60*1000); return ()=>clearInterval(t); },[]);

  function chooseMe(u){ setMe(u); try{ localStorage.setItem("tlfkatl_me",u); }catch(e){} }

  return (
    <div style={{fontFamily:F_BODY,color:C.ink,background:C.paper,minHeight:"100vh",
      maxWidth:430,margin:"0 auto",paddingBottom:74}}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes blink{50%{opacity:.35}} .livedot{animation:blink 1.4s infinite}
        @keyframes rise{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
        .sec{animation:rise .25s ease}`}</style>

      <div style={{padding:"16px 16px 10px",textAlign:"center"}}>
        <div style={{fontFamily:F_DISP,fontSize:32,letterSpacing:1,lineHeight:.9}}>TLFKATL</div>
        <div style={{color:C.grass,fontWeight:700,letterSpacing:2.5,fontSize:10.5,marginTop:2}}>WORLD CUP 2026</div>
      </div>

      <div style={{padding:"0 16px"}}>
        {tab==="home" && <Home board={board} live={live} />}
        {tab==="leaderboard" && <Leaderboard board={board} />}
        {tab==="mypicks" && <MyPicks me={me} allPicks={allPicks} chooseMe={chooseMe} board={board} />}
        {tab==="everyone" && <Everyone allPicks={allPicks} />}
        {tab==="rules" && <Rules />}
      </div>

      <Nav tab={tab} setTab={setTab} />
    </div>
  );
}

// ── HOME ──
function Home({board,live}){
  if(!board||!live) return <Loading/>;
  const rows = board.leaderboard||[];
  const top3 = rows.slice(0,3);
  const matches = (live.matches||[]).slice().sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const now = Date.now();
  // "today/next" games: in progress, or the soonest upcoming day
  const liveNow = matches.filter(m=>m.status==="in_progress");
  const upcoming = matches.filter(m=>m.status==="scheduled");
  const nextDay = upcoming.length ? new Date(upcoming[0].datetime).toDateString() : null;
  const todays = matches.filter(m=>{
    if(m.status==="in_progress") return true;
    if(m.status==="scheduled" && nextDay) return new Date(m.datetime).toDateString()===nextDay;
    return false;
  }).slice(0,6);

  const anyPoints = rows.some(r=>r.points>0);

  return (
    <div className="sec">
      {/* games banner */}
      <SecLabel>{liveNow.length?"● LIVE & UP NEXT":"UP NEXT"}</SecLabel>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:18}}>
        {todays.length===0 && <Card><span style={{color:C.mute,fontSize:13}}>No games scheduled.</span></Card>}
        {todays.map(m=>{
          const playing=m.status==="in_progress", done=m.status==="completed";
          const t=new Date(m.datetime).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
          return (
            <div key={m.gid} style={{minWidth:150,background:"#fff",border:`1px solid ${playing?C.live:C.line}`,
              borderRadius:12,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:playing?C.live:C.mute,fontWeight:700,marginBottom:6,letterSpacing:.5}}>
                {playing?<span><span className="livedot">●</span> LIVE</span>:done?"FT":t} · GRP {m.group}
              </div>
              <ScoreLine flag={FLAG[m.home]} team={m.home} score={m.homeScore} show={playing||done}/>
              <ScoreLine flag={FLAG[m.away]} team={m.away} score={m.awayScore} show={playing||done}/>
            </div>
          );
        })}
      </div>

      {/* podium */}
      <SecLabel>PODIUM</SecLabel>
      <Podium top3={top3} anyPoints={anyPoints}/>

      {/* standings snapshot */}
      <SecLabel>STANDINGS</SecLabel>
      {rows.slice(0,5).map((r,i)=>(
        <div key={r.username} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",
          border:`1px solid ${C.line}`,borderRadius:11,padding:"9px 12px",marginBottom:6}}>
          <span style={{fontFamily:F_DISP,fontSize:22,minWidth:24,textAlign:"center",
            color:i===0?C.gold:C.mute}}>{i+1}</span>
          <span style={{flex:1,fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.username}</span>
          <span style={{fontFamily:F_DISP,fontSize:22,color:C.grass}}>{r.points}</span>
        </div>
      ))}
      <div style={{fontSize:12,color:C.mute,textAlign:"center",marginTop:8}}>Full standings in the Leaderboard tab.</div>
    </div>
  );
}

function Podium({top3,anyPoints}){
  const heights=[96,72,60]; const order=[1,0,2]; // silver, gold, bronze visual order
  const medal=["#E8B53A","#9aa5a0","#b08d57"];
  if(top3.length<3) return <Card><span style={{color:C.mute,fontSize:13}}>Podium fills in once standings exist.</span></Card>;
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8,marginBottom:18}}>
      {order.map(idx=>{
        const r=top3[idx]; if(!r) return null;
        return (
          <div key={idx} style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:4,overflow:"hidden",
              textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.username}</div>
            <div style={{fontFamily:F_DISP,fontSize:20,color:C.grass}}>{anyPoints?r.points:"–"}</div>
            <div style={{height:heights[idx],background:medal[idx],borderRadius:"8px 8px 0 0",
              display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:6,marginTop:4}}>
              <span style={{fontFamily:F_DISP,fontSize:30,color:"#fff"}}>{idx+1}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── LEADERBOARD ──
function Leaderboard({board}){
  if(!board) return <Loading/>;
  const rows=board.leaderboard||[];
  const topPts=Math.max(...rows.map(r=>r.points),0);
  const anyPoints=topPts>0;
  return (
    <div className="sec">
      <SecLabel>FULL STANDINGS</SecLabel>
      {rows.map((r,i)=>(
        <div key={r.username} style={{display:"flex",alignItems:"center",gap:11,background:"#fff",
          border:`1px solid ${C.line}`,borderRadius:13,padding:"11px 13px",marginBottom:8}}>
          <div style={{fontFamily:F_DISP,fontSize:26,minWidth:30,textAlign:"center",
            color:i===0?C.gold:i===1?"#9aa5a0":i===2?"#b08d57":C.mute}}>{i+1}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {r.username}{anyPoints&&r.points===topPts&&" 🔥"}
            </div>
            <div style={{fontSize:12,color:C.mute,marginTop:2,display:"flex",gap:9}}>
              <span>🐴 {FLAG[r.darkhorse]||"—"}</span>
              <span>💀 {FLAG[r.flop]||"—"}</span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>👟 {r.goldenboot||"—"}</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:F_DISP,fontSize:28,lineHeight:.9,color:C.grass}}>{r.points}</div>
            <div style={{fontSize:10,color:C.mute}}>PTS</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MY PICKS ──
function MyPicks({me,allPicks,chooseMe,board}){
  if(!allPicks) return <Loading/>;
  const names = allPicks.map(p=>p.username);
  if(!me || !names.includes(me)){
    return (
      <div className="sec">
        <SecLabel>WHO ARE YOU?</SecLabel>
        <div style={{fontSize:13,color:C.mute,marginBottom:12}}>Tap your name once — we'll remember you on this device.</div>
        {names.map(n=>(
          <button key={n} onClick={()=>chooseMe(n)} style={{display:"block",width:"100%",textAlign:"left",
            background:"#fff",border:`1.5px solid ${C.line}`,borderRadius:12,padding:"13px 15px",
            marginBottom:8,fontSize:15,fontWeight:600,color:C.ink,cursor:"pointer",fontFamily:F_BODY}}>{n}</button>
        ))}
      </div>
    );
  }
  const mine = allPicks.find(p=>p.username===me);
  const myScore = (board?.leaderboard||[]).find(r=>r.username===me);
  return (
    <div className="sec">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <SecLabel>{me.toUpperCase()}</SecLabel>
        <button onClick={()=>chooseMe("")} style={{background:"none",border:"none",color:C.grass,
          fontSize:12,fontWeight:700,cursor:"pointer"}}>not you?</button>
      </div>
      {myScore && <div style={{background:C.grass,color:"#fff",borderRadius:13,padding:"12px 15px",marginBottom:16,
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:700}}>Your total</span>
        <span style={{fontFamily:F_DISP,fontSize:30}}>{myScore.points} pts</span>
      </div>}
      <PicksDetail rec={mine}/>
    </div>
  );
}

// ── EVERYONE'S PICKS ──
function Everyone({allPicks}){
  const [open,setOpen] = useState(null);
  if(!allPicks) return <Loading/>;
  return (
    <div className="sec">
      <SecLabel>EVERYONE'S PICKS</SecLabel>
      {allPicks.map(p=>(
        <div key={p.username} style={{marginBottom:8}}>
          <button onClick={()=>setOpen(open===p.username?null:p.username)} style={{display:"flex",
            justifyContent:"space-between",alignItems:"center",width:"100%",background:"#fff",
            border:`1.5px solid ${C.line}`,borderRadius:12,padding:"13px 15px",cursor:"pointer",fontFamily:F_BODY}}>
            <span style={{fontWeight:700,fontSize:15,color:C.ink}}>{p.username}</span>
            <span style={{fontSize:12,color:C.mute}}>🐴 {FLAG[p.bets?.darkhorse]||"—"} 💀 {FLAG[p.bets?.flop]||"—"} {open===p.username?"▴":"▾"}</span>
          </button>
          {open===p.username && <div style={{padding:"4px 2px 8px"}}><PicksDetail rec={p}/></div>}
        </div>
      ))}
    </div>
  );
}

// shared: render one person's full picks
function PicksDetail({rec}){
  if(!rec) return null;
  const picks = rec.picks||{};
  const order = rec.group_order||{};
  const bets = rec.bets||{};
  const label = {home:"home",draw:"draw",away:"away"};
  return (
    <div>
      <div style={{fontSize:11,fontWeight:700,color:C.grass,letterSpacing:1,margin:"6px 0 8px"}}>SIDE BETS</div>
      <div style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:13.5}}>
        <BetRow k="👟 Golden Boot" v={bets.goldenboot}/>
        <BetRow k="🐴 Dark Horse" v={bets.darkhorse?`${FLAG[bets.darkhorse]||""} ${bets.darkhorse}`:null}/>
        <BetRow k="💀 Flop" v={bets.flop?`${FLAG[bets.flop]||""} ${bets.flop}`:null}/>
        <BetRow k="🐐 Penaldo v Pessi" v={bets.penaldo}/>
        <BetRow k="👃 Golden Nostril" v={bets.nostril}/>
        <BetRow k="🌍 Chum v Cum" v={bets.chumcum}/>
      </div>
      <div style={{fontSize:11,fontWeight:700,color:C.grass,letterSpacing:1,marginBottom:8}}>GROUP PICKS</div>
      {GLETTERS.map(L=>(
        <div key={L} style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
          <div style={{fontFamily:F_DISP,fontSize:20,marginBottom:6}}>GROUP {L}</div>
          {gamesFor(L).map(g=>{
            const pick=picks[g.id];
            const txt = pick==="home"?`${g.home}`:pick==="away"?`${g.away}`:pick==="draw"?"Draw":"—";
            return (
              <div key={g.id} style={{display:"flex",justifyContent:"space-between",fontSize:12.5,padding:"2px 0"}}>
                <span style={{color:C.mute}}>{FLAG[g.home]} {g.home} v {g.away} {FLAG[g.away]}</span>
                <span style={{fontWeight:700,color:pick==="draw"?C.mute:C.ink}}>{txt}</span>
              </div>
            );
          })}
          {order[L]?.length===4 && (
            <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${C.line}`,fontSize:12,color:C.mute}}>
              Order: {order[L].map((t,i)=>`${i+1}. ${FLAG[t]||""}`).join("  ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function BetRow({k,v}){
  return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
    <span style={{color:C.mute}}>{k}</span><span style={{fontWeight:700}}>{v||"—"}</span>
  </div>;
}

// ── RULES ──
function Rules(){
  const Row=({n,t,d})=>(
    <div style={{display:"flex",gap:12,marginBottom:14}}>
      <div style={{fontFamily:F_DISP,fontSize:28,color:C.grass,lineHeight:1,minWidth:40}}>{n}</div>
      <div><div style={{fontWeight:700,marginBottom:2,fontSize:14}}>{t}</div>
        <div style={{fontSize:13,color:C.mute,lineHeight:1.5}}>{d}</div></div>
    </div>
  );
  return (
    <div className="sec">
      <SecLabel>HOW SCORING WORKS</SecLabel>
      <Bucket color={C.grass} tag="BUCKET 1" name="GROUP STAGE">
        <Row n="3" t="Per correct game" d="Pick each group game's result — win, draw, or loss. 3 pts when you're right."/>
        <Row n="+2" t="Upset bonus" d="Correctly back a team ranked 10+ FIFA spots below their opponent for a bonus +2."/>
        <Row n="+10" t="Perfect group order" d="Nail a group's exact 1–4 finishing order for +10. All or nothing."/>
      </Bucket>
      <Bucket color={C.ink} tag="BUCKET 2" name="KNOCKOUT BRACKET">
        <div style={{fontSize:13,color:C.mute,lineHeight:1.6,marginBottom:10}}>
          After groups, fill a March-Madness-style bracket. Points climb each round (scored independently — an early miss never kills a later correct pick):
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["R32","6"],["R16","10"],["QF","18"],["SF","30"],["FINAL","52"]].map(([r,p])=>(
            <div key={r} style={{flex:"1 0 28%",background:"#fff",border:`1px solid ${C.line}`,borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontSize:11,color:C.mute}}>{r}</div>
              <div style={{fontFamily:F_DISP,fontSize:24}}>{p}</div>
            </div>
          ))}
        </div>
      </Bucket>
      <Bucket color={C.gold} tag="BUCKET 3" name="SIDE BETS">
        <div style={{fontSize:13,color:C.mute,lineHeight:1.6}}>
          Golden Boot (12), Dark Horse (5–25 by how far they go), Group Flop (6), and the three head-to-heads — Penaldo v Pessi, Golden Nostril, Chum v Cum (5 each). Enough to give you an edge, never enough to win it alone.
        </div>
      </Bucket>
    </div>
  );
}

// ── shared UI ──
function Nav({tab,setTab}){
  const items=[["home","Home","⌂"],["leaderboard","Board","≡"],["mypicks","Mine","★"],
    ["everyone","All","⚇"],["rules","Rules","?"]];
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto",
      background:"#fff",borderTop:`1px solid ${C.line}`,display:"flex",padding:"6px 4px 8px"}}>
      {items.map(([k,lbl,ic])=>(
        <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:"none",border:"none",
          cursor:"pointer",padding:"6px 2px",color:tab===k?C.grass:C.mute,fontFamily:F_BODY}}>
          <div style={{fontSize:20,lineHeight:1}}>{ic}</div>
          <div style={{fontSize:10.5,fontWeight:tab===k?700:500,marginTop:3}}>{lbl}</div>
        </button>
      ))}
    </div>
  );
}
function ScoreLine({flag,team,score,show}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0"}}>
    <span style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{flag} {team}</span>
    <span style={{fontFamily:F_DISP,fontSize:18,color:show?C.ink:"transparent",minWidth:16,textAlign:"right"}}>{show?(score??0):"–"}</span>
  </div>;
}
function SecLabel({children}){
  return <div style={{fontSize:11,fontWeight:700,letterSpacing:1.2,color:C.grass,margin:"4px 0 10px"}}>{children}</div>;
}
function Card({children}){
  return <div style={{background:"#fff",border:`1px solid ${C.line}`,borderRadius:12,padding:"14px 16px",minWidth:150}}>{children}</div>;
}
function Bucket({color,tag,name,children}){
  return <div style={{borderLeft:`3px solid ${color}`,paddingLeft:14,marginBottom:22}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color}}>{tag}</div>
    <div style={{fontFamily:F_DISP,fontSize:24,letterSpacing:.5,marginBottom:10}}>{name}</div>
    {children}
  </div>;
}
function Loading(){
  return <div style={{textAlign:"center",padding:"50px 0",color:C.mute,fontSize:14}}>Loading…</div>;
}
