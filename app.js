 const surahListContainer = document.getElementById('surah-list');
const quranDisplayArea = document.getElementById('quran-display');
const audioObj = document.getElementById('main-audio-player');
const playPauseBtn = document.getElementById('play-pause');
const seekSlider = document.getElementById('seek-slider');
const searchInput = document.getElementById('surah-search');

let allSurahs = [];

async function initApp() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        allSurahs = data.data;
        displaySurahs(allSurahs);
    } catch (error) {
        surahListContainer.innerHTML = '<li>فشل في الاتصال</li>';
    }
}

function displaySurahs(surahs) {
    surahListContainer.innerHTML = '';
    surahs.forEach(surah => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${surah.number}. ${surah.name}</span>`;
        li.onclick = () => loadSurahContent(surah.number, surah.name);
        surahListContainer.appendChild(li);
    });
}

searchInput.oninput = (e) => {
    const term = e.target.value;
    const filtered = allSurahs.filter(s => s.name.includes(term) || s.number.toString().includes(term));
    displaySurahs(filtered);
};

async function loadSurahContent(id, name) {
    document.getElementById('surah-title').innerText = "سورة " + name;
    quranDisplayArea.innerHTML = '<p style="color:#D4AF37">جاري تحميل الآيات...</p>';
    
    try {
        const resText = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const textData = await resText.json();
        
        quranDisplayArea.innerHTML = '';
        textData.data.ayahs.forEach(ayah => {
            quranDisplayArea.innerHTML += `<span>${ayah.text} <span class="ayah-num">${ayah.numberInSurah}</span></span> `;
        });
        
        // تشغيل الصوت من سيرفر قوي جداً (العفاسي)
        const formattedId = id.toString().padStart(3, '0');
        audioObj.src = `https://server8.mp3quran.net/afs/${formattedId}.mp3`;
        audioObj.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (err) {
        quranDisplayArea.innerHTML = 'حدث خطأ في تحميل السورة.';
    }
}

playPauseBtn.onclick = () => {
    if (audioObj.paused) { audioObj.play(); playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    else { audioObj.pause(); playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
};

audioObj.ontimeupdate = () => {
    seekSlider.value = (audioObj.currentTime / audioObj.duration) * 100 || 0;
    document.getElementById('current-time').innerText = formatTime(audioObj.currentTime);
    document.getElementById('duration-time').innerText = formatTime(audioObj.duration);
};

seekSlider.oninput = () => { audioObj.currentTime = (seekSlider.value / 100) * audioObj.duration; };

function formatTime(s) {
    if (!s) return "0:00";
    let m = Math.floor(s/60); let sec = Math.floor(s%60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

initApp();

