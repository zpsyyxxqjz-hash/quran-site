// تعريف العناصر الأساسية
const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-pause');
const surahListUI = document.getElementById('surah-list');
const quranDisplay = document.getElementById('quran-display');
const seekSlider = document.getElementById('seek-slider');
const currentTimeSpan = document.getElementById('current-time');
const durationTimeSpan = document.getElementById('duration-time');
const surahNameDisplay = document.getElementById('surah-name');
const searchInput = document.getElementById('surah-search');

let allSurahs = []; // تخزين قائمة السور للبحث

// 1. نظام الثيمات الراقي
function setTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('user-theme', themeName);
}

// أزرار الإعدادات (المودال)
document.getElementById('settings-btn').onclick = () => {
    document.getElementById('settings-modal').style.display = 'flex';
};

document.getElementById('close-modal').onclick = () => {
    document.getElementById('settings-modal').style.display = 'none';
};

// 2. جلب قائمة السور عند تشغيل التطبيق
async function initApp() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const json = await response.json();
        allSurahs = json.data;
        renderSurahList(allSurahs);

        // استعادة الثيم المفضل للمستخدم
        const savedTheme = localStorage.getItem('user-theme') || 'theme-royal';
        setTheme(savedTheme);
    } catch (error) {
        surahListUI.innerHTML = '<li class="error-msg">فشل في تحميل قائمة السور</li>';
    }
}

// 3. عرض السور في القائمة الجانبية
function renderSurahList(list) {
    surahListUI.innerHTML = list.map(surah => `
        <li onclick="loadSurah(${surah.number}, '${surah.name}')">
            <span class="surah-num-small">${surah.number}</span>
            <span class="surah-name-text">${surah.name}</span>
        </li>
    `).join('');
}

// 4. تحميل السورة (النص + الصوت الاحترافي)
async function loadSurah(id, name) {
    surahNameDisplay.innerText = "سورة " + name;
    // تأثير التحميل الراقي
    quranDisplay.innerHTML = '<div class="loading-state">جاري جلب الآيات الكريمة...</div>';
    
    try {
        // جلب نص الآيات
        const resText = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const dataText = await resText.json();
        
        // عرض النص مع الشكل الهندسي (المعين) لرقم الآية كما طلبت
        quranDisplay.innerHTML = dataText.data.ayahs.map(ayah => `
            <span class="ayah-item">
                ${ayah.text} 
                <span class="ayah-num"><b>${ayah.numberInSurah}</b></span>
            </span>
        `).join(' ');

        // ضبط مصدر الصوت (الشيخ العفاسي) - نظام السيرفر المستقر
        const formattedId = id.toString().padStart(3, '0');
        audio.src = `https://server8.mp3quran.net/afs/${formattedId}.mp3`;
        
        audio.load();
        audio.play().then(() => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(err => {
            // محاولة ثانية بسيرفر احتياطي إذا فشل الأول
            audio.src = `https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/${formattedId}.mp3`;
            audio.play();
        });

    } catch (err) {
        quranDisplay.innerHTML = '<div class="error-msg">حدث خطأ أثناء تحميل السورة.</div>';
    }
}

// 5. التحكم في المشغل (Play / Pause)
playBtn.onclick = () => {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

// 6. تحديث الوقت وشريط التقدم (Progress Bar)
audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    seekSlider.value = progress;
    currentTimeSpan.innerText = formatTime(audio.currentTime);
    durationTimeSpan.innerText = formatTime(audio.duration);
};

// التنقل عبر شريط التقدم
seekSlider.oninput = () => {
    audio.currentTime = (seekSlider.value / 100) * audio.duration;
};

// دالة تنسيق الوقت
function formatTime(seconds) {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

// 7. وظيفة البحث السريع
searchInput.oninput = (e) => {
    const term = e.target.value.trim();
    const filtered = allSurahs.filter(s => 
        s.name.includes(term) || s.number.toString().includes(term)
    );
    renderSurahList(filtered);
};

// بدء تشغيل التطبيق
initApp();
