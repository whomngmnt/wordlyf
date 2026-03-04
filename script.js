// ============================================
// ДАНІ — тут зберігається вся інформація додатку
// ============================================

// Завантажуємо словник з пам'яті телефону
// JSON.parse — перетворює текст назад в масив
// || [] — якщо нічого не збережено, починаємо з порожнього масиву
let myDictionary = JSON.parse(localStorage.getItem('myDictionary')) || [];

// Таймер для автоперекладу (щоб не робити запит після кожної букви)
let timer = null;

// Змінні для свайпів
let startX = 0;      // де палець/мишка почали рух
let currentX = 0;    // на скільки пікселів зсунулись від початку
let isDragging = false; // чи зараз відбувається перетягування

// Встановлюємо початковий колір навбару
document.getElementById('main-nav').classList.add('nav-home');


// ============================================
// ЗБЕРЕЖЕННЯ В ПАМ'ЯТЬ ТЕЛЕФОНУ
// localStorage — це як маленька база даних прямо в браузері
// JSON.stringify — перетворює масив в текст, бо localStorage зберігає тільки текст
// ============================================
function saveData() {
    localStorage.setItem('myDictionary', JSON.stringify(myDictionary));
}


// ============================================
// ПЕРЕМІШУВАННЯ МАСИВУ РАНДОМНО
// Алгоритм Fisher-Yates — найнадійніший спосіб перемішати масив
// Проходимо з кінця масиву до початку
// На кожному кроці міняємо поточний елемент з випадковим
// ============================================
function shuffleDictionary() {
    for (let i = myDictionary.length - 1; i > 0; i--) {
        // Math.random() — випадкове число від 0 до 1
        // Math.floor() — округлює вниз (наприклад 2.7 → 2)
        const j = Math.floor(Math.random() * (i + 1));
        // Міняємо місцями елементи i та j
        [myDictionary[i], myDictionary[j]] = [myDictionary[j], myDictionary[i]];
    }
}


// ============================================
// ЗНАХОДИМО ЕЛЕМЕНТИ НА СТОРІНЦІ
// querySelectorAll — знаходить ВСІ елементи з таким класом
// getElementById — знаходить ОДИН елемент за id
// ============================================
const navButtons = document.querySelectorAll('.nav-button');
const allSections = document.querySelectorAll('.main-section');
const newWordInput = document.getElementById('new-word-input');
const translationPreview = document.getElementById('translation-preview');
const translateButton = document.getElementById('translate-button');
const learningCard = document.getElementById('learning-card');


// ============================================
// НАВІГАЦІЯ МІЖ ЕКРАНАМИ
// forEach — проходимо по кожній кнопці
// ============================================
navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Читаємо який екран треба показати (з атрибуту data-target в HTML)
        const target = e.currentTarget.dataset.target;
        if (!target) return; // якщо кнопка без data-target — ігноруємо

        // Ховаємо всі екрани
        allSections.forEach(s => s.classList.add('hidden'));

        // Показуємо тільки потрібний екран
        const targetSection = document.getElementById(target);
        if (targetSection) targetSection.classList.remove('hidden');

        // Прибираємо активний стиль з усіх кнопок навбару
        navButtons.forEach(b => b.classList.remove('active'));
        // Додаємо активний стиль тільки на натиснуту кнопку
        e.currentTarget.classList.add('active');

        // Змінюємо колір навбару залежно від екрану
const nav = document.getElementById('main-nav');
nav.className = ''; // скидаємо всі класи
if (target === 'main-page') nav.classList.add('nav-home');
if (target === 'learning')  nav.classList.add('nav-cards');
if (target === 'add-word')  nav.classList.add('nav-add');
if (target === 'dictionary') nav.classList.add('nav-words');

        // Залежно від екрану — оновлюємо потрібні дані
        if (target === 'learning') updateCard();
        if (target === 'dictionary') updateDictionaryList();
        if (target === 'main-page') updateMainPage();
    });
});


