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
    const key = entry.car;
    if (!totals[key]) {
      totals[key] = {
        driver: entry.driver,
        class: entry.carClass,
        total: 0
      };
    }
    totals[key].total += entry.totalScore || 0;
  });

  const sorted = Object.entries(totals).sort((a,b)=>b[1].total - a[1].total);

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
  const [screen, setScreen] = useState("home");
  const [judge, setJudge] = useState(null);
  const [car, setCar] = useState("");
  const [driver, setDriver] = useState("");
  const [gender, setGender] = useState("");
  const [carClass, setCarClass] = useState("");
  const [scores, setScores] = useState({});
  const [mode, setMode] = useState("qualifying");
  const [allData, setAllData] = useState([]);
  const [finalists, setFinalists] = useState([]);

  const setScore = (cat,val)=>{
    setScores({...scores,[cat]:val});
  };

  const loadLeaderboard = async () => {
    const querySnapshot = await getDocs(collection(db, "scores"));
    const data = querySnapshot.docs.map(doc => doc.data());
    setAllData(data);
    setScreen("leaderboard");
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

    const sorted = Object.entries(totals).sort((a,b)=>b[1].total - a[1].total);
    setFinalists(sorted.slice(0,30));
    setMode("finals");

    alert("Top 30 locked. Finals ready.");
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

  // 🏁 HOME SCREEN WITH LOGO
  if (screen === "home") {
    return (
      <div style={{
        textAlign:"center",
        background:"#000",
        color:"#fff",
        height:"100vh",
        paddingTop:40
      }}>
<img 
  src="https://i.ibb.co/0yh124d4/BURNOUT-CHAMPS-SCORING.png" 
  alt="logo" 
  style={{
    width: "90%",
    maxWidth: "420px",
    height: "auto",
    marginBottom: "20px"
  }}
/>

        <div style={{marginTop:40}}>
          <button onClick={()=>setScreen("judge")} style={btnStyle}>
            START JUDGING
          </button>

          <button onClick={loadLeaderboard} style={btnStyle}>
            LEADERBOARD
          </button>

          <button onClick={generateFinalists} style={btnStyle}>
            START TOP 30 FINALS
          </button>
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") {
    const qualifying = allData.filter(d=>d.round==="qualifying");
    const finals = allData.filter(d=>d.round==="finals");

    return (
      <div style={{background:"#000", color:"#fff", minHeight:"100vh"}}>
        <Leaderboard data={qualifying} title="Qualifying" />
        <Leaderboard data={finals} title="🏆 Finals Results" />

        <button onClick={()=>setScreen("home")} style={btnStyle}>
          BACK
        </button>
      </div>
    );
  }

  if (!judge) {
    return (
      <div style={{textAlign:"center", padding:40}}>
        <h2>Select Judge</h2>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} onClick={()=>setJudge(j)} style={btnStyle}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Judge {judge} ({mode})</h2>

      <input placeholder="Car #" value={car} onChange={(e)=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={(e)=>setDriver(e.target.value)} />

      <div>
        <button onClick={()=>setGender("Male")} style={{background:gender==="Male"?"blue":"#ccc"}}>Male</button>
        <button onClick={()=>setGender("Female")} style={{background:gender==="Female"?"blue":"#ccc"}}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)}
            style={{background:carClass===c?"gold":"#ccc", margin:5}}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong>
          {Array.from({length:21},(_,i)=>(
            <button key={i}
              onClick={()=>setScore(cat,i)}
              style={{background:scores[cat]===i?"green":"#ccc", margin:2}}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submit} style={btnStyle}>Submit</button>
      <button onClick={()=>setScreen("home")} style={btnStyle}>Back</button>
    </div>
  );
}

const btnStyle = {
  padding:20,
  margin:10,
  fontSize:18,
  background:"#111",
  color:"#fff",
  border:"2px solid red",
  borderRadius:10
};
