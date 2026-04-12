import React, { useState } from "react";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"];

export default function App(){

  // 🔥 START ON HOME SCREEN
  const [screen,setScreen] = useState("home");

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [data,setData] = useState([]);

  function setScore(cat,val){
    setScores({...scores,[cat]:val});
  }

  function submit(){

    if(!car){
      alert("Enter car number");
      return;
    }

    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    const entry = {
      car,
      driver,
      rego,
      carName,
      gender,
      carClass,
      total
    };

    setData([...data,entry]);

    // CLEAR FORM
    setScores({});
    setCar(""); 
    setDriver(""); 
    setRego(""); 
    setCarName("");
    setGender(""); 
    setCarClass("");
  }

  function leaderboard(){
    return [...data].sort((a,b)=>b.total-a.total);
  }

  function top150(){
    return leaderboard().slice(0,150);
  }

  // =========================
  // 🔥 COVER PAGE (WORKING)
  // =========================
  if(screen==="home"){
    return (
      <div style={home}>
        <h1 style={{color:"#fff",marginBottom:30}}>
          AutoFest Burnout Champs
        </h1>

        <button style={btnBig} onClick={()=>setScreen("judge")}>
          Start Judging
        </button>

        <button style={btnBig} onClick={()=>setScreen("top150")}>
          View Leaderboard
        </button>
      </div>
    );
  }

  // =========================
  // 🔥 TOP 150
  // =========================
  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>🏁 Top 150</h2>

        {top150().map((e,i)=>(
          <div key={i} style={row}>
            #{i+1} | Car No: {e.car} | {e.driver} | Total: {e.total}
          </div>
        ))}

        <button style={btnBig} onClick={()=>setScreen("home")}>
          ⬅ Home
        </button>
      </div>
    );
  }

  // =========================
  // 🔥 JUDGING SCREEN
  // =========================
  return (
    <div style={{padding:20}}>

      <h2>Burnout Scoring</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} style={input}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} style={input}/>
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} style={input}/>
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} style={input}/>

      {/* GENDER */}
      <div style={section}>
        <button style={gender==="Male"?btnGreen:btn} onClick={()=>setGender("Male")}>
          Male
        </button>

        <button style={gender==="Female"?btnGreen:btn} onClick={()=>setGender("Female")}>
          Female
        </button>
      </div>

      {/* CLASS */}
      <div style={section}>
        {classes.map(c=>(
          <button key={c} style={carClass===c?btnBlue:btn} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* SCORES */}
      {categories.map(cat=>(
        <div key={cat} style={section}>
          <strong>{cat}</strong><br/>

          <div style={rowWrap}>
            {Array.from({length:21},(_,i)=>(
              <button 
                key={i} 
                onClick={()=>setScore(cat,i)} 
                style={scores[cat]===i?btnRed:btn}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ACTION BUTTONS */}
      <div style={section}>
        <button style={btnBig} onClick={submit}>Submit</button>
        <button style={btnBig} onClick={()=>setScreen("top150")}>Top 150</button>
        <button style={btnBig} onClick={()=>setScreen("home")}>Home</button>
      </div>

      {/* LIVE LEADERBOARD */}
      <h3>Leaderboard</h3>

      {leaderboard().map((e,i)=>(
        <div key={i} style={row}>
          #{i+1} | Car: {e.car} | Driver: {e.driver} | Score: {e.total}
        </div>
      ))}

    </div>
  );
}

// =========================
// STYLES
// =========================

const home = {
  height:"100vh",
  background:"#000",
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  justifyContent:"center"
};

const input = {
  display:"block",
  width:"100%",
  padding:"14px",
  marginBottom:"12px",
  fontSize:"16px"
};

const section = {
  marginTop:"20px",
  marginBottom:"20px"
};

const row = {
  padding:"12px",
  background:"#eee",
  marginBottom:"8px",
  borderRadius:"6px"
};

const rowWrap = {
  display:"flex",
  flexWrap:"wrap",
  gap:"8px"
};

const btn = {
  padding:"10px 14px",
  margin:"4px"
};

const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};

const btnBig = {
  padding:"16px",
  margin:"10px",
  background:"#111",
  color:"#fff",
  fontSize:"16px"
};
