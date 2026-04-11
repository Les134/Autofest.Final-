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

// SCORE
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
  const [allData, setAllData] = useState([]);
  const [finalists, setFinalists] = useState([]);
  const [locked, setLocked] = useState(false);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = (d)=> setDeductions(prev=>({...prev,[d]:!prev[d]}));

  const submit = async ()=>{
    if(locked) return alert("Already submitted");

    if(!car && !driver && !rego && !carName){
      return alert("Enter at least ONE: Car, Driver, Rego or Car Name");
    }

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

  const buildTop30 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>d.data());

    const sorted = data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,30);

    setAllData(sorted);
    setScreen("top30");
  };

  const startFinals = ()=>{
    setFinalists(allData);
    setScreen("finals");
  };

  // HOME
  if(screen==="home"){
    return (
      <div style={{
        background:"#000",
        height:"100vh",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center"
      }}>
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

  // TOP 30
  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 30</h2>
        {allData.map((e,i)=>(
          <div key={i}>#{i+1} {e.driver || e.car} - {e.finalScore}</div>
        ))}
        <button style={btnBig} onClick={startFinals}>Start Finals</button>
      </div>
    );
  }

  // FINALS
  if(screen==="finals"){
    return (
      <div style={{padding:20}}>
        <h1>FINALS</h1>
        {finalists.map((e,i)=>(
          <div key={i}>#{i+1} {e.driver || e.car}</div>
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

      <input placeholder="Car" value={car} onChange={e=>setCar(e.target.value)}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

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

      <button style={btnBig} onClick={submit} disabled={locked}>Submit</button>
      <button style={btnBig} onClick={buildTop30}>Top 30</button>

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

const btnBig = {
  padding:"18px",
  margin:"10px",
  fontSize:"18px",
  fontWeight:"bold"
};
