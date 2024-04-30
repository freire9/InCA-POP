<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onDestroy, onMount } from 'svelte';
    import { capitalizeFirstLetter, getRandomFrom, getRandomHexColor } from '$lib/utils';
    import { addLog } from "$lib/logService";
    import { appSettings, gameSettings, user, popElmntSizeOpts, gameDirection, subjectName, popElmntShapes, popElmntTypes, popElmntSpeedsOpts, popElmntDirections, localUserId, isLoggedIn, fluidTransitions } from '../../stores.js';
    import SubjectNavBar from '../../components/SubjectNavBar.svelte';
	import InGameStats from '../../components/InGameStats.svelte';

    let lastFrameTime = performance.now(); //ms
    const frameRate = 30;
    const frameDuration = 1000 / frameRate; //ms
    let animationFrameId;
    const popElmntInterval = 500; //ms
    let timeForNextPopElmnt = 0; //ms
    let popElmnts = [];
    let PopElmntIdCounter = 1;
    let balloonKnotHeightPercent;
    const popElmntSpeed = popElmntSpeedsOpts[$gameSettings.popElmntSpeed];
    const popElmntSize = popElmntSizeOpts[$gameSettings.popElmntSize];
    let currentRampageChain = 0;
    let currentStats = Object.fromEntries(Object.values(popElmntTypes).map(type => [type, { popped: 0, total: 0 }]));

    //Max quantities of special popElmnts
    const specialPopElmntsMaxQuantities = Object.fromEntries(
        Object.values(popElmntTypes)
            .filter(type => type !== popElmntTypes.NORMAL) // exclude 'NORMAL'
            .map(type => [
                type,
                Math.floor($gameSettings.popElmntConfig[type].proportion / 100 * $gameSettings.maxPopElmntQty)
            ])
    );
    //Total max quantity of special popElmnts
    const specialPopElmntsMaxQuantity = Object.values(specialPopElmntsMaxQuantities).reduce((sum, value) => sum + value, 0);

    function getAditionalHeight(type, height){
        if($gameSettings.popElmntConfig[type].shape !== popElmntShapes.BALLOON) return 0;

        return height * balloonKnotHeightPercent;
    }

    function setSpecialType(){
        for (const type in specialPopElmntsMaxQuantities) {
            const specialPopElmntsQty = popElmnts.filter(popElmnt => popElmnt.type === type).length;
            if (specialPopElmntsQty < specialPopElmntsMaxQuantities[type]) return type;
        }
    }

    function setInitialSpecialType(specialQuantities){
        for (const type in specialPopElmntsMaxQuantities) {
            if(specialQuantities[type] < specialPopElmntsMaxQuantities[type]) return type;
        }
    }

    function addPopElmnt() {
        if (popElmnts.length >= $gameSettings.maxPopElmntQty) return;

        const id = PopElmntIdCounter++;
        const isSpecial = popElmnts.filter(popElmnt => popElmnt.isSpecial).length < specialPopElmntsMaxQuantity;
        const type = isSpecial ? setSpecialType() : popElmntTypes.NORMAL;
        const { x, y } = getInitialPosition($gameDirection, popElmntSize, type);
        const speed = getRandomSpeed();
        const size = popElmntSize;
        const direction = $gameDirection;
        const rotation = Math.random() * 20 - 10;
        const innerFigType = isSpecial ? $gameSettings.popElmntConfig[type].innerFigType : '';
        const shape = $gameSettings.popElmntConfig[type].shape;

        const color = $gameSettings.popElmntConfig[type].enableRandColor ?
            getRandomHexColor() :
            ($gameSettings.popElmntConfig[type].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[type].interpColors) : $gameSettings.popElmntConfig[type].color);

        const innerFigColor = isSpecial ? 
            ($gameSettings.popElmntConfig[type].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[type].innerFigInterpColors) : $gameSettings.popElmntConfig[type].innerFigColor)
            : '';

        const popElmnt = { id, color, innerFigType, innerFigColor, x, y, speed, direction, size, rotation, isSpecial, type, shape};

        popElmnts = [...popElmnts, popElmnt];
        currentStats[type].total += 1;
    }

    function addInitialPopElmnts() {
        //Initial special popElmnts quantities (initial: 0 for each type)
        let specialPopElmntsQuantities = Object.fromEntries(Object.values(popElmntTypes).map(type => [type, 0]));
        //Total special popElmnts quantity (initial: 0)
        let specialPopElmntsTotalQty = 0;

        while (popElmnts.length < $gameSettings.maxPopElmntQty) {
            const id = PopElmntIdCounter++;
            const x = getRandomXPosition(popElmntSize);
            const y = getRandomYPosition(popElmntSize);
            const speed = getRandomSpeed();
            const size = popElmntSize;
            const direction = $gameDirection;
            const rotation = Math.random() * 20 - 10;
            const isSpecial = specialPopElmntsTotalQty < specialPopElmntsMaxQuantity;
            const type = isSpecial ? setInitialSpecialType(specialPopElmntsQuantities) : popElmntTypes.NORMAL;
            const innerFigType = isSpecial ? $gameSettings.popElmntConfig[type].innerFigType : '';
            const shape = $gameSettings.popElmntConfig[type].shape;

            const color = $gameSettings.popElmntConfig[type].enableRandColor ?
                getRandomHexColor()
                : ($gameSettings.popElmntConfig[type].enableRangeColor ? getRandomFrom($gameSettings.popElmntConfig[type].interpColors) : $gameSettings.popElmntConfig[type].color);
            
            const innerFigColor = isSpecial ? 
                ($gameSettings.popElmntConfig[type].enableInnerFigRangeColor ? getRandomFrom($gameSettings.popElmntConfig[type].innerFigInterpColors) : $gameSettings.popElmntConfig[type].innerFigColor)
                : '';

            if(isSpecial){
                specialPopElmntsQuantities[type] += 1;
                specialPopElmntsTotalQty += 1;
            }

            const popElmnt = { id, color, innerFigType, innerFigColor, x, y, speed, direction, size, rotation, isSpecial, type, shape};

            popElmnts = [...popElmnts, popElmnt];
            currentStats[type].total += 1;
        }
    }
    
    function rampageChainUpdate(popElmnt){
        if(popElmnt.isSpecial){
            currentRampageChain++;
        } else {
            currentRampageChain = 0;
        }
    }

    function destroyPopElmnt(id) {
        popElmnts = popElmnts.filter(popElmnt => popElmnt.id !== id);
    }

    function onScreenPopElmnts(popElmnts){
        const popElmntsOnScreen = popElmnts.filter(popElmnt => {
            switch (popElmnt.direction) {
                case popElmntDirections.LEFT_TO_RIGHT:
                    return popElmnt.x <= window.innerWidth && popElmnt.x >= 0;
                case popElmntDirections.RIGHT_TO_LEFT:
                    return popElmnt.x <= window.innerWidth && popElmnt.x >= 0 - popElmnt.size.width;
                case popElmntDirections.TOP_TO_BOTTOM:
                    return popElmnt.y <= window.innerHeight && popElmnt.y >= 0;
                case popElmntDirections.BOTTOM_TO_TOP:
                    return popElmnt.y <= window.innerHeight + popElmnt.size.height && popElmnt.y >= 0 - (popElmnt.size.height - getAditionalHeight(popElmnt.type, popElmnt.size.height));
                default:
                    return false;
            }
        });
        return popElmntsOnScreen;
    }

    function setGeneralLogs(action){
        const now = new Date();
        const generalLogs = {
            timestamp: now,
            user: ($user && $isLoggedIn) ? $user.displayName : "Anonymous",
            userId: ($user && $isLoggedIn) ? $user.uid : $localUserId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            teacher: $appSettings.instructorName,
            action: action.toString(),
            subject: $subjectName,
        }
        return generalLogs;
    }

    function setOnScreenElmntsLogs(){
        const onScreen = onScreenPopElmnts(popElmnts); 
        const specialPopElmntsQtyOnScreen = Object.fromEntries(
            Object.values(popElmntTypes)
                .filter(type => type !== popElmntTypes.NORMAL) // exclude 'NORMAL'
                .map(type => [
                    'onScreen' + capitalizeFirstLetter(type) + 'Elmnts',
                    onScreen.filter(popElmnt => popElmnt.type === type).length
                ])
        );
        const onScreenElmntsLogs = {
            onScreenElmnts: onScreen.length,
            onScreenSpecialElmnts: Object.values(specialPopElmntsQtyOnScreen).reduce((sum, value) => sum + value, 0),
            ...specialPopElmntsQtyOnScreen,
            onScreenElmntsColors: onScreen.map(popElmnt => popElmnt.color),
            onScreenElmtsInnerFigColors: onScreen.filter(popElmnt => popElmnt.type != popElmntTypes.NORMAL).map(popElmnt => popElmnt.innerFigColor),
            onScrenElmntsInnerFigTypes: onScreen.filter(popElmnt => popElmnt.type != popElmntTypes.NORMAL).map(popElmnt => popElmnt.innerFigType),
        }
        return onScreenElmntsLogs;
    }

    function poppedElmntLogs(popElmnt){
        const generalLogs = setGeneralLogs('Popped element');
        const onScreenElmntsLogs = setOnScreenElmntsLogs();
        let specialDetails = {};
        if(popElmnt.isSpecial){
            specialDetails = {
                innerFigType: popElmnt.innerFigType,
                innerFigColor: popElmnt.innerFigColor,
            }
        }
        const detailLogs = {
            color: popElmnt.color,
            x: Math.floor(popElmnt.x),
            y: Math.floor(popElmnt.y),
            speed: $gameSettings.popElmntSpeed,
            size: $gameSettings.popElmntSize,
            isSpecial: popElmnt.isSpecial,
            type: popElmnt.type,
            shape: popElmnt.shape,
            currentRampageChain: currentRampageChain,
            rampageChainForExcellent: $gameSettings.rampageModeChain,
            gameBackgroundColor: $gameSettings.gameBackgroundColor,
            gameDirection: $gameDirection,
            ...specialDetails,
            ...onScreenElmntsLogs,
        }
        return {...generalLogs, details: detailLogs};
    }

    function backgroundClickLogs(event){
        const generalLogs = setGeneralLogs('Game background click');
        const onScreenElmntsLogs = setOnScreenElmntsLogs();
        const detailLogs = {
            x: event.clientX,
            y: event.clientY,
            gameBackgroundColor: $gameSettings.gameBackgroundColor,
            gameDirection: $gameDirection,
            ...onScreenElmntsLogs,
        }
        return {...generalLogs, details: detailLogs};
    }

    function ExitClickLogs(){
        const generalLogs = setGeneralLogs('Exit game');
        const onScreenElmntsLogs = setOnScreenElmntsLogs();
        const poppedStatsLogs = Object.fromEntries(
            Object.values(popElmntTypes).map(type => [
                type + 'PoppedTotal',
                currentStats[type].popped
            ])
        );
        const totalStatsLogs = Object.fromEntries(
            Object.values(popElmntTypes).map(type => [
                type + 'Total',
                currentStats[type].total
            ])
        );
        const detailLogs = {
            gameBackgroundColor: $gameSettings.gameBackgroundColor,
            gameDirection: $gameDirection,
            ...onScreenElmntsLogs,
            ...poppedStatsLogs,
            ...totalStatsLogs,
        }
        return {...generalLogs, details: detailLogs};
    }

    function handleClick(event) {
        if($gameSettings.enableRampageMode) rampageChainUpdate(event.detail);
        addLog(poppedElmntLogs(event.detail));
        currentStats[event.detail.type].popped += 1;
        destroyPopElmnt(event.detail.id);
    }

    function handleBackgroundClick(event){
        addLog(backgroundClickLogs(event));
    }

    function handleExitClick(){
        addLog(ExitClickLogs());
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

    function getInitialPosition(direction, size, type) {
        switch (direction) {
            case popElmntDirections.LEFT_TO_RIGHT:
                return { x: 0 - size.width, y: getRandomYPosition(size) };
            case popElmntDirections.RIGHT_TO_LEFT:
                return { x: window.innerWidth, y: getRandomYPosition(size) };
            case popElmntDirections.TOP_TO_BOTTOM:
                return { x: getRandomXPosition(size), y: 0 - size.height - getAditionalHeight(type, size.height)};
            case popElmntDirections.BOTTOM_TO_TOP:
                return { x: getRandomXPosition(size), y: window.innerHeight};
            default:
                return { x: 0, y: 0 };
        }
    }

    function movePopElmnts(timestamp) {
        const deltaTime = (timestamp - lastFrameTime) / 1000; //to seconds
        popElmnts = popElmnts.map(popElmnt => {
            const speed = popElmnt.speed;
            const distance = speed * deltaTime;
            const enableMoveDesviation = Math.random() > 0.6;
            const enableRotDesviation = enableMoveDesviation;

            //FOR TRANSITION-CLICK BUG FIREFOX transition: transform 0.3s ease;
            const axisDesviation = $fluidTransitions ? Math.random() * 2 - 1 : Math.random() * 0.3 - 0.15;
            const angleDesviation = $fluidTransitions ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25;
            const horizontalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const verticalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const rotDesviation = enableRotDesviation ? angleDesviation : 0;

            switch (popElmnt.direction) {
                case popElmntDirections.LEFT_TO_RIGHT:
                    return { ...popElmnt, x: popElmnt.x + distance, y: popElmnt.y + verticalDesviation, rotation: popElmnt.rotation + rotDesviation };
                    case popElmntDirections.RIGHT_TO_LEFT:
                        return { ...popElmnt, x: popElmnt.x - distance, y: popElmnt.y + verticalDesviation, rotation: popElmnt.rotation + rotDesviation };
                        case popElmntDirections.TOP_TO_BOTTOM:
                            return { ...popElmnt, y: popElmnt.y + distance, x: popElmnt.x + horizontalDesviation, rotation: popElmnt.rotation + rotDesviation };
                            case popElmntDirections.BOTTOM_TO_TOP:
                                return { ...popElmnt, y: popElmnt.y - distance, x: popElmnt.x + horizontalDesviation, rotation: popElmnt.rotation + rotDesviation };
                                default:
                    return popElmnt;
            }
        });
    
        popElmnts = popElmnts.filter(popElmnt => {
            if (popElmnt.direction === popElmntDirections.LEFT_TO_RIGHT || popElmnt.direction === popElmntDirections.RIGHT_TO_LEFT) {
                return popElmnt.x <= window.innerWidth + popElmnt.size.width && popElmnt.x >= 0 - popElmnt.size.width * 2;
            } else {
                return popElmnt.y <= window.innerHeight + popElmnt.size.height && popElmnt.y >= 0 - (popElmnt.size.height - getAditionalHeight(popElmnt.type, popElmnt.size.height)) * 2;
            }
        });
    }
    
    function gameLoop(timestamp){
        const elapsedTime = timestamp - lastFrameTime; //ms
        timeForNextPopElmnt += elapsedTime;
        if(elapsedTime > frameDuration) {//limit frame rate
            if(timeForNextPopElmnt >= popElmntInterval){
                addPopElmnt();
                timeForNextPopElmnt = 0;
            }
            movePopElmnts(timestamp);

            //(elapsedTime % frameDuration) time passed since last frame that was not rendered due to frame rate limit
            //timestamp - (elapsedTime % frameDuration) is the moment of time when the last frame was supposed to be rendered
            //this is for mantain the frame rate limit for soft and consistent animations
            lastFrameTime = timestamp ;
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    onMount(() => {
        const areBalloons = Object.values($gameSettings.popElmntConfig).some(popElmnt => popElmnt.shape === popElmntShapes.BALLOON);
        if(areBalloons){
            const root = document.documentElement;
            balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
            balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;
        }

        addInitialPopElmnts();

        // start popElmnt animation
        gameLoop(performance.now())
    });

    onDestroy(() => {
        cancelAnimationFrame(animationFrameId);
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
        <SubjectNavBar on:exit={handleExitClick} />
        {#each popElmnts as popElmnt (popElmnt.id)}
            <Balloon balloon={popElmnt} {currentRampageChain} on:balloonClicked={handleClick} />
        {/each}
        <InGameStats stats = {currentStats} />
    </main>
</div>
