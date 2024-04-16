<script>
    import { gameSettings, popElmntType } from "../../stores";

    export let popElmnt;

    function figContourEnabled(){
        return (popElmnt.type == 'EXPERIMENTAL' && $gameSettings.popElmntConfig[popElmntType.EXP].enableInnerFigContour) || (popElmnt.type == 'CONTROL' && $gameSettings.popElmntConfig[popElmntType.CTRL].enableInnerFigContour);
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