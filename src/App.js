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

// SCORECARD
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
    // Require at least ONE of these fields
if(!car && !driver && !rego && !carName){
  return alert("Enter at least ONE: Car #, Driver, Rego or Car Name");
}

// Still require these
if(!gender || !carClass){
  return alert("Select gender and class");
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
    <div
      style={{
        background:"#000",
        height:"100vh",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        textAlign:"center",
        animation:"fadeIn 1.5s ease"
      }}
    >

      {/* LOGO */}
      <img 
        src="/logo.png" 

  // ADMIN
  if(screen==="admin"){
    return (
      <div style={{padding:20}}>
        <h2>Admin Panel</h2>
        {judgesList.map((j,i)=>(
          <input
            key={i}
            value={j}
            style={{display:"block",marginBottom:10,padding:10,fontSize:16}}
            onChange={(e)=>{
              const copy=[...judgesList];
              copy[i]=e.target.value;
              setJudgesList(copy);
            }}
          />
        ))}
        <button style={btnBig} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // JUDGE SELECT
  if(screen==="judgeSelect"){
    return (
      <div style={{textAlign:"center",padding:40}}>
        <h2>Select Judge</h2>
        {judgesList.map((j,i)=>(
          <button key={i} style={btnBig} onClick={()=>{setJudgeName(j); setScreen("judge");}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // LEADERBOARD
  if(screen==="leaderboard"){
    const sorted=[...allData].sort((a,b)=>b.finalScore-a.finalScore).slice(0,30);
    return (
      <div style={{padding:20}}>
        <h2>🏆 Top 30</h2>
        {sorted.map((e,i)=>(
          <div key={i} style={{marginBottom:10,fontSize:18}}>
            #{i+1} {e.driver} ({e.car}) - {e.finalScore}
          </div>
        ))}
        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const totalDeductions = Object.values(deductions).filter(v=>v).length*10;
  const finalScore = totalScore - totalDeductions;

  return (
    <div style={{padding:20}}>

      <h2>{judgeName}</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} style={input}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} style={input}/>
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} style={input}/>
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} style={input}/>

      <div style={{marginTop:20}}>
        <button style={{...btnSelect, background: gender==="Male"?"#00aa00":"#fff"}} onClick={()=>setGender("Male")}>Male</button>
        <button style={{...btnSelect, background: gender==="Female"?"#00aa00":"#fff"}} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div style={{marginTop:20}}>
        {classes.map(c=>(
          <button
            key={c}
            onClick={()=>setCarClass(c)}
            style={{
              ...btnSelect,
              background: carClass===c ? "#0033cc" : "#fff",
              color: carClass===c ? "#fff" : "#000"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <h3 style={{marginTop:30}}>POINT ALLOCATIONS</h3>

      {categories.map(cat=>(
        <div key={cat.name} style={{marginBottom:30}}>
          <strong>{cat.name}</strong>

          <div style={{marginTop:10}}>
            {Array.from({length:cat.max+1},(_,i)=>(
              <button
                key={i}
                onClick={()=>setScore(cat.name,i)}
                style={{
                  margin:6,
                  padding:"14px",
                  fontSize:16,
                  fontWeight:"bold",
                  border:"2px solid #000",
                  background: scores[cat.name]===i ? "#ff0000" : "#fff",
                  color: scores[cat.name]===i ? "#fff" : "#000"
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h3>🚫 DEDUCTIONS</h3>

      {deductionsList.map(d=>(
        <button
          key={d}
          onClick={()=>toggleDeduction(d)}
          style={{
            ...btnSelect,
            background: deductions[d] ? "#ff0000" : "#fff"
          }}
        >
          {d}
        </button>
      ))}

      <h2>Total: {totalScore}</h2>
      <h2>Deductions: -{totalDeductions}</h2>
      <h1>FINAL: {finalScore}</h1>

      <button style={btnBig} onClick={submit} disabled={locked}>
        {locked ? "Submitted" : "Submit"}
      </button>

      <button style={btnBig} onClick={loadLeaderboard}>Top 30</button>

      <button style={btnBig} onClick={()=>{
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

// STYLES
const btnBig = {
  padding:"18px",
  margin:"10px",
  fontSize:"18px",
  fontWeight:"bold",
  border:"3px solid #000",
  background:"#000",
  color:"#fff"
};

const btnSelect = {
  padding:"16px",
  margin:"8px",
  fontSize:"16px",
  fontWeight:"bold",
  border:"3px solid #000"
};

const input = {
  display:"block",
  marginBottom:"10px",
  padding:"12px",
  fontSize:"16px",
  width:"100%"
};
const styles = document.createElement("style");
styles.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.8); opacity:0; }
  to { transform: scale(1); opacity:1; }
}
`;
document.head.appendChild(styles);
