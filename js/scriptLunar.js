document.querySelector("#stop-eclipse").addEventListener('click', function() {
    const state = document.querySelector(".sun-eclipse").style.animationPlayState || 'running';
	document.querySelector(".sun-eclipse").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});