mport React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// ✅ FIXED FIREBASE CONFIG
const firebaseConfig = {
apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
projectId: "autofest-burnout-judging-848fd",
storageBucket: "autofest-burnout-judging-848fd.appspot.com",
messagingSenderId: "742211958318",
appId: "1:742211958318:web:648c2bfd5b4e2af09391bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= STYLES =================
const btn = {
padding: 16,
margin: 10,
fontSize: 16,
borderRadius: 10,
border: "none"
};

// ================= DATA =================
const categories = ["Smoke","Commitment","Style","Control","Entertainment"];
const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];

// ================= APP =================
export default function App() {
const [screen, setScreen] = useState("home");
const [judge, setJudge] = useState(null);
const [car, setCar] = useState("");
const [driver, setDriver] = useState("");
const [gender, setGender] = useState("");
const [carClass, setCarClass] = useState("");
const [scores, setScores] = useState({});
const [allData, setAllData] = useState([]);

const setScore = (cat,val)=>{
setScores({...scores,[cat]});
};

const submit = async ()=>{
if(!car || !driver || !gender || !carClass) {
alert("Fill all fields");
return;
}

const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);

await addDoc(collection(db,"scores"),{
  judge, car, driver, gender, carClass, scores, totalScore
});

alert("Submitted!");
setScores({});
setCar("");
setDriver("");
setGender("");
setCarClass("");

};

const loadLeaderboard = async ()=>{
const snapshot = await getDocs(collection(db,"scores"));
setAllData(snapshot.docs.map(doc=>doc.data()));
setScreen("leaderboard");
};

// ================= HOME =================
if (screen === "home") {
return (
<div style={{textAlign:"center", background:"#000", color:"#fff", minHeight:"100vh", padding:30}}>

    <img src="/icon-512.png" alt="logo" style={{width:200}} />

    <h1>AutoFest Burnout Champs</h1>

    <button style={{...btn, background:"green", color:"#fff"}} onClick={()=>setScreen("judge")}>
      START JUDGING
    </button>

    <button style={{...btn, background:"blue", color:"#fff"}} onClick={loadLeaderboard}>
      LEADERBOARD
    </button>

  </div>
);

}

// ================= LEADERBOARD =================
if (screen === "leaderboard") {
const totals = {};

allData.forEach(entry=>{
  if(!totals[entry.car]){
    totals[entry.car] = {driver:entry.driver, total:0};
  }
  totals[entry.car].total += entry.totalScore || 0;
});

const sorted = Object.entries(totals).sort((a,b)=>b[1].total-a[1].total);

return (
  <div style={{padding:20}}>
    <h2>Leaderboard</h2>
    {sorted.map(([car,info],i)=>(
      <div key={car}>
        #{i+1} Car {car} - {info.driver} : {info.total}
      </div>
    ))}
    <button onClick={()=>setScreen("home")}>Back</button>
  </div>
);

}

// ================= JUDGE SELECT =================
if (!judge) {
return (
<div style={{textAlign:"center"}}>
Select Judge
{[1,2,3,4,5,6].map(j=>(
<button key={j} onClick={()=>setJudge(j)}>Judge {j}
))}

);
}

// ================= SCORING =================
return (

Judge {judge}

  <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
  <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />

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
    <div key={cat}>
      <b>{cat}</b><br/>
      {Array.from({length:21},(_,i)=>(
        <button key={i} onClick={()=>setScore(cat,i)}>{i}</button>
      ))}
    </div>
  ))}

  <button style={{...btn, background:"green", color:"#fff"}} onClick={submit}>
    Submit
  </button>

  <button onClick={()=>setScreen("home")}>Home</button>
</div>

);
}
