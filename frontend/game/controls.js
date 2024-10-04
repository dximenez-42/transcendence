export let keyStates = {};

export function setupKeyControls() {

  window.addEventListener('keydown', function(e) {
	keyStates[e.key] = true;
  });

  window.addEventListener('keyup', function(e) {
	keyStates[e.key] = false;
  });
}

