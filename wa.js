// import makeWASocket, { DisconnectReason,BufferJSON,useMultiFileAuthState } from '@whiskeysockets/baileys'
const baileys=require ('@whiskeysockets/baileys');
async function connectToWhatsApp () {
    const { state, saveCreds } = await baileys.useMultiFileAuthState('auth_info_baileys')
    const sock = baileys.makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth:state,
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== baileys.DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async(m) => {
      try {
        // console.log(JSON.stringify(m, undefined, 2))
        // console.log(m.messages[0].key.remoteJid)
        console.log(m.messages[0]);
        let target=m.messages[0].key.remoteJid;
        let pesan=m.messages[0].message.extendedTextMessage!==null ? m.messages[0].message.extendedTextMessage.text:m.messages[0].message.conversation;
        if(pesan.indexOf('.gpt[')>-1){
          await sock.sendMessage(target, { text: 'maaf waGPT sudah mencapai limit' },{quoted:m.messages[0]})
            
        }
      } catch (error) {
        console.log(error)
        await sock.sendMessage(target, { text: 'uncaugh system error, please standby' })
      }
        
        
    })
    sock.ev.on ('creds.update', saveCreds)
}
// run in main file
connectToWhatsApp()