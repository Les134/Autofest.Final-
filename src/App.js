import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"];
const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [screen,setScreen] = useState("setup");
  const [eventName,setEventName] = useState("");

  const [judge,setJudge] = useState("");
  const [locked,setLocked] = useState(false);

  const [adminCode,setAdminCode] = useState("");

  const [judgeNames,setJudgeNames] = useState({
    1:"Judge 1",2:"Judge 2",3:"Judge 3",
    4:"Judge 4",5:"Judge 5",6:"Judge 6"
  });

  const [data,setData] = useState([]);
  const [competitors,setCompetitors] = useState({});
  const [top150,setTop150] = useState([]);
  const [top30,setTop30] = useState([]);

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  useEffect(()=>{
    const unsubscribe = onSnapshot(collection(db,"scores"), (snapshot)=>{
      setData(snapshot.docs.map(doc=>doc.data()));
    });

    const savedJudge = localStorage.getItem("judge");
    if(savedJudge){
      setJudge(savedJudge);
      setLocked(true);
      setScreen("judge");
    }

    return ()=>unsubscribe();
  },[]);

  function startEvent(){
    if(!eventName){ alert("Enter event name"); return; }
    setScreen("judgeSelect");
  }

  function selectJudge(j){
    setJudge(j);
    setLocked(true);
    localStorage.setItem("judge", j);
    setScreen("judge");
  }

  function setScore(cat,val){
    setScores(prev=>({...prev,[cat]:val}));
  }

  function toggleDeduction(d){
    setDeductions(prev=>({...prev,[d]:!prev[d]}));
  }

  function submit(){

    if(!car){
      alert("Car number required");
      return;
    }

    if(Object.keys(scores).length===0){
      alert("Add scores");
      return;
    }

    let comp = competitors[car];

    if(!comp){
      comp = { driver, rego, carName, gender, carClass };
      setCompetitors(prev=>({...prev,[car]:comp}));
    }

    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = total + tyreScore - deductionTotal;

    addDoc(collection(db,"scores"),{
      id: Date.now(),
      eventName,
      judge,
      car,
      ...comp,
      finalScore
    });

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  }

  function combineScores(){
    const combined = {};

    data.forEach(e=>{
      if(!combined[e.car]){
        combined[e.car] = {...e,total:0};
      }
      combined[e.car].total += e.finalScore;
    });

    return Object.values(combined);
  }

  function buildTop150(){
    setTop150(combineScores().sort((a,b)=>b.total-a.total).slice(0,150));
    setScreen("top150");
  }

  function buildTop30(){
    setTop30(combineScores().sort((a,b)=>b.total-a.total).slice(0,30));
    setScreen("top30");
  }

  function printResults(){
    const list = combineScores().sort((a,b)=>b.total-a.total);
    const win = window.open("");
    win.document.write(`<h1>${eventName}</h1>`);
    list.forEach((e,i)=>{
      win.document.write(`<div>#${i+1} | ${e.car} | ${e.driver} | ${e.total}</div>`);
    });
    win.print();
  }

  // ADMIN
  if(screen==="admin"){
    return (
      <div style={{padding:20}}>
        <input style={input} placeholder="Admin Code" value={adminCode} onChange={e=>setAdminCode(e.target.value)}/>
        <button style={btnBig} onClick={()=>adminCode==="ADMIN123"?setScreen("adminPanel"):alert("Wrong")}>Login</button>
      </div>
    );
  }

  if(screen==="adminPanel"){
    return (
      <div style={{padding:20}}>
        <button style={btnBig} onClick={()=>setData([])}>Clear Scores</button>
        <button style={btnBig} onClick={()=>{localStorage.removeItem("judge");setLocked(false)}}>Reset Judges</button>
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
    return (
      <div style={{padding:20}}>
        <input style={input} placeholder="Event Name" value={eventName} onChange={e=>setEventName(e.target.value)}/>
        <button style={btnBig} onClick={startEvent}>Start</button>
        <button style={btnBig} onClick={()=>setScreen("admin")}>Admin</button>
      </div>
    );
  }

  if(screen==="judgeSelect" && !locked){
    return (
      <div style={{padding:20}}>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={btnBig} onClick={()=>selectJudge(j)}>
            {judgeNames[j]}
          </button>
        ))}
      </div>
    );
  }

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        {top150.map((e,i)=>(
          <div key={i}>#{i+1} {e.car} {e.driver} {e.total}</div>
        ))}
        <button style={btnBig} onClick={buildTop30}>Top 30</button>
      </div>
    );
  }

  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        {top30.map((e,i)=>(
          <div key={i}>#{i+1} {e.car} {e.driver} {e.total}</div>
        ))}
      </div>
    );
  }

  if(screen==="leaderboard"){
    const grouped = {};
    combineScores().forEach(e=>{
      const key = (e.carClass||"")+"-"+(e.gender||"");
      if(!grouped[key]) grouped[key]=[];
      grouped[key].push(e);
    });

    return (
      <div style={{padding:20}}>
        {Object.keys(grouped).map(g=>(
          <div key={g}>
            <h3>{g}</h3>
            {grouped[g].sort((a,b)=>b.total-a.total).map((e,i)=>(
              <div key={i}>#{i+1} {e.car} {e.driver} {e.total}</div>
            ))}
          </div>
        ))}
        <button style={btnBig} onClick={printResults}>Print</button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>
      <h3>{judgeNames[judge]}</h3>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input style={input} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input style={input} placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)}>{i}</button>
          ))}
        </div>
      ))}

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={buildTop150}>Top 150</button>
      <button style={btnBig} onClick={()=>setScreen("leaderboard")}>Leaderboard</button>
    </div>
  );
}

const input = {display:"block",width:"100%",padding:"12px",marginBottom:"10px"};
const btnBig = {padding:"16px",margin:"10px",background:"#000",color:"#fff"};
