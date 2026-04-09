
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

function Leaderboard({ data }) {
  const totals = {};

  data.forEach(entry => {
    const totalScore = entry.totalScore || Object.values(entry.scores || {}).reduce((a,b)=>a+b,0);
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

  const top30 = sorted.slice(0,30);

  return (
    <div style={{padding:20}}>
      <h2>🏆 TOP 30</h2>
      {top30.map(([car,info],i)=>(
        <div key={car}>
          #{i+1} Car {car} - {info.driver} ({info.class}) : {info.total}
        </div>
      ))}

      <h2 style={{marginTop:30}}>📊 By Class</h2>

      {classes.map(cls=>{
        const classCars = sorted.filter(([_,info])=>info.class===cls);

        return (
          <div key={cls} style={{marginTop:20}}>
            <h3>{cls}</h3>
            {classCars.map(([car,info],i)=>(
              <div key={car}>
                #{i+1} Car {car} - {info.driver} : {info.total}
              </div>
            ))}
          </div>
        );
      })}
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
  const [allData, setAllData] = useState([]);

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

  const submit = async ()=>{
    if(!car || !driver || !gender || !carClass || Object.keys(scores).length === 0){
      return alert("Fill all fields");
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
    return (
      <div>
        <Leaderboard data={allData} />
        <button onClick={() => setView("judge")} style={{margin:20, padding:10}}>
          Back to Judging
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h2>Judge {judge}</h2>

      <div>
        <label>Car #: </label>
        <input value={car} onChange={(e)=>setCar(e.target.value)} />
      </div>

      <div>
        <label>Driver Name: </label>
        <input value={driver} onChange={(e)=>setDriver(e.target.value)} />
      </div>

      <div>
        <label>Gender: </label>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
        <p>Selected: {gender}</p>
      </div>

      <div>
        <label>Class: </label>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)} style={{margin:5}}>
            {c}
          </button>
        ))}
        <p>Selected: {carClass}</p>
      </div>

      {categories.map(cat=>(
        <div key={cat} style={{marginTop:10}}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)} style={{margin:2}}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submit} style={{marginTop:20,padding:10}}>
        Submit Score
      </button>

      <button onClick={()=>setScores({})} style={{marginLeft:10,padding:10}}>
        Clear Scores
      </button>

      <button onClick={loadLeaderboard} style={{marginTop:20,marginLeft:10,padding:10}}>
        View Leaderboard
      </button>
    </div>
  );
}
