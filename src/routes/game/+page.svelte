<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onMount } from 'svelte';
    import { deepCopy, getRandomHexColor } from '$lib/utils';
    import { addLog } from "$lib/logService";
    import { appSettings, gameSettings, isLoggedIn, user, balloonSpeedOptions, balloonSizeOptions, gameDirection, menuSettings } from '../../stores.js';
	import SubjectNavBar from '../../components/SubjectNavBar.svelte';

    let balloons = [];
    let balloonIdCounter = 1;
    let balloonKnotHeightPercent;
    let balloonSpeed = balloonSpeedOptions[$gameSettings.balloonSpeed];
    let balloonSize = balloonSizeOptions[$gameSettings.balloonSize];
    let currentRampageChain = 0;
    let rampageCompleteSound;

    function getLetterColor(){
        if($gameSettings.enableCustomLetter && !$gameSettings.enableLetterRangeColor){
            return $gameSettings.balloonLetterColor;
        } else if($gameSettings.enableCustomLetter && $gameSettings.enableLetterRangeColor){
            let randomIndex = Math.floor(Math.random() * $gameSettings.letterInterpolatedColors.length);
            return $gameSettings.letterInterpolatedColors[randomIndex];
        } else{
            return 'transparent';
        }
    }

    function addBalloon() {
        if (balloons.length >= $gameSettings.maxBalloonsQuantity) return;

        const id = balloonIdCounter++;
        let randomIndex = Math.floor(Math.random() * $gameSettings.balloonInterpolatedColors.length);
        let specialBalloonsMaxQuantity = Math.floor($gameSettings.specialBalloonsProp/100 * $gameSettings.maxBalloonsQuantity);
        const color = $gameSettings.balloonRandomColor ?
            getRandomHexColor() :
            ($gameSettings.enableBalloonRangeColor ? $gameSettings.balloonInterpolatedColors[randomIndex] : $gameSettings.balloonColor);
        const { x, y } = getInitialPosition($gameDirection, balloonSize);
        const speed = getRandomSpeed();
        const size = balloonSize;
        const direction = $gameDirection;
        const rotation = Math.random() * 20 - 10;
        const isSpecial = balloons.filter(balloon => balloon.isSpecial).length < specialBalloonsMaxQuantity;
        const letterColor = isSpecial ? getLetterColor() : '';
        const balloon = { id, color, letterColor, x, y, speed, direction, size, rotation, isSpecial};

        balloons = [...balloons, balloon];
    }

    function addInitialBalloons() {
        let specialBalloonsQuantity = 0;
        let specialBalloonsMaxQuantity = Math.floor($gameSettings.specialBalloonsProp/100 * $gameSettings.maxBalloonsQuantity);
        while (balloons.length < $gameSettings.maxBalloonsQuantity) {
            const id = balloonIdCounter++;
            let randomIndex = Math.floor(Math.random() * $gameSettings.balloonInterpolatedColors.length);
            const color = $gameSettings.balloonRandomColor ?
                getRandomHexColor() :
                ($gameSettings.enableBalloonRangeColor ? $gameSettings.balloonInterpolatedColors[randomIndex] : $gameSettings.balloonColor);
            const x = getRandomXPosition(balloonSize);
            const y = getRandomYPosition(balloonSize);
            const speed = getRandomSpeed();
            const size = balloonSize;
            const direction = $gameDirection;
            const rotation = Math.random() * 20 - 10;
            const isSpecial = specialBalloonsQuantity < specialBalloonsMaxQuantity;
            specialBalloonsQuantity += isSpecial ? 1 : 0;
            const letterColor = isSpecial ? getLetterColor() : '';
            const balloon = { id, color, letterColor, x, y, speed, direction, size, rotation, isSpecial};

            balloons = [...balloons, balloon];
        }
    }
    
    function rampageChainUpdate(balloon){
        if(balloon.isSpecial){
            currentRampageChain++;
            if(currentRampageChain >= $gameSettings.rampageModeChain){
                rampageCompleteSound.currentTime = 0;
                rampageCompleteSound.play();
                currentRampageChain = 0;
            }
        } else {
            currentRampageChain = 0;
        }
    }

    function destroyBalloon(id) {
        balloons = balloons.filter(balloon => balloon.id !== id);
    }

    function handleClick(event) {
        console.log('Popped balloon:', event.detail);
        const clickedBalloonId = event.detail.id;
        addLog(
            'Popped balloon', 
            {...deepCopy(event.detail),
                onScreenBalloons: deepCopy(balloons),
                gameDirection: deepCopy($gameDirection),
                ...deepCopy($gameSettings),
                ...deepCopy($appSettings),
                ...deepCopy($menuSettings),
            },
            $isLoggedIn ? deepCopy($user.uid) : null
        );
        if($gameSettings.enableRampageMode) rampageChainUpdate(event.detail);
        destroyBalloon(clickedBalloonId);
    }

    function handleBackgroundClick(event){
        const { target, clientX, clientY } = event;
        addLog(
            'Game background click', 
            {onScreenBalloons: deepCopy(balloons),
                gameDirection: deepCopy($gameDirection),
                ...deepCopy($gameSettings),
                ...deepCopy($appSettings),
                ...deepCopy($menuSettings),
                x: deepCopy(clientX),
                y: deepCopy(clientY)
            },
            $isLoggedIn ? deepCopy($user.uid) : null
        );
    }

    function handleBackgroundKeyboard(event){
        return;
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
        return Math.random() * (balloonSpeed.max - balloonSpeed.min) + balloonSpeed.min;
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
            const axisDesviation = $appSettings.fluidTransitions ? Math.random() * 2 - 1 : Math.random() * 0.3 - 0.15;
            const angleDesviation = $appSettings.fluidTransitions ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25;
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
        rampageCompleteSound = new Audio('/sounds/rampage.mp3');
        const root = document.documentElement;

        balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
        balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;

        addInitialBalloons();

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
</style>
  
<svelte:head>
    <style>
        body {
            margin: 0;
            overflow: hidden;
        }
    </style>
</svelte:head>

<div role="presentation" aria-label="Popping balloons game" on:click={handleBackgroundClick} on:keypress={handleBackgroundKeyboard}>
    <main class="not-selectable" style:background-color = {$gameSettings.gameBackgroundColor} >
        <SubjectNavBar {balloons}/>
        {#each balloons as balloon (balloon.id)}
            <Balloon {balloon} on:balloonClicked={handleClick} />
        {/each}
    </main>
</div>
