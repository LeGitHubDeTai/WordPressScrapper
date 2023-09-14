# Projet de Récupération de Contenu WordPress

Ce projet est un script Node.js qui récupère tous les articles, les pages et les images d'un site WordPress à l'aide de l'API REST de WordPress.

## Prérequis

- Node.js installé sur votre système. Vous pouvez le télécharger depuis [nodejs.org](https://nodejs.org/).

## Configuration

1. Clonez ce dépôt sur votre machine :

```bash
git clone https://github.com/votre-utilisateur/votre-projet.git
```

2. Accédez au répertoire du projet :

```bash
cd votre-projet
```

3. Créez un fichier `.env` à la racine du projet et ajoutez-y l'URL de votre site WordPress sous la forme suivante :

```env
WORDPRESS_URL=https://votresite.com
```

## Installation

1. Installez les dépendances en exécutant la commande suivante :

```bash
npm install
```

## Utilisation

Pour exécuter le script et récupérer les articles, les pages et les images, utilisez la commande suivante :

```bash
npm start
```

Les données seront sauvegardées dans un dossier `build` à la racine du projet.

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

**Auteur :** Tai Tetsuyuki
**Contact :** tai.studio@outlook.fr
