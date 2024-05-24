<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onDestroy, onMount } from 'svelte';
    import { capitalizeFirstLetter, deepCopy, getRandomColorFromPalette, getRandomFrom } from '$lib/utils';
    import { addLog } from "$lib/logService";
    import { appSettings, gameSettings, user, popElmntSizeOpts, gameDirection, subjectName, popElmntShapes, popElmntTypes, popElmntSpeedsOpts, popElmntDirections, localUserId, isLoggedIn, endGameConditionsOpts, gameId, availableColorsOpts } from '../../stores.js';
    import SubjectNavBar from '../../components/SubjectNavBar.svelte';
    import InGameStats from '../../components/InGameStats.svelte';
    import { goto } from '$app/navigation';

    //app constants
    const currentGameDirection = $gameDirection;
    const gameMode = currentGameDirection;
    const popElmntSpeed = popElmntSpeedsOpts[$gameSettings[gameMode].popElmntSpeed];
    const popElmntSize = popElmntSizeOpts[$gameSettings[gameMode].popElmntSize];
    const popElmntSpeedType = $gameSettings[gameMode].popElmntSpeed;
    const popElmntSizeType = $gameSettings[gameMode].popElmntSize;
    const gameBackgroundColor = $gameSettings[gameMode].gameBackgroundColor;
    const maxPopElmntQty = $gameSettings[gameMode].maxPopElmntQty;
    const popElmntConfig = $gameSettings[gameMode].popElmntConfig;
    const instructorName = $appSettings.instructorName;
    const subjectNameValue = $subjectName;
    const localId = $localUserId;
    const rampageModeChain = $gameSettings[gameMode].rampageModeChain;
    const enableRampageMode = $gameSettings[gameMode].enableRampageMode;
    const endGameTimeEnabled = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.TIME].enabled;
    const maxPoppedCondEnabled = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.POP_ELMNTS_POPPED].enabled;
    const maxPoppedCondValue = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.POP_ELMNTS_POPPED].value;
    const specialPoppedCondEnabled = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.SPECIAL_POP_ELMNTS_POPPED].enabled;
    const specialPoppedCondValue = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.SPECIAL_POP_ELMNTS_POPPED].value;
    const actualGameId = $gameId;

    let lastFrameTime = performance.now(); //ms
    const fps = 60;
    const frameInterval = 1000 / fps;
    let animationFrameId;
    const popElmntInterval = 500; //ms
    let timeForNextPopElmnt = 0; //ms
    let popElmnts = [];
    let PopElmntIdCounter = 1;
    let balloonKnotHeightPercent;
    let currentRampageChain = 0;
    let currentStats = Object.fromEntries(Object.values(popElmntTypes).map(type => [type, { popped: 0, total: 0 }]));
    let provisoryStats = Object.fromEntries(Object.values(popElmntTypes).map(type => [type, { popped: 0, total: 0 }]));
    let specialPopElmntsPopped = 0;
    let totalPopElmntsPopped = 0;
    let endGameTimer;
    let specialColorPairsSeen = {};
    let awayFromWindowTimer;
    let timeSinceLastInteraction = 0;
    const timeForTrackInactivity = 20000;
    const timeForInactivityEndGame = 60000;
    const timeForInactivityWindowEndGame = 10000;

    Object.values(availableColorsOpts).forEach(color1 => {
        Object.values(availableColorsOpts).forEach(color2 => {
            const pair = `${color1},${color2}`;
            specialColorPairsSeen[pair] = 0;
        });
    });

    let specialColorPairsSeenPovisory = deepCopy(specialColorPairsSeen);

    //Max quantities of special popElmnts
    const specialPopElmntsMaxQuantities = Object.fromEntries(
        Object.values(popElmntTypes)
            .filter(type => type !== popElmntTypes.NORMAL) // exclude 'NORMAL'
            .map(type => [
                type,
                Math.floor(popElmntConfig[type].proportion / 100 * maxPopElmntQty)
            ])
    );
    //Total max quantity of special popElmnts
    const specialPopElmntsMaxQuantity = Object.values(specialPopElmntsMaxQuantities).reduce((sum, value) => sum + value, 0);

    //function to increment the quantity of color pair (color and inner fig color) seen together
    function addToSeenSpecialColors(popElmntColor, innerFigColor){
        const pair = `${popElmntColor},${innerFigColor}`;
        if(timeSinceLastInteraction < timeForTrackInactivity) specialColorPairsSeen[pair] += 1;
        specialColorPairsSeenPovisory[pair] += 1;
    }

    function startTimer(time) {
        endGameTimer = setInterval(() => {
            clearInterval(endGameTimer);
            handleGameEnd(endGameConditionsOpts.TIME);
        }, time * 1000);
    }

    function restartInactivityTracking(){
        if(timeSinceLastInteraction >= timeForTrackInactivity && timeSinceLastInteraction < timeForInactivityEndGame){
            currentStats = deepCopy(provisoryStats);
            specialColorPairsSeen = deepCopy(specialColorPairsSeenPovisory);
        }
        timeSinceLastInteraction = 0;
    }

    function getAditionalHeight(type, height){
        if($gameSettings[gameMode].popElmntConfig[type].shape !== popElmntShapes.BALLOON) return 0;

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
        if (popElmnts.length >= maxPopElmntQty) return;

        const id = PopElmntIdCounter++;
        const isSpecial = popElmnts.filter(popElmnt => popElmnt.isSpecial).length < specialPopElmntsMaxQuantity;
        const type = isSpecial ? setSpecialType() : popElmntTypes.NORMAL;
        const { x, y } = getInitialPosition(currentGameDirection, popElmntSize, type);
        const speed = getRandomSpeed();
        const size = popElmntSize;
        const direction = currentGameDirection;
        const rotation = Math.random() * 20 - 10;
        const innerFigType = isSpecial ? popElmntConfig[type].innerFigType : '';
        const shape = popElmntConfig[type].shape;
        const randomizedColor = popElmntConfig[type].enableRandColor;
        const randomizedInnerFigColor = isSpecial ? popElmntConfig[type].enableRandInnerFigColor : '';

        const innerFigColor = isSpecial ?
            (randomizedInnerFigColor ? getRandomColorFromPalette() : ((false && popElmntConfig[type].enableInnerFigRangeColor) ? getRandomFrom(popElmntConfig[type].innerFigInterpColors) : popElmntConfig[type].innerFigColor))
            : '';

        const color = randomizedColor ?
            getRandomColorFromPalette({filterColor: isSpecial ? innerFigColor : ''}) :
            ((false && popElmntConfig[type].enableRangeColor) ? getRandomFrom(popElmntConfig[type].interpColors) : popElmntConfig[type].color);


        if(isSpecial) addToSeenSpecialColors(color, innerFigColor);

        popElmnts.push(
            { id, color, randomizedColor, innerFigType, innerFigColor, randomizedInnerFigColor, x, y, speed, direction, size, rotation, isSpecial, type, shape}
        );
        
        if(timeSinceLastInteraction < timeForTrackInactivity) currentStats[type].total += 1;
        provisoryStats[type].total += 1;
    }

    function addInitialPopElmnts() {
        //Initial special popElmnts quantities (initial: 0 for each type)
        let specialPopElmntsQuantities = Object.fromEntries(Object.values(popElmntTypes).map(type => [type, 0]));
        //Total special popElmnts quantity (initial: 0)
        let specialPopElmntsTotalQty = 0;

        while (popElmnts.length < maxPopElmntQty) {
            const id = PopElmntIdCounter++;
            const x = getRandomXPosition(popElmntSize);
            const y = getRandomYPosition(popElmntSize);
            const speed = getRandomSpeed();
            const size = popElmntSize;
            const direction = currentGameDirection;
            const rotation = Math.random() * 20 - 10;
            const isSpecial = specialPopElmntsTotalQty < specialPopElmntsMaxQuantity;
            const type = isSpecial ? setInitialSpecialType(specialPopElmntsQuantities) : popElmntTypes.NORMAL;
            const innerFigType = isSpecial ? popElmntConfig[type].innerFigType : '';
            const shape = popElmntConfig[type].shape;
            const randomizedColor = popElmntConfig[type].enableRandColor;
            const randomizedInnerFigColor = isSpecial ? popElmntConfig[type].enableRandInnerFigColor : '';

            const innerFigColor = isSpecial ?
                (randomizedInnerFigColor ? getRandomColorFromPalette() : ((false && popElmntConfig[type].enableInnerFigRangeColor) ? getRandomFrom(popElmntConfig[type].innerFigInterpColors) : popElmntConfig[type].innerFigColor))
                : '';

            const color = randomizedColor ?
                getRandomColorFromPalette({filterColor: isSpecial ? innerFigColor : ''})
                : ((false && popElmntConfig[type].enableRangeColor) ? getRandomFrom(popElmntConfig[type].interpColors) : popElmntConfig[type].color);
            

            if(isSpecial){
                specialPopElmntsQuantities[type] += 1;
                specialPopElmntsTotalQty += 1;
                addToSeenSpecialColors(color, innerFigColor);
            }

            popElmnts.push(
                { id, color, randomizedColor, innerFigType, innerFigColor, randomizedInnerFigColor, x, y, speed, direction, size, rotation, isSpecial, type, shape}
            );

            if(timeSinceLastInteraction < timeForTrackInactivity) currentStats[type].total += 1;
            provisoryStats[type].total += 1;
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
        const popElmntsOnScreen = deepCopy(popElmnts.filter(popElmnt => {
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
        }));
        return popElmntsOnScreen;
    }

    function setGeneralLogs(action){
        const now = new Date();
        const generalLogs = {
            timestamp: now,
            user: ($user && $isLoggedIn) ? $user.displayName : "Anonymous",
            userId: ($user && $isLoggedIn) ? $user.uid : localId,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            teacher: instructorName,
            action: action.toString(),
            subject: subjectNameValue,
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
            onScreenElmntsInnerFigColors: onScreen.filter(popElmnt => popElmnt.type != popElmntTypes.NORMAL).map(popElmnt => popElmnt.innerFigColor),
            onScrenElmntsInnerFigTypes: onScreen.filter(popElmnt => popElmnt.type != popElmntTypes.NORMAL).map(popElmnt => popElmnt.innerFigType),
        }
        return onScreenElmntsLogs;
    }

    function setOnScreenComparativeLogs(poppedElmnt){
        const onScreen = onScreenPopElmnts(popElmnts);
        const onScreenComparativeLogs = {
            onScreenExactlySameAsPopped: onScreen.filter(popElmnt => 
                    popElmnt.type === poppedElmnt.type &&
                    popElmnt.color === poppedElmnt.color &&
                    popElmnt.innerFigColor === poppedElmnt.innerFigColor &&
                    popElmnt.innerFigType === poppedElmnt.innerFigType
                ).length,
            onScreenDiffButSameTypeAsPopped: onScreen.filter(popElmnt => 
                    popElmnt.type === poppedElmnt.type &&
                    (popElmnt.color !== poppedElmnt.color ||
                        popElmnt.innerFigColor !== poppedElmnt.innerFigColor ||
                        popElmnt.innerFigType !== poppedElmnt.innerFigType
                    )
                ).length + 1,
            onScreenDifferentTypeAsPopped: onScreen.filter(popElmnt => popElmnt.type !== poppedElmnt.type).length,
        }
        return onScreenComparativeLogs;
    }

    function poppedElmntLogs(popElmnt){
        const generalLogs = setGeneralLogs('Popped element');
        const onScreenElmntsLogs = setOnScreenElmntsLogs();
        const onScreenComparativeLogs = setOnScreenComparativeLogs(popElmnt);
        let specialDetails = {};
        if(popElmnt.isSpecial){
            specialDetails = {
                innerFigType: popElmnt.innerFigType,
                innerFigColor: popElmnt.innerFigColor,
                isRandomizedInnerFigColor: popElmnt.randomizedInnerFigColor,
            }
        }
        const detailLogs = {
            color: popElmnt.color,
            isRandomizedColor: popElmnt.randomizedColor,
            x: Math.floor(popElmnt.x),
            y: Math.floor(popElmnt.y),
            speed: popElmntSpeedType,
            size: popElmntSizeType,
            isSpecial: popElmnt.isSpecial,
            type: popElmnt.type,
            shape: popElmnt.shape,
            currentRampageChain: currentRampageChain,
            rampageChainForExcellent: rampageModeChain,
            gameBackgroundColor: gameBackgroundColor,
            gameMode: gameMode,
            ...specialDetails,
            ...onScreenElmntsLogs,
            ...onScreenComparativeLogs,
            gameId: actualGameId,
        }
        return {...generalLogs, details: deepCopy(detailLogs)};
    }

    function backgroundClickLogs(event){
        const generalLogs = setGeneralLogs('Game background click');
        const onScreenElmntsLogs = setOnScreenElmntsLogs();
        const detailLogs = {
            x: event.clientX,
            y: event.clientY,
            gameBackgroundColor: gameBackgroundColor,
            gameMode: gameMode,
            ...onScreenElmntsLogs,
            gameId: actualGameId,
        }
        return {...generalLogs, details: deepCopy(detailLogs)};
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
            gameBackgroundColor: gameBackgroundColor,
            gameMode: gameMode,
            ...onScreenElmntsLogs,
            ...poppedStatsLogs,
            ...totalStatsLogs,
            gameId: actualGameId,
            specialColorPairsSeen: specialColorPairsSeen,
        }
        return {...generalLogs, details: deepCopy(detailLogs)};
    }

    function endGameLogs(condition){
        const generalLogs = setGeneralLogs('End game');
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
            ...poppedStatsLogs,
            ...totalStatsLogs,
            endCondition: condition,
            gameId: actualGameId,
            gameMode: gameMode,
            specialColorPairsSeen: specialColorPairsSeen,
        }
        return {...generalLogs, details: deepCopy(detailLogs)};
    }

    async function handleClick(event) {
        restartInactivityTracking();
        if(enableRampageMode) rampageChainUpdate(event.detail);
        addLog(poppedElmntLogs(event.detail));
        currentStats[event.detail.type].popped += 1;
        provisoryStats[event.detail.type].popped += 1;
        if(event.detail.isSpecial) specialPopElmntsPopped += 1;
        totalPopElmntsPopped += 1;
        destroyPopElmnt(event.detail.id);
        if(maxPoppedCondEnabled && totalPopElmntsPopped >= maxPoppedCondValue) handleGameEnd(endGameConditionsOpts.POP_ELMNTS_POPPED);
        if(specialPoppedCondEnabled && specialPopElmntsPopped >= specialPoppedCondValue) handleGameEnd(endGameConditionsOpts.SPECIAL_POP_ELMNTS_POPPED);
    }

    async function handleBackgroundClick(event){
        restartInactivityTracking();
        addLog(backgroundClickLogs(event));
    }

    async function handleExitClick(){
        restartInactivityTracking();
        clearInterval(endGameTimer);
        addLog(ExitClickLogs(), {isExitEndLog: true});
    }

    async function handleGameEnd(condition){
        clearInterval(endGameTimer);
        addLog(endGameLogs(condition), {isExitEndLog: true});
        goto('/');
    }

    async function handleBackgroundKeyboard(event){
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

    function movePopElmnts(currentTime) {
        const deltaTime = currentTime - lastFrameTime;
        const deltaTimeMultiplier = deltaTime / frameInterval;

        const enableMoveDesviation = Math.random() > 0.8;
        const enableRotDesviation = enableMoveDesviation;

        //FOR TRANSITION-CLICK BUG FIREFOX transition: transform 0.3s ease;
        const axisDesviation = Math.random() * 0.3 - 0.15;
        const angleDesviation = Math.random() * 0.5 - 0.25;
        const horizontalDesviation = enableMoveDesviation ? axisDesviation : 0;
        const verticalDesviation = enableMoveDesviation ? axisDesviation : 0;
        const rotDesviation = enableRotDesviation ? angleDesviation : 0;

        popElmnts.forEach(popElmnt => {
            const distance = popElmnt.speed * deltaTimeMultiplier;
            switch (popElmnt.direction) {
                case popElmntDirections.LEFT_TO_RIGHT:
                    popElmnt.x += distance;
                    popElmnt.y += verticalDesviation;
                    popElmnt.rotation += rotDesviation;
                    break;
                case popElmntDirections.RIGHT_TO_LEFT:
                    popElmnt.x -= distance;
                    popElmnt.y += verticalDesviation;
                    popElmnt.rotation += rotDesviation;
                    break;
                case popElmntDirections.TOP_TO_BOTTOM:
                    popElmnt.y += distance;
                    popElmnt.x += horizontalDesviation;
                    popElmnt.rotation += rotDesviation;
                    break;
                case popElmntDirections.BOTTOM_TO_TOP:
                    popElmnt.y -= distance;
                    popElmnt.x += horizontalDesviation;
                    popElmnt.rotation += rotDesviation;
                    break;
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
    
    function gameLoop(){
        const currentTime = performance.now();
        const deltaTime = currentTime - lastFrameTime; //ms
        timeForNextPopElmnt += deltaTime;
        timeSinceLastInteraction += deltaTime;

        if (timeSinceLastInteraction >= timeForInactivityEndGame) {
            handleGameEnd(endGameConditionsOpts.INACTIVITY);
        }

        if(timeForNextPopElmnt >= popElmntInterval){
            addPopElmnt();
            timeForNextPopElmnt = 0;
        }

        movePopElmnts(currentTime);
        lastFrameTime = currentTime ;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    //Handle user before reloading the page
    let isUserLeaving = false;
    const handleBeforeUnload = (event) => {
        isUserLeaving = true;
        const confirmationMessage = 'Are you sure you want to leave (if you close the data may be lost)?';
        event.returnValue = confirmationMessage; // For modern browsers
        return confirmationMessage; // For older browsers
    };

    //Handle user reloading the page
    const handleUnload = () => {
        if (isUserLeaving) handleGameEnd(endGameConditionsOpts.INACTIVITY);
        else isUserLeaving = false;
    };

    //Handle user leaving the window
    const handleVisibilityChange = () => {
        if (document.hidden) {
            const actualTime = performance.now();
            awayFromWindowTimer = setInterval(() => {
                const currentTime = performance.now();
                if(currentTime - actualTime >= timeForInactivityWindowEndGame){
                    clearInterval(awayFromWindowTimer);
                    handleGameEnd(endGameConditionsOpts.INACTIVITY);
                }
            }, 1000);
        } else {
            clearInterval(awayFromWindowTimer);
        }
    };

    onMount(() => {
        const isClient = !import.meta.env.SSR;
        if(isClient){
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('unload', handleUnload);
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        const areBalloons = Object.values(popElmntConfig).some(popElmnt => popElmnt.shape === popElmntShapes.BALLOON);
        if(areBalloons){
            const root = document.documentElement;
            balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
            balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;
        }

        if(endGameTimeEnabled){
            const time = $gameSettings[gameMode].endGameConditions[endGameConditionsOpts.TIME].value
            startTimer(time);
        }

        addInitialPopElmnts();

        // start popElmnt animation
        gameLoop()

        return () => {
            if(isClient){
                clearInterval(awayFromWindowTimer);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                window.removeEventListener('unload', handleUnload);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };
    });

    onDestroy(() => {
        const isClient = !import.meta.env.SSR;
        if(isClient){
            cancelAnimationFrame(animationFrameId);
            clearInterval(awayFromWindowTimer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
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
    <main class="not-selectable" style:background-color = {gameBackgroundColor} >
        <SubjectNavBar on:exit={handleExitClick} />
        {#each popElmnts as popElmnt (popElmnt.id)}
            <Balloon gameMode={gameMode} balloon={popElmnt} {currentRampageChain} on:balloonClicked={handleClick} />
        {/each}
        <InGameStats stats = {currentStats} gameBackgroundColor={gameBackgroundColor}/>
    </main>
</div>
