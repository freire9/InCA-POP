<script>
	import UserNavBar from "../../components/UserNavBar.svelte";
	import { isFullScreen } from "../../stores";
</script>

<style>
    main{
        padding: 2rem;
    }
    a{
        text-decoration: none;
    }
    i{
        font-style: italic;
    }
    .about{
        text-align: justify;
    }
    .fullscreen{
        height: 100vh;
        overflow: auto;
    }
</style>

<div class="about {$isFullScreen ? 'fullscreen' : ''}">

    <UserNavBar />
    <main>
        <h1>About InCA-Pop</h1>
        <p>
            InCA-Pop is a touch-based life enrichment application focused on other animals 
            than humans (OATHs), as well as a research tool for be able to assess visual ability limits 
            in the context of Animal-Computer Interaction (ACI). It focuses on gather data to be able
            to assess color perception abilities by presenting balloons across the screen, 
            including special balloons that subjects must pop. Since special ballons have a color mark
            inside, based on which special balloons (and in particular their ballon 
            color-inner mark color pair of colors) are popped and which are not, their ranges of capabilities and 
            limits can be analyzed. The application proposes to measure color sensitivity based on the diversity of color pairs 
            exposed and the frequency with which they are popped. The application presents several 
            balloons on the screen, mixing easy and difficult test instances in order to evaluate 
            capacity limits in an ethical way, since the subject always has easy instances if the 
            difficult ones exceed his capacities.
        </p>
    
        <h2>How to use it?</h2>
        <ol>
            <li>
                The <i>Instructor</i> configures the game parameters on the <i>Settings</i> page. This includes the size of the balloons, speed, colors, available game modes, etc.
            </li>
            <li>
                The <i>Instructor</i> presents the device to the <i>Subject</i>.
            </li>
            <li>
                The <i>Subject</i> select one of the available game modes.
            </li>
            <li>
                The <i>Instructor</i> rewards <i>Subject</i> if appropriate (for example when popping a special balloon).
            </li>
            <li>
                The results logs can be downloaded at the <i>Settings</i> page in JSON or CSV format.
            </li>
            <li>
                The results logs can be analyzed at the <i>Researcher</i> page (InCA Researcher Tool).
            </li>
        </ol>
    
        <h2>Related pages</h2>
        <ul>
            <li>
                Find the open-source code <a href="https://github.com/freire9/InCA-POP">here</a>.
            </li>
            <li>
                Find other InCA apps <a href="https://buho.dcc.uchile.cl/~inca/">here</a>.
            </li>
        </ul>
    
        <h2>Acknowledgments</h2>
        <ul>
            <li>
                <a href="https://github.com/freire9">Daniel Freire Fernández</a>, <a href="https://ingenieria.uchile.cl/">FCFM</a> CS Engineering student and developer of this app.
            </li>
            <li>
                <a href="https://barbay.cl/">Jérémy Barbay</a> from <a href="https://buho.dcc.uchile.cl/~inca/">InCA Labs</a>.
            </li>
            <li>
                <strong>Fabián Jaña</strong>, who provided the <a href="https://shockerqt.gitlab.io/inca-utils/">InCA-Utils</a> library for in common elements in InCA apps.
            </li>
            <li>
                <strong>Cristóbal Sepulveda</strong>, developer and provider of <strong>InCA Researcher Tool</strong>, the web-app for analyzing the logs of InCA apps.
            </li>
        </ul>
    </main>
</div>