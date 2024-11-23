import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ǺᎩᎧᏬᏰ = './plugins/commands/cache';

const config = {
    name: 'rbg',
    version: '1.0.0',
    permissions: 0,
    credits: 'ǺᎩᎧᏬᏰ',
    description: 'تحسين الصورة',
    commandCategory: 'صور',
    usages: 'الرد على الصورة',
    cooldown: 5,
    dependencies: {}
};

const langData = {
    "ar_SY": {
        "notAReply": "يرجى الرد على الصورة لتحسينها.",
        "notAPhoto": "هذه ليست صورة.",
        "processingError": "حدث خطأ أثناء معالجة الصورة.",
        "executionError": "حدث خطأ أثناء تنفيذ الأمر.",
        "successMessage": "تـم تـحـسـيـن الـصـورة ✅"
    },
    "en_US": {
        "notAReply": "Please reply to the image to enhance it.",
        "notAPhoto": "This is not a photo.",
        "processingError": "An error occurred while processing the image.",
        "executionError": "An error occurred while executing the command.",
        "successMessage": "The image has been successfully enhanced ✅"
    },
    "vi_VN": {
        "notAReply": "Vui lòng trả lời hình ảnh để nâng cao chất lượng.",
        "notAPhoto": "Đây không phải là một bức ảnh.",
        "processingError": "Đã xảy ra lỗi khi xử lý hình ảnh.",
        "executionError": "Đã xảy ra lỗi khi thực thi lệnh.",
        "successMessage": "Chất lượng hình ảnh đã được nâng cao thành công ✅"
    }
};

async function onCall({ message, getLang }) {
    if (!message.messageReply || !message.messageReply.attachments || message.messageReply.attachments.length === 0) {
        return message.reply(getLang("notAReply"));
    }

    if (message.messageReply.attachments[0].type !== "photo") {
        return message.reply(getLang("notAPhoto"));
    }

    try {
        const imageUrl = message.messageReply.attachments[0].url;
        
        const response = await axios.get('https://4k-ayoub.vercel.app/upscale?url=' + encodeURIComponent(imageUrl), { responseType: 'arraybuffer' });

        if (response.status !== 200) {
            return message.reply(getLang("processingError"));
        }

        const imgBuffer = Buffer.from(response.data, 'binary');

        
        await fs.ensureDir(ǺᎩᎧᏬᏰ);

        const filePath = path.join(ǺᎩᎧᏬᏰ, `4k.png`);
        await fs.outputFile(filePath, imgBuffer);

        await message.reply({
            body: getLang("successMessage"),
            attachment: fs.createReadStream(filePath)
        });
    } catch (error) {
        console.error(error);
        return message.reply(getLang("executionError"));
    }
}

export default {
    config,
    langData,
    onCall
};
