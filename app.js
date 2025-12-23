const surahList = document.getElementById('surah-list');
const quran = document.getElementById('quran');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const seek = document.getElementById('seek');
const time = document.getElementById('time');
const reciterSelect = document.getElementById('reciter');
const statusText = document.getElementById('status');

let fullQuran = null;

/* تحميل السور */
async function loadSurahs() {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const json = await res.json();
    surahList.innerHTML = '';

    json.data.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.number}. ${s.name}`;
        li.onclick = () => loadSurah(s.number, s.name);
        surahList.appendChild(li);
    });
}

/* تحميل المصحف كامل */
async function loadQuran() {
    const res = await fetch('https://api.alquran.cloud/v1/quran/ar.uthmani');
    const json = await res.json();
    fullQuran = json.data.surahs;
}

/* عرض السورة */
async function loadSurah(id, name) {
    statusText.textContent = `سورة ${name}`;
    if (!fullQuran) await loadQuran();

    const surah = fullQuran.find(s => s.number === id);
    quran.innerHTML = `<h2>${name}</h2>`;

    surah.ayahs.forEach(a => {
        quran.innerHTML += `${a.text} <span style="color:gold">﴿${a.numberInSurah}﴾</span> `;
    });

    playWithFallback(id);
}

/* تشغيل مع احتياطي */
function playWithFallback(id) {
    const primary = reciterSelect.value;
    const fallback = 'ar.minshawi';

    audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${primary}/${id}.mp3`;
    audio.load();

    audio.onerror = () => {
        audio.src = `https://cdn.islamic.network/quran/audio-surah/128/${fallback}/${id}.mp3`;
        audio.load();
    };

    audio.play();
    playBtn.textContent = '⏸';
}

/* التحكم */
playBtn.onclick = () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸';
    } else {
        audio.pause();
        playBtn.textContent = '▶';
    }
};

audio.ontimeupdate = () => {
    seek.value = (audio.currentTime / audio.duration) * 100 || 0;
    time.textContent =
        Math.floor(audio.currentTime / 60) + ':' +
        ('0' + Math.floor(audio.currentTime % 60)).slice(-2);
};

seek.oninput = () => {
    audio.currentTime = (seek.value / 100) * audio.duration;
};

loadSurahs();
