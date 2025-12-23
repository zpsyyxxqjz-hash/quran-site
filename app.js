const surahListContainer = document.getElementById('surah-list');
const quranDisplayArea = document.getElementById('quran-display');
const audioObj = document.getElementById('main-audio-player');
const playPauseBtn = document.getElementById('play-pause');
const seekSlider = document.getElementById('seek-slider');

// 1. جلب قائمة السور عند التشغيل
async function startApp() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        surahListContainer.innerHTML = '';
        
        data.data.forEach(surah => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${surah.number}. ${surah.name}</span>`;
            li.onclick = () => getSurahData(surah.number, surah.name);
            surahListContainer.appendChild(li);
        });
    } catch (error) {
        surahListContainer.innerHTML = '<li style="color:var(--gold)">عذراً، فشل تحميل القائمة</li>';
    }
}

// 2. تحميل نص السورة وتشغيل صوت العفاسي
async function getSurahData(id, name) {
    document.getElementById('surah-title').innerText = "سورة " + name;
    quranDisplayArea.innerHTML = '<p style="color:var(--gold); font-size: 1.5rem;">جاري التحميل...</p>';
    
    try {
        // جلب النص
        const resText = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const textData = await resText.json();
        
        quranDisplayArea.innerHTML = '';
        textData.data.ayahs.forEach(ayah => {
            quranDisplayArea.innerHTML += `<span>${ayah.text} <b style="color:var(--gold)">﴿${ayah.numberInSurah}﴾</b> </span>`;
        });
        
        // جلب وتفعيل صوت العفاسي
        const formattedId = id.toString().padStart(3, '0');
        audioObj.src = `https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/${formattedId}.mp3`;
        audioObj.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
    } catch (err) {
        quranDisplayArea.innerHTML = 'حدث خطأ أثناء تحميل السورة.';
    }
}

// 3. أزرار التحكم والوقت
playPauseBtn.onclick = () => {
    if (audioObj.paused) {
        audioObj.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioObj.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

audioObj.ontimeupdate = () => {
    const progress = (audioObj.currentTime / audioObj.duration) * 100 || 0;
    seekSlider.value = progress;
    document.getElementById('current-time').innerText = formatTimeDisplay(audioObj.currentTime);
    document.getElementById('duration-time').innerText = formatTimeDisplay(audioObj.duration);
};

seekSlider.oninput = () => {
    audioObj.currentTime = (seekSlider.value / 100) * audioObj.duration;
};

function formatTimeDisplay(seconds) {
    if (!seconds) return "0:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

// بدء التطبيق
startApp();
