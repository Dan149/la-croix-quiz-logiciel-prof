# La Croix Quiz

## Logiciel de création de quiz scolaire

> Créé dans le cadre d'un projet scolaire pour le lycée Saint Jean et La Croix de Saint Quentin 

---

### Connexion

Le professeur lance le logiciel à partir de son ordinateur, les élèves peuvent dès le lancement du serveur par le biais du logiciel rejoindre la session de quiz en cours à partir d'un navigateur web sur l'addresse ip du professeur au port 3333:

`http://<IP v4 locale du prof>:3333`

*Attention: la machine du professeur doit être connectée au même réseau que celles des élèves.*

---

### Compilation

Voici les étapes à suivre pour compiler soi-même le logiciel:

1- Assurez-vous d'avoir installé <a href="https://npmjs.com">npm</a>.

2- Clonez le projet sur votre machine: 

- Par le terminal/cmd (git doit être installé):

`git clone https://github.com/Dan149/la-croix-quiz-logiciel-prof`

- ou téléchargez le zip sur la page d'accueil du projet.

3- Depuis le terminal, dans le dossier du projet, installez les dépendences: `npm install`

4- Pour finir, compilez: `npm run build`

L'exécutable se trouvera dans le dossier _release_, dans le sous-dossier portant le nom de la version.

---

### Captures d'écran
<details>
  <summary>Afficher les images</summary>
  
![Copie d'écran_20240331_205917](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/09df4d21-0000-43ee-a0fd-d5fc0aa5830c)
![Copie d'écran_20240331_210021](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/69999c4a-740e-48ee-a4b6-4b4fca320f7d)
![Copie d'écran_20240331_210043](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/af6d68fd-85d9-4d97-aca3-ea48e9a0dc85)
![Copie d'écran_20240331_210108](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/b34cd5ab-de84-4e89-a06e-f0bcae509c65)
![Copie d'écran_20240331_210206](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/b4a8acc7-2a15-45c6-b50d-be9644387f9a)
![Copie d'écran_20240331_210255](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/cc8a8f59-fd8f-4cef-ac70-02a34df42a19)
![Copie d'écran_20240331_210328](https://github.com/Dan149/la-croix-quiz-logiciel-prof/assets/48863749/bf663706-a9b2-44e3-8893-8318a86dcbbd)
</details>

---

## Documentation interne (pour développeurs):

### Index:
  - <a href="#structureLogiciel">Structure du logiciel</a>
  - <a href="#technosEmployees">Technologies employées</a>

<h4 id="structureLogiciel">Structure du logiciel</h4>
  Le logiciel se décompose en 3 parties principales ayant chacun une fonction et des principes de fonctionnement propres:
  
  - __Le processus principal__: partie du logiciel du professeur qui effectue des opérations sur l'ordinateur (démarrer le serveur, intéragir avec le système de fichiers, ouvrir la fenêtre etc..."), ce processus se trouve dans `electron/main.ts`. <br>
  - __L'interface utilisateur__: Interface affichée au professeur, démarée dans une fenêtre par le processus principal, intéragissant avec celui-ci à l'aide d'un tunnel semblable à une API qui se trouve dans le fichier `electron/preload.ts`. L'interface est codée comme un site web, plus d'informations dans la partie <a href="#technosEmployees">technologies employées</a>, elle se situe dans le dossier `src/`. <br>
  - __L'application web__: Site web se trouvant sous forme "compilée" dans le dossier `public/client`, il est envoyé à chaque utilisateur (élève) se connectant au serveur. Le site web est codé séparément par moi-même, dans un répértoire Github privé différent, il possède donc un nom de version lui étant propre. <br>


<h4 id="technosEmployees">Technologies employées</h4>
  Le site web et l'interface du logiciel sont tous deux codés avec la même librairie JavaScript: <a target="_blank" href="https://fr.react.dev/">React</a>, qui permet de générer un fichier html unique, affiché par l'utilisateur. <br>
  Le processus principal lui aussi est codé en JavaScript, grâce à un environnement d'exécution nommé <a target="_blank" href="https://nodejs.org/en/">Node.js</a>, qui permet l'éxecution de JS hors navigateur classique. Les feuilles de styles en cascade pour les interfaces sont codées au format <a target="_blank" href="https://sass-lang.com/">Sass</a> (dérivée .scss), qui est ensuite "compilé" vers du CSS standard.
