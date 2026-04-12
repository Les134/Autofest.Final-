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
  "Driver Skill & Control",
  "Blown Tyres"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];
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

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});

  useEffect(function(){
    loadData();

    // 🔥 restore session
    var savedJudge = localStorage.getItem("judge");
    if(savedJudge){
      setJudge(savedJudge);
      setLocked(true);
      setScreen("judge");
    }
  },[]);

  function loadData(){
    getDocs(collection(db,"scores")).then(function(q){
      setData(q.docs.map(function(doc){ return doc.data(); }));
    });
  }

  function startEvent(){
    if(!eventName){
      alert("Enter Event Name");
      return;
    }
    setScreen("judgeSelect");
  }

  function selectJudge(j){
    setJudge(j);
    setLocked(true);
    localStorage.setItem("judge", j);
    setScreen("judge");
  }

  function setScore(cat,val){
    setScores(prev=>{
      var u = Object.assign({}, prev);
      u[cat] = val;
      return u;
    });
  }

  function toggleDeduction(d){
    setDeductions(prev=>{
      var u = Object.assign({}, prev);
      u[d] = !u[d];
      return u;
    });
  }

  function submit(){

    var total = Object.values(scores).reduce((a,b)=>a+b,0);
    var deductionsTotal = Object.values(deductions).filter(v=>v).length * 10;
    var finalScore = total - deductionsTotal;

    var payload = {
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

    setData(prev=>prev.concat([payload]));

    addDoc(collection(db,"scores"), payload).catch(()=>{});

    setScores({});
    setDeductions({});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  }

  function combineScores(){
    var combined = {};
    data.forEach(e=>{
      var key = e.car || e.rego || "Unknown";
      if(!combined[key]){
        combined[key]={car:e.car,carClass:e.carClass,gender:e.gender,total:0};
      }
      combined[key].total += e.finalScore;
    });
    return Object.values(combined);
  }

  function buildTop150(){
    setTop150(combineScores().sort((a,b)=>b.total-a.total).slice(0,150));
    setScreen("top150");
  }

  // -------- SCREENS --------

  if(screen==="setup"){
    return (
      <div style={{padding:20}}>
        <h1>🏁 Event Setup</h1>

        <input
          style={input}
          placeholder="Event Name"
          value={eventName}
          onChange={e=>setEventName(e.target.value)}
        />

        <h3>Judges</h3>
        {[1,2,3,4,5,6].map(j=>(
          <input key={j}
            style={input}
            value={judgeNames[j]}
            onChange={e=>setJudgeNames({...judgeNames,[j]:e.target.value})}
          />
        ))}

        <button style={btnBig} onClick={startEvent}>
          Start Event
        </button>
      </div>
    );
  }

  if(screen==="judgeSelect" && !locked){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>
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
        <h2>{eventName} - Top 150</h2>
        {top150.map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | {e.car} | {e.total}
          </div>
        ))}
        <button style={btnBig} onClick={()=>setScreen("judge")}>Back</button>
      </div>
    );
  }

  // -------- MAIN JUDGE SCREEN --------

  return (
    <div style={{padding:20}}>

      <h2>{eventName}</h2>
      <h3>{judgeNames[judge]}</h3>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>

      <div>
        <button style={gender==="Male"?btnGreen:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?btnGreen:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c}
            onClick={()=>setCarClass(c)}
            style={carClass===c?btnBlue:btn}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>{
        var max = cat==="Blown Tyres"?5:20;

        return (
          <div key={cat} style={scoreBlock}>
            <strong>{cat}</strong>
            <div>
              {Array.from({length:max+1},(_,i)=>(
                <button key={i}
                  onClick={()=>setScore(cat,i)}
                  style={scores[cat]===i?btnRed:btn}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <strong>Deductions</strong><br/>
        {deductionsList.map(d=>(
          <button key={d}
            onClick={()=>toggleDeduction(d)}
            style={deductions[d]?btnRed:btn}>
            {d}
          </button>
        ))}
      </div>

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={buildTop150}>Top 150</button>

    </div>
  );
}

// styles
const input = {display:"block",width:"100%",padding:"14px",marginBottom:"12px"};
const scoreBlock = {marginTop:25,marginBottom:30};
const row = {padding:"14px",marginBottom:"10px",background:"#eee"};
const btn = {padding:"14px",margin:"6px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"18px",margin:"12px",background:"#000",color:"#fff"};
