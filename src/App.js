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

// SCORECARD MATCH
const categories = [
  { name: "Instant Smoke", max: 10 },
  { name: "Constant Smoke", max: 20 },
  { name: "Volume", max: 20 },
  { name: "Driving Skill", max: 50 },
  { name: "Blown Tyres", max: 10 }
];

const deductionsList = [
  "Reversing",
  "Stopping/Stalling",
  "Contact with Barrier",
  "Fail to Exit Pad",
  "Large Fire"
];

const classes = [
  "V8 Pro",
  "V8 N/A",
  "6 Cyl Pro",
  "6 Cyl N/A",
  "Rotary"
];

function Leaderboard({ data }) {
  const sorted = data.sort((a,b)=>b.finalScore - a.finalScore);

  return (
    <div style={{padding:20}}>
      <h2>🏆 Leaderboard</h2>
      {sorted.map((entry,i)=>(
        <div key={i}>
          #{i+1} Car {entry.car} - {entry.driver} ({entry.carClass}) : {entry.finalScore}
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
    if(!car || !driver || !gender || !carClass){
      return alert("Fill all fields");
    }

    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
    const totalDeductions = Object.values(deductions).filter(v=>v).length * 10;
    const finalScore = totalScore - totalDeductions;

    await addDoc(collection(db,"scores"),{
      judge,
      car,
      driver,
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
    setGender("");
    setCarClass("");
  };

  // HOME SCREEN
  if (screen === "home") {
    return (
      <div style={{textAlign:"center",padding:50}}>
        <h1>🔥 AutoFest Burnout Champs</h1>
        <button onClick={()=>setScreen("judgeSelect")} style={{padding:20}}>
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
          <button key={j} onClick={()=>{setJudge(j); setScreen("judge");}} style={{margin:10,padding:20}}>
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

  // JUDGING SCREEN
  const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
  const totalDeductions = Object.values(deductions).filter(v=>v).length * 10;
  const finalScore = totalScore - totalDeductions;

  return (
    <div style={{padding:20}}>

      <h2>Judge {judge}</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver Name" value={driver} onChange={e=>setDriver(e.target.value)} />

      <div>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
        <p>{gender}</p>
      </div>

      <div>
        <h3>Class</h3>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)} style={{margin:5}}>
            {c}
          </button>
        ))}
        <p>{carClass}</p>
      </div>

      <h3>POINT ALLOCATIONS</h3>

      {categories.map(cat=>(
        <div key={cat.name}>
          <strong>{cat.name} (/{cat.max})</strong>
          <p>Selected: {scores[cat.name] ?? "-"}</p>

          {Array.from({length:cat.max+1},(_,i)=>(
            <button
              key={i}
              onClick={()=>setScore(cat.name,i)}
              style={{
                margin:2,
                background: scores[cat.name] === i ? "red" : "#ccc",
                color: scores[cat.name] === i ? "white" : "black"
              }}
            >
              {i}
            </button>
          ))}
        </div>
      ))}

      <h3>🚫 POINT DEDUCTIONS</h3>

      {deductionsList.map(d=>(
        <button
          key={d}
          onClick={()=>toggleDeduction(d)}
          style={{
            margin:5,
            background: deductions[d] ? "black" : "#ddd",
            color: deductions[d] ? "white" : "black"
          }}
        >
          {d} (-10)
        </button>
      ))}

      <h3>Total Allocation: {totalScore} /110</h3>
      <h3>Deductions: -{totalDeductions}</h3>
      <h2>FINAL SCORE: {finalScore}</h2>

      <button onClick={submit}>Submit</button>
      <button onClick={loadLeaderboard}>Leaderboard</button>

    </div>
  );
}
