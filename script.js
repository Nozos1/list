const startBtn = document.getElementById('start-btn');
const scrollWrapper = document.getElementById('scroll-wrapper');
const openScroll = document.getElementById('open-scroll');
const elText = document.getElementById('text');
const btnPause = document.getElementById('pause');
const btnReset = document.getElementById('reset');
const elVoice = document.getElementById('voiceSel');
const elRate = document.getElementById('rate');

const LETTER_TEXT = `Drogi Przyjacielu,

Piszę ten list, by przypomnieć Ci o sile spokoju.
W świecie pełnym pośpiechu to właśnie cisza daje najwięcej odpowiedzi.

Niech ten pergamin przypomina, że czasem warto zatrzymać się,
odetchnąć i po prostu być.

Z wyrazami szacunku,
Autor`;

let typingTimer=null,isTyping=false,paused=false,typedIndex=0;
const TYPE_INTERVAL=30;
const scrollSound = new Audio('scroll.mp3');
scrollSound.volume = 0.8;

/* kliknięcie START */
startBtn.addEventListener('click', () => {
  // Dźwięk + ukrycie zwoju
  scrollSound.currentTime = 0;
  scrollSound.play();

  scrollWrapper.classList.add('hidden');
  openScroll.classList.remove('hidden');

  // Poczekaj chwilę na animację
  setTimeout(startSequence, 1200);
});

/* Efekt pisania */
function typeNextChar(){
  if(paused)return;
  if(typedIndex <= LETTER_TEXT.length){
    elText.textContent = LETTER_TEXT.slice(0, typedIndex);
    typedIndex++;
    typingTimer = setTimeout(typeNextChar, TYPE_INTERVAL);
  } else {
    elText.classList.add('caret-off');
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
