<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onMount } from 'svelte';
    import { deepCopy, getRandomFrom, getRandomHexColor } from '$lib/utils';
    import { addLog } from "$lib/logService";
    import { appSettings, gameSettings, isLoggedIn, user, popElmntSizeOpts, gameDirection, menuSettings, subjectName, popElmntSpeedOpts, popElmntType } from '../../stores.js';
	import SubjectNavBar from '../../components/SubjectNavBar.svelte';

    let popElmnts = [];
    let PopElmntIdCounter = 1;
    let balloonKnotHeightPercent;
    let popElmntSpeed = popElmntSpeedOpts[$gameSettings.popElmntSpeed];
    let popElmntSize = popElmntSizeOpts[$gameSettings.popElmntSize];
    let currentRampageChain = 0;

    function addPopElmnt() {
        if (popElmnts.length >= $gameSettings.maxPopElmntQty) return;

        const id = PopElmntIdCounter++;
        let ctrlPopElmntsMaxQuantity = Math.floor($gameSettings.popElmntConfig[popElmntType.CTRL].proportion/100 * $gameSettings.maxPopElmntQty);
        let expPopElmntsMaxQuantity = Math.floor($gameSettings.popElmntConfig[popElmntType.EXP].proportion/100 * $gameSettings.maxPopElmntQty);
        let specialPopElmntsMaxQuantity = ctrlPopElmntsMaxQuantity + expPopElmntsMaxQuantity;
        const isSpecial = popElmnts.filter(popElemnt => popElemnt.isSpecial).length < specialPopElmntsMaxQuantity;
        const type = isSpecial ? 
            (popElmnts.filter(popElemnt => popElemnt.type == 'CONTROL').length < ctrlPopElmntsMaxQuantity ? 'CONTROL' : 'EXPERIMENTAL')
            : 'NORMAL';
        const { x, y } = getInitialPosition($gameDirection, popElmntSize);
        const speed = getRandomSpeed();
        const size = popElmntSize;
        const direction = $gameDirection;
        const rotation = Math.random() * 20 - 10;
        let color;
        let innerFigColor = '';
        const innerFigType = type == 'CONTROL' ? $gameSettings.popElmntConfig[popElmntType.CTRL].innerFigType : (type == 'EXPERIMENTAL' ? $gameSettings.popElmntConfig[popElmntType.EXP].innerFigType : '');
        
        if(type == 'CONTROL'){
            color = $gameSettings.popElmntConfig[popElmntType.CTRL].enableRandColor ?
                getRandomHexColor() :
                ($gameSettings.popElmntConfig[popElmntType.CTRL].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.CTRL].interpColors) : $gameSettings.popElmntConfig[popElmntType.CTRL].color);
            innerFigColor = $gameSettings.popElmntConfig[popElmntType.CTRL].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.CTRL].innerFigInterpColors) : $gameSettings.popElmntConfig[popElmntType.CTRL].innerFigColor;
        } else if(type == 'EXPERIMENTAL'){
            color = $gameSettings.popElmntConfig[popElmntType.EXP].enableRandColor ?
                getRandomHexColor() :
                ($gameSettings.popElmntConfig[popElmntType.EXP].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.EXP].interpColors) : $gameSettings.popElmntConfig[popElmntType.EXP].color);
            innerFigColor = $gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.EXP].innerFigInterpColors) : $gameSettings.popElmntConfig[popElmntType.EXP].innerFigColor;
        } else {//NORMAL
            color = $gameSettings.popElmntConfig[popElmntType.NORMAL].enableRandColor ?
                getRandomHexColor() :
                ($gameSettings.popElmntConfig[popElmntType.NORMAL].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.NORMAL].interpColors) : $gameSettings.popElmntConfig[popElmntType.NORMAL].color);
        }

        const popElemnt = { id, color, innerFigType, innerFigColor, x, y, speed, direction, size, rotation, isSpecial, type};

        popElmnts = [...popElmnts, popElemnt];
    }

    function addInitialPopElmnts() {
        let ctrlPopElmntQuantity = 0;
        let expPopElmntQuantity = 0;
        let specialPopElmntQuantity = ctrlPopElmntQuantity + expPopElmntQuantity;
        let ctrlPopElmntsMaxQuantity = Math.floor($gameSettings.popElmntConfig[popElmntType.CTRL].proportion/100 * $gameSettings.maxPopElmntQty);
        let expPopElmntsMaxQuantity = Math.floor($gameSettings.popElmntConfig[popElmntType.EXP].proportion/100 * $gameSettings.maxPopElmntQty);
        let specialPopElmntsMaxQuantity = ctrlPopElmntsMaxQuantity + expPopElmntsMaxQuantity;

        while (popElmnts.length < $gameSettings.maxPopElmntQty) {
            const id = PopElmntIdCounter++;
            const x = getRandomXPosition(popElmntSize);
            const y = getRandomYPosition(popElmntSize);
            const speed = getRandomSpeed();
            const size = popElmntSize;
            const direction = $gameDirection;
            const rotation = Math.random() * 20 - 10;
            const isSpecial = specialPopElmntQuantity < specialPopElmntsMaxQuantity;
            const type = isSpecial ? 
                (ctrlPopElmntQuantity < ctrlPopElmntsMaxQuantity ? 'CONTROL' : 'EXPERIMENTAL')
                : 'NORMAL';
            let color;
            let innerFigColor = '';
            const innerFigType = type == 'CONTROL' ? $gameSettings.popElmntConfig[popElmntType.CTRL].innerFigType : (type == 'EXPERIMENTAL' ? $gameSettings.popElmntConfig[popElmntType.EXP].innerFigType : '');

            if(type == 'CONTROL'){
                color = $gameSettings.popElmntConfig[popElmntType.CTRL].enableRandColor ?
                    getRandomHexColor() :
                    ($gameSettings.popElmntConfig[popElmntType.CTRL].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.CTRL].interpColors) : $gameSettings.popElmntConfig[popElmntType.CTRL].color);
                innerFigColor = $gameSettings.popElmntConfig[popElmntType.CTRL].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.CTRL].innerFigInterpColors) : $gameSettings.popElmntConfig[popElmntType.CTRL].innerFigColor;
                ctrlPopElmntQuantity += 1;
                specialPopElmntQuantity += 1;
            } else if(type == 'EXPERIMENTAL'){
                color = $gameSettings.popElmntConfig[popElmntType.EXP].enableRandColor ?
                    getRandomHexColor() :
                    ($gameSettings.popElmntConfig[popElmntType.EXP].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.EXP].interpColors) : $gameSettings.popElmntConfig[popElmntType.EXP].color);
                innerFigColor = $gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.EXP].innerFigInterpColors) : $gameSettings.popElmntConfig[popElmntType.EXP].innerFigColor;
                expPopElmntQuantity += 1;
                specialPopElmntQuantity += 1;
            } else {//NORMAL
                color = $gameSettings.popElmntConfig[popElmntType.NORMAL].enableRandColor ?
                    getRandomHexColor() :
                    ($gameSettings.popElmntConfig[popElmntType.NORMAL].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[popElmntType.NORMAL].interpColors) : $gameSettings.popElmntConfig[popElmntType.NORMAL].color);
            }
            
            const popElemnt = { id, color, innerFigType, innerFigColor, x, y, speed, direction, size, rotation, isSpecial, type};

            popElmnts = [...popElmnts, popElemnt];
        }
    }
    
    function rampageChainUpdate(popElemnt){
        if(popElemnt.isSpecial){
            currentRampageChain++;
            if(currentRampageChain >= $gameSettings.rampageModeChain) currentRampageChain = 0;
        } else {
            currentRampageChain = 0;
        }
    }

    function destroyPopElmnt(id) {
        popElmnts = popElmnts.filter(popElemnt => popElemnt.id !== id);
    }

    function handleClick(event) {
        console.log('Popped element:', event.detail);
        const clickedPopElmntId = event.detail.id;
        addLog(
            'Popped element', 
            {...deepCopy(event.detail),
                onScreenPopElmnts: deepCopy(popElmnts),
                gameDirection: deepCopy($gameDirection),
                ...deepCopy($gameSettings),
                ...deepCopy($appSettings),
                ...deepCopy($menuSettings),
                subjectName: deepCopy($subjectName),
            },
            $isLoggedIn ? deepCopy($user.uid) : null
        );
        if($gameSettings.enableRampageMode) rampageChainUpdate(event.detail);
        destroyPopElmnt(clickedPopElmntId);
    }

    function handleBackgroundClick(event){
        const { target, clientX, clientY } = event;
        addLog(
            'Game background click', 
            {onScreenPopElmnts: deepCopy(popElmnts),
                gameDirection: deepCopy($gameDirection),
                ...deepCopy($gameSettings),
                ...deepCopy($appSettings),
                ...deepCopy($menuSettings),
                x: deepCopy(clientX),
                y: deepCopy(clientY),
                subjectName: deepCopy($subjectName),
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
        return Math.random() * (popElmntSpeed.max - popElmntSpeed.min) + popElmntSpeed.min;
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

    function animatePopElmnts() {
        function movePopElmnts() {
        popElmnts = popElmnts.map(popElemnt => {
            const speed = popElemnt.speed;
            const enableMoveDesviation = Math.random() > 0.6;
            const enableRotDesviation = enableMoveDesviation;

            //FOR TRANSITION-CLICK BUG FIREFOX transition: transform 0.3s ease;
            const axisDesviation = $appSettings.fluidTransitions ? Math.random() * 2 - 1 : Math.random() * 0.3 - 0.15;
            const angleDesviation = $appSettings.fluidTransitions ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25;
            const horizontalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const verticalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const rotDesviation = enableRotDesviation ? angleDesviation : 0;
            switch (popElemnt.direction) {
            case 'leftToRight':
                return { ...popElemnt, x: popElemnt.x + speed, y: popElemnt.y + verticalDesviation, rotation: popElemnt.rotation + rotDesviation };
            case 'rightToLeft':
                return { ...popElemnt, x: popElemnt.x - speed, y: popElemnt.y + verticalDesviation, rotation: popElemnt.rotation + rotDesviation };
            case 'topToBottom':
                return { ...popElemnt, y: popElemnt.y + speed, x: popElemnt.x + horizontalDesviation, rotation: popElemnt.rotation + rotDesviation };
            case 'bottomToTop':
                return { ...popElemnt, y: popElemnt.y - speed, x: popElemnt.x + horizontalDesviation, rotation: popElemnt.rotation + rotDesviation };
            default:
                return popElemnt;
            }
        });
        
        popElmnts = popElmnts.filter(popElemnt => {
            if (popElemnt.direction === 'leftToRight' || popElemnt.direction === 'rightToLeft') {
            return popElemnt.x <= window.innerWidth + popElemnt.size.width && popElemnt.x >= 0 - popElemnt.size.width * 2;
            } else {
            return popElemnt.y <= window.innerHeight + popElemnt.size.height && popElemnt.y >= 0 - (popElemnt.size.height - (popElemnt.size.height * balloonKnotHeightPercent)) * 2;
            }
        });
        
        requestAnimationFrame(movePopElmnts);
        }
        requestAnimationFrame(movePopElmnts);
    }
    
    onMount(() => {
        const root = document.documentElement;

        balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
        balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;

        addInitialPopElmnts();

        // add popElmnts with time interval 0.5s
        const intervalId = setInterval(addPopElmnt, 500);

        // start popElemnt animation
        animatePopElmnts();

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
        <SubjectNavBar {popElmnts}/>
        {#each popElmnts as popElemnt (popElemnt.id)}
            <Balloon balloon={popElemnt} {currentRampageChain} on:balloonClicked={handleClick} />
        {/each}
    </main>
</div>
