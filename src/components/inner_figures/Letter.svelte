<script>
	import { gameSettings } from "../../stores";

    export let balloon;
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); 
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    
    function figContourEnabled(){
        return (balloon.type == 'EXPERIMENTAL' && $gameSettings.enableExpInnerFigContour) || (balloon.type == 'CONTROL' && $gameSettings.enableCtrlInnerFigContour);
    }
</script>


<span
    class="not-selectable"
    style=
        "-webkit-text-fill-color: {balloon.innerFigColor};
        -webkit-text-stroke: {figContourEnabled() ? "0.7px black" : "unset"};"
    style:font-size='{balloon.size.height * 0.7}px'
    >
    {randomLetter}
</span>