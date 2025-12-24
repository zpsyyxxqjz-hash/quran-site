const audio = document.getElementById("main-audio");
const list = document.getElementById("surah-list");
const display = document.getElementById("quran-display");
const welcome = document.getElementById("welcome-area");

let surahs=[];

fetch("https://api.alquran.cloud/v1/surah")
.then(r=>r.json())
.then(d=>{
  surahs=d.data;
  list.innerHTML=surahs.map(s=>
    `<li onclick="loadSurah(${s.number},'${s.name}')">${s.number}. ${s.name}</li>`
  ).join("");
});

function loadSurah(id,name){
  welcome.style.display="none";
  fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`)
  .then(r=>r.json())
  .then(d=>{
    display.innerHTML=d.data.ayahs.map(a=>`${a.text} ۝`).join(" ");
    audio.src=`https://server8.mp3quran.net/afs/${String(id).padStart(3,'0')}.mp3`;
    audio.play();
    document.getElementById("active-surah-name").innerText="سورة "+name;
  });
}

document.getElementById("play-pause").onclick=()=>{
  audio.paused?audio.play():audio.pause();
};
