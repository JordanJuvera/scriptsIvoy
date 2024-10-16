function obtenerApiKey(){

	let keyQA = ( Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-3) )
	let keyProd = ( Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-3) )

	document.getElementById('key_QA').textContent='is-'+ keyQA;
	document.getElementById('key_Prod').textContent='ip-'+ keyProd;
}