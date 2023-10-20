# Backend API - piiquante

Ce repo contient le code backend de l'application piiquante. 

## Lancement du backend

Après avoir récupéré le REPO executez la commande `npm install` pour installer les dépendances du projet

Une fois les dépendances installées lancez le projet avec la commande `node server`

un fichier .env doit être recréée et ajouté a la racine du projet
contenu du fichier: 

```
MONGODB_ID=<votre identifiant mongoDB>
MONGODB_PWD=<le mdp associé à votre compte>
JWT_KEY=zouzou
MONGODB_CLUSTER=<votre cluster mongoDB>
MONGODB_DB=<Le nom de votre base de donnée>

```

un dossier "images" est a recréer à la racine du projet.
