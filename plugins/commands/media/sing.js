import ytdl from '@distube/ytdl-core';
import ytSearch from 'yt-search';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
    name: "sing",
    aliases: ["play"],
    version: "1.0",
    credits: "Modified by User",
    description: "Play a song from YouTube",
    usages: "<song-name>",
    category: "Music",
    cooldown: 10
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = __dirname + '/cache';

// Function to ensure the cache folder exists
async function ensureCacheFolderExists() {
    try {
        await fs.ensureDir(cacheFolder);
    } catch (error) {
        console.error('Error creating cache folder:', error);
    }
}

async function onCall({ message, args }) {
    const { messageID, threadID } = message;

    const query = args.join(" ");
    if (!query) {
        return message.reply("❌ Please provide a song name.");
    }

    try {
        // Ensure the cache folder exists
        await ensureCacheFolderExists();

        await message.react("⏰");

        // Search for the song on YouTube
        const searchResult = await ytSearch(query);
        if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
            return message.reply("❌ No results found on YouTube.");
        }

        // Get the first video result
        const video = searchResult.videos[0];
        const { videoId, title, duration } = video;

        if (duration.seconds > 600) {
            return message.reply("❌ Song is too long (maximum duration: 10 minutes).");
        }

        // Download audio using ytdl-core
        const downloadStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const filePath = `${cacheFolder}/${randomString()}.mp3`;
        const writeStream = fs.createWriteStream(filePath);

        downloadStream.pipe(writeStream);

        // Wait for the download to finish
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Send the downloaded audio file
        await message.reply({
            body: `🎧 Now playing: ${title}`,
            attachment: fs.createReadStream(filePath)
        });

        // Delete the downloaded file after sending
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log("File deleted successfully.");
        });

        console.log("Audio sent successfully.");
    } catch (error) {
        console.error("Error occurred:", error);
        await message.reply(`❌ An error occurred: ${error.message}`);
    }
}

function randomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
}

export default {
    config,
    onCall
};
