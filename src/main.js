import config from "config";
import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/format"
import { ogg } from "./ogg.js";
import { openai } from "./openai.js"; 
import { removeFile } from "./utils.js"

console.log(config.get('TEST_ENV'));

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

// const setq = (q) => `Я прохожу интервью на должность Full Stack Software Engineer. Ответь на этот вопрос как можно короче и лаконичнее: "${q}". Если это позволяет и возможно, то ответить прям одним предложением или ещё лучше просто тезисно. Ответ напиши сперва на очень простом английском как будто я очень слабо знаю английский, потом сделай несколько переносов строки и напиши перевод на русском`
const setq = (q) => `Помоги мне коротко ответить на интервью Full Stack Software Engineer. Ответь очень коротко и лаконично на вопрос: "${q}". Ответить тезисно или просто очень коротко. Ответ напиши на очень простом английском языке как будто я очень слабо знаю английский, потом сделай несколько переносов строки и напиши перевод на русском`

bot.use(session())

bot.command(['new', 'start'], async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Waiting for your voice or text message')
})

bot.on(message('voice'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code('Waiting for a response from the server...'))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)
    
    const text = await openai.transcription(mp3Path) 

    await ctx.reply(code(`Your request: ${text}`))

    // without use context
    // const messages = [{role: openai.roles.USER, content: text}]
    // const response = await openai.chat(messages)

    ctx.session.messages.push({
      role: openai.roles.USER, 
      content: `${setq(text)}`,
    })
    
    const response = await openai.chat(ctx.session.messages).finally(removeFile(mp3Path)) 

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, 
      content: response.content,
    })

    //console.log(ctx.session.messages);

    await ctx.reply(response.content)
  } catch (error) {
    console.log('Error while voice message', error.message);
  }

  
})

 


bot.on(message('text'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code('Waiting for a response from the server...'))
     
    // without use context
    // const messages = [{role: openai.roles.USER, content: text}]
    // const response = await openai.chat(messages)

    ctx.session.messages.push({
      role: openai.roles.USER, 
      content: `${setq(ctx.message.text)}`,
    })
    
    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, 
      content: response.content,
    })

    //console.log(ctx.session.messages);

    await ctx.reply(response.content)
  } catch (error) {
    console.log('Error while voice message', error.message);
  }

  
})


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

