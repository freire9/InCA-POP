<script>
    import { gameSettings, popElmntTypes } from "../../stores";

    export let popElmnt;

    function figContourEnabled(){
        return (popElmnt.type == popElmntTypes.EXP && $gameSettings.popElmntConfig[popElmntTypes.EXP].enableInnerFigContour) || (popElmnt.type == popElmntTypes.CTRL && $gameSettings.popElmntConfig[popElmntTypes.CTRL].enableInnerFigContour);
    }
</script>

<span
    class="not-selectable"
    style:background-color='{popElmnt.innerFigColor}'
    style:border={ figContourEnabled() ? 'black 2px solid' : 'unset'}
    style:border-radius='{'100%'}'
    style:width='{popElmnt.size.height * 0.40}px'
    style:height='{popElmnt.size.height * 0.40}px'
    >
</span>