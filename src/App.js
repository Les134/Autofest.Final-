import React, { useState, useEffect } from "react";
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

  const [judgeNames,setJudgeNames] = useState({
    1:"Judge 1",2:"Judge 2",3:"Judge 3",
    4:"Judge 4",5:"Judge 5",6:"Judge 6"
  });

  const [locked,setLocked] = useState(false);

  const [data,setData] = useState([]);
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
    loadData();

    const savedJudge = localStorage.getItem("judge");
    if(savedJudge){
      setJudge(savedJudge);
      setLocked(true);
      setScreen("judge");
    }
  },[]);

  function loadData(){
    getDocs(collection(db,"scores")).then(q=>{
      setData(q.docs.map(doc=>doc.data()));
    });
  }

  function startEvent(){ setScreen("judgeSelect"); }

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

    if(Object.keys(scores).length===0){
      alert("Add scores");
      return;
    }

    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = total + tyreScore - deductionTotal;

    const payload = {
      id: Date.now(),
      eventName,
      judge,
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      finalScore
    };

    setData(prev=>[...prev,payload]);
    addDoc(collection(db,"scores"), payload).catch(()=>{});

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  }

  function combineScores(){
    const combined = {};

    data.forEach(e=>{
      const key = e.car || e.rego || e.id;

      if(!combined[key]){
        combined[key]={
          car:e.car||"",
          driver:e.driver||"",
          rego:e.rego||"",
          carName:e.carName||"",
          carClass:e.carClass,
          gender:e.gender,
          total:0
        };
      }

      combined[key].driver = e.driver || combined[key].driver;
      combined[key].rego = e.rego || combined[key].rego;

      combined[key].total += e.finalScore;
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

  // ---------- SCREENS ----------

  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>🏆 TOP 30 FINALS (OVERALL)</h2>

        {top30.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | Car: {e.car} | Driver: {e.driver} | Score: {e.total}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>Top 150</h2>

        {top150.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | Car: {e.car} | Driver: {e.driver} | Score: {e.total}
          </div>
        ))}

        <button style={btnBig} onClick={buildTop30}>Top 30 Finals</button>
        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  // ---------- MAIN ----------

  return (
    <div style={{padding:20}}>

      <h2>{eventName}</h2>
      <h3>{judgeNames[judge]}</h3>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input style={input} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>

      <div>
        <button style={gender==="Male"?btnGreen:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?btnGreen:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)} style={carClass===c?btnBlue:btn}>{c}</button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong>
          <div>
            {Array.from({length:21},(_,i)=>(
              <button key={i} onClick={()=>setScore(cat,i)} style={scores[cat]===i?btnRed:btn}>{i}</button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <strong>Blown Tyres (5pts each)</strong><br/>
        <button style={tyres.left?btnRed:btn} onClick={()=>setTyres({...tyres,left:!tyres.left})}>Left</button>
        <button style={tyres.right?btnRed:btn} onClick={()=>setTyres({...tyres,right:!tyres.right})}>Right</button>
      </div>

      <div>
        <strong>Deductions</strong><br/>
        {deductionsList.map(d=>(
          <button key={d} onClick={()=>toggleDeduction(d)} style={deductions[d]?btnRed:btn}>{d}</button>
        ))}
      </div>

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={buildTop150}>Top 150</button>

    </div>
  );
}

// styles
const input = {display:"block",width:"100%",padding:"14px",marginBottom:"12px"};
const row = {padding:"14px",marginBottom:"10px",background:"#eee"};
const btn = {padding:"14px",margin:"6px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"18px",margin:"12px",background:"#000",color:"#fff"};
