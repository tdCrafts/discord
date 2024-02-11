const listener = {
    eventType: "once",
    eventName: "ready",
    listener: client => {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
};

module.exports = listener;
