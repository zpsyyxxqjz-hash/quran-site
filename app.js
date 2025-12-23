const surahList = document.getElementById('surah-list');
const quranArea = document.getElementById('quran-text-area');
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const seekSlider = document.getElementById('seek-slider');
const reciterSelect = document.getElementById('reciter-select');

// 1. وظيفة تحميل قائمة السور
async function fetchSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        surahList.innerHTML = ''; // مسح رسالة التحميل
        data.data.forEach(surah => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${surah.number}.</span> ${surah.name}`;
            li.onclick = () => loadSurahContent(surah.number, surah.name);
            surahList.appendChild(li);
        });
    } catch (error) {
        surahList.innerHTML = '<li style="color: #ff4d4d;">فشل الاتصال بالخادم. حاول مرة أخرى.</li>';
    }
}

// 2. وظيفة تحميل الآيات
async function loadSurahContent(id, name) {
    quranArea.innerHTML = `<p>جاري تحميل سورة ${name}...</p>`;
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const data = await response.json();
        
        quranArea.innerHTML = `<h1 style="color: var(--gold); margin-bottom: 30px;">${name}</h1>`;
        data.data.ayahs.forEach(ayah => {
            quranArea.innerHTML += `<span class="ayah">${ayah.text} <span class="ayah-num">﴿${ayah.numberInSurah}﴾</span></span> `;
        });
        
        setupAudio(id);
        document.getElementById('last-read-status').innerText = `أنت تستمع الآن: ${name}`;
    } catch (error) {
        quranArea.innerHTML = '<p>تعذر تحميل النص. تأكد من اتصالك بالإنترنت.</p>';
    }
}

// 3. وظيفة مشغل الصوت
function setupAudio(id) {
    const reciter = reciterSelect.value;
    const surahId = id.toString().padStart(3, '0');
    audioPlayer.src = `https://download.quranicaudio.com/quran/${reciter}/${surahId}.mp3`;
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// 4. التحكم في الأزرار
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
    document.getElementById('current-time').innerText = formatTime(audioPlayer.currentTime);
    document.getElementById('duration-time').innerText = formatTime(audioPlayer.duration);
};

seekSlider.oninput = () => {
    audioPlayer.currentTime = (seekSlider.value / 100) * audioPlayer.duration;
};

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

// تبديل الثيم
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('dark');
};

// البدء عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', fetchSurahs);
