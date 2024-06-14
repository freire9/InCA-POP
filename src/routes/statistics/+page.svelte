<script>
	import { onMount } from "svelte";
    import UserNavBar from "../../components/UserNavBar.svelte";
    import Profile from "../../components/settings/Profile.svelte";
    import { actionsOpts, availableColorsNames, availableColorsOpts, availableColorsOptsByHex, isFullScreen, isLoggedIn, user } from "../../stores";
	import { getRemoteLogs } from "$lib/logService";
	import { capitalizeFirstLetter, deepCopy } from "$lib/utils";
	import ColorPicker from "../../components/settings/ColorPicker.svelte";

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
    let filteredPopElmntColors = Object.values(availableColorsNames);
    let filteredInnerFigColors = Object.values(availableColorsNames);
    let fetchedSubjects = [];

    let currentFilters = {};

    onMount(async () => {
        loading = true;
        if(!$isLoggedIn || !$user) {
            loading = false;
            return;
        }

        console.log('recuperando datos')

        // Get the logs from the server
        let fetchedLogs = await getRemoteLogs($user.uid);

        fetchedSubjects = Array.from(new Set(fetchedLogs.map(log => log.subject)));

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

    // Function to filter the data by the selected filters
    const applyFilters = (item, filters) => {
        for (const key in filters) {
            if (item[key] !== filters[key]) {
                return false;
            }
        }
        return true;
    };

    // Function to handle select input filter
    function handleSelect(value, filterFunction) {
        filterFunction(value);
        getColorPairsSeen();
        getColorPairsPopped();
        filterColumns()
    }

    // Function to handle the selection of the action filter
    const handleActionFilter = (event) => {
        currentFilters['action'] = event.target.value;
        handleSelect(event.target.value, filterDataByAction);
    }
    
    const handlePopElmntColorFilter = (event) => {
        currentFilters['popElmntColor'] = availableColorsOptsByHex[event.detail];
        handleSelect(event.detail, filterStatsByPopElmntColor);
    }
    
    const handleInnerFigColorFilter = (event) => {
        currentFilters['innerFigColor'] = availableColorsOptsByHex[event.detail];
        handleSelect(event.detail, filterStatsByInnerFigColor);
    }

    const handleSubjectSelect = (event) => {
        currentFilters['subject'] = event.target.value;
        handleSelect(event.target.value, filterDataBySubject);
    }

    function filterDataBySubject(selectedSubject) {
        if (selectedSubject === '') {
            filteredLogs = formattedLogs;
        } else {
            filteredLogs = formattedLogs.filter(item => applyFilters(item, currentFilters));
        }
    }
    
    function filterStatsByPopElmntColor(selectedColor) {
        if (selectedColor === '') {
            filteredPopElmntColors = Object.values(availableColorsNames);
        } else {
            filteredPopElmntColors = Object.values(availableColorsNames).filter(color => applyFilters(color, currentFilters));
        }
    }

    function filterStatsByInnerFigColor(selectedColor) {
        if (selectedColor === '') {
            filteredInnerFigColors = Object.values(availableColorsNames);
        } else {
            filteredInnerFigColors = Object.values(availableColorsNames).filter(color => applyFilters(color, currentFilters));
        }
    }

    // Function to filter the data by the selected action
    function filterDataByAction(selectedAction) {
        if (selectedAction === '') {
            filteredLogs = formattedLogs;
        } else {
            filteredLogs = formattedLogs.filter(item => applyFilters(item, currentFilters));
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
        const exitEndLogs = filteredLogs.filter(log => log.action === 'Exit game' || log.action === 'Game end');
        colorPairsSeen = {};
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
        const specialPoppedElmntLogs = filteredLogs.filter(log => log.action === 'Popped element' && log.isSpecial);
        colorPairsPopped = {};
        specialPoppedElmntLogs.forEach(log => {
            const colorPair = [log.color, log.innerFigColor].join(',');
            colorPairsPopped[colorPair] = colorPairsPopped[colorPair] ? colorPairsPopped[colorPair] + 1 : 1;
        });
    }

    function showPoppedVsSeenPercent(popElmntColor, innerFigColor){
        const colorPair = [popElmntColor, innerFigColor].join(',');
        if (colorPairsSeen[colorPair] === 0) return 'N/A';

        return ((colorPairsPopped[colorPair] / colorPairsSeen[colorPair]) * 100).toFixed(2).toString() + '%';
    }

</script>

<UserNavBar backPath={'/settings'}/>

<main class="{$isFullScreen ? 'fullscreen' : ''}">
    <h1>Statistics</h1>

    <h2>Profile:</h2>
    <Profile />
    <div class="subject-name-select-container">
        <label for="subjectNameSelect">Select a subject:</label>
        <select id="subjectNameSelect" class="not-selectable subject-name-select" on:input={handleSubjectSelect}>
            <option value="">All subjects</option>
            {#each fetchedSubjects as subject}
                <option value={subject}>{subject}</option>
            {/each}
        </select>
    </div>

    <h2>Data:</h2>
    {#if loading}
        <p>Loading...</p>
    {:else}
        {#if !formattedLogs.length}
            <p>No logs found for this user ID</p>
        {:else}
        <label for="actionsFilter">Filter by action:</label>
        <select id="actionsFilter" class="not-selectable action-filter-select" on:input={handleActionFilter}>
            <option value="">All actions</option>
            {#each Object.values(actionsOpts) as action}
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
        {#if !formattedLogs.length}
            <p>No logs found for this user ID</p>
        {:else}
            <ColorPicker selectAllOption={true} id={"popElmntColorsFilter"} label={"Filter by pop element color:"} on:input={handlePopElmntColorFilter}/>
            <ColorPicker selectAllOption={true} id={"innerFigColorsFilter"} label={"Filter by inner figure color:"} on:input={handleInnerFigColorFilter}/>

            <label for="seenColorsPercentMode">View percents:</label>
            <input type="checkbox" id="seenColorsPercentMode" bind:checked={seenColorsPercentModeEnabled} />

            <h3>Color\inner fig color popped vs total seen:</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Color\Inner fig color</th>
                            {#each filteredInnerFigColors as color2Name}
                                <th>
                                    <span class="tr-color-square" style="background-color: {availableColorsOpts[color2Name]};"></span>
                                    {capitalizeFirstLetter(color2Name)}
                                </th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredPopElmntColors as color1Name}
                            <tr>
                                <th>
                                    <span class="tr-color-square" style="background-color: {availableColorsOpts[color1Name]};"></span>
                                    {capitalizeFirstLetter(color1Name)}
                                </th>

                                {#each filteredInnerFigColors as color2Name}
                                    <td>
                                        {#if seenColorsPercentModeEnabled}
                                            {showPoppedVsSeenPercent(availableColorsOpts[color1Name], availableColorsOpts[color2Name])}
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
  .subject-name-select-container{
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }
</style>