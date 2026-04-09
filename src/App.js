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
function Leaderboard({ data }) {
  const totals = {};

  data.forEach(entry => {
    const totalScore = Object.values(entry.scores || {}).reduce((a,b)=>a+b,0);

    if (!totals[entry.car]) {
      totals[entry.car] = {
        driver: entry.driver,
        total: 0
      };
    }

    totals[entry.car].total += totalScore;
  });

  const sorted = Object.entries(totals)
    .sort((a,b)=>b[1].total - a[1].total);

  return (
    <div style={{padding:20}}>
      <h2>Leaderboard</h2>
      {sorted.map(([car,info],i)=>(
        <div key={car}>
          #{i+1} Car {car} - {info.driver} : {info.total}
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
  const [scores, setScores] = useState({});

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

  const submit = async ()=>{
    if(!car || !driver || !gender){
      return alert("Fill all fields");
    }

    await addDoc(collection(db,"scores"),{
      judge,
      car,
      driver,
      gender,
      scores,
      time:new Date()
    });

    alert("Score submitted!");
    setScores({});
    setCar("");
    setDriver("");
    setGender("");
  };

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
    </div>
  );
}

