<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function handleChange(event) {
        dispatch('change', event.target.checked);
    }

    export let label = 'Label';
    export let value;
</script>

<div>
    <label class="switch">
      <input type="checkbox" bind:checked={value} on:change={handleChange} />
      <span class="slider"></span>
    </label>
    <span>{label}</span>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
        margin: 0;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 28px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #0baf5b;
    }

    input:checked + .slider:before {
        transform: translateX(22px);
    }
    @media (max-width: 600px) {
        .switch {
            width: 50px;
            height: 24px;
        }

        .slider {
            border-radius: 24px;
        }

        .slider:before {
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
        }

        input:checked + .slider:before {
            transform: translateX(15px);
        }

        label {
            font-size: 12px;
        }

        span {
            font-size: 11px;
        }
    }
    @media (min-width: 601px) and (max-width: 1024px) {
        .switch {
            width: 50px;
            height: 28px;
        }

        .slider {
            border-radius: 28px;
        }

        .slider:before {
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
        }

        input:checked + .slider:before {
            transform: translateX(22px);
        }

        label {
            font-size: 14px;
        }

        span {
            font-size: 13px;
        }
    }
</style>
