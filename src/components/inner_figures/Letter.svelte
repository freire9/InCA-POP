<script>
	import { gameSettings, popElmntTypes } from "../../stores";

    export let popElmnt;
    export let gameMode;
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); 
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    
    function figContourEnabled(){
        if(popElmnt.type === popElmntTypes.NORMAL ) return false;

        return $gameSettings[gameMode].popElmntConfig[popElmnt.type].enableInnerFigContour;
    }

    function getFigContourColor(){
        if(!figContourEnabled()) return;

        return $gameSettings[gameMode].popElmntConfig[popElmnt.type].innerFigContourColor;

    }

    function getFigContourWidth(){
        if(!figContourEnabled()) return;

        return $gameSettings[gameMode].popElmntConfig[popElmnt.type].innerFigContourWidth;
    }
</script>


<span
    class="not-selectable"
    style=
        "-webkit-text-fill-color: {popElmnt.innerFigColor};
        -webkit-text-stroke: {figContourEnabled() ? getFigContourWidth().toString() + "px " + getFigContourColor().toString() : "unset"};"
    style:font-size='{popElmnt.size.height * 0.7}px'
    >
    {randomLetter}
</span>