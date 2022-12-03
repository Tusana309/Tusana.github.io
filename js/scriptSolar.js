// pause animation
document.querySelector("#pause-solar").addEventListener('click', function() {
    const state = document.querySelector(".moon-solar").style.animationPlayState || 'running';
	document.querySelector(".moon-solar").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});
document.querySelector("#pause-solar").addEventListener('click', function() {
    const state = document.querySelector(".universe-solar").style.animationPlayState || 'running';
	document.querySelector(".universe-solar").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});
document.querySelector("#show-infor").addEventListener('click', function() {
    const state = document.querySelector(".sun-solar dl.infos").style.opacity || '1';
	document.querySelector(".sun-solar dl.infos").style.opacity = state === '1' ? '0' : '1';
});
document.querySelector("#show-infor").addEventListener('click', function() {
    const state = document.querySelector(".moon-solar dl.infos").style.opacity || '1';
	document.querySelector(".moon-solar dl.infos").style.opacity = state === '1' ? '0' : '1';
});