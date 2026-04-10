import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// ================= BUTTON STYLES (MOVE TO TOP) =================
const btnGreen = {
margin: 10,
padding: "14px 20px",
background: "green",
color: "#fff",
border: "none",
borderRadius: "10px"
};

const btnBlue = {
margin: 10,
padding: "14px 20px",
background: "#007bff",
color: "#fff",
border: "none",
borderRadius: "10px"
};

const btnYellow = {
margin: 10,
padding: "14px 20px",
background: "#ffc107",
color: "#000",
border: "none",
borderRadius: "10px"
};

// ================= FIREBASE =================
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

// ================= HOME =================
const Home = ({ setView }) => (

<button style={btnGreen} onClick={()=>setView("judge")}>START JUDGING</button>
<button style={btnBlue} onClick={()=>setView("leaderboard")}>LEADERBOARD</button>
<button style={btnYellow} onClick={()=>setView("finals")}>TOP 30 FINALS</button>

// ================= LEADERBOARD =================
function Leaderboard({ data }) {
const totals = {};

data.forEach(entry => {
const totalScore = entry.totalScore || 0;

if (!totals[entry.car]) {
  totals[entry.car] = { driver: entry.driver, total: 0 };
}

totals[entry.car].total += totalScore;

});

const sorted = Object.entries(totals)
.sort((a,b)=>b[1].total - a[1].total);

return (

Leaderboard
{sorted.map(([car,info],i)=>(

#{i+1} Car {car} - {info.driver} : {info.total}

))}

);
}

// ================= MAIN =================
export default function App() {
const [view, setView] = useState("home");
const [judge, setJudge] = useState(null);

const [car, setCar] = useState("");
const [driver, setDriver] = useState("");
const [gender, setGender] = useState("");
const [scores, setScores] = useState({});
const [allData, setAllData] = useState([]);

if (view === "home") return ;

if (!judge && view === "judge") {
return (
<div style={{textAlign:"center"}}>
Select Judge
{[1,2,3,4,5,6].map(j=>(
<button key={j} onClick={()=>setJudge(j)}>Judge {j}
))}

);
}

const setScore = (cat,val)=> setScores({...scores,[cat]});

const loadLeaderboard = async () => {
const snapshot = await getDocs(collection(db,"scores"));
setAllData(snapshot.docs.map(doc=>doc.data()));
setView("leaderboard");
};

const submit = async ()=>{
if(!car || !driver || !gender) return alert("Fill all fields");

const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);

await addDoc(collection(db,"scores"),{
  judge, car, driver, gender, scores, totalScore
});

alert("Submitted!");
setScores({});
setCar("");
setDriver("");
setGender("");

};

if (view === "leaderboard") {
return (


<button onClick={()=>setView("home")}>Back

);
}

if (view === "finals") {
return (
<div style={{textAlign:"center"}}>
Top 30 Finals
<button onClick={()=>setView("judge")}>Start Finals

);
}

return (

Judge {judge}

  <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
  <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />

  <div>
    <button style={btnBlue} onClick={()=>setGender("Male")}>Male</button>
    <button style={btnBlue} onClick={()=>setGender("Female")}>Female</button>
  </div>

  {categories.map(cat=>(
    <div key={cat}>
      <b>{cat}</b><br/>
      {Array.from({length:21},(_,i)=>(
        <button key={i} onClick={()=>setScore(cat,i)}>{i}</button>
      ))}
    </div>
  ))}

  <button style={btnGreen} onClick={submit}>Submit</button>
  <button onClick={loadLeaderboard}>Leaderboard</button>
  <button onClick={()=>setView("home")}>Home</button>
</div>

);
}
