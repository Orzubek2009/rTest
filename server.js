const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = 3000;

// GitHub Repository Details
const OWNER = "your-github-username";
const REPO = "global-chat";
const FILE_PATH = "messages.json";
const BRANCH = "main";

// GitHub API Settings
const GITHUB_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
const HEADERS = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
};

app.use(bodyParser.json());

// Fetch messages from GitHub
app.get("/messages", async (req, res) => {
    try {
        const response = await axios.get(GITHUB_API_URL, { headers: HEADERS });
        const content = Buffer.from(response.data.content, "base64").toString("utf-8");
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages." });
    }
});

// Add a new message
app.post("/messages", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Message cannot be empty." });

    try {
        // Get the current messages
        const response = await axios.get(GITHUB_API_URL, { headers: HEADERS });
        const sha = response.data.sha;
        let messages = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf-8"));
        
        // Add new message
        messages.push({ text, timestamp: Date.now() });

        // Update the file on GitHub
        await axios.put(GITHUB_API_URL, {
            message: "Update chat messages",
            content: Buffer.from(JSON.stringify(messages, null, 2)).toString("base64"),
            sha,
            branch: BRANCH,
        }, { headers: HEADERS });

        res.json({ success: true, message: "Message sent!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
