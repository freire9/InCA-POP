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
	
	//settings stores
	import { 
		maxBalloonsQuantity,
		gameDirection,
		balloonSize,
		balloonSpeed,
		balloonRandomColor,
		balloonColor,
		gameBackgroundColor,
	} from '../../stores.js';

	let balloons = [];
	let balloonIdCounter = 1;
	let navBarHeight;
  
	function addBalloon() {
		if (balloons.length >= $maxBalloonsQuantity) return;

		const id = balloonIdCounter++;
		const color = $balloonRandomColor ? getRandomColor() : $balloonColor;
		const { x, y } = getInitialPosition($gameDirection, $balloonSize);
		const speed = getRandomSpeed();
		const size = $balloonSize;
		const direction = $gameDirection;
		const balloon = { id, color, x, y, speed, direction, size};
	
		balloons = [...balloons, balloon];
	}

	function addInitialBalloons() {
		while (balloons.length < $maxBalloonsQuantity) {
			const id = balloonIdCounter++;
			const color = $balloonRandomColor ? getRandomColor() : $balloonColor;
			const x = getRandomXPosition($balloonSize);
			const y = getRandomYPosition($balloonSize);
			const speed = getRandomSpeed();
			const size = $balloonSize;
			const direction = $gameDirection;
			const balloon = { id, color, x, y, speed, direction, size};


			balloons = [...balloons, balloon];
		}
	}

	function destroyBalloon(id) {
    	balloons = balloons.filter(balloon => balloon.id !== id);
  	}

	function handleClick(event) {
		console.log('Popped balloon:', event.detail);
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
		const minPosition = navBarHeight;
		//navBarHeight in vh, i.e window.innerHeight * (1 - navBarHeight) give the available percent of usable screen
		const maxPosition = window.innerHeight * (1 - navBarHeight) - size.height

		return Math.random() * (maxPosition - minPosition) + minPosition;
	}

	function getRandomXPosition(size) {
		const maxPosition = window.innerWidth - size.width;
		return Math.random() * maxPosition;
	}

	function getRandomSpeed() {
		return Math.random() * ($balloonSpeed.max - $balloonSpeed.min) + $balloonSpeed.min;
  	}

	  function getInitialPosition(direction, size) {
		switch (direction) {
		case 'leftToRight':
			return { x: 0, y: getRandomYPosition(size) };
		case 'rightToLeft':
			return { x: window.innerWidth - size.width, y: getRandomYPosition(size) };
		case 'topToBottom':
			return { x: getRandomXPosition(size), y: 0 };
		case 'bottomToTop':
			return { x: getRandomXPosition(size), y: window.innerHeight * (1 - navBarHeight) - size.height};
		default:
			return { x: 0, y: 0 };
		}
 	 }
  
	function animateBalloons() {
	  function moveBalloons() {
		balloons = balloons.map(balloon => {
			const speed = balloon.speed;

			switch (balloon.direction) {
			case 'leftToRight':
				return { ...balloon, x: balloon.x + speed };
			case 'rightToLeft':
				return { ...balloon, x: balloon.x - speed };
			case 'topToBottom':
				return { ...balloon, y: balloon.y + speed };
			case 'bottomToTop':
				return { ...balloon, y: balloon.y - speed };
			default:
				return balloon;
        	}
		});
		
			
		balloons = balloons.filter(balloon => {
			if (balloon.direction === 'leftToRight' || balloon.direction === 'rightToLeft') {
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
		const root = document.documentElement;
		//in vh
		navBarHeight = getComputedStyle(root).getPropertyValue('--nav-bar-height');
		navBarHeight = parseFloat(navBarHeight)/100

		addInitialBalloons()

		// add balloons with time interval 0.5s
		const intervalId = setInterval(addBalloon, 500);

		// start balloon animation
		animateBalloons();

		// clean interval when component is destroyed
		return () => clearInterval(intervalId);
	  });
  </script>
  
  <style>
	main {
	  position: relative;
	  height: calc(100vh - var(--nav-bar-height));
	  overflow: hidden;
	}
	nav {
		background-color: red;
		height: var(--nav-bar-height);
	}
  </style>
  
  <main style:background-color = {$gameBackgroundColor}>
	{#each balloons as balloon (balloon.id)}
	  <Balloon {balloon} on:balloonClicked={handleClick} onDestroy={() => destroyBalloon(balloon.id)} />
	{/each}
  </main>
  