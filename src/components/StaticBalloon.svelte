<script>
    import { Fa } from 'inca-utils';
    export let icon;
</script>

<style>
    .balloon {
        cursor: pointer;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        filter: brightness(1.2);
        border-radius: 100% / 80% 80% 120% 120%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5), transparent 70%);
        background-color: var(--bg-pseudo);
        width: 20vw;
        height: 50vh;
    }
    .balloon::before {
        content: '';
        position: absolute;
        width: 15%;
        height: var(--balloon-knot-height);
        left: 50%;
        top: 100%;
        transform: translateX(-50%);
        border-radius: 100% / 130% 120% 20% 10%;
        background: var(--bg-pseudo);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .string {
        position: absolute;
        width: 1px;
        height: 10%;
        background-color: black;
        bottom: -25%;
        left: 50%;
        border-bottom-left-radius: 50%;
        transform: 'translateX(--50%)';
    }
</style>

<div class="balloon not-selectable"
>
    <span
    class="not-selectable"
    style="-webkit-text-fill-color: black"
    style:font-size='{100 * 0.7}px'
    >
    <Fa icon={icon}/>
    </span>
  <div class="string not-selectable" style:transform='translateX(-50%)'></div>
</div>
