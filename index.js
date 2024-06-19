app
//Header1

let text = document.querySelector('#text');

text.setAttribute('data-text',text.innerHTML);

document.body.innerHTML += '<div style="position: absolute; bottom: 0; left: 0; right: 0; padding: .5em; font-size: 12px; font-family: monospace; text-align: center; pointer-event: none;">Click anywhere to re-run</div>';

var lr = document.querySelector('html');
window.addEventListener('click',()=>{
  var newone = lr.cloneNode(true);
  lr.parentNode.replaceChild(newone, lr);
  lr = newone;
});

