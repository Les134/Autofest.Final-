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
  const [judgesList, setJudgesList] = useState([
    "Judge 1","Judge 2","Judge 3","Judge 4","Judge 5","Judge 6"
  ]);

  const [car, setCar] = useState("");
  const [driver, setDriver] = useState("");
  const [rego, setRego] = useState("");
  const [carName, setCarName] = useState("");

  const [gender, setGender] = useState("");
  const [carClass, setCarClass] = useState("");

  const [scores, setScores] = useState({});
  const [deductions, setDeductions] = useState({});
  const [allData, setAllData] = useState([]);
  const [locked, setLocked] = useState(false);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = (d)=> setDeductions(prev=>({...prev,[d]:!prev[d]}));

  const submit = async ()=>{
    if(locked) return alert("Already submitted");
    if(!car || !driver || !rego || !carName || !gender || !carClass){
      return alert("Fill all fields");
    }

    if(!window.confirm("Submit score?")) return;

    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
    const totalDeductions = Object.values(deductions).filter(v=>v).length*10;
    const finalScore = totalScore - totalDeductions;

    await addDoc(collection(db,"scores"),{
      judge: judgeName,
      car, driver, rego, carName, gender, carClass,
      scores, deductions, totalScore, totalDeductions, finalScore,
      time:new Date()
    });

    alert("Submitted");
    setLocked(true);
  };

  const loadLeaderboard = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    setAllData(q.docs.map(d=>d.data()));
    setScreen("leaderboard");
  };

  if(screen==="home"){
    return (
      <div style={{textAlign:"center",padding:40}}>
        <h1>AutoFest Series Burnout Champs</h1>
        <button onClick={()=>setScreen("judgeSelect")}>Start Judging</button>
        <button onClick={()=>setScreen("admin")}>Admin</button>
      </div>
    );
  }

  if(screen==="admin"){
    return (
      <div style={{padding:20}}>
        <h2>Admin Panel</h2>
        {judgesList.map((j,i)=>(
          <input
            key={i}
            value={j}
            onChange={(e)=>{
              const copy=[...judgesList];
              copy[i]=e.target.value;
              setJudgesList(copy);
            }}
          />
        ))}
        <button onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  if(screen==="judgeSelect"){
    return (
      <div style={{textAlign:"center",padding:40}}>
        <h2>Select Judge</h2>
        {judgesList.map((j,i)=>(
          <button key={i} onClick={()=>{setJudgeName(j); setScreen("judge");}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  if(screen==="leaderboard"){
    const sorted=[...allData].sort((a,b)=>b.finalScore-a.finalScore).slice(0,30);
    return (
      <div style={{padding:20}}>
        <h2>Top 30</h2>
        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} {e.driver} ({e.car}) - {e.finalScore}
          </div>
        ))}
        <button onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const totalDeductions = Object.values(deductions).filter(v=>v).length*10;
  const finalScore = totalScore - totalDeductions;

  return (
    <div style={{padding:20}}>
      <h2>{judgeName}</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} />
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

      <div>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)}>{c}</button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat.name}>
          <strong>{cat.name}</strong>
          {Array.from({length:cat.max+1},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat.name,i)}>{i}</button>
          ))}
        </div>
      ))}

      <h3>Deductions</h3>
      {deductionsList.map(d=>(
        <button key={d} onClick={()=>toggleDeduction(d)}>{d}</button>
      ))}

      <h2>Final: {finalScore}</h2>

      <button onClick={submit} disabled={locked}>
        {locked ? "Submitted" : "Submit"}
      </button>

      <button onClick={loadLeaderboard}>Leaderboard</button>

      <button onClick={()=>{
        setScores({});
        setDeductions({});
        setCar(""); setDriver(""); setRego(""); setCarName("");
        setGender(""); setCarClass(""); setLocked(false);
      }}>
        Next Car
      </button>
    </div>
  );
}
