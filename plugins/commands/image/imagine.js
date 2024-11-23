import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const config = {
    name: "imagine",
    aliases: ["imagin"],
    description: "تخيل صور من نص",
    usage: "[النص]",
    cooldown: 5,
    permissions: [0],
    credits: "ǺᎩᎧᏬᏰ",
    extra: {}
};

const langData = {
    "ar_SY": {
        "message": "تـم تـخـيـل الـصـور بـنـجـاح ✅",
        "error": "حدث خطأ أثناء معالجة الطلب",
        "missingPrompt": "يرجى كتابة شيء ليتم تخيله."
    },
    "en_US": {
        "message": "Images generated successfully ✅",
        "error": "An error occurred while processing the request",
        "missingPrompt": "Please provide something to imagine. "
    }, 
    "vi_VN": {
        "message": "Hình ảnh đã được tạo thành công ✅",
        "error": "Có lỗi xảy ra trong quá trình xử lý yêu cầu",
        "missingPrompt": "Vui lòng cung cấp một cái gì đó để tưởng tượng."
    } 
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function translateText(text) {
    const translateURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await axios.get(translateURL);
        return response.data[0][0][0];
    } catch (error) {
        console.error('Translation error: ', error.message);
        throw new Error('Error translating text');
    }
}

export async function onCall({ message, args, getLang }) {
    if (args.length === 0) {
        return message.send(getLang("missingPrompt"));
    }

    const prompt = args.join(" ");
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const translatedPrompt = await translateText(prompt);

            const response = await axios.post("https://imagine-ayoub.vercel.app/generate-image", { prompt: translatedPrompt });
            const images = response.data.images;

            const cachedImages = [];
            for (let i = 0; i < images.length; i++) {
                const imageBuffer = Buffer.from(images[i], 'binary');
                const filePath = path.join(__dirname, `./cache/ǺᎩᎧᏬᏰ_${i}.png`);

                fs.writeFileSync(filePath, imageBuffer);
                cachedImages.push(filePath);
            }

            const attachments = cachedImages.map(filePath => fs.createReadStream(filePath));

            message.send({
                body: getLang("message"),
                attachment: attachments
            });

            return; 
        } catch (error) {
            console.error(`Attempt ${attempt + 1} - Error response: `, error.response ? JSON.stringify(error.response.data) : error.message);
            attempt++;
            if (attempt >= maxRetries) {
                const errorMessage = error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message;
                message.send(`${getLang("error")} - ${errorMessage}`);
            }
        }
    }
}

export default {
    config,
    langData,
    onCall
};
