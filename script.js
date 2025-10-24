const LETTER_TEXT = `Drogi Przyjacielu,

Piszę ten list, by przypomnieć Ci o sile spokoju.
W świecie pełnym pośpiechu to właśnie cisza daje najwięcej odpowiedzi.

Niech ten pergamin przypomina, że czasem warto zatrzymać się,
odetchnąć i po prostu być.

Z wyrazami szacunku,
Autor`;

const startBtn = document.getElementById('start-btn');
const rolled = document.getElementById('scroll-wrapper');
const openScroll = document.getElementById('open-scroll');
const elText = document.getElementById('text');
const btnPause = document.getElementById('pause');
const btnReset = document.getElementById('reset');
const elVoice = document.getElementById('voiceSel');
const elRate = document.getElementById('rate');

let typingTimer=null,isTyping=false,paused=false,typedIndex=0;
const TYPE_INTERVAL=30;

const scrollSound = new Audio('scroll.mp3');
scrollSound.volume = 0.7;

startBtn.addEventListener('click', () => {
  scrollSound.currentTime = 0;
  scrollSound.play();

  rolled.classList.add('hidden');
  openScroll.classList.remove('hidden');

  setTimeout(() => startSequence(), 1200);
});

function typeNextChar(){
  if(paused)return;
  if(typedIndex<=LETTER_TEXT.length){
    elText.textContent=LETTER_TEXT.slice(0,typedIndex);
    typedIndex++;
    typingTimer=setTimeout(typeNextChar,TYPE_INTERVAL);
  }else{
    elText.classList.add('caret-off');
    isTyping=false;
  }
}

const supportsTTS='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;
let voices=[]; let currentUtterance=null;

function populateVoices(){
  if(!supportsTTS)return;
  voices=window.speechSynthesis.getVoices();
  const pl=voices.filter(v=>(v.lang||'').toLowerCase().startsWith('pl'));
  const rest=voices.filter(v=>!(v.lang||'').toLowerCase().startsWith('pl'));
  const sorted=[...pl,...rest];
  elVoice.innerHTML='';
  sorted.forEach(v=>{
    const o=document.createElement('option');
    o.value=v.name;
    o.textContent=`${v.name} ${v.lang?'· '+v.lang:''}${pl.includes(v)?' (PL)':''}`;
    elVoice.appendChild(o);
  });
  const pref=sorted.find(v=>(v.lang||'').toLowerCase().startsWith('pl'));
  if(pref)elVoice.value=pref.name;
}
if(supportsTTS){
  populateVoices();
  window.speechSynthesis.onvoiceschanged=populateVoices;
}

function speakText(){
  if(!supportsTTS)return;
  window.speechSynthesis.cancel();
  currentUtterance=new SpeechSynthesisUtterance(LETTER_TEXT);
  currentUtterance.rate=parseFloat(elRate.value||'1');
  const v=voices.find(v=>v.name===elVoice.value)||
           voices.find(v=>(v.lang||'').toLowerCase().startsWith('pl'))||
           voices[0];
  if(v)currentUtterance.voice=v;
  window.speechSynthesis.speak(currentUtterance);
}

function startSequence(){
  resetAll();
  setTimeout(()=>{
    elText.style.opacity='1';
    typeNextChar();
    speakText();
  }, 1500);
  btnPause.disabled=false;
}

function pauseAll(){
  paused=true;
  if(typingTimer)clearTimeout(typingTimer);
  if(supportsTTS)window.speechSynthesis.pause();
  btnPause.disabled=true;
}
function resumeAll(){
  paused=false;
  typeNextChar();
  if(supportsTTS)window.speechSynthesis.resume();
  btnPause.disabled=false;
}

function resetAll(){
  if(typingTimer)clearTimeout(typingTimer);
  elText.textContent='';
  elText.classList.remove('caret-off');
  elText.style.opacity='0';
  if(supportsTTS)window.speechSynthesis.cancel();
  typedIndex=0;paused=false;
}

btnPause.addEventListener('click',()=>paused?resumeAll():pauseAll());
btnReset.addEventListener('click',resetAll);
