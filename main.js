const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration de l'API WordPress
const baseUrl = process.env.WORDPRESS_URL;
const apiRoute = '/wp-json/wp/v2';
const articlesEndpoint = `${baseUrl}${apiRoute}/posts`;
const pagesEndpoint = `${baseUrl}${apiRoute}/pages`;

const OUTPUT = process.env.OUTPUT || 'dist';

// Mettre tous les fichiers dans un dossier "dist"
const buildFolder = path.join(__dirname, OUTPUT);
if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
}

// Fonction pour récupérer les données de l'API
async function fetchData(endpoint) {
    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des données : ${error.message}`);
        throw error;
    }
}

// Fonction pour récupérer et sauvegarder les articles, pages et images
async function main() {
    try {
        // Récupérer les articles et les pages
        const articles = await fetchData(articlesEndpoint);
        const pages = await fetchData(pagesEndpoint);

        // Sauvegarder les articles et les pages au format JSON
        fs.writeFileSync(path.join(buildFolder, 'articles.json'), JSON.stringify(articles, null, 2));
        fs.writeFileSync(path.join(buildFolder, 'pages.json'), JSON.stringify(pages, null, 2));

        console.log('Articles et pages récupérés et sauvegardés avec succès.');

        // Récupérer les images
        const mediaEndpoint = `${baseUrl}${apiRoute}/media`;
        const media = await fetchData(mediaEndpoint);

        // Créer un dossier pour les images s'il n'existe pas déjà
        const assetsFolder = path.join(__dirname, OUTPUT, 'assets');
        if (!fs.existsSync(assetsFolder)) {
            fs.mkdirSync(assetsFolder);
        }

        // Télécharger et sauvegarder les images
        for (const item of media) {
            const imageUrl = item.source_url;
            const imageName = path.basename(imageUrl);
            const imagePath = path.join(assetsFolder, imageName);

            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));

            await new Promise((resolve, reject) => {
                imageStream.on('finish', resolve);
                imageStream.on('error', (error) => {
                    console.error(`Erreur lors du téléchargement de l'image ${imageName}: ${error.message}`);
                    reject(error);
                });
            });

            console.log(`Image ${imageName} téléchargée et sauvegardée.`);
        }
    } catch (error) {
        console.error(`Une erreur s'est produite : ${error.message}`);
    }
}

// Appeler la fonction principale
main();
