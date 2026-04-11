import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = ["Smoke","Commitment","Style","Control","Entertainment"];
const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

export default function App(){

  const [screen,setScreen] = useState("judgeSelect");
  const [judge,setJudge] = useState("");

  const [judgeNames,setJudgeNames] = useState({
    1:"Judge 1",2:"Judge 2",3:"Judge 3",
    4:"Judge 4",5:"Judge 5",6:"Judge 6"
  });

  const [data,setData] = useState([]);
  const [top150,setTop150] = useState([]);

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});

  // 🔥 LOAD + SYNC
  useEffect(()=>{
    loadData();
    syncOffline();
  },[]);

  const loadData = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    setData(q.docs.map(doc=>doc.data()));
  };

  // 🔥 OFFLINE SAVE
  const saveOffline = (data)=>{
    const existing = JSON.parse(localStorage.getItem("offlineScores") || "[]");
    existing.push(data);
    localStorage.setItem("offlineScores", JSON.stringify(existing));
  };

  // 🔥 SYNC OFFLINE
  const syncOffline = async ()=>{
    const offline = JSON.parse(localStorage.getItem("offlineScores") || "[]");

    if(offline.length === 0) return;

    for(const item of offline){
      try{
        await addDoc(collection(db,"scores"), item);
      }catch{
        return;
      }
    }

    localStorage.removeItem("offlineScores");
  };

  const setScore = (cat,val)=> setScores(prev=>({...prev,[cat]:val}));

  // 🔥 SUBMIT (FAST + OFFLINE SAFE)
  const submit = async ()=>{
    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const finalScore = total;

    const payload = {
      judge,
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      finalScore,
      time: Date.now()
    };

    // save locally first
    saveOffline(payload);

    try{
      await addDoc(collection(db,"scores"), payload);

      let offline = JSON.parse(localStorage.getItem("offlineScores") || "[]");
      offline.shift();
      localStorage.setItem("offlineScores", JSON.stringify(offline));

    }catch{
      console.log("offline mode");
    }

    // reset UI
    setScores({});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  };

  // 🔥 COMBINE (FIXED)
  const combineScores = ()=>{
    const combined = {};

    data.forEach(entry=>{
      const key =
        entry.car ||
        entry.rego ||
        entry.driver ||
        entry.carName ||
        "Unknown";

      if(!combined[key]){
        combined[key] = {
          car: entry.car,
          driver: entry.driver,
          rego: entry.rego,
          carName: entry.carName,
          carClass: entry.carClass,
          gender: entry.gender,
          total: 0
        };
      }

      combined[key].total += entry.finalScore;
    });

    return Object.values(combined);
  };

  // 🔥 TOP 150 SAFE
  const buildTop150 = ()=>{
    const combined = combineScores();

    if(combined.length === 0){
      alert("No scores yet");
      return;
    }

    setTop150(
      combined.sort((a,b)=>b.total-a.total).slice(0,150)
    );

    setScreen("top150");
  };

  const grouped = {};
  combineScores().forEach(e=>{
    const key = `${e.carClass || "Unknown"} - ${e.gender || "Unknown"}`;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(e);
  });

  Object.keys(grouped).forEach(k=>{
    grouped[k].sort((a,b)=>b.total-a.total);
  });

  // SCREENS

  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {[1,2,3,4,5,6].map(j=>(
          <div key={j}>
            <input
              style={input}
              value={judgeNames[j]}
              onChange={e=>setJudgeNames({...judgeNames,[j]:e.target.value})}
            />
            <button style={btnBig} onClick={()=>{setJudge(j);setScreen("judge");}}>
              {judgeNames[j]}
            </button>
          </div>
        ))}
      </div>
    );
  }

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 150</h2>

        {top150.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} |
            {e.car && ` Car No: ${e.car} |`}
            {e.driver && ` Driver: ${e.driver} |`}
            {e.rego && ` Rego: ${e.rego} |`}
            {e.carName && ` Car: ${e.carName} |`}
            Score: {e.total}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("leaderboard")}>
          Leaderboard
        </button>

        <button style={btnBig} onClick={()=>setScreen("judge")}>
          Back
        </button>
      </div>
    );
  }

  if(screen==="leaderboard"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>

        {Object.keys(grouped).map(group=>(
          <div key={group}>
            <h3 style={header}>{group}</h3>

            {grouped[group].map((e,i)=>(
              <div key={i} style={row}>
                #{i+1} |
                {e.car && ` Car No: ${e.car} |`}
                {e.driver && ` Driver: ${e.driver} |`}
                {e.rego && ` Rego: ${e.rego} |`}
                {e.carName && ` Car: ${e.carName} |`}
                Score: {e.total}
              </div>
            ))}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("judge")}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>

      <h2>{judgeNames[judge]}</h2>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input style={input} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input style={input} placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

      {categories.map(cat=>(
        <div key={cat} style={{marginTop:20}}>
          <strong>{cat}</strong>
          <div>
            {Array.from({length:21},(_,i)=>(
              <button key={i}
                onClick={()=>setScore(cat,i)}
                style={scores[cat]===i?btnRed:btn}>
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={buildTop150}>Top 150</button>
      <button style={btnBig} onClick={()=>setScreen("leaderboard")}>Leaderboard</button>

    </div>
  );
}

// styles
const input = {display:"block",width:"100%",padding:"14px",marginBottom:"12px"};
const row = {padding:"14px",marginBottom:"10px",background:"#eee",borderRadius:6};
const header = {background:"#000",color:"#fff",padding:"10px"};
const btn = {padding:"14px",margin:"6px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBig = {padding:"18px",margin:"12px",background:"#000",color:"#fff"};
💥 NOW YOU HAVE
