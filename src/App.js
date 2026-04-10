import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// 🔥 FIREBASE CONFIG
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

// 🔥 SCORING CATEGORIES
const categories = ["Smoke","Commitment","Style","Control","Entertainment"];

// ================= HOME SCREEN =================
const Home = ({ setView }) => (

<img 
  src="/icon-512.png"
  alt="AutoFest"
  style={{ width: "220px", marginBottom: "20px" }}
/>

<h1>AutoFest Burnout Champs</h1>
<p style={{opacity: 0.7}}>Professional Judging System</p>

<div style={{marginTop: 30}}>
  <button style={btnGreen} onClick={()=>setView("judge")}>
    START JUDGING
  </button>

  <button style={btnBlue} onClick={()=>setView("leaderboard")}>
    LEADERBOARD
  </button>

  <button style={btnYellow} onClick={()=>setView("finals")}>
    TOP 30 FINALS
  </button>
</div>

// ================= LEADERBOARD =================
function Leaderboard({ data }) {
const totals = {};

data.forEach(entry => {
const totalScore = entry.totalScore || 0;

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

Leaderboard
{sorted.map(([car,info],i)=>(

#{i+1} Car {car} - {info.driver} : {info.total}

))}

);
}

// ================= MAIN APP =================
export default function App() {

const [view, setView] = useState("home");
const [judge, setJudge] = useState(null);

const [car, setCar] = useState("");
const [driver, setDriver] = useState("");
const [gender, setGender] = useState("");
const [scores, setScores] = useState({});
const [allData, setAllData] = useState([]);

// ===== HOME =====
if (view === "home") {
return ;
}

// ===== SELECT JUDGE =====
if (!judge && view === "judge") {
return (
<div style={{padding:40,textAlign:"center"}}>
Select Judge
{[1,2,3,4,5,6].map(j=>(
<button key={j} onClick={()=>setJudge(j)} style={{margin:10,padding:20}}>
Judge {j}

))}

);
}

// ===== SET SCORE =====
const setScore = (cat,val)=>{
setScores({...scores,[cat]});
};

// ===== LOAD LEADERBOARD =====
const loadLeaderboard = async () => {
const querySnapshot = await getDocs(collection(db, "scores"));
const data = querySnapshot.docs.map(doc => doc.data());
setAllData(data);
setView("leaderboard");
};

// ===== SUBMIT =====
const submit = async ()=>{
if(!car || !driver || !gender || Object.keys(scores).length === 0){
return alert("Fill all fields and scores");
}

const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);

await addDoc(collection(db,"scores"),{
  judge,
  car,
  driver,
  gender,
  scores,
  totalScore,
  time:new Date()
});

alert("Score submitted!");
setScores({});
setCar("");
setDriver("");
setGender("");

};

// ===== LEADERBOARD VIEW =====
if (view === "leaderboard") {
return (


<button onClick={() => setView("home")} style={{margin:20}}>
Back


);
}

// ===== FINALS (TOP 30 RESET) =====
if (view === "finals") {
return (
<div style={{padding:40,textAlign:"center"}}>
Top 30 Finals
Fresh scoring round
<button onClick={()=>setView("judge")}>Start Finals Judging

);
}

// ===== JUDGING SCREEN =====
return (

Judge {judge}

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
    <button style={btnBlue} onClick={()=>setGender("Male")}>Male</button>
    <button style={btnBlue} onClick={()=>setGender("Female")}>Female</button>
    <p>{gender}</p>
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

  <button style={btnGreen} onClick={submit}>Submit</button>
  <button onClick={()=>setScores({})}>Clear</button>
  <button onClick={loadLeaderboard}>Leaderboard</button>
  <button onClick={()=>setView("home")}>Home</button>
</div>

);
}

// ================= BUTTON STYLES =================
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
