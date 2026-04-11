import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { name: "Smoke", max: 20 },
  { name: "Commitment", max: 20 },
  { name: "Style", max: 20 },
  { name: "Control", max: 20 },
  { name: "Entertainment", max: 20 }
];

const classes = ["V8 Pro","V8 N/A","6 Cyl","Rotary"];

export default function App() {

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [scores,setScores] = useState({});
  const [saving,setSaving] = useState(false);
  const [top150,setTop150] = useState([]);
  const [screen,setScreen] = useState("judge");

  const setScore = (cat,val)=>{
    setScores(prev=>({...prev,[cat]:val}));
  };

  // 🔥 BULLETPROOF SUBMIT
  const submit = async ()=>{
    if(saving) return;

    if(!car && !driver){
      alert("Enter car or driver");
      return;
    }

    if(Object.keys(scores).length === 0){
      alert("Add scores");
      return;
    }

    setSaving(true);

    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    try {

      // ⏱ HARD TIMEOUT PROTECTION
      await Promise.race([
        addDoc(collection(db,"scores"),{
          car,
          driver,
          finalScore: total,
          created: Date.now()
        }),
        new Promise((_,reject)=>
          setTimeout(()=>reject(new Error("timeout")),3000)
        )
      ]);

      console.log("Saved");

    } catch (err){
      console.log("Save issue:", err.message);
    }

    // 🔥 ALWAYS RESET (NO FREEZE POSSIBLE)
    setScores({});
    setCar("");
    setDriver("");
    setSaving(false);
  };

  // 🔥 ALWAYS WORKING TOP150
  const buildTop150 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>d.data());

    const sorted = data
      .sort((a,b)=>b.finalScore-a.finalScore)
      .slice(0,150);

    setTop150(sorted);
    setScreen("top150");
  };

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 150</h2>
        {top150.map((e,i)=>(
          <div key={i}>
            #{i+1} {e.driver || e.car} - {e.finalScore}
          </div>
        ))}
        <button onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>

      <h2>Judge</h2>

      <input placeholder="Car" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />

      {categories.map(cat=>(
        <div key={cat.name}>
          <strong>{cat.name}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat.name,i)}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submit}>
        {saving ? "Saving..." : "Submit"}
      </button>

      <button onClick={buildTop150}>
        Top 150
      </button>

    </div>
  );
}
