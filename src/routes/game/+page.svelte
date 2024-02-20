<nav>
	<a href="/">Home</a>
</nav>

<svelte:head>
	<style>
		body {
			margin: 0;
		}
	</style>
</svelte:head>

<script>
	import Balloon from '../../components/Balloon.svelte';;
	import { onMount } from 'svelte';
  
	let balloons = [];
	let balloonIdCounter = 1;
	let maxBalloons = 8; //variable
	let minSpeed = 0.2;
	let maxSpeed = 0.5;
	let selectedDirection = 'left-right'; // default direction
  
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
		while (balloons.length < maxBalloons) {
			const id = balloonIdCounter++;
			const color = getRandomColor();
			const size = 80;
			const x = getRandomXPosition(size);
			const y = getRandomYPosition(size);
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
		const red = Math.floor(Math.random() * 256);
		const green = Math.floor(Math.random() * 256);
		const blue = Math.floor(Math.random() * 256);

		return `rgb(${red}, ${green}, ${blue})`;
	}
  
	function getRandomYPosition(size) {
		const navBarHeight = 0.07; // in styles.css. TODO: refactor modularity
		const minPosition = navBarHeight;
		const maxPosition = window.innerHeight * (1 - navBarHeight) - size
		return Math.random() * (maxPosition - minPosition) + minPosition;
	}

	function getRandomXPosition(size) {
		const maxPosition = window.innerWidth - size;
		return Math.random() * maxPosition;
	}

	function getRandomSpeed() {
		return Math.random() * (maxSpeed - minSpeed) + minSpeed;
  	}

	  function getInitialPosition(direction, size) {
		switch (direction) {
		case 'left-right':
			return { x: 0, y: getRandomYPosition(size) };
		case 'right-left':
			return { x: window.innerWidth, y: getRandomYPosition(size) };
		case 'top-bottom':
			return { x: getRandomXPosition(size), y: 0 };
		case 'bottom-top':
			return { x: getRandomXPosition(size), y: window.innerHeight };
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
	  height: calc(100vh - var(--nav-bar-height));
	  overflow: hidden;
	  background-color: lightblue;
	}
	nav {
		background-color: red;
		height: var(--nav-bar-height);
	}
  </style>
  
  <main>
	{#each balloons as balloon (balloon.id)}
	  <Balloon {balloon} on:balloonClicked={handleClick} onDestroy={() => destroyBalloon(balloon.id)} />
	{/each}
  </main>
  