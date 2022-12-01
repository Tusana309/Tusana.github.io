// pause animation
document.querySelector("#pause-solar").addEventListener('click', function() {
    const state = document.querySelector(".moon-solar").style.animationPlayState || 'running';
	document.querySelector(".moon-solar").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});
document.querySelector(".universe-solar").addEventListener('click', function() {
    const state = document.querySelector(".universe-solar").style.animationPlayState || 'running';
	document.querySelector(".universe-solar").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});

