(function(){
  // enhance behavior: require checkbox or scroll-to-bottom to enable Accept
  const originalGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices) : null;
  function blocked(){ return Promise.reject(new Error('Accept terms to enable camera')) }
  if(!navigator.mediaDevices) navigator.mediaDevices = { getUserMedia: blocked };
  navigator.mediaDevices.getUserMedia = function(constraints){
    const accepted = localStorage.getItem('termsAccepted') === '1';
    const camEnabled = localStorage.getItem('cameraEnabled') !== '0';
    return (accepted && camEnabled) ? (originalGetUserMedia ? originalGetUserMedia(constraints) : blocked()) : blocked();
  };

  const modal = document.getElementById('terms-modal');
  const accept = document.getElementById('terms-accept');
  const decline = document.getElementById('terms-decline');
  const termsBody = document.createElement('div');
  termsBody.className = 'terms-body';

  // move existing content into .terms-body for better layout
  const panel = modal.querySelector('.panel');
  while(panel.firstChild){
    const node = panel.firstChild;
    // stop when we reach actions div (buttons), keep actions at bottom
    if(node.classList && node.classList.contains('actions')) break;
    termsBody.appendChild(node);
  }
  // insert terms-body before actions
  const actions = panel.querySelector('.actions');
  panel.insertBefore(termsBody, actions);

  // Add checkbox row and print button inside actions
  const agreeRow = document.createElement('div');
  agreeRow.className = 'agree-row';
  agreeRow.innerHTML = '<label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="agree-check"> मैंने पढ़ लिया और सहमत हूँ</label>';
  actions.insertBefore(agreeRow, actions.firstChild);

  const printBtn = document.createElement('button');
  printBtn.className = 'btn btn-secondary';
  printBtn.textContent = 'Print';
  printBtn.addEventListener('click', ()=>{ window.print(); });
  actions.insertBefore(printBtn, actions.firstChild);

  // Add disable camera button
  const disableCamBtn = document.createElement('button');
  disableCamBtn.className = 'btn btn-secondary';
  disableCamBtn.textContent = 'Disable Camera';
  disableCamBtn.style.marginRight = '8px';
  disableCamBtn.addEventListener('click', ()=>{
    localStorage.setItem('cameraEnabled','0');
    localStorage.setItem('termsAccepted','1');
    stopAllStreams();
    hideCameraUI();
    closeModal();
  });
  actions.insertBefore(disableCamBtn, actions.firstChild);

  // disable accept until agreed or scrolled to bottom
  accept.classList.add('btn','btn-primary','btn-disabled');
  let agreed = false;
  const check = document.getElementById('agree-check');
  check.addEventListener('change', ()=>{ agreed = check.checked; updateAccept(); });

  function atBottom(){ return termsBody.scrollHeight - termsBody.scrollTop <= termsBody.clientHeight + 6 }
  termsBody.addEventListener('scroll', updateAccept);
  function updateAccept(){
    if(agreed || atBottom()){
      accept.classList.remove('btn-disabled');
    } else {
      accept.classList.add('btn-disabled');
    }
  }

  function openModal(){ modal.style.display='flex'; document.body.style.pointerEvents='none'; modal.querySelector('.panel').style.pointerEvents='auto'; }
  function closeModal(){ modal.style.display='none'; document.body.style.pointerEvents='auto'; }

  // If cameraEnabled explicitly disabled, keep modal closed but ensure camera UI hidden
  if(localStorage.getItem('cameraEnabled') === '0'){
    localStorage.setItem('termsAccepted','1');
    hideCameraUI();
    closeModal();
  } else if(localStorage.getItem('termsAccepted') === '1') closeModal(); else openModal();

  accept.addEventListener('click', function(){
    if(accept.classList.contains('btn-disabled')) return;
    // accept and enable camera by default
    localStorage.setItem('termsAccepted','1');
    localStorage.setItem('cameraEnabled','1');
    closeModal();
  });
  decline.addEventListener('click', function(){ try{ window.close(); }catch(e){ closeModal(); } });

  // Hide camera UI until accepted
  function hideCameraUI(){
    document.querySelectorAll('video, [data-camera], .camera-banner, .camera-feed, .camera-corner').forEach(e=>{ e.style.display='none' });
    document.querySelectorAll('button,div,span,p').forEach(el=>{
      const t = (el.textContent||'').toLowerCase();
      if(t.includes('camera') || t.includes('📹') || t.includes('camera live') || t.includes('camera on')) el.style.display='none';
    });
  }
  window.addEventListener('load', function(){ if(localStorage.getItem('termsAccepted') !== '1') hideCameraUI(); });

  // Stop any active media streams on the page
  function stopAllStreams(){
    try{
      // stop from video elements
      document.querySelectorAll('video').forEach(v=>{
        try{
          const s = v.srcObject;
          if(s && s.getTracks) s.getTracks().forEach(t=>t.stop());
        }catch(e){}
        try{ v.srcObject = null }catch(e){}
      });
      // stop from navigator (if accessible)
      if(navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function'){
        // nothing to stop here directly; streams are stopped via tracks above
      }
    }catch(e){}
  }

  // Mic control behaviour (UI-only)
  const mic = document.getElementById('mic-control');
  const label = mic.querySelector('.label');
  let micOn = false;
  function updateMic(){ mic.classList.toggle('muted', !micOn); label.textContent = 'Mic: ' + (micOn? 'On' : 'Off'); }
  mic.addEventListener('click', function(){ micOn = !micOn; updateMic(); });
  updateMic();
})();
