const express = require('express');
const { tcpPingPort } = require("tcp-ping-port");
const fs = require('fs');
const path = require('path');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const app = express();
const port = process.env.PORT || 3000;
const { bot1, bot2, bot3, bot4, bot5, bot6, bot7, bot8, bot9, bot10, bot11, heartBot1, heartBot2 } = require('./status-config.json');

// Discord webhook URL
const webhookUrl = 'https://discord.com/api/webhooks/1249552845028462592/7XybnGPfBfAjzjv3EE0YS9aBYPCdMSTN0A8O0jN6_jjltzvTgi9m_3oib404AS-rqFt9';
const webhookClient = new WebhookClient({ url: webhookUrl });

const tcpBotArray = [bot1, bot2, bot3, bot4, bot5, bot6, bot7, bot8, bot9, bot10, bot11];
const heartbeatBotArray = [heartBot1, heartBot2];

let messageID = null;

// In-memory store for heartbeat bot statuses
let heartbeatBotStatuses = {};

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(__dirname));

// Function to generate HTML for bot statuses
function generateBotStatusHTML(statuses) {
    return statuses.map(bot => `
        <div class="card status">
            <h1 class="statustext">
                <i class="fas fa-circle ${bot.online ? 'Operational' : 'Down'}"></i> ${bot.name} is
                <span class="${bot.online ? 'Operational' : 'Down'}">${bot.online ? 'Operational' : 'Down'}</span>
            </h1>
        </div>
        <div style="padding-top: 20px"></div>
    `).join('');
}

// Function to get the statuses of the bots
async function getBotStatuses() {
    const tcpStatuses = await Promise.all(tcpBotArray.map(async (bot) => {
        const online = await tcpPingPort(bot.address, parseFloat(bot.port));
        return { name: bot.name, online: online.online };
    }));

    const currentTime = Date.now();
    const heartbeatStatuses = heartbeatBotArray
        .filter(bot => bot && bot.name) // Ensure the bot object and bot.name are defined
        .map(bot => ({
            name: bot.name,
            online: (heartbeatBotStatuses[bot.name] && (currentTime - heartbeatBotStatuses[bot.name] < 20000)) || false
        }));

    return [...tcpStatuses, ...heartbeatStatuses];
}

// Function to create the embed
function createStatusEmbed(statuses) {
    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('Bot status')
        .setTimestamp()
        .setFooter({ text: 'Updates every minute', iconURL: 'http://taragoolives.com.au/wp-content/plugins/recipe-card/images/loading.gif' });

    embed.addFields(statuses.map(bot => ({
        name: bot.name,
        value: `**Status:** ${bot.online ? "Online 🟢" : "Offline 🔴"}`,
        inline: false
    })));

    return embed;
}

// Function to send the status embed to Discord
async function sendStatusEmbed() {
    const statuses = await getBotStatuses();

    if (messageID) {
        // If messageID exists, edit the existing message
        webhookClient.editMessage(messageID, {
            embeds: [createStatusEmbed(statuses)]
        }).catch(console.error);
    } else {
        // Otherwise, send a new message and store the message ID
        webhookClient.send({
            embeds: [createStatusEmbed(statuses)]
        }).then(message => {
            messageID = message.id;
        }).catch(console.error);
    }
}

// Endpoint to get bot statuses
app.get('/status', async (req, res) => {
    const statuses = await getBotStatuses();

    const allOnline = statuses.every(bot => bot.online);
    const allOffline = statuses.every(bot => !bot.online);

    let filePath;

    if (allOnline) {
        filePath = path.join(__dirname, 'up.html');
    } else if (allOffline) {
        filePath = path.join(__dirname, 'down.html');
    } else {
        filePath = path.join(__dirname, 'some.html');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading HTML file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Inject bot statuses into the HTML
        const botStatusHTML = generateBotStatusHTML(statuses);
        const updatedData = data.replace('<!-- BOT_STATUS_PLACEHOLDER -->', botStatusHTML);
        res.send(updatedData);
    });
});

// Endpoint to handle heartbeat requests
app.post('/heartbeat', (req, res) => {
    const { botName } = req.body;

    if (!botName || !heartbeatBotArray.find(bot => bot.name === botName)) {
        res.status(400).send('Invalid bot name');
        return;
    }

    heartbeatBotStatuses[botName] = Date.now();

    res.send('Heartbeat received');
});

// Clear outdated heartbeat statuses every 20 seconds
setInterval(() => {
    const currentTime = Date.now();
    for (const botName in heartbeatBotStatuses) {
        if (currentTime - heartbeatBotStatuses[botName] >= 20000) {
            delete heartbeatBotStatuses[botName];
        }
    }
}, 20000);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Schedule status updates to Discord every minute
setInterval(sendStatusEmbed, 60000);

