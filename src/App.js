import React, { useState } from "react";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = ["V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"];

export default function App(){

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

    setScores({});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");
  }

  function leaderboard(){
    return data.sort((a,b)=>b.total-a.total);
  }

  return (
    <div style={{padding:20}}>

      <h2>Burnout Scoring</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} style={input}/>
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} style={input}/>
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} style={input}/>
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} style={input}/>

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
        <div key={cat} style={{marginTop:10}}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)} style={scores[cat]===i?btnRed:btn}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <button style={btnBig} onClick={submit}>Submit</button>

      <h3>Leaderboard</h3>

      {leaderboard().map((e,i)=>(
        <div key={i} style={row}>
          #{i+1} | Car: {e.car} | Driver: {e.driver} | Score: {e.total}
        </div>
      ))}

    </div>
  );
}

const input = {display:"block",width:"100%",padding:"12px",marginBottom:"10px"};
const row = {padding:"10px",background:"#eee",marginBottom:"6px"};

const btn = {padding:"10px",margin:"4px"};
const btnRed = {...btn,background:"red",color:"#fff"};
const btnBlue = {...btn,background:"blue",color:"#fff"};
const btnGreen = {...btn,background:"green",color:"#fff"};
const btnBig = {padding:"14px",margin:"10px",background:"#000",color:"#fff"};
