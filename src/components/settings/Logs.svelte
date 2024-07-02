<script>
	import { downloadLogs, getTotalLocalStorageSize } from "$lib/logService";
	import { isLoggedIn, localUserId, user, useRemoteDb } from "../../stores";
    import { Fa } from 'inca-utils';
    import { faFileArrowDown, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from "svelte";
	import { USE_FIREBASE } from "$lib/firebaseConfig";

    // Loading flags
    let loadingCsvLogsDownload = false;
    let loadingJsonLogsDownload = false;
    let loadingLocalCsvLogsDownload = false;
    let loadingLocalJsonLogsDownload = false;
    let localStorageSize = 0;

    async function handleRemoteLogsDownload(format){
        if(!USE_FIREBASE || !$useRemoteDb) return;

        format === 'json' ? loadingJsonLogsDownload = true : loadingCsvLogsDownload = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        try{
            if ($isLoggedIn && $user) downloadLogs(format, $user.uid);
            else downloadLogs(format, $localUserId);
        }
        catch(e){
            console.error('Error downloading logs:', e);
        }
        finally{
            format === 'json' ? loadingJsonLogsDownload = false : loadingCsvLogsDownload = false;
        }
    }
    async function handleLocalLogsDownload(format){
        format === 'json' ? loadingLocalJsonLogsDownload = true : loadingLocalCsvLogsDownload = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        try{
            downloadLogs(format, $localUserId, {local: true});
        }
        catch(e){
            console.error('Error downloading logs:', e);
        }
        finally{
            format === 'json' ? loadingLocalJsonLogsDownload = false : loadingLocalCsvLogsDownload = false;
        }
    }
    onMount(()=>{
        localStorageSize = getTotalLocalStorageSize();
    });

    function clearLocalLogs(){
        if(!confirm('Are you sure you want to clear the local logs?')) return;
        localStorage.removeItem('localLogs');
        localStorageSize = getTotalLocalStorageSize();
    }
</script>

<h2>Logs</h2>

{#if USE_FIREBASE && $useRemoteDb}
    <p>Check the automatic statistics in <strong><a href="https://inca-researcher-tool.vercel.app/pop" target="_blank">InCA Researcher Tool</a>.</strong></p>
    <p class="local-logs-warning"><strong>Use your linked Google account or with your local user ID. (You must have enabled the use of the remote database for this).</strong></p>

    <div class="remote-logs-container">
        <button class="download-logs-btn" on:click={()=> handleRemoteLogsDownload('json')} disabled={loadingJsonLogsDownload}>
            {#if loadingJsonLogsDownload}
                <span class="loading"></span> Downloading JSON logs...
            {:else}
                <Fa icon={faFileArrowDown} />
                Download remote database logs file (JSON)
            {/if}
        </button>
        
        <button class="download-logs-btn" on:click={()=> handleRemoteLogsDownload('csv')} disabled={loadingCsvLogsDownload}>
            {#if loadingCsvLogsDownload}
                <span class="loading"></span> Downloading CSV logs...
            {:else}
                <Fa icon={faFileArrowDown} />
                Download remote database logs file (CSV)
            {/if}
        </button>
    </div>
{/if}

<div class="local-logs-container">
    <button class="download-logs-btn" on:click={()=> handleLocalLogsDownload('json')} disabled={loadingLocalJsonLogsDownload}>
        {#if loadingLocalJsonLogsDownload}
            <span class="loading"></span> Downloading JSON logs...
        {:else}
            <Fa icon={faFileArrowDown} />
            Download local logs file (JSON)
        {/if}
    </button>
    
    <button class="download-logs-btn" on:click={()=> handleLocalLogsDownload('csv')} disabled={loadingLocalCsvLogsDownload}>
        {#if loadingLocalCsvLogsDownload}
            <span class="loading"></span> Downloading CSV logs...
        {:else}
            <Fa icon={faFileArrowDown} />
            Download local logs file (CSV)
        {/if}
    </button>
</div>
<p class="local-logs-warning">
    <strong>
        *: Caution, local logs are limited by the localStorage maximum size (5MB).<br>
        If you exceed this limit, after each new interaction the oldest log entry will be deleted.
        Always prefer to use the remote database logs.<br>
        Current size used by local storage data (local logs and app preferences): {(localStorageSize / (1024 * 1024)).toFixed(2)}MB/5MB ({((localStorageSize / (1024 * 1024)) / 5 * 100).toFixed(2)}%)
    </strong>
</p>

<button class="clear-local-logs-btn" on:click={clearLocalLogs}>
    <Fa icon={faTrash} />
    Clear local logs
</button>

<style>
    .local-logs-warning{
        font-size: 0.6rem;
        color: red;
        margin-top: 10px;
    }
    button.download-logs-btn{
        margin-top: 10px;
    }
    button.clear-local-logs-btn{
        margin-top: 50px;
    }
    button.download-logs-btn,
    button.clear-local-logs-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.download-logs-btn:hover,
    button.clear-local-logs-btn:hover{
        background-color: #e6e6e6;
    }
    button.download-logs-btn:focus,
    button.clear-local-logs-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
    .remote-logs-container,
    .local-logs-container{
        display: flex;
        flex-direction: row;
        gap: 50px;
    }
    .remote-logs-container{
        margin-top: 50px;
        margin-bottom: 50px;
    }
    @media (max-width: 600px) {
        button.download-logs-btn,
        button.clear-local-logs-btn{
            width: 220px;
        }
        .remote-logs-container,
        .local-logs-container{
            flex-direction: column;
            gap: 10px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        button.download-logs-btn,
        button.clear-local-logs-btn{
            width: 230px;
        }
    }
    @media (min-width: 1024px){
        button.download-logs-btn,
        button.clear-local-logs-btn{
            width: 300px;
        }
    }
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #000;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to {
        transform: rotate(360deg);
        }
    }
</style>