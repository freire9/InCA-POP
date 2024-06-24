
# InCA-Pop

## About InCA-Pop
InCA-Pop is a touch-based life enrichment application focused on other animals than humans (OATHs), as well as a research tool for assessing visual ability limits in the context of Animal-Computer Interaction (ACI). It focuses on assessing color perception abilities and contrast sensitivity by presenting balloons across the screen, including special balloons that subjects must pop. Based on which special balloons (and in particular their colors) are popped and which are not, their ranges of capabilities and limits are analyzed. Color sensitivity is measured based on the diversity of colors exposed and the frequency with which they are popped. Contrast sensitivity works in the same way but by evaluating balloons of colors slightly different from the game background. The application presents several balloons on the screen, mixing easy and difficult test instances in order to evaluate capacity limits in an ethical way, since the subject always has easy instances if the difficult ones exceed his capacities.

## How to use the app
1.  The _Instructor_ configures the game parameters on the _Settings_ page. This includes the size of the balloons, speed, colors, available game modes, etc.
2.  The _Instructor_ presents the device to the _Subject_.
3.  The _Subject_ select one of the available game modes.
4.  The _Instructor_ rewards _Subject_ if appropriate (for example when popping a special balloon).
5.  The results logs can be downloaded at the _Settings_ page in JSON or CSV format.
6.  The results logs can be analyzed at the _Researcher_ page.

##  How to install it

InCA-Pop is a web application developed in sveltekit, so it does not require installation and can be found [here](https://inca-pop.vercel.app/).
On the other hand, if you want to mount your own version on a server you must follow the following steps:

1. Clone this repository.
2. (Optional: for remote data logs): Create a [***Firebase Firestore database***](https://firebase.google.com/):
    - Add ***Google authentication*** to the *firebase* project. 
    - Allow your production domain to authenticator settings in *firebase*.
    - Add ***users*** and ***usageLogs*** collections to *firestore*.
    - Configure *firestore* **rules** to acces *users* and *usageLogs* collections from your deployed app. (Be careful: authenticated users may only have *read* and *write* permisson for the *firestore documents* owned by the user)
    - Create a ***.env*** file in the clonated *InCA-POP* repository project root and add the *firebase* project *enviroment variables*.
3. Install dependencies with  `npm install` (or `pnpm install` or `yarn`)
4. Create a production version with `npm  run  build`.
You can preview the production build with `npm run preview`.
    >  To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Related pages

-   Find the developer deployed site [here](https://inca-pop.vercel.app/).
-   Find the open-source code [here](https://github.com/freire9/InCA-POP).
-   Find other InCA apps [here](https://buho.dcc.uchile.cl/~inca/).

## Credits/acknowledgments

-   [Daniel Freire Fernández](https://github.com/freire9), [FCFM](https://ingenieria.uchile.cl/) CS Engineering student and developer of this app.
-   [Jérémy Barbay](https://barbay.cl/) from [InCA Labs](https://buho.dcc.uchile.cl/~inca/).
-   Fabián Jaña, who provided the [InCA-Utils](https://shockerqt.gitlab.io/inca-utils/) library for in common elements in InCA apps.