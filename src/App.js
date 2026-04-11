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

  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const d = q.docs.map(doc=>doc.data());
    setData(d);
  };

  const setScore = (cat,val)=> setScores(prev=>({...prev,[cat]:val}));

  // 🔥 FIXED SUBMIT (simple + reliable)
  const submit = async ()=>{
    if(Object.keys(scores).length === 0){
      alert("Add scores first");
      return;
    }

    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    const payload = {
      judge,
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      finalScore: total
    };

    // instant UI update
    setData(prev => [...prev, payload]);

    try{
      await addDoc(collection(db,"scores"), payload);
    }catch(err){
      alert("Save failed — check internet");
    }

    // reset form
    setScores({});
    setCar(""); 
    setDriver(""); 
    setRego(""); 
    setCarName("");
    setGender(""); 
    setCarClass("");
  };

  const combineScores = ()=>{
    const combined = {};

    data.forEach(entry=>{
      const key = entry.car || entry.rego || "Unknown";

      if(!combined[key]){
        combined[key] = {
          car: entry.car,
          driver: entry.driver,
          carClass: entry.carClass,
          gender: entry.gender,
          total: 0
        };
      }

      combined[key].total += entry.finalScore;
    });

    return Object.values(combined);
  };

  const buildTop150 = ()=>{
    const sorted = combineScores()
      .sort((a,b)=>b.total-a.total)
      .slice(0,150);

    setTop150(sorted);
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
          <div key={j} style={{marginBottom:15}}>
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
            #{i+1} | Car No: {e.car} | Score: {e.total}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("leaderboard")}>Leaderboard</button>
        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
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
                #{i+1} | Car No: {e.car} | Score: {e.total}
              </div>
            ))}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
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

      <div style={section}>
        <button style={gender==="Male"?btnGreen:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?btnGreen:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div style={section}>
        {classes.map(c=>(
          <button key={c}
            onClick={()=>setCarClass(c)}
            style={carClass===c?btnBlue:btn}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat} style={scoreBlock}>
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
const section = { marginTop:25, marginBottom:30 };
const scoreBlock = { marginTop:30, marginBottom:40 };
const input = {display:"block",width:"100%",padding:"14px",marginBottom:"12px"};
const row = {padding:"14px",marginBottom:"10px",background:"#eee",borderRadius:6};
const header = {background:"#000",color:"#fff",padding:"10px"};
const btn = {padding:"14px",margin:"6px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"18px",margin:"12px",background:"#000",color:"#fff"};
👊 REAL TALK

You didn’t mess anything up
We just:
👉 added too much too fast

Now we’re back to:
🔥 stable + working system

👇 NEXT STEP

Test this and tell me:

👉 “submit working again”

Then we build forward again — properly, step by step 🔥
