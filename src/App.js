import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd",
  storageBucket: "autofest-burnout-judging-848fd.firebasestorage.app",
  messagingSenderId: "742211958318",
  appId: "1:742211958318:web:648c2bfd5b4e2af09391bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { name: "Instant Smoke", max: 10 },
  { name: "Constant Smoke", max: 20 },
  { name: "Volume", max: 20 },
  { name: "Driving Skill", max: 20 },
  { name: "Blown Tyres", max: 20 }
];

const deductionsList = [
  "Reversing",
  "Stopping/Stalling",
  "Contact with Barrier",
  "Fail to Exit Pad",
  "Large Fire"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [judgeName, setJudgeName] = useState("");

  const [car, setCar] = useState("");
  const [driver, setDriver] = useState("");
  const [rego, setRego] = useState("");
  const [carName, setCarName] = useState("");

  const [gender, setGender] = useState("");
  const [carClass, setCarClass] = useState("");

  const [scores, setScores] = useState({});
  const [deductions, setDeductions] = useState({});
  const [top150, setTop150] = useState([]);
  const [top30, setTop30] = useState([]);

  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = (d)=> setDeductions(prev=>({...prev,[d]:!prev[d]}));

  // ✅ FIXED SUBMIT (DELAY FIX)
  const submit = async ()=>{
    if(submitting) return;

    if(!car && !driver && !rego && !carName){
      alert("Enter competitor");
      return;
    }

    if(!gender || !carClass){
      alert("Select gender + class");
      return;
    }

    if(Object.keys(scores).length === 0){
      alert("Add scores");
      return;
    }

    setSubmitting(true);

    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
    const totalDeductions = Object.values(deductions).filter(v=>v).length*10;
    const finalScore = totalScore - totalDeductions;

    try {
      await addDoc(collection(db,"scores"),{
        car, driver, rego, carName, gender, carClass,
        finalScore
      });

      // 🔥 FIX: small delay ensures React state updates
      setTimeout(()=>{
        setLocked(true);
        setSubmitting(false);
        alert("Saved ✅");
      },300);

    } catch (err){
      alert("Error saving");
      setSubmitting(false);
    }
  };

  // ✅ ALWAYS FRESH TOP 150
  const buildTop150 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>d.data());

    const sorted = data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,150);

    setTop150(sorted);
    setScreen("top150");
  };

  // ✅ ALWAYS FRESH TOP 30
  const buildTop30 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>d.data());

    const sorted = data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,30);

    setTop30(sorted);
    setScreen("top30");
  };

  // RESULTS
  const getWinners = ()=>{
    const results = {};
    classes.forEach(cls=>{
      results[cls] = top30
        .filter(e=>e.carClass===cls)
        .sort((a,b)=>b.finalScore-a.finalScore)
        .slice(0,3);
    });
    return results;
  };

  // HOME
  if(screen==="home"){
    return (
      <div style={home}>
        <img src="/logo.png" style={{maxWidth:"90%",marginBottom:30}}/>
        <button style={btnBig} onClick={()=>setScreen("judgeSelect")}>ENTER</button>
      </div>
    );
  }

  // JUDGE SELECT
  if(screen==="judgeSelect"){
    return (
      <div style={{textAlign:"center",padding:40}}>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={btnBig} onClick={()=>{setJudgeName("Judge "+j); setScreen("judge");}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  // TOP 150
  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 150</h2>
        {top150.map((e,i)=>(
          <div key={i}>#{i+1} {e.driver || e.car} - {e.finalScore}</div>
        ))}
        <button style={btnBig} onClick={buildTop30}>Top 30</button>
      </div>
    );
  }

  // TOP 30
  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 30</h2>
        {top30.map((e,i)=>(
          <div key={i}>#{i+1} {e.driver || e.car} - {e.finalScore}</div>
        ))}
        <button style={btnBig} onClick={()=>setScreen("results")}>Results</button>
      </div>
    );
  }

  // RESULTS
  if(screen==="results"){
    const winners = getWinners();
    return (
      <div style={{padding:20}}>
        <h1>RESULTS</h1>
        {classes.map(cls=>(
          <div key={cls}>
            <h2>{cls}</h2>
            <div>🥇 {winners[cls][0]?.driver || "-"}</div>
            <div>🥈 {winners[cls][1]?.driver || "-"}</div>
            <div>🥉 {winners[cls][2]?.driver || "-"}</div>
          </div>
        ))}
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const totalDeductions = Object.values(deductions).filter(v=>v).length*10;
  const finalScore = totalScore - totalDeductions;

  return (
    <div style={{padding:20}}>

      <h2>{judgeName}</h2>

      <input placeholder="Car" value={car} onChange={e=>setCar(e.target.value)} style={input}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} style={input}/>

      {categories.map(cat=>(
        <div key={cat.name} style={{marginBottom:25}}>
          <strong>{cat.name}</strong>
          <div>
            {Array.from({length:cat.max+1},(_,i)=>(
              <button key={i}
                onClick={()=>setScore(cat.name,i)}
                style={{
                  margin:6,
                  padding:"14px",
                  background: scores[cat.name]===i ? "#ff0000" : "#fff"
                }}>
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h2>Final: {finalScore}</h2>

      <button
        style={{...btnBig, background: submitting ? "#666" : "#000"}}
        onClick={submit}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>

      <button style={btnBig} onClick={buildTop150}>Top 150</button>
      <button style={btnBig} onClick={buildTop30}>Top 30</button>

    </div>
  );
}

const home = {
  background:"#000",
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
};

const btnBig = {
  padding:"18px",
  margin:"12px",
  fontSize:"18px"
};

const input = {
  display:"block",
  marginBottom:"10px",
  padding:"12px",
  width:"100%"
};
