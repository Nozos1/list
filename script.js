const startBtn = document.getElementById('start-btn');
const scrollWrapper = document.getElementById('scroll-wrapper');
const openScroll = document.getElementById('open-scroll');
const elText = document.getElementById('text');
const btnPause = document.getElementById('pause');
const btnReset = document.getElementById('reset');
const elVoice = document.getElementById('voiceSel');
const elRate = document.getElementById('rate');

const LETTER_TEXT = `
Chciałbym ci powiedzieć co czuję, lecz moją domeną są czyny nie słowa </br> 
Chciałbym żeby był ktoś inny, ale każdy sie przy tobie chowa 
Chciałbym żebyś nie czuła się już pogubiona. To normalne bo przecież każdy żyje pierwszy raz 
Chciałbym żebyśmy żyli wiele razy, ale żyjemy tylko raz 
Chciałbym żebyś znów popatrzyła na mnie swoimi pięknymi oczami 
Chciałbym żeby znów cały świat stanął mi przed oczami 
Chciałbym żebyś wiedziała że świat bez ciebie jest ciemnoszary 
Chciałbym żebyś wiedziała że mam poważne zamiary 
Chciałbym żebyś lepiej mnie poznała 
Chciałbym żebyś wiedziała że dla mnie jesteś doskonała 
Chciałbym...
`;

let typingTimer=null,isTyping=false,paused=false,typedIndex=0;
const TYPE_INTERVAL=30;
const scrollSound = new Audio('scroll.mp3');
scrollSound.volume = 0.8;

/* kliknięcie START */
startBtn.addEventListener('click', () => {
  // dźwięk rozwinięcia
  scrollSound.currentTime = 0;
  scrollSound.play();

  // uruchom animację rozwijania zwoju
  scrollWrapper.classList.add('scroll-rollout');

  // po 1.5 sekundy (koniec animacji) pokaż list
  setTimeout(() => {
    scrollWrapper.classList.add('hidden');           // ukryj zwój
    openScroll.classList.remove('hidden');           // pokaż rozwinięty pergamin
    openScroll.classList.add('active');
    startSequence();                                 // rozpocznij pisanie + lektor
  }, 1500);
});


/* Efekt pisania */
function typeNextChar() {
  if (paused) return;
  if (typedIndex <= LETTER_TEXT.length) {
    // bierzemy aktualny fragment tekstu
    let partial = LETTER_TEXT.slice(0, typedIndex);

    // każde "Chciałbym" zaczyna nowy akapit
    let formatted = partial.replace(/Chciałbym/gi, "<br>Chciałbym");

    // wyświetlamy z interpretacją HTML
    elText.innerHTML = formatted;

    typedIndex++;
    typingTimer = setTimeout(typeNextChar, TYPE_INTERVAL);
  } else {
    elText.classList.add("caret-off");
  }
}


/* Lektor */
const supportsTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voices=[], currentUtterance=null;

function populateVoices(){
  if(!supportsTTS)return;
  voices = speechSynthesis.getVoices();
  const pl = voices.filter(v => (v.lang||'').toLowerCase().startsWith('pl'));
  const sorted = [...pl, ...voices.filter(v => !pl.includes(v))];
  elVoice.innerHTML='';
  sorted.forEach(v=>{
    const o=document.createElement('option');
    o.value=v.name;
    o.textContent=`${v.name} ${v.lang?'· '+v.lang:''}`;
    elVoice.appendChild(o);
  });
  const pref = sorted.find(v=>(v.lang||'').toLowerCase().startsWith('pl'));
  if(pref) elVoice.value=pref.name;
}
if(supportsTTS){
  populateVoices();
  speechSynthesis.onvoiceschanged=populateVoices;
}

function speakText(){
  if(!supportsTTS)return;
  speechSynthesis.cancel();
  currentUtterance=new SpeechSynthesisUtterance(LETTER_TEXT);
  currentUtterance.rate=parseFloat(elRate.value||'1');
  const v=voices.find(v=>v.name===elVoice.value)||
           voices.find(v=>(v.lang||'').toLowerCase().startsWith('pl'))||
           voices[0];
  if(v) currentUtterance.voice=v;
  speechSynthesis.speak(currentUtterance);
}

/* Sekwencja startowa */
function startSequence(){
  elText.style.opacity='1';
  typeNextChar();
  speakText();
  btnPause.disabled=false;
}

/* Pauza i wznawianie */
function pauseAll(){
  paused=true;
  if(typingTimer)clearTimeout(typingTimer);
  if(supportsTTS)speechSynthesis.pause();
  btnPause.disabled=true;
}
function resumeAll(){
  paused=false;
  typeNextChar();
  if(supportsTTS)speechSynthesis.resume();
  btnPause.disabled=false;
}
function resetAll(){
  if(typingTimer)clearTimeout(typingTimer);
  elText.textContent='';
  elText.classList.remove('caret-off');
  elText.style.opacity='0';
  if(supportsTTS)speechSynthesis.cancel();
  typedIndex=0;
  paused=false;
}

// === Dynamiczne dopasowanie przycisku Start do pieczęci ===
window.addEventListener('load', positionStartButton);
window.addEventListener('resize', positionStartButton);

function positionStartButton() {
  const scrollWrapper = document.getElementById('scroll-wrapper');
  const btn = document.getElementById('start-btn');
  if (!scrollWrapper || !btn) return;

  // pobieramy rzeczywiste wymiary kontenera
  const rect = scrollWrapper.getBoundingClientRect();

  // proporcje położenia pieczęci względem obrazu
  const leftRatio = 0.555; // 55,5% szerokości (pozycja pieczęci)
  const topRatio = 0.52;   // 52% wysokości
  const sizeRatio = 0.09;  // 9% szerokości zwoju = rozmiar przycisku

  // obliczenia
  const btnSize = rect.width * sizeRatio;
  const btnX = rect.width * leftRatio;
  const btnY = rect.height * topRatio;

  // przypisz styl
  btn.style.width = `${btnSize}px`;
  btn.style.height = `${btnSize}px`;
  btn.style.fontSize = `${btnSize * 0.25}px`;
  btn.style.left = `${btnX}px`;
  btn.style.top = `${btnY}px`;
  btn.style.transform = 'translate(-50%, -50%)';
}



btnPause.addEventListener('click', ()=>paused?resumeAll():pauseAll());
btnReset.addEventListener('click', resetAll);
