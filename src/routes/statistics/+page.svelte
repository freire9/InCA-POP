<script>
	import { onMount } from "svelte";
    import UserNavBar from "../../components/UserNavBar.svelte";
    import Profile from "../../components/settings/Profile.svelte";
    import { availableColorsNames, availableColorsOpts, isFullScreen, isLoggedIn, user } from "../../stores";
	import { getRemoteLogs } from "$lib/logService";
	import { capitalizeFirstLetter, deepCopy } from "$lib/utils";

    let loading;
    let formattedLogs = [];
    let columns = [];
    let actions = [];
    let filteredLogs;
    let visibleColumns;
    let colorPairsSeen = {};
    let colorPairsPopped = {};
    $: loading = false;
    $: actions = [];
    $: filteredLogs = [];
    $: visibleColumns = [];
    let seenColorsPercentModeEnabled = false;

    onMount(async () => {
        loading = true;
        if(!$isLoggedIn || !$user) {
            loading = false;
            return;
        }

        console.log('recuperando datos')

        // Get the logs from the server
        let fetchedLogs = await getRemoteLogs($user.uid);

        // Extract the details from the logs and merge them with the rest of the log data
        fetchedLogs = fetchedLogs.map(log => {
            const {details, ...rest} = log;
            return {...rest, ...details};
        });

        // Format the timestamp to be a Date object
        formattedLogs = deepCopy(fetchedLogs).map(log => {
            const formattedTimeLog = {...log};
            formattedTimeLog.timestamp = new Date(log.timestamp.seconds * 1000 + log.timestamp.nanoseconds / 1000000);
            return formattedTimeLog;
        });

        // Copy the logs to be able to filter them without affecting the original data
        filteredLogs = deepCopy(formattedLogs);

        // Get the columns and actions to filter by
        columns = Array.from(new Set(filteredLogs.flatMap(obj => Object.keys(obj))));
        actions = Array.from(new Set(filteredLogs.flatMap(obj => obj.action)));
        
        // Set the initial visible columns to be all of them
        visibleColumns = columns;

        // Get the total times that a color pair has been seen and popped
        getColorPairsSeen();
        getColorPairsPopped();

        console.log(columns)
        loading = false;
        console.log(filteredLogs);
        console.log(colorPairsSeen)
    })

    // Function to handle the selection of the action filter
    function handleSelect(event) {
        const selectedAction = event.target.value;
        filterDataByAction(selectedAction);
        filterColumns()
    }

    // Function to filter the data by the selected action
    function filterDataByAction(selectedAction) {
        if (selectedAction === '') {
            filteredLogs = formattedLogs;
        } else {
            filteredLogs = formattedLogs.filter(item => item.action === selectedAction);
        }
    }

    // Function to filter the columns to only show the ones that have data
    function filterColumns() {
        visibleColumns = columns.filter(column => {
            return filteredLogs.some(item => typeof item[column] !== 'undefined');
        });
    }

    // Function to get total times that a color pairs has been seen
    function getColorPairsSeen(){
        const exitEndLogs = formattedLogs.filter(log => log.action === 'Exit game' || log.action === 'Game end');
        exitEndLogs.forEach(log => {
            Object.values(availableColorsOpts).forEach(color1 =>{
                Object.values(availableColorsOpts).forEach(color2 =>{
                    const colorPair = [color1, color2].join(',');
                    const qty = log.specialColorPairsSeen[colorPair];
                    colorPairsSeen[colorPair] = colorPairsSeen[colorPair] ? colorPairsSeen[colorPair] + qty : qty;
                    colorPairsPopped[colorPair] = 0;
                })
            })
        });
    }

    // Function to get total times that a color pairs has been popped
    function getColorPairsPopped(){
        const specialPoppedElmntLogs = formattedLogs.filter(log => log.action === 'Popped element' && log.isSpecial);
        specialPoppedElmntLogs.forEach(log => {
            const colorPair = [log.color, log.innerFigColor].join(',');
            colorPairsPopped[colorPair] = colorPairsPopped[colorPair] ? colorPairsPopped[colorPair] + 1 : 1;
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
        {#if !filteredLogs.length}
            <p>No logs found for this user ID</p>
        {:else}
        <label for="actionsFilter">Filter by action:</label>
        <select id="actionsFilter" class="not-selectable action-filter-select" on:input={handleSelect}>
            <option value="">All actions</option>
            {#each actions as action}
            <option value={action}>{action}</option>
            {/each}
        </select>
        
        <p>Showing {filteredLogs.length} logs</p>
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
    {/if}

    <h2>Stats:</h2>
    {#if loading}
        <p>Loading...</p>
    {:else}
        {#if !filteredLogs.length}
            <p>No logs found for this user ID</p>
        {:else}
            <h3>Color\inner fig color popped vs total seen:</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Color\Inner fig color</th>
                            {#each Object.values(availableColorsNames) as color2Name}
                                <th>
                                    <span class="tr-color-square" style="background-color: {availableColorsOpts[color2Name]};"></span>
                                    {capitalizeFirstLetter(color2Name)}
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.values(availableColorsNames) as color1Name}
                            <tr>
                                <th>
                                    <span class="tr-color-square" style="background-color: {availableColorsOpts[color1Name]};"></span>
                                    {capitalizeFirstLetter(color1Name)}
                                </th>

                                {#each Object.values(availableColorsNames) as color2Name}
                                    <td>
                                        {#if seenColorsPercentModeEnabled}
                                            {((colorPairsPopped[`${availableColorsOpts[color1Name]},${availableColorsOpts[color2Name]}`] /
                                            colorPairsSeen[`${availableColorsOpts[color1Name]},${availableColorsOpts[color2Name]}`]) * 100).toFixed(2)} %
                                        {:else}
                                            {colorPairsPopped[`${availableColorsOpts[color1Name]},${availableColorsOpts[color2Name]}`]}
                                            /
                                            {colorPairsSeen[`${availableColorsOpts[color1Name]},${availableColorsOpts[color2Name]}`]}
                                        {/if}
                                    </td>
                                {/each}
                            </tr>        
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
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
  tbody tr th {
    font-weight: bold;
  }

  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tbody tr.selected {
    background-color: #ffc;
  }
  .tr-color-square{
    width: 20px;
    height: 20px;
    display: inline-block;
    margin-right: 5px;
  }
</style>