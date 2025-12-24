const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-pause');
const surahListUI = document.getElementById('surah-list');
const quranDisplay = document.getElementById('quran-display');
const welcomeArea = document.getElementById('welcome-area');
const seekSlider = document.getElementById('seek-slider');

let allSurahs = [];

// جلب السور
async function init() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await res.json();
        allSurahs = data.data;
        renderList(allSurahs);
    } catch (e) { console.error("Error loading surahs"); }
}

function renderList(list) {
    surahListUI.innerHTML = list.map(s => `
        <li onclick="loadSurah(${s.number}, '${s.name}')">
            <span>${s.number}. ${s.name}</span>
        </li>
    `).join('');
}

// تحميل السورة
async function loadSurah(id, name) {
    welcomeArea.style.display = 'none';
    document.getElementById('active-surah-name').innerText = "سورة " + name;
    quranDisplay.innerHTML = '<p style="color: var(--matte-gold); opacity: 0.6;">جاري التحميل...</p>';
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const data = await res.json();
        
        quranDisplay.innerHTML = data.data.ayahs.map(a => `
            <span>${a.text} <span class="ayah-num"><b>${a.numberInSurah}</b></span></span>
        `).join(' ');

        const sId = id.toString().padStart(3, '0');
        audio.src = `https://server8.mp3quran.net/afs/${sId}.mp3`;
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (e) { quranDisplay.innerHTML = "حدث خطأ في الاتصال."; }
}

// التحكم
playBtn.onclick = () => {
    if (audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    else { audio.pause(); playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
};

audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    seekSlider.value = progress;
    document.getElementById('current-time').innerText = formatTime(audio.currentTime);
};

function formatTime(s) {
    const m = Math.floor(s/60); const sec = Math.floor(s%60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

// البحث
document.getElementById('surah-search').oninput = (e) => {
    const term = e.target.value;
    const filtered = allSurahs.filter(s => s.name.includes(term));
    renderList(filtered);
};

init();
