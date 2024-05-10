<script>
	import { onMount } from "svelte";
    import UserNavBar from "../../components/UserNavBar.svelte";
    import Profile from "../../components/settings/Profile.svelte";
    import { isFullScreen, isLoggedIn, user } from "../../stores";
	import { getRemoteLogs } from "$lib/logService";

    let loading;
    let formattedLogs = [];
    let columns = [];
    let actions = [];
    let filteredLogs;
    let visibleColumns;
    $: loading = false;
    $: actions = [];
    $: filteredLogs = [];
    $: visibleColumns = [];

    onMount(async () => {
        loading = true;
        if(!$isLoggedIn || !$user) return;
        console.log('recuperando datos')
        let logs = await getRemoteLogs($user.uid);
        logs = logs.map(log => {
            const {details, ...rest} = log;
            return {...rest, ...details};
        });
        formattedLogs = JSON.parse(JSON.stringify(logs));
        filteredLogs = formattedLogs;
        columns = Array.from(new Set(filteredLogs.flatMap(obj => Object.keys(obj))));
        actions = Array.from(new Set(filteredLogs.flatMap(obj => obj.action)));
        visibleColumns = columns;
        console.log(columns)
        loading = false;
        console.log(filteredLogs);
    })

    function handleSelect(event) {
        const selectedAction = event.target.value;
        filterDataByAction(selectedAction);
        filterColumns()
    }

    function filterDataByAction(selectedAction) {
        if (selectedAction === '') {
            filteredLogs = formattedLogs;
        } else {
            filteredLogs = formattedLogs.filter(item => item.action === selectedAction);
        }
    }

    function filterColumns() {
        visibleColumns = columns.filter(column => {
            return filteredLogs.some(item => typeof item[column] !== 'undefined');
        });
    }

</script>

<UserNavBar backPath={'/settings'}/>

<main class="{$isFullScreen ? 'fullscreen' : ''}">
    <h1>Statistics</h1>

    <h2>Profile:</h2>
    <Profile />

    <h2>Data:</h2>

    {#if loading}
        <p>Loading...</p>
    {:else}

        <label for="actionsFilter">Filter by action:</label>
        <select id="actionsFilter" class="not-selectable action-filter-select" on:input={handleSelect}>
            <option value="">All actions</option>
            {#each actions as action}
                <option value={action}>{action}</option>
            {/each}
        </select>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        {#each visibleColumns as column}
                            <th>{column}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each filteredLogs as logs}
                        <tr>
                            {#each visibleColumns as column}
                                <td>{logs[column]}</td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>

<style>
    .action-filter-select{
        margin-bottom: 20px;
    }
    main{
        padding: 2rem;
    }
    .fullscreen{
        height: 100vh;
        overflow: auto;
    }
    .table-container {
    width: 90vw;
    max-height: 500px;
    height: max-content;
    overflow-y: auto;
    overflow-x: auto;
  }

  table {
    width: max-content;
    min-width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 8px;
    border: 1px solid #dddddd;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
  }

  thead tr:first-child th {
    background-color: #e0e0e0;
    font-weight: bold;
  }

  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tbody tr.selected {
    background-color: #ffc;
  }
</style>