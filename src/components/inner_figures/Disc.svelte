<script>
    import { gameSettings } from "../../stores";

    export let balloon;
</script>

<span
    class="not-selectable"
    style:background-color='{balloon.innerFigColor}'
    style:border={$gameSettings.enableInnerFigContour ? 'black 2px solid' : 'unset'}
    style:border-radius='{'100%'}'
    style:width='{balloon.size.height * 0.40}px'
    style:height='{balloon.size.height * 0.40}px'
    >
</span>