// ============================================
// ГОЛОВНА СТОРІНКА — оновлює статистику
// filter — відбирає елементи масиву за умовою
// .length — кількість елементів
// ============================================
function updateMainPage() {
    // Рахуємо скільки слів вивчено (progress досяг 5)
    const learned = myDictionary.filter(w => w.progress >= 5).length;
    // Рахуємо скільки слів в процесі (progress більше 0 але менше 5)
    const inProgress = myDictionary.filter(w => w.progress > 0 && w.progress < 5).length;
    // Загальна кількість слів
    const total = myDictionary.length;

    // Вставляємо цифри на сторінку
    document.getElementById('learned-count').textContent = learned;
    document.getElementById('in-progress-count').textContent = inProgress;
    document.getElementById('total-count').textContent = total;
}


// ============================================
// ОНОВИТИ КАРТКУ — показує наступне слово
// ============================================
function updateCard() {
    const cardEng = document.getElementById('card-eng');
    const cardUkr = document.getElementById('card-ukr');
    const cardStatus = document.getElementById('card-status');

    // Беремо тільки невивчені слова
    const wordsToLearn = myDictionary.filter(w => w.progress < 5);

    if (wordsToLearn.length > 0) {
        // Перемішуємо щоб слова йшли рандомно
        shuffleDictionary();
        // Після перемішування знову беремо перше невивчене
        const nextWord = myDictionary.filter(w => w.progress < 5)[0];

        cardEng.textContent = nextWord.english;
        cardUkr.textContent = nextWord.ukrainian;

        // Ховаємо переклад — з'явиться після натискання
        cardUkr.classList.add('hidden');

        // Повертаємо картку на початкову позицію
        learningCard.style.transform = "translateX(0) rotate(0deg)";
        learningCard.style.opacity = "1";

    } else if (myDictionary.length === 0) {
        // Словник порожній
        cardEng.textContent = "Додай слова ➕";
        cardUkr.textContent = "";
        cardUkr.classList.add('hidden');
    } else {
        // Всі слова вивчено
        cardEng.textContent = "Всі вивчено 🎉";
        cardUkr.textContent = "";
        cardUkr.classList.add('hidden');
    }

    // Очищаємо підказку ЗНАЮ / НЕ ЗНАЮ
    if (cardStatus) cardStatus.textContent = "";
}


