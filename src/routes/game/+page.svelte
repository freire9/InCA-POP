<nav>
	<a href="/">Home</a>
</nav>

<script>
	import Balloon from '../../components/Balloon.svelte';;
	import { onMount } from 'svelte';
  
	let balloons = [];
	let balloonIdCounter = 1;
	let maxBalloons = 8; //variable
	let minSpeed = 0.2;
	let maxSpeed = 0.5;
	let selectedDirection = 'right-left'; // default direction
  
	function addBalloon() {
		if (balloons.length >= maxBalloons) return;

		const id = balloonIdCounter++;
		const color = getRandomColor();
		const size = 80;
		const { x, y } = getInitialPosition(selectedDirection, size);
		const speed = getRandomSpeed();
		const direction = selectedDirection;
		const balloon = { id, color, x, y, speed, direction };
	
		balloons = [...balloons, balloon];
	}

	function addInitialBalloons() {
		while (balloons.length < maxBalloons) {console.log(balloons.length)
			const id = balloonIdCounter++;
			const color = getRandomColor();
			const size = 80;
			const x = (Math.random() * window.innerWidth) - size;
			const y = getRandomYPosition() - size;
			const speed = getRandomSpeed();
			const direction = selectedDirection;
			const balloon = { id, color, x, y, speed, direction, size};

			balloons = [...balloons, balloon];
		}
	}

	function destroyBalloon(id) {
    	balloons = balloons.filter(balloon => balloon.id !== id);
  	}

	function handleClick(event) {
		console.log('Evento clicado:', event.detail);
		//here logs can be managed to a csv or a db
		const clickedBalloonId = event.detail.id;
		destroyBalloon(clickedBalloonId);
  	}
  
	function getRandomColor() {
		return '#' + Math.floor(Math.random()*16777215).toString(16);
	}
  
	function getRandomYPosition() {
		return Math.random() * window.innerHeight;
	}

	function verifyYOverflow(yPosition, size){
		if(yPosition >= window.innerHeight) return window.innerHeight - size;
		if(yPosition <= 0) return 0;	
		return yPosition;
	}

	function verifyXOverflow(xPosition, size){
		if(xPosition >= window.innerWidth) return window.innerWidth - size;
		if(xPosition <= 0) return 0;
		return xPosition;
	}

	function getRandomXPosition() {
		return Math.random() * window.innerWidth;
	}

	function getRandomSpeed() {
		return Math.random() * (maxSpeed - minSpeed) + minSpeed;
  	}

	  function getInitialPosition(direction, size) {
		switch (direction) {
		case 'left-right':
			return { x: 0, y: getRandomYPosition() };
		case 'right-left':
			return { x: window.innerWidth, y: getRandomYPosition() };
		case 'top-bottom':
			return { x: getRandomXPosition(), y: 0 };
		case 'bottom-top':
			return { x: getRandomXPosition(), y: window.innerHeight };
		default:
			return { x: 0, y: 0 };
		}
 	 }
  
	function animateBalloons() {
	  function moveBalloons() {
		balloons = balloons.map(balloon => {
			const speed = balloon.speed;

			switch (balloon.direction) {
			case 'left-right':
				return { ...balloon, x: balloon.x + speed };
			case 'right-left':
				return { ...balloon, x: balloon.x - speed };
			case 'top-bottom':
				return { ...balloon, y: balloon.y + speed };
			case 'bottom-top':
				return { ...balloon, y: balloon.y - speed };
			default:
				return balloon;
        	}
		});
		
			
		balloons = balloons.filter(balloon => {
			if (balloon.direction === 'left-right' || balloon.direction === 'right-left') {
				console.log(balloon)
			return balloon.x <= window.innerWidth && balloon.x >= 0;
			} else {
			return balloon.y <= window.innerHeight && balloon.y >= 0;
			}
		});
		
		requestAnimationFrame(moveBalloons);
	  }
  
	  requestAnimationFrame(moveBalloons);
	}

	onMount(() => {
		addInitialBalloons()

		// add balloons with time interval 1.5s
		const intervalId = setInterval(addBalloon, 1500);

		// start balloon animation
		animateBalloons();

		// clean interval when coponent is destroyed
		return () => clearInterval(intervalId);
	  });
  </script>
  
  <style>
	main {
	  position: relative;
	  height: 100vh;
	  overflow: hidden;
	}
  </style>
  
  <main>
	{#each balloons as balloon (balloon.id)}
	  <Balloon {balloon} on:balloonClicked={handleClick} onDestroy={() => destroyBalloon(balloon.id)} />
	{/each}
  </main>
  