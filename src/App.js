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

const categories = ["Smoke","Commitment","Style","Control","Entertainment"];
const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

function Leaderboard({ data, title }) {
  const totals = {};

  data.forEach(entry => {
    const totalScore = entry.totalScore || 0;
    const key = entry.car;

    if (!totals[key]) {
      totals[key] = {
        driver: entry.driver,
        class: entry.carClass,
        total: 0
      };
    }

    totals[key].total += totalScore;
  });

  const sorted = Object.entries(totals)
    .sort((a,b)=>b[1].total - a[1].total);

  return (
    <div style={{padding:20}}>
      <h2>{title}</h2>

      {sorted.map(([car,info],i)=>(
        <div key={car}>
          #{i+1} Car {car} - {info.driver} ({info.class}) : {info.total}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [judge, setJudge] = useState(null);
  const [car, setCar] = useState("");
  const [driver, setDriver] = useState("");
  const [gender, setGender] = useState("");
  const [carClass, setCarClass] = useState("");
  const [scores, setScores] = useState({});
  const [view, setView] = useState("judge");
  const [mode, setMode] = useState("qualifying");
  const [allData, setAllData] = useState([]);
  const [finalists, setFinalists] = useState([]);

  if (!judge) {
    return (
      <div style={{padding:40,textAlign:"center"}}>
        <h1>Select Judge</h1>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} onClick={()=>setJudge(j)} style={{margin:10,padding:20}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  const setScore = (cat,val)=>{
    setScores({...scores,[cat]:val});
  };

  const loadLeaderboard = async () => {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const data = querySnapshot.docs.map(doc => doc.data());
    setAllData(data);
    setView("leaderboard");
  };

  const generateFinalists = async () => {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const data = querySnapshot.docs.map(doc => doc.data());

    const totals = {};

    data.filter(d=>d.round==="qualifying").forEach(entry => {
      if (!totals[entry.car]) {
        totals[entry.car] = {
          driver: entry.driver,
          class: entry.carClass,
          total: 0
        };
      }
      totals[entry.car].total += entry.totalScore;
    });

    const sorted = Object.entries(totals)
      .sort((a,b)=>b[1].total - a[1].total);

    const top30 = sorted.slice(0,30);
    setFinalists(top30);
    setMode("finals");

    alert("Top 30 locked in. Finals ready.");
  };

  const submit = async ()=>{
    if(!car || !driver || !gender || !carClass || Object.keys(scores).length === 0){
      return alert("Fill all fields");
    }

    if (mode === "finals") {
      const isFinalist = finalists.find(([c]) => c === car);
      if (!isFinalist) return alert("Not in Top 30");
    }

    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);

    await addDoc(collection(db,"scores"),{
      judge,
      car,
      driver,
      gender,
      carClass,
      scores,
      totalScore,
      round: mode,
      time:new Date()
    });

    alert("Score submitted!");
    setScores({});
    setCar("");
    setDriver("");
    setGender("");
    setCarClass("");
  };

  if (view === "leaderboard") {
    const qualifying = allData.filter(d=>d.round==="qualifying");
    const finals = allData.filter(d=>d.round==="finals");

    return (
      <div>
        <Leaderboard data={qualifying} title="Qualifying Leaderboard" />
        <Leaderboard data={finals} title="🏆 FINALS RESULTS (WINNERS)" />

        <button onClick={() => setView("judge")} style={{margin:20,padding:10}}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Judge {judge}</h2>
      <h3>Mode: {mode.toUpperCase()}</h3>

      <div>
        <label>Car #: </label>
        <input value={car} onChange={(e)=>setCar(e.target.value)} />
      </div>

      <div>
        <label>Driver: </label>
        <input value={driver} onChange={(e)=>setDriver(e.target.value)} />
      </div>

      <div>
        <label>Gender: </label>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        <label>Class: </label>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)} style={{margin:5}}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong>
          <p>Selected: {scores[cat] ?? "-"}</p>

          {Array.from({length:21},(_,i)=>(
            <button
              key={i}
              onClick={()=>setScore(cat,i)}
              style={{
                background: scores[cat]===i ? "red" : "#ccc",
                margin:2
              }}
            >
              {i}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submit} style={{marginTop:20}}>Submit</button>
      <button onClick={()=>setScores({})}>Clear</button>
      <button onClick={loadLeaderboard}>Leaderboard</button>
      <button onClick={generateFinalists}>Start Top 30 Finals</button>
    </div>
  );
}
