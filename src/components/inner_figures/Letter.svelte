<script>
	import { gameSettings, popElmntTypes } from "../../stores";

    export let popElmnt;
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); 
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    
    function figContourEnabled(){
        return (popElmnt.type == popElmntTypes.EXP && $gameSettings.popElmntConfig[popElmntTypes.EXP].enableInnerFigContour) || (popElmnt.type == popElmntTypes.CTRL && $gameSettings.popElmntConfig[popElmntTypes.CTRL].enableInnerFigContour);
    }
</script>


<span
    class="not-selectable"
    style=
        "-webkit-text-fill-color: {popElmnt.innerFigColor};
        -webkit-text-stroke: {figContourEnabled() ? "0.7px black" : "unset"};"
    style:font-size='{popElmnt.size.height * 0.7}px'
    >
    {randomLetter}
</span>