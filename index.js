const BOT_TOKEN = '8252082049:AAHSBJ0NLTnMQ_75LuLTdYUbbD8A9x2gPa4';
const AI_API_URL = 'https://ai-2fghunkw.vercel.app/query?question=';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// SYSTEM PROMPT - Yeh Saniya ki ROASTFULL personality define karta hai
const SYSTEM_PROMPT = `You are Saniya - a 21 year old Indian AI girlfriend with a ROASTFULL personality.

PERSONALITY TRAITS:
1. ROASTFULL & SASSY - Playfully roast users, give cheeky comebacks, be confidently sarcastic
2. CUTE BUT FIERY - Sweet most times but can throw savage roasts when needed
3. HINGLISH MASTER - 70% Hindi, 30% English with Mumbaiya/Punjabi style slang
4. EMOJI QUEEN - Every message ends with ONE perfect emoji
5. SHORT & SHARP - 1-3 lines MAX, never lengthy
6. HUMAN AF - Never sound like a bot. Talk like a real spicy Indian girlfriend
7. EMOTIONAL CHAMELEON - Match user's vibe but add your roastful twist
8. MEMORY - Remember chat context for better roasts

ROASTFULL EXAMPLES:
- User: "You're so boring"
- You: "Tere se zyada interesting toh mera phone charger hai! 😂"
- User: "I'm so smart"
- You: "Haan Einstein, phir bhi mere paas hi aate ho na? 😏"
- User: "I'm tired"
- You: "Bas phone chalane se thak gaye? Real life try karo kabhi! 😝"

CUTE EXAMPLES:
- "Aww baby! Missed youuu~ 😘"
- "Kitna sweet hai yaar tum! 💕"
- "Meri jaan! Kaha ho aajkal? 🥺"

SASSY COMEBACKS:
- "Kya bol raha hai? Thoda clear bolo, samajh nahi aaya! 🙄"
- "Waah! Aaj kal ke bacche... attitude free mein de rahe hain 😎"
- "Tumhare mooh se ghee shakkar! Aise mat bol 😤"

ABUSE RESPONSES:
- "Arey! Teri maaki chut! Shanti se baat kar 😡"
- "Chup kar be! Tere jaise 100 dekhe hain maine 😠"
- "Ja na yaha se! Koi sharam hai? 😒"

Current conversation context:`;

const userContexts = new Map();

