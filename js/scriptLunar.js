document.querySelector("#pause-lunar").addEventListener('click', function() {
    const state = document.querySelector(".earth-eclipse").style.animationPlayState || 'running';
	document.querySelector(".earth-eclipse").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});
document.querySelector("#show-infor").addEventListener('click', function() {
    const state = document.querySelector(".moon-eclipse dl.infos").style.opacity || '1';
	document.querySelector(".moon-eclipse dl.infos").style.opacity = state === '1' ? '0' : '1';
});
document.querySelector("#show-infor").addEventListener('click', function() {
    const state = document.querySelector(".earth-eclipse dl.infos").style.opacity || '1';
	document.querySelector(".earth-eclipse dl.infos").style.opacity = state === '1' ? '0' : '1';
});