🔥 FULL CLEAN WORKING FILE (COPY ALL)
import React, { useState } from "react";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"];
const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function AppNEW(){

  const [screen,setScreen] = useState("home");
  const [judge,setJudge] = useState(null);

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const [data,setData] = useState([]);

  function setScore(cat,val){
    setScores(prev=>({...prev,[cat]:val}));
  }

  function toggleDeduction(d){
    setDeductions(prev=>({...prev,[d]:!prev[d]}));
  }

  function submit(){

    if(!car){
      alert("Enter car number");
      return;
    }

    if(Object.keys(scores).length===0){
      alert("Add scores");
      return;
    }

    const total = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = total + tyreScore - deductionTotal;

    const entry = {
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      judge,
      finalScore
    };

    setData(prev=>[...prev,entry]);

    // RESET
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  }

  function leaderboard(){
    return [...data].sort((a,b)=>b.finalScore-a.finalScore);
  }

  function top150(){
    return leaderboard().slice(0,150);
  }

  // ================= HOME =================
  if(screen==="home"){
    return (
      <div style={home}>
        <h1 style={{color:"#fff"}}>AutoFest Burnout Champs</h1>

        <button style={btnBig} onClick={()=>setScreen("judgeSelect")}>
          Start Judging
        </button>

        <button style={btnBig} onClick={()=>setScreen("top150")}>
          View Leaderboard
        </button>
      </div>
    );
  }

  // ================= JUDGE SELECT =================
  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={btnBig} onClick={()=>{setJudge(j);setScreen("judge")}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  // ================= TOP 150 =================
  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>Top 150</h2>

        {top150().map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | Car {e.car} | {e.driver} | Score: {e.finalScore}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("home")}>
          Home
        </button>
      </div>
    );
  }

  // ================= JUDGING =================
  return (
    <div style={{padding:20}}>

      <h3>Judge {judge}</h3>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)}/>
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)}/>
      <input style={input} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)}/>
      <input style={input} placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)}/>

      <div>
        <button style={gender==="Male"?btnGreen:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?btnGreen:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c} style={carClass===c?btnBlue:btn} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)} style={scores[cat]===i?btnRed:btn}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <div>
        <strong>Blown Tyres (5pts each)</strong><br/>
        <button style={tyres.left?btnRed:btn} onClick={()=>setTyres(prev=>({...prev,left:!prev.left}))}>Left</button>
        <button style={tyres.right?btnRed:btn} onClick={()=>setTyres(prev=>({...prev,right:!prev.right}))}>Right</button>
      </div>

      <div>
        <strong>Deductions</strong><br/>
        {deductionsList.map(d=>(
          <button key={d} onClick={()=>toggleDeduction(d)} style={deductions[d]?btnRed:btn}>
            {d}
          </button>
        ))}
      </div>

      <button style={btnBig} onClick={submit}>Submit</button>
      <button style={btnBig} onClick={()=>setScreen("top150")}>Top 150</button>
      <button style={btnBig} onClick={()=>setScreen("home")}>Home</button>

      <h3>Leaderboard</h3>

      {leaderboard().map((e,i)=>(
        <div key={i} style={row}>
          #{i+1} | Car {e.car} | {e.driver} | Score: {e.finalScore}
        </div>
      ))}

    </div>
  );
}

// styles
const home = {
  height:"100vh",
  background:"#000",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center"
};

const input = {display:"block",width:"100%",padding:"14px",marginBottom:"10px"};
const row = {padding:"10px",background:"#eee",marginBottom:"6px"};
const btn = {padding:"10px",margin:"4px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"16px",margin:"10px",background:"#000",color:"#fff"};