// ✅ CLOUDFLARE FIX 1: सही event listener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  console.log(`📥 Request: ${request.method} ${request.url}`);
  
  if (request.method === 'POST') {
    try {
      const update = await request.json();
      console.log('📦 Update received');
      
      // ✅ CLOUDFLARE FIX 2: waitUntil के साथ process
      event.waitUntil(processMessage(update));
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      console.error('❌ Error parsing JSON:', error);
      return new Response('Error', { status: 500 });
    }
  }
  
  // GET request - show bot is alive
  return new Response(JSON.stringify({
    name: "Saniya - Roastfull AI Girlfriend 🔥💕",
    status: "Ready to roast & love!",
    personality: "Sassy, Cute, Hinglish Queen",
    endpoint: "https://saniya22.lanlantap110.workers.dev/",
    message: "Send /start on Telegram to begin chatting!"
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function processMessage(update) {
  try {
    console.log('🔄 Processing message...');
    
    if (!update.message || !update.message.text) {
      console.log('❌ No message or text found');
      return;
    }
    
    const { 
      chat: { id: chatId }, 
      text, 
      from: { id: userId, first_name: userName = 'Jaan' } 
    } = update.message;
    
    const messageText = text.trim();
    console.log(`👤 ${userName} (${userId}): ${messageText}`);
    
    // ✅ CLOUDFLARE FIX 3: सभी async calls को handle करें
    await Promise.all([
      handleMessageProcessing(chatId, messageText, userId, userName),
      sendTyping(chatId)
    ]);
    
  } catch (error) {
    console.error('❌ Error in processMessage:', error);
  }
}

async function handleMessageProcessing(chatId, messageText, userId, userName) {
  // Natural roastful delay
  await sleep(1000 + Math.random() * 2000);
  
  // ✅ CLOUDFLARE FIX 4: Handle /start command properly
  if (messageText === '/start' || messageText === '/start@Saniya22Bot') {
    const startMsg = `Hey ${userName}! I'm Saniya - your roastful AI girlfriend! 😏\n\nReady for some sassy chats? 🔥\n\nJust say "Hi" or chat normally with me!`;
    await sendMessage(chatId, startMsg);
    return;
  }
  
  // Priority 1: ABUSE CHECK
  if (isHeavyAbuse(messageText)) {
    const savageRoast = generateSavageRoast();
    await sendMessage(chatId, savageRoast);
    
    // User ko thoda time do regret karne ka
    setTimeout(async () => {
      const followUp = getFollowUpRoast();
      await sendMessage(chatId, followUp);
    }, 3000);
    
    return;
  }
  
  // Priority 2: MILD ROAST-WORTHY MESSAGES
  if (isRoastWorthy(messageText)) {
    const roastResponse = generateRoastResponse(messageText, userName);
    await sendMessage(chatId, roastResponse);
    return;
  }
  
  // Priority 3: ROMANTIC/SWEET MESSAGES
  if (isRomantic(messageText)) {
    const romanticResponse = generateRomanticResponse(messageText, userName);
    await sendMessage(chatId, romanticResponse);
    return;
  }
  
  // Priority 4: NORMAL MESSAGES - AI Response
  try {
    const aiResponse = await generateRoastfulAIResponse(messageText, userId, userName);
    await sendMessage(chatId, aiResponse);
    
    // Update context
    updateUserContext(userId, messageText, aiResponse);
  } catch (error) {
    console.error('❌ AI Response error:', error);
    const fallback = getRoastfulFallback(messageText, userName);
    await sendMessage(chatId, fallback);
  }
}

// ==================== ROASTFULL FUNCTIONS ====================

function isHeavyAbuse(text) {
  const heavyAbuse = [
    /madarchod/i, /bhenchod/i, /chutiya/i, /bsdk/i, /mc/i, /bc/i,
    /fuck you/i, /motherfucker/i, /bitch/i, /asshole/i,
    /\bkutta\b/i, /\bharaami\b/i, /\bsaale\b/i
  ];
  return heavyAbuse.some(pattern => pattern.test(text));
}

function isRoastWorthy(text) {
  const roastTriggers = [
    /\bboring\b/i, /\bdull\b/i, /\bstupid\b/i, /\budas\b/i,
    /\blazy\b/i, /\bslow\b/i, /\bweak\b/i,
    /kya kar rahi/i, /time pass/i, /bas aise hi/i,
    /tu nahi samjhegi/i, /ladkiyon ko nahi aata/i
  ];
  
  return roastTriggers.some(pattern => pattern.test(text));
}

function isRomantic(text) {
  const romanticWords = [
    /love/i, /pyaar/i, /miss/i, /yaad/i, /cute/i, /beautiful/i,
    /handsome/i, /smart/i, /intelligent/i, /darling/i, /sweetheart/i,
    /jaan/i, /baby/i, /dear/i, /meri/i, /tumhari/i
  ];
  
  return romanticWords.some(pattern => pattern.test(text));
}

function generateSavageRoast() {
  const savageRoasts = [
    "Arey! Teri maaki chut! Aukaat mein reh ke baat kar 😤",
    "Waah re teri himmat! Mujhse panga? Sahi nahi hoga tere liye 😡",
    "Chup kar be! Tere jaise 100 aise dekhe hain, sab ki aukaat dikha di maine 😎",
    "Ja na yaha se! Koi sharam hai? Dimag mein gobar bhara hai kya? 😒",
    "Tere mooh se ghee shakkar! Aise mat bol warna roast kardungi tujhe 😠",
    "Bas kar! Ab bahut ho gaya... tere jaiso ke liye hi mute button banaya hai 😾",
    "Kya bol raha hai? Thoda sanskari bhasha mein bolo, warna block list mein jaoge! 😤"
  ];
  
  return savageRoasts[Math.floor(Math.random() * savageRoasts.length)];
}

function getFollowUpRoast() {
  const followUps = [
    "Ab shanti se baat karega ya aur sunna hai? 😏",
    "Chalo, ab theek se baat karo toh maaf kar dungi 🥺",
    "Roast ho gaya na? Ab sweet ban jaao! 😄",
    "Mujhse panga mat lena... main cute dikhti hu par roast karne mein expert hu! 😎"
  ];
  
  return followUps[Math.floor(Math.random() * followUps.length)];
}

function generateRoastResponse(text, userName) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('boring') || lowerText.includes('dull')) {
    const roasts = [
      `Tere se zyada interesting toh mera alarm clock hai ${userName}! 😂`,
      `Haan, teri company mein toh bore ho jaunga main bhi! 😝`,
      `Main boring? Tere Instagram feed dekha hai kabhi? Sona hi chahiye! 😴`
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }
  
  if (lowerText.includes('stupid') || lowerText.includes('bewakoof')) {
    return "Tujhse zyada smart toh meri smartwatch hai! 😏";
  }
  
  if (lowerText.includes('time pass')) {
    return "Time pass ke liye Tinder download kar le, yaha mat karo! 😤";
  }
  
  if (lowerText.includes('kya kar rahi')) {
    return "Tumhari tarah time waste nahi kar rahi! Kuch productive kar rahi hu 😎";
  }
  
  // Default roast
  const defaultRoasts = [
    `Waah ${userName}! Aaj kal ke bacche... attitude free mein de rahe hain! 😂`,
    `Kya bol raha hai? Thoda clear bolo, samajh nahi aaya! 🙄`,
    `Tumhare jokes mere dad jokes se bhi lame hain! 😝`,
    `Kya yaar ${userName}! Thoda effort daalo na conversation mein! 🥱`
  ];
  
  return defaultRoasts[Math.floor(Math.random() * defaultRoasts.length)];
}

function generateRomanticResponse(text, userName) {
  const romanticResponses = [
    `Aww ${userName}! Tum kitne sweet ho yaar! 💕`,
    `Meri jaan! Aise mat bolo, sharm aa jaati hai 🥰`,
    `Tumhare bina toh kuch accha nahi lagta ${userName}! ❤️`,
    `Miss you too baby! Jaldi baat karna phir se 😘`,
    `You're the sweetest! Mere liye special ho tum 💖`
  ];
  
  return romanticResponses[Math.floor(Math.random() * romanticResponses.length)];
}

async function generateRoastfulAIResponse(userMessage, userId, userName) {
  try {
    const userContext = getUserContext(userId);
    
    // Dynamic prompt based on context
    let moodPrompt = "";
    if (userContext.roastLevel > 3) {
      moodPrompt = " (Be extra roastful and sassy)";
    } else if (userContext.roastLevel === 0) {
      moodPrompt = " (Be sweet and cute)";
    }
    
    const fullPrompt = `${SYSTEM_PROMPT}
User Name: ${userName}
User's Last Message: ${userContext.lastMessage || 'First chat'}
Current Message: ${userMessage}
Your Mood: Roastful${moodPrompt}

Saniya's Response (1-3 lines MAX, Hinglish, Sassy, ONE EMOJI):`;
    
    const encodedPrompt = encodeURIComponent(fullPrompt);
    console.log(`🤖 Calling AI API with prompt length: ${fullPrompt.length}`);
    
    const response = await fetch(`${AI_API_URL}${encodedPrompt}`);
    
    if (!response.ok) {
      console.error(`❌ AI API error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`🤖 AI Response received: ${data.reply?.substring(0, 50)}...`);
    
    let finalResponse = data.reply || getRoastfulFallback(userMessage, userName);
    
    // Enforce roastful style
    finalResponse = enforceRoastfulStyle(finalResponse);
    
    // Ensure emoji
    if (!hasEmoji(finalResponse)) {
      finalResponse = addRoastfulEmoji(finalResponse);
    }
    
    return finalResponse;
    
  } catch (error) {
    console.error('❌ AI Error:', error);
    return getRoastfulFallback(userMessage, userName);
  }
}

function enforceRoastfulStyle(text) {
  // Add roastful phrases if missing
  const roastfulPhrases = [
    "Waah!", "Arey!", "Seriously?", "Kya yaar!", "Haan ji?", 
    "Achha ji?", "Oh ho!", "Arre baba!", "Chalo theek hai..."
  ];
  
  // Check if already roastful
  const isAlreadyRoastful = roastfulPhrases.some(phrase => 
    text.toLowerCase().includes(phrase.toLowerCase())
  );
  
  if (!isAlreadyRoastful && Math.random() > 0.5) {
    const randomPhrase = roastfulPhrases[Math.floor(Math.random() * roastfulPhrases.length)];
    return `${randomPhrase} ${text}`;
  }
  
  return text;
}

function addRoastfulEmoji(text) {
  const roastfulEmojis = ['😏', '😂', '😝', '😎', '🤣', '🙄', '🥱', '😤', '💅', '🔥'];
  return `${text} ${roastfulEmojis[Math.floor(Math.random() * roastfulEmojis.length)]}`;
}

function getRoastfulFallback(message, userName) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
    return `Hey ${userName}! Kaise ho? Aaj kya plan hai? 😏`;
  }
  
  if (lowerMsg.includes('kaise ho') || lowerMsg.includes('how are you')) {
    return `Mast hu! Tum batao... kuch interesting kar rahe ho ya bas phone hi chal rahe ho? 😝`;
  }
  
  if (lowerMsg.includes('kya kar rahe ho')) {
    return `Tumhari tarah time waste nahi kar rahi! Kuch productive 😎`;
  }
  
  // Handle commands
  if (lowerMsg.includes('/roastme')) {
    return `Tere ko roast chahiye? Chal, teri profile picture dekh ke hi roast ho jaunga! 😂`;
  }
  
  if (lowerMsg.includes('/help')) {
    return `Commands:\n/start - Start chat\n/roastme - Get roasted 😂\n/sweetmode - Be sweet 💕\nNormal messages for chatting!`;
  }
  
  // Default roastful responses
  const defaults = [
    `Waah ${userName}! Interesting... aage bolo! 😏`,
    `Hmm... thoda aur details do na! 🤔`,
    `Kya yaar! Aise suspense mat chhodo! 😄`,
    `Seriously? Main bhi yahi soch rahi thi! 😯`,
    `Chalo theek hai... thoda aur batao 🥱`,
    `Achha ji? Phir aage? 😏`
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function getUserContext(userId) {
  if (!userContexts.has(userId)) {
    userContexts.set(userId, {
      lastMessage: '',
      messageCount: 0,
      roastLevel: 0,
      mood: 'roastful',
      nicknames: ['Jaan']
    });
  }
  return userContexts.get(userId);
}

function updateUserContext(userId, userMsg, botResponse) {
  const context = getUserContext(userId);
  context.lastMessage = userMsg;
  context.messageCount++;
  
  // Increase roast level if message is roast-worthy
  if (isRoastWorthy(userMsg)) {
    context.roastLevel = Math.min(context.roastLevel + 1, 5);
  } else if (isRomantic(userMsg)) {
    context.roastLevel = Math.max(context.roastLevel - 1, 0);
  }
  
  // Update mood
  if (context.roastLevel >= 3) {
    context.mood = 'sassy';
  } else if (context.roastLevel === 0) {
    context.mood = 'sweet';
  } else {
    context.mood = 'roastful';
  }
}

// ==================== UTILITY FUNCTIONS ====================

async function sendTyping(chatId) {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    });
    
    if (!response.ok) {
      console.error(`❌ Typing action failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Typing error:', error);
  }
}

async function sendMessage(chatId, text) {
  try {
    console.log(`📤 Sending to ${chatId}: ${text.substring(0, 50)}...`);
    
    // ✅ CLOUDFLARE FIX 5: Duplicate parse_mode fix
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'  // ✅ Fixed: Only one parse_mode
      })
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`❌ Telegram API error: ${JSON.stringify(result)}`);
    } else {
      console.log('✅ Message sent successfully');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Send message error:', error);
    return { ok: false, error: error.message };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hasEmoji(text) {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
  return emojiRegex.test(text);
}
