import { useState } from "react"

export default function App(){

  const [name,setName] = useState("")
  const [name2,setName2] = useState("")
  const [mode,setMode] = useState("solo")

  return (

    <div style={{padding:40,fontFamily:"sans-serif"}}>

      <h1>🍱 SpoonLabs 랜덤런치</h1>

      <div style={{marginTop:20}}>

        <button onClick={()=>setMode("solo")}>혼자 신청</button>
        <button onClick={()=>setMode("group")} style={{marginLeft:10}}>같이 신청</button>

      </div>

      {mode==="solo" && (

        <div style={{marginTop:20}}>

          <input
          placeholder="이름"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          />

          <button style={{marginLeft:10}}>
          신청
          </button>

        </div>

      )}

      {mode==="group" && (

        <div style={{marginTop:20}}>

          <input
          placeholder="이름1"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          />

          <input
          placeholder="이름2"
          value={name2}
          onChange={(e)=>setName2(e.target.value)}
          style={{marginLeft:10}}
          />

          <button style={{marginLeft:10}}>
          같이 신청
          </button>

        </div>

      )}

    </div>

  )

}
