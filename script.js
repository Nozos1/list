const startBtn = document.getElementById('start-btn');
const scrollWrapper = document.getElementById('scroll-wrapper');
const openScroll = document.getElementById('open-scroll');
const elText = document.getElementById('text');
const scrollSound = document.getElementById('scrollSound');

const TYPE_INTERVAL = 100; // powolne i klimatyczne
let typedIndex = 0;
let typingTimer;
let paused = false;

const LETTER_TEXT = `
Droga Magdo,

Chciałbym ci powiedzieć co czuję, lecz moją stroną są czyny nie słowa 
Chciałbym żeby był ktoś inny, ale każdy sie przy tobie chowa 
Chciałbym żebyś nie czuła się już pogubiona. To normalne bo przecież każdy żyje pierwszy raz 
Chciałbym żebyśmy żyli wiele razy, ale żyjemy tylko raz 
Chciałbym żebyś znów popatrzyła na mnie swoimi pięknymi oczami 
Chciałbym żeby znów cały świat stanął mi przed oczami 
Chciałbym żebyś wiedziała że świat bez ciebie jest ciemnoszary 
Chciałbym żebyś wiedziała że mam poważne zamiary 
Chciałbym żebyś lepiej mnie poznała 
Chciałbym żebyś wiedziała że dla mnie jesteś doskonała 
Chciałbym...`;

startBtn.addEventListener('click', handleStartClick, { passive: true });
startBtn.addEventListener('touchstart', handleStartClick, { passive: true });

function handleStartClick(e) {
  e.preventDefault();

  try {
    scrollSound.currentTime = 0;
    scrollSound.play().catch(() => {});
  } catch (err) {
    console.warn('Brak dźwięku scroll.mp3 lub zablokowany autoplay');
  }

  scrollWrapper.classList.add('scroll-rollout');

  setTimeout(() => {
    scrollWrapper.classList.add('hidden');
    openScroll.classList.remove('hidden');
    openScroll.classList.add('active');
    startSequence();
  }, 1500);
}

function startSequence() {
  typedIndex = 0;
  elText.innerHTML = "";
  typeNextChar();
}

function typeNextChar() {
  if (paused) return;
  if (typedIndex <= LETTER_TEXT.length) {
    let partial = LETTER_TEXT.slice(0, typedIndex);
    // każdy akapit od nowej linii
    let formatted = partial.replace(/Chciałbym/gi, "<br>Chciałbym");
    elText.innerHTML = formatted;
    typedIndex++;
    typingTimer = setTimeout(typeNextChar, TYPE_INTERVAL);
  }
}
