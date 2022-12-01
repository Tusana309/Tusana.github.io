document.querySelector("#stop").addEventListener('click', function() {
    const state = document.querySelector(".sun").style.animationPlayState || 'running';
	document.querySelector(".sun").style.animationPlayState = state === 'running' ? 'paused' : 'running';
});