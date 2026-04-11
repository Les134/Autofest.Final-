
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

const categories = ["Smoke","Commitment","Style","Control","Entertainment"];
const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","Rotary"];
const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [screen,setScreen] = useState("judgeSelect");
  const [judge,setJudge] = useState("");

  const [judgeNames,setJudgeNames] = useState({
    1:"Judge 1",2:"Judge 2",3:"Judge 3",
    4:"Judge 4",5:"Judge 5",6:"Judge 6"
  });

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
  },[]);

  function loadData(){
    getDocs(collection(db,"scores")).then(function(q){
      var d = q.docs.map(function(doc){ return doc.data(); });
      setData(d);
    });
  }

  function setScore(cat,val){
    setScores(function(prev){
      var updated = Object.assign({}, prev);
      updated[cat] = val;
      return updated;
    });
  }

  function toggleDeduction(d){
    setDeductions(function(prev){
      var updated = Object.assign({}, prev);
      updated[d] = !updated[d];
      return updated;
    });
  }

  function submit(){

    if(Object.keys(scores).length === 0){
      alert("Add scores first");
      return;
    }

    var total = Object.values(scores).reduce(function(a,b){ return a+b; },0);

    var deductionCount = Object.values(deductions).filter(function(v){ return v; }).length;
    var finalScore = total - (deductionCount * 10);

    var payload = {
      judge: judge,
      car: car,
      driver: driver,
      rego: rego,
      carName: carName,
      gender: gender,
      carClass: carClass,
      finalScore: finalScore
    };

    setData(function(prev){
      return prev.concat([payload]);
    });

    addDoc(collection(db,"scores"), payload).catch(function(){
      console.log("save failed");
    });

    // reset
    setScores({});
    setDeductions({});
    setCar("");
    setDriver("");
    setRego("");
    setCarName("");
    setGender("");
    setCarClass("");
  }

  function combineScores(){
    var combined = {};

    data.forEach(function(entry){

      var key = entry.car || entry.rego || "Unknown";

      if(!combined[key]){
        combined[key] = {
          car: entry.car,
          driver: entry.driver,
          carClass: entry.carClass,
          gender: entry.gender,
          total: 0
        };
      }

      combined[key].total += entry.finalScore;
    });

    return Object.values(combined);
  }

  function buildTop150(){
    var sorted = combineScores()
      .sort(function(a,b){ return b.total - a.total; })
      .slice(0,150);

    setTop150(sorted);
    setScreen("top150");
  }

  var grouped = {};
  combineScores().forEach(function(e){
    var key = (e.carClass || "Unknown") + " - " + (e.gender || "Unknown");

    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  Object.keys(grouped).forEach(function(k){
    grouped[k].sort(function(a,b){
      return b.total - a.total;
    });
  });

  // SCREENS

  if(screen === "judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {[1,2,3,4,5,6].map(function(j){
          return (
            <div key={j} style={{marginBottom:15}}>
              <input
                style={input}
                value={judgeNames[j]}
                onChange={function(e){
                  var updated = Object.assign({}, judgeNames);
                  updated[j] = e.target.value;
                  setJudgeNames(updated);
                }}
              />

              <button style={btnBig} onClick={function(){
                setJudge(j);
                setScreen("judge");
              }}>
                {judgeNames[j]}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if(screen === "top150"){
    return (
      <div style={{padding:20}}>
        <h2>TOP 150</h2>

        {top150.map(function(e,i){
          return (
            <div key={i} style={row}>
              #{i+1} | Car No: {e.car} | Score: {e.total}
            </div>
          );
        })}

        <button style={btnBig} onClick={function(){setScreen("leaderboard");}}>
          Leaderboard
        </button>

        <button style={btnBig} onClick={function(){setScreen("judge");}}>
          Back
        </button>
      </div>
    );
  }

  if(screen === "leaderboard"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>

        {Object.keys(grouped).map(function(group){
          return (
            <div key={group}>
              <h3 style={header}>{group}</h3>

              {grouped[group].map(function(e,i){
                return (
                  <div key={i} style={row}>
                    #{i+1} | Car No: {e.car} | Score: {e.total}
                  </div>
                );
              })}
            </div>
          );
        })}

        <button style={btnBig} onClick={function(){setScreen("judge");}}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{padding:20}}>

      <h2>{judgeNames[judge]}</h2>

      <input style={input} placeholder="Car #" value={car} onChange={function(e){setCar(e.target.value);}}/>
      <input style={input} placeholder="Driver" value={driver} onChange={function(e){setDriver(e.target.value);}}/>
      <input style={input} placeholder="Rego" value={rego} onChange={function(e){setRego(e.target.value);}}/>
      <input style={input} placeholder="Car Name" value={carName} onChange={function(e){setCarName(e.target.value);}}/>

      <div style={section}>
        <button style={gender==="Male"?btnGreen:btn} onClick={function(){setGender("Male");}}>Male</button>
        <button style={gender==="Female"?btnGreen:btn} onClick={function(){setGender("Female");}}>Female</button>
      </div>

      <div style={section}>
        {classes.map(function(c){
          return (
            <button key={c}
              onClick={function(){setCarClass(c);}}
              style={carClass===c?btnBlue:btn}>
              {c}
            </button>
          );
        })}
      </div>

      {/* 🔥 DEDUCTIONS */}
      <div style={section}>
        <strong>Deductions</strong><br/>
        {deductionsList.map(function(d){
          return (
            <button key={d}
              onClick={function(){toggleDeduction(d);}}
              style={deductions[d]?btnRed:btn}>
              {d}
            </button>
          );
        })}
      </div>

      {categories.map(function(cat){
        return (
          <div key={cat} style={scoreBlock}>
            <strong>{cat}</strong>
            <div>
              {Array.from({length:21},(_,i)=>(
                <button key={i}
                  onClick={function(){setScore(cat,i);}}
                  style={scores[cat]===i?btnBlue:btn}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={buildTop150}>Top 150</button>
      <button style={btnBig} onClick={function(){setScreen("leaderboard");}}>Leaderboard</button>

    </div>
  );
}

// styles
const section = { marginTop:25, marginBottom:30 };
const scoreBlock = { marginTop:30, marginBottom:40 };
const input = {display:"block",width:"100%",padding:"14px",marginBottom:"12px"};
const row = {padding:"14px",marginBottom:"10px",background:"#eee",borderRadius:6};
const header = {background:"#000",color:"#fff",padding:"10px"};
const btn = {padding:"14px",margin:"6px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"18px",margin:"12px",background:"#000",color:"#fff"};          
           
          
           
 
  
           

   


      
     
    




