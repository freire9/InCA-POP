<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onMount } from 'svelte';
    import { ActionButton } from 'inca-utils';
    import { getRandomColor } from '$lib/utils';
    import { goto } from '$app/navigation';
    
    //settings stores
    import { 
        maxBalloonsQuantity,
        gameDirection,
        balloonSize,
        balloonSpeed,
        balloonRandomColor,
        balloonColor,
        gameBackgroundColor,
        fluidTransitions,
        enableBalloonRangeColor,
        balloonInterpolatedColors,
    } from '../../stores.js';


    let balloons = [];
    let balloonIdCounter = 1;
    let balloonKnotHeightPercent;

    function addBalloon() {
        if (balloons.length >= $maxBalloonsQuantity) return;

        const id = balloonIdCounter++;
        let randomIndex = Math.floor(Math.random() * $balloonInterpolatedColors.length);
        const color = $balloonRandomColor ?
            getRandomColor() :
            ($enableBalloonRangeColor ? $balloonInterpolatedColors[randomIndex] : $balloonColor);
        const { x, y } = getInitialPosition($gameDirection, $balloonSize);
        const speed = getRandomSpeed();
        const size = $balloonSize;
        const direction = $gameDirection;
        const rotation = Math.random() * 20 - 10;
        const isSpecial = Math.random() > 0.7;
        const balloon = { id, color, x, y, speed, direction, size, rotation, isSpecial};

        balloons = [...balloons, balloon];
    }

    function addInitialBalloons() {
        while (balloons.length < $maxBalloonsQuantity) {
            const id = balloonIdCounter++;
            let randomIndex = Math.floor(Math.random() * $balloonInterpolatedColors.length);
            const color = $balloonRandomColor ?
                getRandomColor() :
                ($enableBalloonRangeColor ? $balloonInterpolatedColors[randomIndex] : $balloonColor);
            const x = getRandomXPosition($balloonSize);
            const y = getRandomYPosition($balloonSize);
            const speed = getRandomSpeed();
            const size = $balloonSize;
            const direction = $gameDirection;
            const rotation = Math.random() * 20 - 10;
            const isSpecial = Math.random() > 0.7;
            const balloon = { id, color, x, y, speed, direction, size, rotation, isSpecial};

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

    function getRandomYPosition(size) {
        const minPosition = 0;
        const maxPosition = window.innerHeight - size.height;

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
                return { x: 0 - size.width, y: getRandomYPosition(size) };
            case 'rightToLeft':
                return { x: window.innerWidth, y: getRandomYPosition(size) };
            case 'topToBottom':
                return { x: getRandomXPosition(size), y: 0 - size.height - (size.height * balloonKnotHeightPercent)};
            case 'bottomToTop':
                return { x: getRandomXPosition(size), y: window.innerHeight};
            default:
                return { x: 0, y: 0 };
        }
    }

    function animateBalloons() {
        function moveBalloons() {
        balloons = balloons.map(balloon => {
            const speed = balloon.speed;
            const enableMoveDesviation = Math.random() > 0.6;
            const enableRotDesviation = enableMoveDesviation;

            //FOR TRANSITION-CLICK BUG FIREFOX transition: transform 0.3s ease;
            const axisDesviation = $fluidTransitions ? Math.random() * 2 - 1 : Math.random() * 0.3 - 0.15;
            const angleDesviation = $fluidTransitions ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25;
            const horizontalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const verticalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const rotDesviation = enableRotDesviation ? angleDesviation : 0;

            switch (balloon.direction) {
            case 'leftToRight':
                return { ...balloon, x: balloon.x + speed, y: balloon.y + verticalDesviation, rotation: balloon.rotation + rotDesviation };
            case 'rightToLeft':
                return { ...balloon, x: balloon.x - speed, y: balloon.y + verticalDesviation, rotation: balloon.rotation + rotDesviation };
            case 'topToBottom':
                return { ...balloon, y: balloon.y + speed, x: balloon.x + horizontalDesviation, rotation: balloon.rotation + rotDesviation };
            case 'bottomToTop':
                return { ...balloon, y: balloon.y - speed, x: balloon.x + horizontalDesviation, rotation: balloon.rotation + rotDesviation };
            default:
                return balloon;
            }
        });
        
            
        balloons = balloons.filter(balloon => {
            if (balloon.direction === 'leftToRight' || balloon.direction === 'rightToLeft') {
            return balloon.x <= window.innerWidth + balloon.size.width && balloon.x >= 0 - balloon.size.width * 2;
            } else {
            return balloon.y <= window.innerHeight + balloon.size.height && balloon.y >= 0 - (balloon.size.height - (balloon.size.height * balloonKnotHeightPercent)) * 2;
            }
        });
        
        requestAnimationFrame(moveBalloons);
        }

        requestAnimationFrame(moveBalloons);
    }
    onMount(() => {
        const root = document.documentElement;

        balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
        balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;

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
        height: 100vh;
        overflow: hidden;
    }
    @media (max-width: 600px) {
        :root{
            --nav-bar-height: 15vh;
        }
    }
    @media (min-width: 1024px){
        :root{
            --nav-bar-height: 20vh;
        }
    }
    .exit-btn{
        position: absolute;
    }
</style>
  
<svelte:head>
    <style>
        body {
            margin: 0;
        }
    </style>
</svelte:head>

<main class="not-selectable" style:background-color = {$gameBackgroundColor}>
    <div class="not-selectable exit-btn">
        <ActionButton mode="exit" on:click={() => goto('/')} --width='var(--nav-bar-height)'/>
    </div>
    {#each balloons as balloon (balloon.id)}
        <Balloon {balloon} on:balloonClicked={handleClick} />
    {/each}
</main>
  