const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');
require('dotenv').config();

const seedLessons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for Seeding');

        await Lesson.deleteMany({});
        console.log('🗑️  Cleared existing lessons');

        const lessons = [
            {
                title: 'Basic Greetings in Hindi',
                description: 'Learn essential Hindi greetings for daily conversations',
                difficulty: 'Beginner',
                duration: 10,
                estimatedTime: '10 mins',
                content: `
Welcome to your first Hindi lesson! Let's learn the most important greetings:

1. **Namaste (नमस्ते)** - Hello/Greetings
   - Used at any time of day
   - Shows respect and friendliness
   - Commonly accompanied by hands pressed together

2. **Alvida (अलविदा)** - Goodbye
   - Formal farewell
   - Can also say "Phir milenge" (See you again)

3. **Dhanyavaad (धन्यवाद)** - Thank you
   - Shows gratitude and politeness

4. **Kripya (कृपया)** - Please
   - Used when making requests

**Practice Tips:**
- Say each word slowly at first
- Listen to the pronunciation carefully
- Practice with the audio feature
- Try speaking along with the audio

Remember: Practice makes perfect! Don't worry about mistakes.
                `.trim(),
                type: 'Speaking'
            },
            {
                title: 'Numbers 1-10 in Hindi',
                description: 'Count from one to ten in Hindi with proper pronunciation',
                difficulty: 'Beginner',
                duration: 8,
                estimatedTime: '8 mins',
                content: `
Let's learn to count in Hindi! Numbers are the foundation of everyday conversation.

**Hindi Numbers:**
1. Ek (एक) - One
2. Do (दो) - Two
3. Teen (तीन) - Three
4. Chaar (चार) - Four
5. Paanch (पांच) - Five
6. Chhe (छह) - Six
7. Saat (सात) - Seven
8. Aath (आठ) - Eight
9. Nau (नौ) - Nine
10. Das (दस) - Ten

**Pronunciation Tips:**
- "Ek" sounds like "ache" without the 'ch'
- "Do" rhymes with "go"
- "Teen" sounds like "seen"
- "Chaar" has a soft 'ch' sound

**Practice Exercise:**
Count from 1 to 10, then backwards from 10 to 1!
                `.trim(),
                type: 'Reading'
            },
            {
                title: 'Common Hindi Phrases',
                description: 'Essential phrases for everyday conversations',
                difficulty: 'Beginner',
                duration: 12,
                estimatedTime: '12 mins',
                content: `
Master these common phrases to navigate daily conversations:

**Introductions:**
- Mera naam ___ hai (मेरा नाम ___ है) - My name is ___
- Aap ka naam kya hai? (आपका नाम क्या है?) - What is your name?

**Questions:**
- Kaise ho? (कैसे हो?) - How are you? (informal)
- Aap kaise hain? (आप कैसे हैं?) - How are you? (formal)
- Kya? (क्या?) - What?
- Kyun? (क्यों?) - Why?
- Kahan? (कहां?) - Where?

**Responses:**
- Main theek hoon (मैं ठीक हूं) - I am fine
- Haan (हां) - Yes
- Nahi (नहीं) - No

**Polite Expressions:**
- Maaf kijiye (माफ़ कीजिये) - Excuse me / Sorry
- Bahut accha (बहुत अच्छा) - Very good

Take your time to practice each phrase with the audio!
                `.trim(),
                type: 'Speaking'
            },
            {
                title: 'Colors in Hindi',
                description: 'Learn basic colors with visual associations',
                difficulty: 'Intermediate',
                duration: 10,
                estimatedTime: '10 mins',
                content: `
Let's add color to your Hindi vocabulary!

**Basic Colors:**
🔴 Laal (लाल) - Red
🔵 Neela (नीला) - Blue
🟢 Hara (हरा) - Green
🟡 Peela (पीला) - Yellow
⚫ Kala (काला) - Black
⚪ Safed (सफ़ेद) - White
🟤 Bhoora (भूरा) - Brown
🟠 Naarangi (नारंगी) - Orange
🟣 Baingani (बैंगनी) - Purple
🩷 Gulabi (गुलाबी) - Pink

**Using Colors in Sentences:**
- Yeh laal hai (यह लाल है) - This is red
- Mujhe neela pasand hai (मुझे नीला पसंद है) - I like blue
- Aakash neela hai (आकाश नीला है) - The sky is blue

**Fun Activity:**
Look around your room and name the colors you see in Hindi!
                `.trim(),
                type: 'Listening'
            },
            {
                title: 'Family Members in Hindi',
                description: 'Learn vocabulary for family relationships',
                difficulty: 'Intermediate',
                duration: 15,
                estimatedTime: '15 mins',
                content: `
Family is important in Indian culture. Let's learn family terms!

**Immediate Family:**
👨 Pita / Pitaji (पिता/पिताजी) - Father
👩 Mata / Mataji (माता/माताजी) - Mother
👦 Beta (बेटा) - Son
👧 Beti (बेटी) - Daughter
👨‍👦 Bhai (भाई) - Brother
👩‍👧 Behen (बहन) - Sister

**Extended Family:**
👴 Dada / Dadaji (दादा/दादाजी) - Grandfather (paternal)
👵 Dadi / Dadiji (दादी/दादीजी) - Grandmother (paternal)
👴 Nana / Nanaji (नाना/नानाजी) - Grandfather (maternal)
👵 Nani / Naniji (नानी/नानीजी) - Grandmother (maternal)
👨‍👩‍👧‍👦 Chacha / Chachaji (चाचा/चाचाजी) - Uncle (father's brother)
👨‍👩‍👧‍👦 Chachi / Chachiji (चाची/चाचीजी) - Aunt (uncle's wife)
👨‍👩‍👧‍👦 Mama / Mamaji (मामा/मामाजी) - Uncle (mother's brother)
👨‍👩‍👧‍👦 Mami / Mamiji (मामी/मामीजी) - Aunt (mama's wife)

**Note:** Adding "-ji" shows respect!

**Practice Sentence:**
- Mere pita ka naam ___ hai (मेरे पिता का नाम ___ है) - My father's name is ___
                `.trim(),
                type: 'Reading'
            },
            {
                title: 'Days of the Week',
                description: 'Learn all seven days in Hindi',
                difficulty: 'Beginner',
                duration: 8,
                estimatedTime: '8 mins',
                content: `
Let's learn the days of the week in Hindi!

**Days of the Week:**
📅 Somvaar (सोमवार) - Monday
📅 Mangalvaar (मंगलवार) - Tuesday
📅 Budhvaar (बुधवार) - Wednesday
📅 Guruvaar / Brhaspativaar (गुरुवार/बृहस्पतिवार) - Thursday
📅 Shukravaar (शुक्रवार) - Friday
📅 Shanivaar (शनिवार) - Saturday
📅 Ravivaar (रविवार) - Sunday

**Common Phrases:**
- Aaj kya din hai? (आज क्या दिन है?) - What day is today?
- Aaj somvaar hai (आज सोमवार है) - Today is Monday
- Kal mangalvaar hai (कल मंगलवार है) - Tomorrow is Tuesday

**Memory Tip:**
Many Hindi days are named after planets and deities!
- Som = Moon (Monday)
- Mangal = Mars (Tuesday)
- Budh = Mercury (Wednesday)
- Guru = Jupiter (Thursday)
- Shukra = Venus (Friday)
- Shani = Saturn (Saturday)
- Ravi = Sun (Sunday)
                `.trim(),
                type: 'Reading'
            },
            {
                title: 'Basic Questions in Hindi',
                description: 'Ask and answer common questions',
                difficulty: 'Intermediate',
                duration: 12,
                estimatedTime: '12 mins',
                content: `
Learn to ask important questions in Hindi:

**Question Words:**
❓ Kya (क्या) - What
❓ Kaun (कौन) - Who
❓ Kab (कब) - When
❓ Kahan (कहाँ) - Where
❓ Kyun (क्यों) - Why
❓ Kaise (कैसे) - How

**Common Questions:**
1. Aap kahan rehte hain? (आप कहाँ रहते हैं?) - Where do you live?
2. Aap kya karte hain? (आप क्या करते हैं?) - What do you do?
3. Yeh kya hai? (यह क्या है?) - What is this?
4. Aap kab aayenge? (आप कब आएंगे?) - When will you come?
5. Yeh kaun hai? (यह कौन है?) - Who is this?

**Useful Responses:**
- Main ___ mein rehta/rehti hoon (मैं ___ में रहता/रहती हूँ) - I live in ___
- Main student hoon (मैं छात्र हूँ) - I am a student
- Yeh kitaab hai (यह किताब है) - This is a book

Practice asking and answering with a friend!
                `.trim(),
                type: 'Speaking'
            },
            {
                title: 'Food and Drinks Vocabulary',
                description: 'Essential words for food and beverages',
                difficulty: 'Intermediate',
                duration: 15,
                estimatedTime: '15 mins',
                content: `
Let's learn food vocabulary - essential for traveling in India!

**Common Foods:**
🍚 Chawal (चावल) - Rice
🍞 Roti (रोटी) - Bread
🍛 Daal (दाल) - Lentils
🥔 Aloo (आलू) - Potato
🥕 Gajar (गाजर) - Carrot
🍅 Tamatar (टमाटर) - Tomato
🧅 Pyaaz (प्याज) - Onion

**Beverages:**
☕ Chai (चाय) - Tea
☕ Kaafi (कॉफ़ी) - Coffee
🥛 Doodh (दूध) - Milk
💧 Paani (पानी) - Water
🥤 Juice (जूस) - Juice

**At a Restaurant:**
- Menu dikhayiye (मेनू दिखाइए) - Show me the menu
- Mujhe ___ chahiye (मुझे ___ चाहिए) - I want ___
- Kitne paise? (कितने पैसे?) - How much money?
- Bahut swadisht hai! (बहुत स्वादिष्ट है!) - Very delicious!

**Cultural Note:**
In India, it's polite to say "Dhanyavaad" (Thank you) after a meal!
                `.trim(),
                type: 'Listening'
            }
        ];

        await Lesson.insertMany(lessons);
        console.log(`✅ Successfully seeded ${lessons.length} Hindi lessons!`);
        console.log('📚 Lessons include:');
        lessons.forEach((lesson, index) => {
            console.log(`   ${index + 1}. ${lesson.title} (${lesson.estimatedTime})`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
};

seedLessons();