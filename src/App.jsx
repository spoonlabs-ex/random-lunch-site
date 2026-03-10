import { useState } from "react"

export default function App() {

  const [name,setName] = useState("")
  const [entries,setEntries] = useState([])

  const submit = async () => {

    if(!name) return

    const res = await fetch("/.netlify/functions/submitEntry",{
      method:"POST",
      body: JSON.stringify({name})
    })

    const data = await res.json()

    setEntries([...entries,{name}])
    setName("")
  }

  return (
    <div className="container">

      <div className="title">
        🍱 SpoonLabs 랜덤런치
      </div>

      <div className="card">

        <div className="inputRow">

          <input
            placeholder="이름 입력"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <button onClick={submit}>
            신청
          </button>

        </div>

      </div>

      <div className="card">

        <b>현재 신청자</b>

        <div className="characters">

          {entries.map((e,i)=>(
            <div
              key={i}
              className="character"
              style={{
                top:Math.random()*350,
                left:Math.random()*700
              }}
            >
              {e.name}
            </div>
          ))}

        </div>

      </div>

    </div>
  )
}
