<script>
	import { downloadLogs } from "$lib/logService";
	import { isLoggedIn, localUserId, user } from "../../stores";
    import { Fa } from 'inca-utils';
    import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';

    // Loading flags
    let loadingCsvLogsDownload = false;
    let loadingJsonLogsDownload = false;

    async function handleRemoteLogsDownload(format){
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
</script>

<h2>Logs</h2>
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

<style>
    button.download-logs-btn{
        margin-top: 10px;
    }
    button.download-logs-btn{
        background-color: beige;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
    }
    button.download-logs-btn:hover{
        background-color: #e6e6e6;
    }
    button.download-logs-btn:focus{
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
    .remote-logs-container{
        display: flex;
        flex-direction: row;
        gap: 50px;
    }
    @media (max-width: 600px) {
        button.download-logs-btn{
            width: 220px;
        }
        .remote-logs-container{
            flex-direction: column;
            gap: 10px;
        }
    }
    @media (min-width: 600px) and (max-width: 1024px) {
        button.download-logs-btn{
            width: 230px;
        }
    }
    @media (min-width: 1024px){
        button.download-logs-btn{
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