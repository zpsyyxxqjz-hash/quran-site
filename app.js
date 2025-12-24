const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-pause');
const surahListUI = document.getElementById('surah-list');
const quranDisplay = document.getElementById('quran-display');

// 1. نظام تغيير الثيمات
function setTheme(name) {
    document.body.className = name;
    localStorage.setItem('user-theme', name); // حفظ الاختيار
}

document.getElementById('settings-btn').onclick = () => document.getElementById('settings-modal').style.display = 'block';
document.getElementById('close-modal').onclick = () => document.getElementById('settings-modal').style.display = 'none';

// 2. حل مشكلة الصوت - نظام السيرفر الاحتياطي
async function playSurah(id, name) {
    document.getElementById('surah-name').innerText = "سورة " + name;
    quranDisplay.innerHTML = '<div class="hex"><span>⏳</span></div> جاري التحميل...';
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const data = await res.json();
        quranDisplay.innerHTML = data.data.ayahs.map(a => `${a.text} <span style="color:var(--accent)">﴿${a.numberInSurah}﴾</span>`).join(' ');

        // محاولة التشغيل من السيرفر الأول
        const sId = id.toString().padStart(3, '0');
        audio.src = `https://server8.mp3quran.net/afs/${sId}.mp3`;
        
        audio.load();
        audio.play().catch(() => {
            // إذا فشل، جرب السيرفر الاحتياطي
            console.log("السيرفر الأول لم يستجب، جاري تجربة البديل...");
            audio.src = `https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/${sId}.mp3`;
            audio.play();
        });
        
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } catch (e) {
        quranDisplay.innerHTML = "حدث خطأ في الاتصال بالسيرفر.";
    }
}

// 3. جلب القائمة والبحث
let allSurahs = [];
async function init() {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();
    allSurahs = data.data;
    render(allSurahs);
    
    const savedTheme = localStorage.getItem('user-theme') || 'theme-cosmic';
    setTheme(savedTheme);
}

function render(list) {
    surahListUI.innerHTML = list.map(s => `<li onclick="playSurah(${s.number}, '${s.name}')">${s.number}. ${s.name}</li>`).join('');
}

document.getElementById('surah-search').oninput = (e) => {
    const filtered = allSurahs.filter(s => s.name.includes(e.target.value));
    render(filtered);
};

init();

// تحكم الوقت والمشغل
playBtn.onclick = () => audio.paused ? (audio.play(), playBtn.innerHTML='<i class="fas fa-pause"></i>') : (audio.pause(), playBtn.innerHTML='<i class="fas fa-play"></i>');
audio.ontimeupdate = () => {
    document.getElementById('seek-slider').value = (audio.currentTime / audio.duration) * 100 || 0;
    document.getElementById('current-time').innerText = Math.floor(audio.currentTime/60) + ":" + (Math.floor(audio.currentTime%60)).toString().padStart(2,'0');
};
