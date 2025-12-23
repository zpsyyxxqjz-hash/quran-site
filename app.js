const surahList = document.getElementById('surah-list');
const quranArea = document.getElementById('quran-text-area');
const audioPlayer = document.getElementById('audio-player');
const reciterSelect = document.getElementById('reciter-select');
const playPauseBtn = document.getElementById('play-pause-btn');
const seekSlider = document.getElementById('seek-slider');
const currentTimeSpan = document.getElementById('current-time');
const durationTimeSpan = document.getElementById('duration-time');
const lastRead = document.getElementById('last-read-status');

async function loadSurahList() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const json = await res.json();
        surahList.innerHTML = '';
        json.data.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.number}. ${s.name}`;
            li.onclick = () => loadSurah(s.number, s.name);
            surahList.appendChild(li);
        });
    } catch { surahList.innerHTML = '<li>تعذر تحميل القائمة</li>'; }
}

async function loadSurah(id, name) {
    quranArea.innerHTML = `<p>جاري تحميل ${name}...</p>`;
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const json = await res.json();
        quranArea.innerHTML = `<h1>${name}</h1>`;
        json.data.ayahs.forEach(a => {
            quranArea.innerHTML += `<span class="ayah">${a.text} <span class="ayah-num">﴿${a.numberInSurah}﴾</span></span> `;
        });
        lastRead.textContent = `أنت تستمع لـ: ${name}`;
        playAudio(id);
    } catch { quranArea.innerHTML = '<p>خطأ في تحميل النص</p>'; }
}

function playAudio(id) {
    const reciter = reciterSelect.value;
    const formattedId = id.toString().padStart(3, '0');
    audioPlayer.src = `https://download.quranicaudio.com/quran/${reciter}/${formattedId}.mp3`;
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

playPauseBtn.onclick = () => {
    if (audioPlayer.paused) { audioPlayer.play(); playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    else { audioPlayer.pause(); playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
};

audioPlayer.ontimeupdate = () => {
    seekSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    durationTimeSpan.textContent = formatTime(audioPlayer.duration);
};

seekSlider.oninput = () => audioPlayer.currentTime = (seekSlider.value / 100) * audioPlayer.duration;

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    let m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('dark');
window.onload = loadSurahList;
