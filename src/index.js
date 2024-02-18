import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import express from 'express'
import bodyParser from 'body-parser'

const port = process.env.PORT

const app = express()
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.BOT_TOKEN)

// HTTP APP

let servers = {}

app.use(bodyParser.json())
app.use((err, req, res, next) => {
	try {
		JSON.parse(req.body)
	}
	catch(err) {
		res.status(400).send('Bad request')
	}
})

const updateMessage = () => {
	const embed = new EmbedBuilder()
		.setColor(0xFF8C00)
		.setTitle('Triangle Union')

	Object.keys(servers).forEach(id => {
		const serverData = servers[id]
		embed.addFields({ name: serverData.name, value: `Текущий онлайн: **${serverData.online}**` })
	})

	client.channels.fetch(process.env.BOT_CHANNEL_ID).then(chan => {
		chan.messages.fetch().then(messages => {
			const msg = messages.first()

			if (msg != undefined) {
				msg.edit({ embeds: [embed] })
			}
			else {
				chan.send({ embeds: [embed] })
			}
		})
	})
}

app.post('/update-online', (req, res) => {
	const authKey = req.header('auth-key')
	if ( authKey != process.env.AUTH_KEY ) {
		res.status(403).send('Forbidden')
		return
	}

	const body = req.body
	const serverID = body.id

	servers[serverID] = {
		name: body.name,
		online: body.online,
	}

	updateMessage()
	res.status(200).send('OK')
})

app.listen(port, () => {
	console.log(`Express app listening on port ${port}`)
})