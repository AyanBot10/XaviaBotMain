import axios from 'axios';

const config = {
    name: "gpt",
    aliases: ["chatgpt"],
    description: "Ask a question to the GPT.",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

async function onCall({ message, args }) {
    if (!args.length) {
        message.reply("🗨️✨ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
        return;
    }

    let query = args.join(" ");
    const uid = message.senderID; // Using senderID as uid

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the new API with the query
        const response = await axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(query)}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

            const gptResponse = response.data.reply;
            await message.send(`🗨️✨ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n━━━━━━━━━━━━━━━━\n${gptResponse}\n━━━━━━━━━━━━━━━━`);

    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        message.react(`❎`);
    }
}

export default {
    config,
    onCall
};