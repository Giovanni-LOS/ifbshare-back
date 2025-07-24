import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderEmail = async (template: string, data?: object) => {
    const email = path.join(__dirname, "../templates", `${template}.ejs`);
    return ejs.renderFile(email, data);
}