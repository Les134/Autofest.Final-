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
  "Stopping",
  "Barrier Contact",
  "Fail Exit",
  "Fire"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

export default function App() {
  const [screen, setScreen] = useState("home");

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

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = d => setDeductions(prev=>({...prev,[d]:!prev[d]}));

  // 🚀 FIXED FAST SUBMIT
  const submit = ()=>{
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

    addDoc(collection(db,"scores"),{
      car, driver, rego, carName,
      gender, carClass,
      scores,
      finalScore,
      created: Date.now()
    })
    .then(()=>{
      setSaved(true);

      // instant reset
      setScores({});
      setDeductions({});
      setCar(""); setDriver(""); setRego(""); setCarName("");
      setGender(""); setCarClass("");

      setTimeout(()=>setSaved(false),500);
    })
    .catch(()=>{
      alert("Save failed");
    })
    .finally(()=>{
      setSaving(false);
    });
  };

  const buildTop150 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>({id:d.id,...d.data()}));

    setTop150(data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,150));
    setScreen("top150");
  };

  const buildTop30 = async ()=>{
    const q = await getDocs(collection(db,"scores"));
    const data = q.docs.map(d=>({id:d.id,...d.data()}));

    setTop30(data.sort((a,b)=>b.finalScore-a.finalScore).slice(0,30));
    setScreen("top30");
  };

  const getWinners = ()=>{
    const result = {};
    classes.forEach(c=>{
      result[c] = top30
        .filter(e=>e.carClass===c)
        .sort((a,b)=>b.finalScore-a.finalScore)
        .slice(0,3);
    });
    return result;
  };

  if(screen==="home"){
    return (
      <div style={home}>
        <h1 style={{color:"#fff"}}>AUTO FEST</h1>
        <button style={btnBig} onClick={()=>setScreen("judge")}>START</button>
      </div>
    );
  }

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>🏁 TOP 150</h2>

        {top150.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | {e.driver || e.car || e.rego} | {e.finalScore}
          </div>
        ))}

        <button style={btnBig} onClick={buildTop30}>Top 30</button>
      </div>
    );
  }

  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>🔥 TOP 30</h2>

        {top30.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | {e.driver || e.car} | {e.finalScore}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("results")}>RESULTS</button>
      </div>
    );
  }

  if(screen==="results"){
    const winners = getWinners();

    return (
      <div style={{padding:20}}>
        <h1>🏆 RESULTS</h1>

        {classes.map(c=>(
          <div key={c}>
            <h2>{c}</h2>
            <div>🥇 {winners[c][0]?.driver || "-"}</div>
            <div>🥈 {winners[c][1]?.driver || "-"}</div>
            <div>🥉 {winners[c][2]?.driver || "-"}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Judge Screen</h2>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input style={input} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input style={input} placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

      <div style={section}>
        <button style={gender==="Male"?btnActive:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?btnActive:btn} onClick={()=>setGender("Female")}>Female</button>
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
        <div key={cat.name} style={{marginBottom:30}}>
          <strong>{cat.name}</strong>
          <div>
            {Array.from({length:cat.max+1},(_,i)=>(
              <button key={i}
                onClick={()=>setScore(cat.name,i)}
                style={scores[cat.name]===i?btnRed:btn}>
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h3>DEDUCTIONS</h3>
      {deductionsList.map(d=>(
        <button key={d}
          onClick={()=>toggleDeduction(d)}
          style={deductions[d]?btnRed:btn}>
          {d}
        </button>
      ))}

      <button style={btnBig} onClick={submit}>
        {saving ? "Saving..." : saved ? "Saved ✅" : "Submit"}
      </button>

      <button style={btnBig} onClick={buildTop150}>Top 150</button>
    </div>
  );
}

const home = {
  background:"#000",
  height:"100vh",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center"
};

const section = {marginBottom:20};

const input = {
  display:"block",
  width:"100%",
  padding:"12px",
  marginBottom:"10px"
};

const row = {
  padding:"12px",
  marginBottom:"10px",
  background:"#eee",
  borderRadius:"6px"
};

const btn = {
  padding:"16px",
  margin:"8px",
  fontSize:"16px",
  minWidth:"60px"
};

const btnRed = {
  ...btn,
  background:"red",
  color:"#fff"
};

const btnBlue = {
  ...btn,
  background:"blue",
  color:"#fff"
};

const btnActive = {
  ...btn,
  background:"green",
  color:"#fff"
};

const btnBig = {
  padding:"18px",
  margin:"12px",
  fontSize:"18px",
  background:"#000",
  color:"#fff"
};
