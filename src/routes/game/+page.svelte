<script>
    import Balloon from '../../components/Balloon.svelte';;
    import { onMount } from 'svelte';
    import { deepCopy, getRandomFrom, getRandomHexColor } from '$lib/utils';
    import { addLog } from "$lib/logService";
    import { appSettings, gameSettings, isLoggedIn, user, popElmntSizeOpts, gameDirection, menuSettings, subjectName, popElmntSpeedOpts, popElmntType, popElmntShape } from '../../stores.js';
    import SubjectNavBar from '../../components/SubjectNavBar.svelte';

    let popElmnts = [];
    let PopElmntIdCounter = 1;
    let balloonKnotHeightPercent;
    const popElmntSpeed = popElmntSpeedOpts[$gameSettings.popElmntSpeed];
    const popElmntSize = popElmntSizeOpts[$gameSettings.popElmntSize];
    let currentRampageChain = 0;

    //Max quantities of special popElmnts
    const specialPopElmntsMaxQuantities = Object.fromEntries(
        Object.values(popElmntType)
            .filter(type => type !== popElmntType.NORMAL) // exclude 'NORMAL'
            .map(type => [
                type,
                Math.floor($gameSettings.popElmntConfig[type].proportion / 100 * $gameSettings.maxPopElmntQty)
            ])
    );
    //Total max quantity of special popElmnts
    const specialPopElmntsMaxQuantity = Object.values(specialPopElmntsMaxQuantities).reduce((sum, value) => sum + value, 0);

    function getAditionalHeight(type, height){
        if($gameSettings.popElmntConfig[type].shape !== popElmntShape.BALLOON) return 0;

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
        const type = isSpecial ? setSpecialType() : popElmntType.NORMAL;
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
    }

    function addInitialPopElmnts() {
        //Initial special popElmnts quantities (initial: 0 for each type)
        let specialPopElmntsQuantities = Object.fromEntries(Object.values(popElmntType).map(type => [type, 0]));
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
            const type = isSpecial ? setInitialSpecialType(specialPopElmntsQuantities) : popElmntType.NORMAL;
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
                case 'leftToRight':
                    return popElmnt.x <= window.innerWidth && popElmnt.x >= 0;
                case 'rightToLeft':
                    return popElmnt.x <= window.innerWidth && popElmnt.x >= 0 - popElmnt.size.width;
                case 'topToBottom':
                    return popElmnt.y <= window.innerHeight && popElmnt.y >= 0;
                case 'bottomToTop':
                    return popElmnt.y <= window.innerHeight + popElmnt.size.height && popElmnt.y >= 0 - (popElmnt.size.height - getAditionalHeight(popElmnt.type, popElmnt.size.height));
                default:
                    return false;
            }
        });
        return popElmntsOnScreen;
    }

    function poppedElmntLogs(popElmnt){
        const now = new Date();
        const generalLogs = {
            timestamp: "2024-03-22T17:13:45.706Z",
            user: "Anonymous",
            userId: "90ae7b8d-f0f6-4cf9-8f27-2ee61d9f80ff",
            date: now.toISOString().slice(0, 10),
            time: now.toISOString().slice(11, 19),
            teacher: $appSettings.instructorName,
            action: "Popped element",
            subject: $subjectName,
        }
        const onScreen = onScreenPopElmnts(popElmnts); 
        const specialPopElmntsQtyOnScreen = Object.fromEntries(
            Object.values(popElmntType)
                .filter(type => type !== popElmntType.NORMAL) // exclude 'NORMAL'
                .map(type => [
                    type + 'Qty',
                    onScreen.filter(popElmnt => popElmnt.type === type).length
                ])
        );
        let specialDetails = {};
        if(popElmnt.isSpecial){
            specialDetails = {
                innerFigType: popElmnt.innerFigType,
                innerFigColor: popElmnt.innerFigColor,
            }
        }
        const detailLogs = {
            id: popElmnt.id,
            color: popElmnt.color,
            x: popElmnt.x,
            y: popElmnt.y,
            speed: popElmnt.speed,
            direction: popElmnt.direction,
            size: popElmnt.size,
            isSpecial: popElmnt.isSpecial,
            type: popElmnt.type,
            ...specialDetails,
            currentRampageChain: currentRampageChain,
            rampageChainForExcellent: $gameSettings.rampageModeChain,
            shape: popElmnt.shape,
            screenElmnts: onScreenPopElmnts(popElmnts).length,
            specialPopElmntsQty: Object.values(specialPopElmntsQtyOnScreen).reduce((sum, value) => sum + value, 0),
            ...specialPopElmntsQtyOnScreen,
            backgroundColor: $gameSettings.gameBackgroundColor,
        }
        return {...generalLogs, details: detailLogs};
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
        console.log(poppedElmntLogs(event.detail));
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

    function getInitialPosition(direction, size, type) {
        switch (direction) {
            case 'leftToRight':
                return { x: 0 - size.width, y: getRandomYPosition(size) };
            case 'rightToLeft':
                return { x: window.innerWidth, y: getRandomYPosition(size) };
            case 'topToBottom':
                return { x: getRandomXPosition(size), y: 0 - size.height - getAditionalHeight(type, size.height)};
            case 'bottomToTop':
                return { x: getRandomXPosition(size), y: window.innerHeight};
            default:
                return { x: 0, y: 0 };
        }
    }

    function animatePopElmnts() {
        function movePopElmnts() {
        popElmnts = popElmnts.map(popElmnt => {
            const speed = popElmnt.speed;
            const enableMoveDesviation = Math.random() > 0.6;
            const enableRotDesviation = enableMoveDesviation;

            //FOR TRANSITION-CLICK BUG FIREFOX transition: transform 0.3s ease;
            const axisDesviation = $appSettings.fluidTransitions ? Math.random() * 2 - 1 : Math.random() * 0.3 - 0.15;
            const angleDesviation = $appSettings.fluidTransitions ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25;
            const horizontalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const verticalDesviation = enableMoveDesviation ? axisDesviation : 0;
            const rotDesviation = enableRotDesviation ? angleDesviation : 0;

            switch (popElmnt.direction) {
                case 'leftToRight':
                    return { ...popElmnt, x: popElmnt.x + speed, y: popElmnt.y + verticalDesviation, rotation: popElmnt.rotation + rotDesviation };
                case 'rightToLeft':
                    return { ...popElmnt, x: popElmnt.x - speed, y: popElmnt.y + verticalDesviation, rotation: popElmnt.rotation + rotDesviation };
                case 'topToBottom':
                    return { ...popElmnt, y: popElmnt.y + speed, x: popElmnt.x + horizontalDesviation, rotation: popElmnt.rotation + rotDesviation };
                case 'bottomToTop':
                    return { ...popElmnt, y: popElmnt.y - speed, x: popElmnt.x + horizontalDesviation, rotation: popElmnt.rotation + rotDesviation };
                default:
                    return popElmnt;
            }
        });
        
        popElmnts = popElmnts.filter(popElmnt => {
            if (popElmnt.direction === 'leftToRight' || popElmnt.direction === 'rightToLeft') {
                return popElmnt.x <= window.innerWidth + popElmnt.size.width && popElmnt.x >= 0 - popElmnt.size.width * 2;
            } else {
                return popElmnt.y <= window.innerHeight + popElmnt.size.height && popElmnt.y >= 0 - (popElmnt.size.height - getAditionalHeight(popElmnt.type, popElmnt.size.height)) * 2;
            }
        });
        
        requestAnimationFrame(movePopElmnts);
        }
        requestAnimationFrame(movePopElmnts);
    }
    
    onMount(() => {
        const areBalloons = Object.values($gameSettings.popElmntConfig).some(popElmnt => popElmnt.shape === popElmntShape.BALLOON);
        if(areBalloons){
            const root = document.documentElement;
            balloonKnotHeightPercent = getComputedStyle(root).getPropertyValue('--balloon-knot-height');
            balloonKnotHeightPercent = parseFloat(balloonKnotHeightPercent)/100;
        }

        addInitialPopElmnts();

        // add popElmnts with time interval 0.5s
        const intervalId = setInterval(addPopElmnt, 500);

        // start popElmnt animation
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
        {#each popElmnts as popElmnt (popElmnt.id)}
            <Balloon balloon={popElmnt} {currentRampageChain} on:balloonClicked={handleClick} />
        {/each}
    </main>
</div>
