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
const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [screen,setScreen] = useState("judgeSelect");
  const [judge,setJudge] = useState("");

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

  // 🔥 LOAD DATA ON START (KEY FIX)
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const d = q.docs.map(doc=>doc.data());
    setData(d);
  };

  const setScore = (cat,val)=> setScores(prev=>({...prev,[cat]:val}));
  const toggleDeduction = d => setDeductions(prev=>({...prev,[d]:!prev[d]}));

  const submit = ()=>{
    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const deductionsTotal = Object.values(deductions).filter(v=>v).length * 10;
    const finalScore = total - deductionsTotal;

    const payload = {
      car, driver, rego, carName,
      gender, carClass,
      finalScore
    };

    // update UI instantly
    setData(prev => [...prev, payload]);

    // reset form
    setScores({});
    setDeductions({});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");

    // save async
    addDoc(collection(db,"scores"), payload).catch(()=>{});
  };

  // 🔥 INSTANT TOP150 (NO FIREBASE CALL)
  const buildTop150 = ()=>{
    if(data.length === 0){
      alert("No scores yet");
      return;
    }

    const sorted = [...data]
      .sort((a,b)=>b.finalScore-a.finalScore)
      .slice(0,150);

    setTop150(sorted);
    setScreen("top150");
  };

  // GROUPED
  const grouped = {};
  data.forEach(e=>{
    const key = `${e.carClass || "Unknown"} - ${e.gender || "Unknown"}`;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(e);
  });

  Object.keys(grouped).forEach(k=>{
    grouped[k].sort((a,b)=>b.finalScore-a.finalScore);
  });

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>🏁 TOP 150</h2>

        {top150.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | Car No: {e.car || "-"} | Total Score: {e.finalScore}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("leaderboard")}>
          View Classes
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
        <h2>🏁 Leaderboard</h2>

        {Object.keys(grouped).map(group=>(
          <div key={group} style={{marginBottom:30}}>
            <h3 style={header}>{group}</h3>

            {grouped[group].map((e,i)=>(
              <div key={i} style={row}>
                #{i+1} | Car No: {e.car || "-"} | Total Score: {e.finalScore}
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

  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={btnBig} onClick={()=>{setJudge(j);setScreen("judge");}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:20}}>

      <h2>Judge {judge}</h2>

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

      <div style={section}>
        <h3>Deductions</h3>
        {deductionsList.map(d=>(
          <button key={d}
            onClick={()=>toggleDeduction(d)}
            style={deductions[d]?btnRed:btn}>
            {d}
          </button>
        ))}
      </div>

      <button style={btnBig} onClick={submit}>Submit</button>

      <button style={btnBig} onClick={buildTop150}>
        Top 150
      </button>

      <button style={btnBig} onClick={()=>setScreen("leaderboard")}>
        Leaderboard
      </button>

    </div>
  );
}

// styles
const section = { marginTop:25, marginBottom:30 };
const scoreBlock = { marginTop:30, marginBottom:40 };

const input = {
  display:"block",
  width:"100%",
  padding:"14px",
  marginBottom:"12px"
};

const row = {
  padding:"14px",
  marginBottom:"10px",
  background:"#eee",
  borderRadius:6,
  fontWeight:"bold"
};

const header = {
  background:"#000",
  color:"#fff",
  padding:"10px"
};

const btn = {
  padding:"14px",
  margin:"6px"
};

const btnRed = { ...btn, background:"red", color:"#fff" };
const btnBlue = { ...btn, background:"blue", color:"#fff" };
const btnGreen = { ...btn, background:"green", color:"#fff" };

const btnBig = {
  padding:"18px",
  margin:"12px",
  background:"#000",
  color:"#fff"
};
