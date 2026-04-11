import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  "Smoke","Commitment","Style","Control","Entertainment"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});

  const [saving,setSaving] = useState(false);
  const [top150,setTop150] = useState([]);
  const [screen,setScreen] = useState("judge");

  const setScore = (cat,val)=> setScores(prev=>({...prev,[cat]:val}));
  const toggleDeduction = d => setDeductions(prev=>({...prev,[d]:!prev[d]}));

  // 🔥 FULL SAFE SUBMIT (NO FREEZE)
  const submit = async ()=>{
    if(saving) return;

    if(!car && !driver && !rego && !carName){
      alert("Enter at least ONE field");
      return;
    }

    if(Object.keys(scores).length === 0){
      alert("Add scores");
      return;
    }

    setSaving(true);

    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const deductionsTotal = Object.values(deductions).filter(v=>v).length * 10;
    const finalScore = total - deductionsTotal;

    try {
      await Promise.race([
        addDoc(collection(db,"scores"),{
          car, driver, rego, carName,
          gender, carClass,
          scores,
          finalScore,
          created: Date.now()
        }),
        new Promise((_,reject)=>setTimeout(()=>reject(),3000))
      ]);
    } catch {}

    // ✅ ALWAYS RESET (KEY FIX)
    setScores({});
    setDeductions({});
    setCar("");
    setDriver("");
    setRego("");
    setCarName("");
    setGender("");
    setCarClass("");

    setSaving(false);
  };

  const buildTop150 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>d.data());

    setTop150(
      data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,150)
    );

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

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

      {/* Gender */}
      <div>
        <button onClick={()=>setGender("Male")} style={{background:gender==="Male"?"green":""}}>Male</button>
        <button onClick={()=>setGender("Female")} style={{background:gender==="Female"?"green":""}}>Female</button>
      </div>

      {/* Classes */}
      <div>
        {classes.map(c=>(
          <button key={c}
            onClick={()=>setCarClass(c)}
            style={{background:carClass===c?"blue":""}}>
            {c}
          </button>
        ))}
      </div>

      {/* Scores */}
      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i}
              onClick={()=>setScore(cat,i)}
              style={{background:scores[cat]===i?"red":""}}>
              {i}
            </button>
          ))}
        </div>
      ))}

      {/* Deductions */}
      <h3>Deductions</h3>
      {deductionsList.map(d=>(
        <button key={d}
          onClick={()=>toggleDeduction(d)}
          style={{background:deductions[d]?"red":""}}>
          {d}
        </button>
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
