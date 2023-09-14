const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const baseUrl = process.env.WORDPRESS_URL;
const OUTPUT = process.env.OUTPUT || 'dist';

const buildFolder = path.join(__dirname, OUTPUT);
if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
}

async function fetchData(endpoint) {
    try {
        const response = await axios.get(endpoint);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des données de ${endpoint} : ${error.message}`);
        throw error;
    }
}

async function main() {
    try {
        // Récupérer les routes de l'API à partir de /wp-json
        const routes = await fetchData(`${baseUrl}/wp-json`);

        for (const route in routes.routes) {
            // Pour cet exemple, nous allons considérer que toutes les routes terminant par un `/`
            // (comme /wp/v2/posts/) sont les routes que nous souhaitons extraire. 
            // Adaptez selon vos besoins.
            if (!route.endsWith(')')) {
                try {
                    const data = await fetchData(baseUrl + '/wp-json' + route);
                    const outputFilename = route.split('/').filter(Boolean).join('-') + '.json'; // Converti /wp/v2/posts/ en wp-v2-posts.json
                    fs.writeFileSync(path.join(buildFolder, outputFilename), JSON.stringify(data, null, 2));
                    console.log(`Données de ${route} récupérées et sauvegardées avec succès.`);
                } catch (err) {
                    console.error(`Erreur lors de la récupération des données de la route ${route}: ${err.message}`);
                }
            }
        }
        
        // Récupérer les images
        const mediaEndpoint = `${baseUrl}/wp-json/wp/v2/media`;
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
        console.error(`Une erreur s'est produite lors de la récupération des routes: ${error.message}`);
    }
}

main();
