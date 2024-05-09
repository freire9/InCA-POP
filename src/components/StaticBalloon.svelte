<script>
    import { Fa } from 'inca-utils';
    import { createEventDispatcher } from 'svelte'
    export let icon;
    export let mode;
    const dispatch = createEventDispatcher();

    function handleClick(){
        dispatch('modeClicked', mode);
    }
</script>

<style>
    @media (max-width: 600px) {
        .balloon{
            --balloon-width: 80px;
            width: var(--balloon-width);
            height: 100px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        .balloon{
            --balloon-width: 120px;
            width: var(--balloon-width);
            height: 150px;
        }
    }
    @media (min-width: 1024px){
        .balloon{
            --balloon-width: 200px;
            width: var(--balloon-width);
            height: 250px;
        }
    }
    .balloon {
        cursor: pointer;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        /* filter: brightness(1.2); */
        border-radius: 100% / 80% 80% 120% 120%;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        /* background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5), transparent 70%); */
        background-color: var(--bg-pseudo);
        border: 0.4vmin solid;
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
        border: 0.4vmin solid;
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
    .balloon span{
        font-size: calc(var(--balloon-width) * 0.5);
    }
    button:focus-visible,
    button:focus-visible::before{
        outline: 2px solid blue;
    }
</style>

<button class="balloon not-selectable" on:click|stopPropagation={handleClick}>
    <span class="not-selectable">
        <Fa icon={icon}/>
    </span>
  <div class="string not-selectable" style:transform='translateX(-50%)'></div>
</button>
