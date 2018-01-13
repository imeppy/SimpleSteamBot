const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const cleverbot = require("cleverbot.io");
const config = require('./config.json');

const client = new SteamUser();
const bot = new cleverbot("EDIT ME", "EDIT ME");

const logOnOptions = {
	accountName: config.username,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};
const PREFIX = "[#INFO] ";

client.logOn(logOnOptions);

client.on('loggedOn', () => {
	console.log(PREFIX + 'Logged into Steam');

	client.setPersona(6);
	console.log(PREFIX + 'I am Online now.');
});

client.on('friendRelationship', (steamid, relationship) => {
    if (relationship === 2) {
        client.addFriend(steamid);
        client.chatMessage(steamid, 'Hello there! Thanks for adding me!');
    }
});

client.on('friendMessage', (steamID, message) => 
{
	var msgArr = message.split(" ");
	var com = msgArr[0].split("!");
	message = message.trim();
	
	if((message[0] == '!' || message[0] == '.' || message[0] == '/' || message[0] == '?') && isAdmin(steamID) && com.length > 1)
	{
		switch(com[1])
		{
			case 'code':
			{
				client.chatMessage(steamID, 'Code » ' + SteamTotp.generateAuthCode(config.sharedSecret));
				break;
			}
			case 'name':
			{
				if(msgArr.length > 1)
				{
					client.setPersona(6,msgArr.slice(1).join(' '));
					client.chatMessage(steamID, 'Name » ' + msgArr.slice(1).join(' '));
				}
				else 
					client.chatMessage(steamID, 'Usage » !name [nickname]');
				
				break;
			}
			default:
				client.chatMessage(steamID, 'ERROR » Command not found.');
		}
	}
	else
	{
		bot.ask(message, function (err, response) {
		  client.chatMessage(steamID, response);
		});
	}
});

function isAdmin(id)
{
	if(id == config.admin)
		return true;
	else
		return false;
}