// ============================================
// АВТОПЕРЕКЛАД
// Спрацьовує кожного разу коли користувач вводить букву
// ============================================
newWordInput.addEventListener('input', () => {
    // Скасовуємо попередній таймер щоб не спамити запитами
    clearTimeout(timer);

    // Якщо поле порожнє — скидаємо превью
    if (!newWordInput.value.trim()) {
        translationPreview.textContent = 'translation';
        return;
    }

    // Показуємо що йде переклад
    translationPreview.textContent = 'перекладаю...';

    // Чекаємо 500мс після останньої букви і тільки тоді робимо запит
    // encodeURIComponent — перетворює текст щоб він коректно передавався в URL
    timer = setTimeout(() => {
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(newWordInput.value)}&langpair=en|uk`)
            .then(res => res.json())  // отримуємо відповідь і перетворюємо з JSON формату
            .then(data => {
                translationPreview.textContent = data.responseData.translatedText;
            })
            .catch(() => {
                // .catch спрацьовує якщо запит не вдався (наприклад немає інтернету)
                translationPreview.textContent = 'помилка перекладу';
            });
    }, 500);
});


// ============================================
// ДОДАВАННЯ СЛОВА В СЛОВНИК
// ============================================
translateButton.addEventListener('click', () => {
    const english = newWordInput.value.trim(); // .trim() прибирає пробіли на початку і кінці
    const ukrainian = translationPreview.textContent;

    // Перевіряємо що все заповнено коректно
    if (!english || ukrainian === 'translation' || ukrainian === 'перекладаю...') return;

    // Перевіряємо чи слово вже є в словнику
    // .some() — повертає true якщо хоча б один елемент підходить під умову
    // .toLowerCase() — перетворює в малі літери щоб порівняння було без урахування регістру
    const exists = myDictionary.some(w => w.english.toLowerCase() === english.toLowerCase());
    if (exists) {
        translationPreview.textContent = '⚠️ Слово вже є';
        return;
    }

    // Додаємо нове слово в масив
    myDictionary.push({ english, ukrainian, progress: 0 });
    saveData();         // зберігаємо в пам'ять
    updateWordList();   // оновлюємо список на екрані

    // Очищаємо поля і показуємо підтвердження
    newWordInput.value = '';
    translationPreview.textContent = '✅ Додано!';

    // Через 1.5 секунди повертаємо текст назад
    setTimeout(() => {
        translationPreview.textContent = 'translation';
    }, 1500);
});


// ============================================
// СПИСОК СЛІВ НА ЕКРАНІ "ДОДАТИ"
// Показує останні 5 доданих слів
// ============================================
function updateWordList() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = ''; // очищаємо список перед оновленням

    // [...myDictionary] — копія масиву щоб не змінювати оригінал
    // .reverse() — перевертаємо щоб нові слова були зверху
    // .slice(0, 5) — беремо тільки перші 5
    const recent = [...myDictionary].reverse().slice(0, 5);

    recent.forEach((word) => {
        const realIndex = myDictionary.indexOf(word); // знаходимо справжній індекс для видалення
        const item = document.createElement('div');   // створюємо новий div елемент
        item.className = 'word-item';

        // innerHTML — вставляємо HTML всередину елемента
        item.innerHTML = `
            <div class="word-info">
                <span class="word-eng">${word.english}</span>
                <span class="word-arrow">→</span>
                <span class="word-ukr">${word.ukrainian}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="word-dot"></div>
                <button class="delete-btn" onclick="deleteWord(${realIndex})">🗑️</button>
            </div>
        `;
        wordList.appendChild(item); // додаємо елемент на сторінку
    });
}


// ============================================
// СПИСОК ВСІХ СЛІВ НА ЕКРАНІ "СЛОВНИК"
// Показує всі слова з прогресом у вигляді зірочок
// ============================================
function updateDictionaryList() {
    const wordList = document.getElementById('word-list-dictionary');
    wordList.innerHTML = '';

    if (myDictionary.length === 0) {
        wordList.innerHTML = '<p style="color:#c4bde0; text-align:center; margin-top:30px; font-weight:600;">Словник порожній 🌱<br>Додай перші слова!</p>';
        return;
    }

    myDictionary.forEach((word, index) => {
        const item = document.createElement('div');
        item.className = 'word-item';

        // Генеруємо рядок зірочок — заповнені і порожні
        // .repeat() — повторює рядок задану кількість разів
        const stars = '⭐'.repeat(word.progress) + '☆'.repeat(5 - word.progress);

        item.innerHTML = `
    <div class="word-info" style="flex-direction:column; align-items:flex-start; gap:2px;">
        <div style="display:flex; gap:10px; align-items:center;">
            <span class="word-eng">${word.english}</span>
            <span class="word-arrow">→</span>
            <span class="word-ukr">${word.ukrainian}</span>
        </div>
    </div>
`;
        wordList.appendChild(item);
    });
}


// ============================================
// ВИДАЛЕННЯ СЛОВА
// splice — видаляє елемент з масиву за індексом
// (index, 1) — починаючи з позиції index, видалити 1 елемент
// ============================================
function deleteWord(index) {
    myDictionary.splice(index, 1);
    saveData();
    updateWordList();
    updateDictionaryList();
    updateMainPage();
}


// ============================================
// СВАЙПИ — МИШКА (комп'ютер)
// ============================================

// Натиснули кнопку миші — починаємо тягнути
learningCard.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX; // запам'ятовуємо початкову позицію
    learningCard.style.transition = "none"; // вимикаємо анімацію під час руху
});

// Рухаємо мишку по всьому вікну (не тільки по картці)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return; // якщо не тягнемо — ігноруємо

    currentX = e.clientX - startX; // рахуємо зсув
    learningCard.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;

    // Показуємо підказку залежно від напрямку
    const status = document.getElementById('card-status');
    if (status) {
        if (currentX > 50) status.textContent = "ЗНАЮ ✅";
        else if (currentX < -50) status.textContent = "НЕ ЗНАЮ ❌";
        else status.textContent = "";
    }
});


// ============================================
// СВАЙПИ — ДОТИК (iPhone)
// Все те саме що і mouse, але для пальця
// e.touches[0] — координати першого пальця на екрані
// { passive: true } — підказка браузеру що ми не блокуємо скрол
// ============================================

learningCard.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    learningCard.style.transition = "none";
}, { passive: true });

learningCard.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX - startX;
    learningCard.style.transform = `translateX(${currentX}px) rotate(${currentX / 10}deg)`;

    const status = document.getElementById('card-status');
    if (status) {
        if (currentX > 50) status.textContent = "ЗНАЮ ✅";
        else if (currentX < -50) status.textContent = "НЕ ЗНАЮ ❌";
        else status.textContent = "";
    }
}, { passive: true });


// ============================================
// ЗАВЕРШЕННЯ СВАЙПУ — однакове для миші і дотику
// ============================================
const endDragging = () => {
    if (!isDragging) return;
    isDragging = false;

    // Вмикаємо плавну анімацію
    learningCard.style.transition = "transform 0.4s ease";

    if (currentX > 150) {
        // Свайп вправо достатньо далеко = ЗНАЮ
        // Картка відлітає за правий край
        learningCard.style.transform = "translateX(500px) rotate(30deg)";

        const words = myDictionary.filter(w => w.progress < 5);
        if (words.length > 0) {
            words[0].progress++; // +1 до прогресу
            saveData();
        }
        // Чекаємо 400мс поки картка відлетить і показуємо наступну
        setTimeout(() => { updateCard(); updateMainPage(); }, 400);

    } else if (currentX < -150) {
        // Свайп вліво достатньо далеко = НЕ ЗНАЮ
        // Картка відлітає за лівий край
        learningCard.style.transform = "translateX(-500px) rotate(-30deg)";

        const words = myDictionary.filter(w => w.progress < 5);
        if (words.length > 0) {
            const first = words[0];
            first.progress = 0; // скидаємо прогрес — треба вчити знову
            // Переміщуємо слово в кінець масиву щоб воно повернулось пізніше
            myDictionary.splice(myDictionary.indexOf(first), 1);
            myDictionary.push(first);
            saveData();
        }
        setTimeout(() => updateCard(), 400);

    } else {
        // Не достатньо далеко — повертаємо картку назад
        learningCard.style.transform = "translateX(0) rotate(0deg)";
    }

    currentX = 0; // скидаємо зсув
};

// Вішаємо завершення на мишку і дотик
window.addEventListener('mouseup', endDragging);
window.addEventListener('mouseleave', endDragging); // якщо мишка вилетіла за межі вікна
learningCard.addEventListener('touchend', endDragging);


// ============================================
// КЛІК НА КАРТКУ — показати/сховати переклад
// Math.abs — прибирає мінус (щоб -200 стало 200)
// Якщо зсув менше 10px — це був клік а не свайп
// classList.toggle — якщо є клас прибирає, якщо нема — додає
// ============================================
learningCard.addEventListener('click', () => {
    if (Math.abs(currentX) < 10) {
        const cardUkr = document.getElementById('card-ukr');
        if (cardUkr) cardUkr.classList.toggle('hidden');
    }
});


// ============================================
// СТАРТ ДОДАТКУ
// Підсвічуємо першу кнопку навбару як активну
// Завантажуємо початкові дані на всі екрани
// ============================================
document.querySelector('[data-target="main-page"]').classList.add('active');
updateMainPage();
updateWordList();