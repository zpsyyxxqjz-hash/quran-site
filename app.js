const surahList = document.getElementById("surah-list");
const quran = document.getElementById("quran");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const reciter = document.getElementById("reciter");
const status = document.getElementById("status");

let currentSurah = null;

/* تحميل السور */
fetch("https://api.alquran.cloud/v1/surah")
.then(res => res.json())
.then(json => {
    surahList.innerHTML = "";
    json.data.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.number}. ${s.name}`;
        li.onclick = () => loadSurah(s.number, s.name);
        surahList.appendChild(li);
    });
});

/* تحميل سورة */
async function loadSurah(id, name) {
    status.textContent = `سورة ${name}`;
    quran.innerHTML = "جاري التحميل...";

    const res = await fetch("https://api.alquran.cloud/v1/quran/ar.uthmani");
    const data = await res.json();
    const surah = data.data.surahs.find(s => s.number === id);

    quran.innerHTML = `<h2>${name}</h2>`;
    surah.ayahs.forEach(a => {
        quran.innerHTML += `${a.text} <span style="color:#D4AF37">﴿${a.numberInSurah}﴾</span> `;
    });

    currentSurah = id;
    loadAudio();
}

/* تحميل الصوت */
function loadAudio() {
    if (!currentSurah) return;

    const reader = reciter.value;
    audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${reader}/${currentSurah}.mp3`;
    audio.load();
}

/* زر تشغيل */
playBtn.onclick = () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
};

/* تغيير القارئ */
reciter.onchange = () => {
    loadAudio();
    audio.play();
    playBtn.textContent = "⏸";
};
