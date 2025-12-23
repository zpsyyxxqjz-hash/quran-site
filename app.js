const surahList = document.getElementById('surah-list');
const quranArea = document.getElementById('quran-text-area');
const audioPlayer = document.getElementById('audio-player');
const reciterSelect = document.getElementById('reciter-select');
const themeToggle = document.getElementById('theme-toggle');
const lastRead = document.getElementById('last-read-status');
const playPauseBtn = document.getElementById('play-pause-btn');
const seekSlider = document.getElementById('seek-slider');
const currentTimeSpan = document.getElementById('current-time');
const durationTimeSpan = document.getElementById('duration-time');

// تحميل قائمة السور
async function loadSurahList() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const { data } = await res.json();
        surahList.innerHTML = '';
        data.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.number}. ${s.name}`;
            li.onclick = () => loadSurah(s.number, s.name);
            surahList.appendChild(li);
        });
    } catch {
        surahList.innerHTML = '<li>فشل تحميل السور</li>';
    }
}

// تحميل سورة
async function loadSurah(id, name) {
    quranArea.innerHTML = `<p>جاري تحميل سورة ${name}...</p>`;
    lastRead.textContent = `آخر ما قرأت: ${name}`;
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const { data } = await res.json();
        quranArea.innerHTML = `<h1>${name}</h1>`;
        data.ayahs.forEach(a => {
            quranArea.innerHTML += `<span class="ayah">${a.text} <span class="ayah-num">﴿${a.numberInSurah}﴾</span></span>`;
        });
        playAudio(id);
        localStorage.setItem('lastSurah', JSON.stringify({ id, name }));
    } catch {
        quranArea.innerHTML = '<p>تعذر عرض السورة</p>';
    }
}

function playAudio(surahId) {
    const reciter = reciterSelect.value;
    audioPlayer.src = `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahId}.mp3`;
    audioPlayer.play();
}

// التحكم في المشغل المخصص
playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

audioPlayer.ontimeupdate = () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekSlider.value = progress || 0;
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    durationTimeSpan.textContent = formatTime(audioPlayer.duration);
};

seekSlider.oninput = () => {
    audioPlayer.currentTime = (seekSlider.value / 100) * audioPlayer.duration;
};

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    let min = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${min}:${s < 10 ? '0' + s : s}`;
}

themeToggle.onclick = () => document.body.classList.toggle('dark');

window.onload = () => {
    loadSurahList();
    const saved = JSON.parse(localStorage.getItem('lastSurah'));
    if (saved) lastRead.textContent = `آخر ما قرأت: ${saved.name}`;
};
