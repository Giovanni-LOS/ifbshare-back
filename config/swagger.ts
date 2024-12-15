import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from "path";
import {fileURLToPath} from "url";
const __filename = fileURLToPath(import.meta.url); // Obter o arquivo atual
const __dirname = path.dirname(__filename); // Obter o diretório atual

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'IFB Share Documentation',
        version: '1.0.0',
        description: 'Documentação para a API do site IFB Share.',
    },
};

const options = {
    definition: swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.ts')],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app: Application): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    app.get('/api-docs/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

export default setupSwagger;
