<script>
    import { gameSettings, popElmntTypes } from "../../stores";

    export let popElmnt;
    export let gameMode;

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
    style:background-color='{popElmnt.innerFigColor}'
    style:border={ figContourEnabled() ? getFigContourColor().toString() + ' ' + getFigContourWidth().toString() + 'px solid' : 'unset'}
    style:border-radius='{'100%'}'
    style:width='{popElmnt.size.height * 0.40}px'
    style:height='{popElmnt.size.height * 0.40}px'
    style:display='inline-block'
    >
</span>