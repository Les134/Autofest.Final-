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

// UPDATED SCORECARD
const categories = [
  { name: "Instant Smoke", max: 10 },
  { name: "Constant Smoke", max: 20 },
  { name: "Volume", max: 20 },
  { name: "Driving Skill", max: 20 }, // FIXED
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

function Leaderboard({ data }) {
  const sorted = data
    .sort((a,b)=>b.finalScore - a.finalScore)
    .slice(0,30);

  return (
    <div style={{padding:20}}>
      <h2>🏆 TOP 30 QUALIFIERS</h2>
      {sorted.map((entry,i)=>(
        <div key={i} style={{marginBottom:10}}>
          #{i+1} Car {entry.car} - {entry.driver} ({entry.carName}) [{entry.rego}] : {entry.finalScore}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [judge, setJudge] = useState(null);

  const [car, setCar] = useState("");
  const [driver, setDriver] = useState("");
  const [rego, setRego] = useState("");
  const [carName, setCarName] = useState("");

  const [gender, setGender] = useState("");
  const [carClass, setCarClass] = useState("");

  const [scores, setScores] = useState({});
  const [deductions, setDeductions] = useState({});
  const [allData, setAllData] = useState([]);

  const setScore = (cat,val)=>{
    setScores({...scores,[cat]:val});
  };

  const toggleDeduction = (d)=>{
    setDeductions(prev => ({
      ...prev,
      [d]: !prev[d]
    }));
  };

  const loadLeaderboard = async () => {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const data = querySnapshot.docs.map(doc => doc.data());
    setAllData(data);
    setScreen("leaderboard");
  };

  const submit = async ()=>{
    if(!car || !driver || !rego || !carName || !gender || !carClass){
      return alert("Fill all fields");
    }

    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
    const totalDeductions = Object.values(deductions).filter(v=>v).length * 10;
    const finalScore = totalScore - totalDeductions;

    await addDoc(collection(db,"scores"),{
      judge,
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      scores,
      deductions,
      totalScore,
      totalDeductions,
      finalScore,
      time:new Date()
    });

    alert("Score submitted!");

    setScores({});
    setDeductions({});
    setCar("");
    setDriver("");
    setRego("");
    setCarName("");
    setGender("");
    setCarClass("");
  };

  // HOME
  if (screen === "home") {
    return (
      <div style={{textAlign:"center",padding:40}}>
        <img src="/logo.png" alt="logo" style={{width:200}} />
        <h1>AutoFest Series Burnout Champs</h1>
        <button onClick={()=>setScreen("judgeSelect")} style={{padding:20,fontSize:18}}>
          Start Judging
        </button>
      </div>
    );
  }

  // JUDGE SELECT
  if (screen === "judgeSelect") {
    return (
      <div style={{textAlign:"center",padding:40}}>
        <h1>Select Judge</h1>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} onClick={()=>{setJudge(j); setScreen("judge");}} style={{margin:10,padding:20,fontSize:18}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  // LEADERBOARD
  if (screen === "leaderboard") {
    return (
      <div>
        <Leaderboard data={allData} />
        <button onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const totalDeductions = Object.values(deductions).filter(v=>v).length * 10;
  const finalScore = totalScore - totalDeductions;

  return (
    <div style={{padding:20}}>

      <h2>Judge {judge}</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver Name" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Rego No" value={rego} onChange={e=>setRego(e.target.value)} />
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

      <div style={{marginTop:10}}>
        <button onClick={()=>setGender("Male")} style={{background: gender==="Male"?"green":"#ddd", padding:10, margin:5}}>Male</button>
        <button onClick={()=>setGender("Female")} style={{background: gender==="Female"?"green":"#ddd", padding:10, margin:5}}>Female</button>
      </div>

      <div>
        <h3>Class</h3>
        {classes.map(c=>(
          <button
            key={c}
            onClick={()=>setCarClass(c)}
            style={{
              background: carClass===c ? "blue" : "#ddd",
              color:"white",
              padding:10,
              margin:5
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <h3>POINT ALLOCATIONS</h3>

      {categories.map(cat=>(
        <div key={cat.name} style={{marginBottom:25}}>
          <strong>{cat.name} (/{cat.max})</strong>

          <div style={{marginTop:10}}>
            {Array.from({length:cat.max+1},(_,i)=>(
              <button
                key={i}
                onClick={()=>setScore(cat.name,i)}
                style={{
                  margin:4,
                  padding:12,
                  fontSize:16,
                  background: scores[cat.name]===i ? "red" : "#ccc"
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
            margin:6,
            padding:12,
            fontSize:16,
            background: deductions[d] ? "red" : "#ddd"
          }}
        >
          {d} (-10)
        </button>
      ))}

      <h3>Total: {totalScore}</h3>
      <h3>Deductions: -{totalDeductions}</h3>
      <h2>FINAL: {finalScore}</h2>

      <button onClick={submit} style={{padding:15, fontSize:18}}>Submit</button>
      <button onClick={loadLeaderboard} style={{padding:15, fontSize:18, marginLeft:10}}>Top 30</button>

    </div>
  );
}
