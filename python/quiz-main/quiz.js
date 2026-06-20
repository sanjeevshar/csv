let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let attempted = 0;
let startTime;
let timerInterval;
let questionTimerInterval;
let shuffledQuestions = [];
let timeLeft = 30;
let userAnswers = []; // Track user answers for review
let lifelines = {
    '5050': true,
    'audience': true,
    'phone': true,
    'flip': true
};
let prizeMoney = 0;
const prizeLevels = [1000, 2000, 3000, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000, 1250000, 2500000, 5000000, 10000000, 20000000, 50000000, 70000000];
let audioContext;
let cameraStream = null;
let userName = '';
let userEmail = '';
let breakAudio = null;
let lightInterval = null;
let googleWarningInterval = null;
let faceDetectionInterval = null;
let mediaRecorder = null;
let audioChunks = [];
let voiceDetectionInterval = null;
let skipCount = 2;
let maxSkips = 2;
let phoneDetectionInterval = null;
let recognition = null;
let detectionLogs = [];

// Initialize audio context
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Play tick sound
function playTickSound() {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Play correct answer sound
function playCorrectSound() {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 523.25; // C5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play second note
    setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659.25; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
}

// Play wrong answer sound (siren)
function playWrongSound() {
    if (!audioContext) initAudio();
    
    // Create siren effect with frequency modulation
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // LFO for frequency modulation (siren effect)
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.type = 'sawtooth';
    lfo.type = 'sine';
    lfo.frequency.value = 20; // 20 Hz modulation (Indian police siren)
    lfoGain.gain.value = 400; // Modulation depth
    
    oscillator.frequency.value = 500; // Base frequency (Indian police siren tone)
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5);
    
    oscillator.start(audioContext.currentTime);
    lfo.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
    lfo.stop(audioContext.currentTime + 2);
}

// Capture secret photo when detection occurs and save to file
function captureSecretPhoto(detectionType) {
    const videoElement = document.getElementById('cameraPreview') || document.getElementById('sideCameraPreview');
    if (!videoElement) return;
    
    try {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Save photo as file
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `photo_${userName}_${detectionType}_${Date.now()}.jpg`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Save to detection logs
        detectionLogs.push({
            type: 'PHOTO_CAPTURED',
            timestamp: new Date().toLocaleString('en-IN'),
            details: `${detectionType} - Photo saved as file: photo_${userName}_${detectionType}_${Date.now()}.jpg`
        });
        
        console.log('Secret photo captured and saved for:', detectionType);
    } catch (e) {
        console.error('Error capturing photo:', e);
    }
}

// Play loud siren for Google detection
function playLoudSiren() {
    if (!audioContext) initAudio();
    
    // Create very loud siren effect
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.type = 'sawtooth';
    lfo.type = 'sine';
    lfo.frequency.value = 15; // Faster modulation
    lfoGain.gain.value = 600; // Higher modulation depth
    
    oscillator.frequency.value = 800; // Higher base frequency
    
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime); // Louder
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5);
    
    oscillator.start(audioContext.currentTime);
    lfo.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 5);
    lfo.stop(audioContext.currentTime + 5);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (line) {
            // Better CSV parsing to handle quoted fields with commas
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            
            // Clean up quotes from fields
            const cleaned = result.map(field => field.replace(/^"|"$/g, '').trim());
            data.push(cleaned);
        }
    }
    return data;
}

// Load questions from CSV file
async function loadQuestions() {
    try {
        // Embedded CSV data for file explorer compatibility - KBC Questions
        const csvData = `Index,Question,Ans,a,b,c,d,
1,भारत की राजधानी क्या है?,d,मुंबई,कोलकाता,चेन्नई,नई दिल्ली,
2,भारत का राष्ट्रीय पक्षी क्या है?,c,मोर,कबूतर,गरुड़,बाज,
3,भारत का राष्ट्रीय फूल क्या है?,b,गुलाब,कमल,सूरजमुखी,चंपा,
4,भारत का राष्ट्रीय गीत किसने लिखा?,b,रबींद्रनाथ टैगोर,बंकिम चंद्र चटर्जी,सुरेंद्रनाथ बनर्जी,प्रेमचंद,
5,भारत की स्वतंत्रता कब मिली?,b,1945,1947,1950,1952,
6,भारत का पहला प्रधानमंत्री कौन था?,a,जवाहरलाल नेहरू,सरदार पटेल,डॉ. राजेंद्र प्रसाद,महात्मा गांधी,
7,भारत का राष्ट्रपति कितने वर्षों के लिए चुना जाता है?,b,3 वर्ष,5 वर्ष,6 वर्ष,4 वर्ष,
8,भारतीय रुपये का प्रतीक क्या है?,c,$,€,₹,£,
9,ताजमहल किस शहर में स्थित है?,a,आगरा,दिल्ली,लखनऊ,जयपुर,
10,भारत का सबसे बड़ा राज्य कौन सा है?,c,मध्य प्रदेश,राजस्थान,महाराष्ट्र,उत्तर प्रदेश,
11,भारत की जनसंख्या कितनी है?,c,100 करोड़,120 करोड़,140 करोड़,160 करोड़,
12,भारत का सबसे लंबा नदी कौन सी है?,a,गंगा,यमुना,ब्रह्मपुत्र,गोदावरी,
13,हिमालय की सबसे ऊंची चोटी कौन सी है?,b,के2,कंचनजंगा,माउंट एवरेस्ट,नंदा देवी,
14,भारत का राष्ट्रीय खेल क्या है?,a,हॉकी,क्रिकेट,फुटबॉल,टेनिस,
15,भारत की सबसे बड़ी मस्जिद कौन सी है?,c,जामा मस्जिद,मोती मस्जिद,बादशाही मस्जिद,चार मीनार,
16,भारत का सबसे बड़ा बांध कौन सा है?,b,भाखरा नांगल,हिराकुड,तेहरी,नर्मदा,
17,भारत का सबसे बड़ा रेलवे स्टेशन कौन सा है?,a,हावड़ा,नई दिल्ली,मुंबई सेंट्रल,चेन्नई सेंट्रल,
18,भारत का सबसे बड़ा हवाई अड्डा कौन सा है?,b,इंदिरा गांधी अंतरराष्ट्रीय,छत्रपति शिवाजी,केम्पेगोडा,नेताजी सुभाष चंद्र बोस,
19,भारत का राष्ट्रीय पशु क्या है?,c,बाघ,शेर,हाथी, गाय,
20,भारत का राष्ट्रीय जलचर पशु क्या है?,a,डॉल्फिन,मगरमच्छ,शार्क,व्हेल,
21,भारत का राष्ट्रीय वृक्ष क्या है?,b,पीपल,नीम,बरगद,आम,
22,भारत का सबसे बड़ा द्वीप कौन सा है?,c,अंडमान,लक्षद्वीप,मिनिकॉय,दीव,
23,भारत का सबसे बड़ा रेगिस्तान कौन सा है?,a,थार,राजस्थान,कच्छ,लद्दाख,
24,भारत की सबसे लंबी सीमा किस देश के साथ है?,b,पाकिस्तान,चीन,बांग्लादेश,नेपाल,
25,भारत का सबसे ऊंचा मीनार कौन सा है?,c,कुतुब मीनार,चार मीनार,ब्रिटिश लाइब्रेरी,विक्टोरिया मेमोरियल,
26,भारत का सबसे पुराना शहर कौन सा है?,a,वाराणसी,पटना,दिल्ली,मथुरा,
27,भारत का सबसे बड़ा व्यापारिक शहर कौन सा है?,b,मुंबई,दिल्ली,कोलकाता,चेन्नई,
28,भारत का सबसे बड़ा त्योहार कौन सा है?,c,दीवाली,होली,दशहरा,ईद,
29,भारत का सबसे बड़ा नदी घाटी कौन सी है?,a,गंगा घाटी,ब्रह्मपुत्र घाटी,इंदु घाटी,गोदावरी घाटी,
30,भारत का सबसे बड़ा झील कौन सी है?,b,वुलर झील,चिल्का झील,डल झील,नैनीताल,
31,भारत की संविधान किस वर्ष लागू हुई?,b,1947,1950,1952,1949,
32,भारत के संविधान के मुख्य वास्तुकार कौन थे?,a,डॉ. बी. आर. अम्बेडकर,जवाहरलाल नेहरू,सरदार पटेल,महात्मा गांधी,
33,भारत की संविधान में कितने अनुच्छेद हैं?,c,395,400,450,380,
34,भारत की संविधान में कितने अनुसूचियां हैं?,b,10,12,8,15,
35,भारत की संविधान में राष्ट्रपति का कार्यकाल कितना है?,b,5 वर्ष,6 वर्ष,4 वर्ष,3 वर्ष,
36,भारत की संविधान में प्रधानमंत्री की नियुक्ति कौन करता है?,a,राष्ट्रपति,उपराष्ट्रपति,संसद,लोकसभा,
37,भारत की संविधान में संसद के दो सदन कौन से हैं?,c,लोकसभा और राज्यसभा,लोकसभा और विधानसभा,राज्यसभा और विधान परिषद,लोकसभा और विधान परिषद,
38,भारत की संविधान में लोकसभा के सदस्यों की संख्या कितनी है?,b,543,545,550,540,
39,भारत की संविधान में राज्यसभा के सदस्यों की संख्या कितनी है?,c,245,250,240,255,
40,भारत की संविधान में उच्चतम न्यायालय के न्यायाधीशों की संख्या कितनी है?,a,34,30,35,33,
41,भारत की संविधान में मुख्य न्यायाधीश की नियुक्ति कौन करता है?,b,राष्ट्रपति,प्रधानमंत्री,लोकसभा अध्यक्ष,राज्यसभा अध्यक्ष,
42,भारत की संविधान में अनुच्छेद 370 किस राज्य से संबंधित है?,c,जम्मू और कश्मीर,पंजाब,हिमाचल प्रदेश,उत्तराखंड,
43,भारत की संविधान में अनुच्छेद 356 क्या है?,a,राष्ट्रपति शासन,आपातकाल,राष्ट्रपति का चुनाव,उपराष्ट्रपति का चुनाव,
44,भारत की संविधान में मौलिक अधिकार किस भाग में हैं?,b,भाग III,भाग II,भाग IV,भाग I,
45,भारत की संविधान में धर्म की स्वतंत्रता किस अनुच्छेद में है?,a,अनुच्छेद 25,अनुच्छेद 26,अनुच्छेद 27,अनुच्छेद 28,
46,भारत की संविधान में शिक्षा का अधिकार किस अनुच्छेद में है?,b,अनुच्छेद 21A,अनुच्छेद 45,अनुच्छेद 51A,अनुच्छेद 32,
47,भारत की संविधान में जीवन का अधिकार किस अनुच्छेद में है?,c,अनुच्छेद 21,अनुच्छेद 14,अनुच्छेद 19,अनुच्छेद 20,
48,भारत की संविधान में संपत्ति का अधिकार किस अनुच्छेद में है?,a,अनुच्छेद 300,अनुच्छेड 301,अनुच्छेद 302,अनुच्छेद 303,
49,भारत की संविधान में व्यवसाय की स्वतंत्रता किस अनुच्छेद में है?,b,अनुच्छेद 19(1)(g),अनुच्छेद 21,अनुच्छेद 14,अनुच्छेद 32,
50,भारत की संविधान में संविधान संशोधन किस अनुच्छेद में है?,c,अनुच्छेद 368,अनुच्छेद 370,अनुच्छेद 356,अनुच्छेद 300,
51,भारत की संविधान में उच्चतम न्यायालय की स्थापना कब हुई?,b,1950,1947,1952,1949,
52,भारत की संविधान में न्यायिक समीक्षा किस अनुच्छेद में है?,c,अनुच्छेद 32,अनुच्छेद 226,अनुच्छेद 227,अनुच्छेद 228,
53,भारत की संविधान में राज्यपाल की नियुक्ति कौन करता है?,a,राष्ट्रपति,प्रधानमंत्री,राज्य के मुख्यमंत्री,राज्यपाल स्वयं,
54,भारत की संविधान में राज्यसभा के सदस्यों का चुनाव कैसे होता है?,b,अप्रत्यक्ष चुनाव,प्रत्यक्ष चुनाव,राष्ट्रपति द्वारा नियुक्ति,संसद द्वारा चुनाव,
55,भारत की संविधान में लोकसभा के सदस्यों का चुनाव कैसे होता है?,c,प्रत्यक्ष चुनाव,अप्रत्यक्ष चुनाव,राष्ट्रपति द्वारा नियुक्ति,संसद द्वारा चुनाव,
56,भारत की संविधान में वित्त आयोग किस अनुच्छेद में है?,a,अनुच्छेद 280,अनुच्छेद 281,अनुच्छेद 282,अनुच्छेद 283,
57,भारत की संविधान में भारतीय रिज़र्व बैंक की स्थापना कब हुई?,c,1935,1947,1950,1949,
58,भारत की संविधान में भारतीय रिज़र्व बैंक का पहला गवर्नर कौन था?,a,सर जेम्स टेलर,सर चिंतामन देशमुख,सर बी. आर. अम्बेडकर,सर जवाहरलाल नेहरू,
59,भारत की संविधान में पंचवर्षीय योजना किस वर्ष शुरू हुई?,b,1951,1950,1952,1947,
60,भारत की संविधान में हरित क्रांति किस वर्ष शुरू हुई?,c,1966,1965,1967,1968,
61,भारत की संविधान में बैंकिंग राष्ट्रीकरण कब हुआ?,a,1969,1970,1971,1968,
62,भारत की संविधान में आर्थिक सुधार 1991 किसके द्वारा किए गए?,b,डॉ. मनमोहन सिंह,पी. वी. नरसिंह राव,अटल बिहारी वाजपेयी,राजीव गांधी,
63,भारत की संविधान में जीएसटी किस वर्ष लागू हुआ?,c,2017,2016,2018,2015,
64,भारत की संविधान में डिजिटल इंडिया किस वर्ष शुरू हुआ?,a,2015,2016,2017,2018,
65,भारत की संविधान में मेक इन इंडिया किस वर्ष शुरू हुआ?,b,2014,2015,2016,2017,
66,भारत की संविधान में स्टार्टअप इंडिया किस वर्ष शुरू हुआ?,c,2016,2015,2017,2018,
67,भारत की संविधान में चंद्रयान-3 किस वर्ष लॉन्च हुआ?,a,2019,2018,2020,2017,
68,भारत की संविधान में मंगलयान किस वर्ष लॉन्च हुआ?,b,2013,2014,2015,2016,
69,भारत की संविधान में आर्यभट्ट किस शताब्दी के हैं?,c,पांचवीं,चौथी,छठी,तीसरी,
70,भारत की संविधान में शून्य का आविष्कार किसने किया?,a,आर्यभट्ट,ब्रह्मगुप्त,वराहमिहिर,भास्कराचार्य,
71,भारत की संविधान में दशमलव प्रणाली किसने भारत में प्रचलित की?,b,आर्यभट्ट,ब्रह्मगुप्त,वराहमिहिर,भास्कराचार्य,
72,भारत के पहले उपराष्ट्रपति कौन थे?,a,डॉ. राजेंद्र प्रसाद,सरदार पटेल,डॉ. राधाकृष्णन,जवाहरलाल नेहरू,
73,भारत के पहले मुख्य न्यायाधीश कौन थे?,b,एच. जे. कानिया,बी. एन. राव,एम. हिदायतुल्ला,पी. एन. भगवती,
74,भारत की पहली महिला प्रधानमंत्री कौन थी?,c,इंदिरा गांधी,प्रतिभा पाटील,सुषमा स्वराज,ममता बनर्जी,
75,भारत की पहली महिला राष्ट्रपति कौन थी?,a,प्रतिभा पाटील,इंदिरा गांधी,सुषमा स्वराज,मीरा कुमार,
76,भारत का पहला उप-प्रधानमंत्री कौन था?,b,सरदार वल्लभभाई पटेल,जवाहरलाल नेहरू,मौलाना आजाद,बी. आर. अम्बेडकर,
77,भारत का पहला गृह मंत्री कौन था?,c,सरदार वल्लभभाई पटेल,जवाहरलाल नेहरू,मौलाना आजाद,बी. आर. अम्बेडकर,
78,भारत का पहला वित्त मंत्री कौन था?,a,आर. के. शनमुखम चेट्टी,जवाहरलाल नेहरू,मौलाना आजाद,सरदार पटेल,
79,भारत का पहला रक्षा मंत्री कौन था?,b,बलदेव सिंह चेमा,जवाहरलाल नेहरू,सरदार पटेल,वी. के. कृष्ण मेनन,
80,भारत का पहला विदेश मंत्री कौन था?,c,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,बी. आर. अम्बेडकर,
81,भारत का पहला कानून मंत्री कौन था?,a,डॉ. बी. आर. अम्बेडकर,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
82,भारत का पहला संचार मंत्री कौन था?,b,रफी अहमद किदवई,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
83,भारत का पहला रेल मंत्री कौन था?,c,जॉन मथाई,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
84,भारत का पहला शिक्षा मंत्री कौन था?,a,मौलाना अबुल कलाम आजाद,जवाहरलाल नेहरू,सरदार पटेल,बी. आर. अम्बेडकर,
85,भारत का पहला स्वास्थ्य मंत्री कौन था?,b,राजकुमारी अमृत कौर,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
86,भारत का पहला कृषि मंत्री कौन था?,c,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,बी. आर. अम्बेडकर,
87,भारत का पहला विज्ञान और प्रौद्योगिकी मंत्री कौन था?,a,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,बी. आर. अम्बेडकर,
88,भारत का पहला वाणिज्य और उद्योग मंत्री कौन था?,b,श्यामा प्रसाद मुखर्जी,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
89,भारत का पहला सामाजिक न्याय और सशक्तिकरण मंत्री कौन था?,c,जगजीवन राम,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,
90,भारत का पहला पर्यावरण और वन मंत्री कौन था?,a,शांति कुमार,जवाहरलाल नेहरू,सरदार पटेल,मौलाना आजाद,`;
        
        questions = parseCSV(csvData);
        
        console.log('Parsed questions:', questions.length);
        
        if (questions.length <= 1) {
            alert('CSV फ़ाइल में कोई प्रश्न नहीं मिला। कृपया फ़ाइल प्रारूप जांचें।');
            return;
        }
        
        document.getElementById('totalQuestions').textContent = questions.length - 1;
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('प्रश्न लोड करने में विफल।');
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Play KBC break sound
function playKBCBreakSound() {
    const audio = new Audio('kbc_break.mp3');
    audio.play().catch(error => {
        console.log('Error playing KBC break sound:', error);
    });
}

// Show meme video
function showMemeVideo() {
    const modal = document.getElementById('memeModal');
    const video = document.getElementById('memeVideo');
    modal.classList.remove('hidden');
    video.play().catch(error => {
        console.log('Error playing meme video:', error);
    });
}

// Close meme video
function closeMemeVideo() {
    const modal = document.getElementById('memeModal');
    const video = document.getElementById('memeVideo');
    video.pause();
    video.currentTime = 0;
    modal.classList.add('hidden');
}

// Start registration
function startRegistration() {
    alert('Button clicked! Starting registration...');
    console.log('startRegistration called');
    userName = document.getElementById('userName').value.trim();
    console.log('User name entered:', userName);
    
    if (!userName) {
        alert('कृपया अपना नाम दर्ज करें!');
        return;
    }
    
    console.log('Saving user registration...');
    // Save user registration to CSV file
    saveUserRegistration(userName);
    
    console.log('Hiding registration screen...');
    document.getElementById('registrationScreen').classList.add('hidden');
    
    console.log('Showing camera screen...');
    document.getElementById('cameraScreen').classList.remove('hidden');
    document.getElementById('cameraScreen').classList.add('fade-in');
    
    console.log('Requesting camera access...');
    // Request camera access
    requestCameraAccess();
}

// Update profile picture with user's first letter
function updateProfilePicture() {
    const profilePic = document.getElementById('profilePicture');
    if (profilePic && userName) {
        profilePic.textContent = userName.charAt(0).toUpperCase();
    }
}

// Save user registration to register.csv file (only once per session)
let registrationSaved = false;
function saveUserRegistration(name) {
    if (registrationSaved) return; // Don't save again if already saved
    
    const timestamp = new Date().toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'full'
    });
    
    const csvContent = `${timestamp},${name},0,0\n`; // Name, timestamp, score, prize money (initially 0)
    
    // Create or append to register.csv
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, 'register.csv');
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = 'register.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    registrationSaved = true; // Mark as saved
    console.log('User registration saved to register.csv:', name, timestamp);
}

// Save quiz results to register.csv file (only once at the end)
let quizResultsSaved = false;
function saveQuizResults() {
    if (quizResultsSaved) return; // Don't save again if already saved
    
    const timestamp = new Date().toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'full'
    });
    
    // Append to register.csv with final score and prize money
    const csvContent = `${timestamp},${userName},${score},${prizeMoney}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, 'register.csv');
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = 'register.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    quizResultsSaved = true; // Mark as saved
    console.log('Quiz results saved to register.csv for:', userName);
}

// Request camera access
async function requestCameraAccess() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: true 
        });
        const videoElement = document.getElementById('cameraPreview');
        videoElement.srcObject = cameraStream;
        videoElement.play().catch(e => console.log('Video play error:', e));
        
        // Also set up side camera preview
        const sideVideoElement = document.getElementById('sideCameraPreview');
        sideVideoElement.srcObject = cameraStream;
        sideVideoElement.play().catch(e => console.log('Side video play error:', e));
        
        // Start face detection
        startFaceDetection();
        
        // Start voice detection
        startVoiceDetection();
    } catch (error) {
        console.error('Camera access denied:', error);
        alert('कैमरा और माइक्रोफोन अनुमति आवश्यक है! कृपया अनुमति दें।');
    }
}

// Confirm camera and start - go directly to quiz
function confirmCameraAndStart() {
    // Allow proceeding even without camera for testing
    if (!cameraStream) {
        console.log('Camera stream not available, proceeding anyway for testing');
        // alert('कृपया पहले कैमरा अनुमति दें!');
        // return;
    }
    
    console.log('Confirming camera and starting quiz...');
    console.log('Hiding camera screen...');
    document.getElementById('cameraScreen').classList.add('hidden');
    console.log('Hiding start screen...');
    document.getElementById('startScreen').classList.add('hidden');
    console.log('Showing quiz screen...');
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('quizScreen').classList.add('fade-in');
    document.getElementById('playerName').textContent = userName;
    
    console.log('Quiz screen should now be visible');
    
    // Start quiz directly
    startQuiz();
}

// Start Google warning and detection
function startGoogleWarning() {
    if (googleWarningInterval) clearInterval(googleWarningInterval);
    
    googleWarningInterval = setInterval(() => {
        // Simulate Google detection warning
        const warningElement = document.getElementById('googleWarning');
        if (warningElement) {
            warningElement.classList.add('animate-pulse');
            
            // Randomly simulate Google detection (for demo purposes)
            // In real implementation, this would use computer vision to detect Google
            const randomDetection = Math.random() < 0.05; // 5% chance every 5 seconds
            if (randomDetection) {
                triggerGoogleDetection();
            }
        }
    }, 5000);
}

// Trigger Google detection - play siren and close website
function triggerGoogleDetection() {
    // Log detection
    detectionLogs.push({
        type: 'GOOGLE_DETECTED',
        timestamp: new Date().toLocaleString('en-IN'),
        details: 'User said "Google" or "गूगल"'
    });
    
    // Capture secret photo
    captureSecretPhoto('GOOGLE_DETECTION');
    
    // Play loud siren
    playLoudSiren();
    
    // Show alert
    alert('⚠️ GOOGLE DETECTED! ⚠️\n\nआपने Google का उपयोग किया है! वेबसाइट बंद हो रही है।\n\nGOOGLE DETECTED! Website is closing.');
    
    // Stop everything
    stopAllMonitoring();
    
    // Close website
    window.close();
    
    // If window.close() doesn't work (browser restriction), redirect to blank page
    setTimeout(() => {
        window.location.href = 'about:blank';
    }, 1000);
}

// Stop all monitoring
function stopAllMonitoring() {
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Stop all intervals
    clearInterval(timerInterval);
    clearInterval(questionTimerInterval);
    clearInterval(googleWarningInterval);
    clearInterval(lightInterval);
    clearInterval(faceDetectionInterval);
    clearInterval(voiceDetectionInterval);
    clearInterval(phoneDetectionInterval);
    
    // Stop voice recognition
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('Recognition already stopped');
        }
        recognition = null;
    }
    
    // Stop audio
    if (breakAudio) {
        breakAudio.pause();
        breakAudio.currentTime = 0;
    }
    
    // Remove phone warning if exists
    const phoneWarning = document.getElementById('phoneWarning');
    if (phoneWarning) {
        phoneWarning.remove();
    }
}

// Start face detection
function startFaceDetection() {
    if (faceDetectionInterval) clearInterval(faceDetectionInterval);
    
    // Check for face every 1 second (simulated - in real implementation would use face-api.js)
    faceDetectionInterval = setInterval(() => {
        // Simulated face detection - in real implementation use face-api.js or similar
        // For now, we'll assume face is always detected
        // In production, you would use a library like face-api.js to detect faces
        const hasFace = true; // Simulated - always true for demo
        
        if (!hasFace) {
            // Play siren immediately when face disappears
            playLoudSiren();
            alert('⚠️ FACE NOT DETECTED! ⚠️\n\nआपका चेहरा कैमरे में नहीं दिख रहा है! वेबसाइट बंद हो रही है।\n\nFACE NOT DETECTED! Website is closing.');
            stopAllMonitoring();
            window.close();
            setTimeout(() => {
                window.location.href = 'about:blank';
            }, 1000);
        }
    }, 1000);
    
    // Start phone detection
    startPhoneDetection();
}

// Start phone detection
function startPhoneDetection() {
    if (phoneDetectionInterval) clearInterval(phoneDetectionInterval);
    
    // Check for phone every 1 second (simulated - in real implementation would use object detection)
    phoneDetectionInterval = setInterval(() => {
        // Simulated phone detection - in real implementation use object detection like TensorFlow.js
        // For demo, we'll use random detection (very low probability)
        const hasPhone = Math.random() < 0.01; // 1% chance every second for demo
        
        if (hasPhone) {
            // Show phone detection warning with red light
            showPhoneDetection();
        }
    }, 1000);
}

// Show phone detection warning
function showPhoneDetection() {
    // Log detection
    detectionLogs.push({
        type: 'PHONE_DETECTED',
        timestamp: new Date().toLocaleString('en-IN'),
        details: 'Phone detected in front of camera'
    });
    
    // Capture secret photo
    captureSecretPhoto('PHONE_DETECTION');
    
    // Play siren
    playLoudSiren();
    
    // Show red light effect
    const redLight = document.getElementById('redLight');
    if (redLight) {
        redLight.style.opacity = '1';
    }
    
    // Show blue light effect
    const blueLight = document.getElementById('blueLight');
    if (blueLight) {
        blueLight.style.opacity = '0.3';
    }
    
    // Create blinking screen effect
    const blinkInterval = setInterval(() => {
        document.body.style.backgroundColor = document.body.style.backgroundColor === 'red' ? 'black' : 'red';
    }, 200);
    
    // Show luxurious phone warning with ALERT and WARNING
    const phoneWarning = document.createElement('div');
    phoneWarning.id = 'phoneWarning';
    phoneWarning.className = 'fixed inset-0 z-50 flex items-center justify-center bg-red-900 bg-opacity-95';
    phoneWarning.innerHTML = `
        <div class="bg-gradient-to-br from-red-700 via-red-800 to-red-900 rounded-3xl p-12 shadow-2xl border-8 border-yellow-500 max-w-2xl mx-4 transform animate-bounce">
            <div class="text-center">
                <!-- Alert Icon -->
                <div class="text-9xl mb-6 animate-pulse">🚨</div>
                
                <!-- ALERT Text -->
                <h1 class="text-6xl font-black text-yellow-400 mb-4 tracking-widest animate-pulse" style="text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);">
                    ⚠️ ALERT ⚠️
                </h1>
                
                <!-- Phone Icon -->
                <div class="text-8xl mb-6">📱</div>
                
                <!-- WARNING Text -->
                <h2 class="text-5xl font-bold text-white mb-6 animate-pulse" style="text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);">
                    ⚠️ WARNING ⚠️
                </h2>
                
                <p class="text-yellow-300 text-2xl mb-4 font-bold">PHONE DETECTED!</p>
                <p class="text-white text-xl mb-4">फोन का उपयोग प्रतिबंधित है!</p>
                <p class="text-red-200 text-lg mb-6">PHONE USAGE PROHIBITED!</p>
                
                <!-- Warning Icons -->
                <div class="flex justify-center gap-4 mb-6">
                    <span class="text-6xl animate-pulse">🚫</span>
                    <span class="text-6xl animate-pulse">⛔</span>
                    <span class="text-6xl animate-pulse">🚨</span>
                </div>
                
                <div class="mt-8 text-yellow-400 text-3xl font-black animate-pulse" style="text-shadow: 0 0 30px rgba(255, 0, 0, 1);">
                    🚫 वेबसाइट बंद हो रही है 🚫
                </div>
                
                <div class="mt-4 text-white text-xl font-bold animate-pulse">
                    WEBSITE CLOSING!
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(phoneWarning);
    
    // Stop blinking and close website after 4 seconds
    setTimeout(() => {
        clearInterval(blinkInterval);
        document.body.style.backgroundColor = '';
        stopAllMonitoring();
        window.close();
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 1000);
    }, 4000);
}

// Start voice detection for "Google" using Web Speech API
function startVoiceDetection() {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Enable interim results for faster detection
        recognition.lang = 'en-US'; // English language for better Google detection
        
        recognition.onresult = function(event) {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const command = event.results[i][0].transcript.toLowerCase();
                    console.log('Voice detected:', command);
                    
                    // Check for "Google" in English or Hindi
                    if (command.includes('google') || command.includes('गूगल') || command.includes('googl')) {
                        triggerGoogleDetection();
                    }
                }
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            // Restart recognition on error
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (e) {
                    console.log('Recognition already started');
                }
            }, 1000);
        };
        
        recognition.onend = function() {
            // Restart recognition when it stops
            try {
                recognition.start();
            } catch (e) {
                console.log('Recognition already started');
            }
        };
        
        try {
            recognition.start();
            console.log('Voice recognition started for Google detection');
            alert('🎤 Voice recognition ACTIVE! Saying "Google" will trigger detection.');
        } catch (e) {
            console.log('Recognition already started or error:', e);
        }
    } else {
        console.log('Web Speech API not supported in this browser');
        // Fallback to simulated detection for browsers that don't support Web Speech API
        if (voiceDetectionInterval) clearInterval(voiceDetectionInterval);
        voiceDetectionInterval = setInterval(() => {
            const randomDetection = Math.random() < 0.02; // 2% chance every 3 seconds
            if (randomDetection) {
                triggerGoogleDetection();
            }
        }, 3000);
    }
}

// Start red/blue light effects
function startLightEffects() {
    if (lightInterval) clearInterval(lightInterval);
    
    let isRed = true;
    lightInterval = setInterval(() => {
        const redLight = document.getElementById('redLight');
        const blueLight = document.getElementById('blueLight');
        
        if (redLight && blueLight) {
            if (isRed) {
                redLight.style.opacity = '0.3';
                blueLight.style.opacity = '0';
            } else {
                redLight.style.opacity = '0';
                blueLight.style.opacity = '0.3';
            }
            isRed = !isRed;
        }
    }, 2000);
}

// Stop light effects
function stopLightEffects() {
    if (lightInterval) {
        clearInterval(lightInterval);
        lightInterval = null;
    }
    
    const redLight = document.getElementById('redLight');
    const blueLight = document.getElementById('blueLight');
    
    if (redLight) redLight.style.opacity = '0';
    if (blueLight) blueLight.style.opacity = '0';
}

// Start the quiz
async function startQuiz() {
    console.log('Starting quiz...');
    
    // Update profile picture
    updateProfilePicture();
    
    // Play KBC break sound
    playKBCBreakSound();
    
    // Load questions from CSV
    await loadQuestions();
    
    console.log('Questions loaded:', questions.length);
    
    if (questions.length <= 1) {
        alert('CSV फ़ाइल में कोई प्रश्न नहीं मिला। कृपया फ़ाइल प्रारूप जांचें।');
        return;
    }
    
    // Use only 18 questions (up to 7 crores)
    shuffledQuestions = shuffleArray(questions.slice(1)).slice(0, 18);
    
    console.log('Shuffled questions:', shuffledQuestions.length);
    
    if (shuffledQuestions.length === 0) {
        alert('कोई प्रश्न लोड नहीं हुआ। कृपया जांचें कि qbank1.csv उसी निर्देशिका में है या नहीं।');
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    attempted = 0;
    userAnswers = [];
    startTime = new Date();
    prizeMoney = 0;
    
    // Reset skip count
    skipCount = maxSkips;
    document.getElementById('skipCount').textContent = skipCount;
    document.getElementById('skipButton').disabled = false;
    document.getElementById('skipButton').classList.remove('opacity-50', 'cursor-not-allowed');
    
    // Show side camera
    document.getElementById('sideCamera').classList.remove('hidden');
    
    // Reset lifelines
    lifelines = {
        '5050': true,
        'audience': true,
        'phone': true,
        'flip': true
    };
    
    // Enable lifeline buttons
    document.getElementById('lifeline5050').disabled = false;
    document.getElementById('lifelineAudience').disabled = false;
    document.getElementById('lifelinePhone').disabled = false;
    document.getElementById('lifelineFlip').disabled = false;

    document.getElementById('prizeLadder').classList.remove('hidden');
    
    // Populate prize ladder
    populatePrizeLadder();

    // Start Google warning interval
    startGoogleWarning();
    
    // Start light effects
    startLightEffects();

    startTimer();
    
    console.log('About to call displayQuestion...');
    displayQuestion();
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Skip question
function skipQuestion() {
    // Check if skips are available
    if (skipCount <= 0) {
        alert('आप केवल 2 प्रश्न छोड़ सकते हैं! आपके सभी स्किप खत्म हो गए हैं।');
        return;
    }
    
    clearInterval(questionTimerInterval);
    attempted++;
    
    // Decrease skip count
    skipCount--;
    document.getElementById('skipCount').textContent = skipCount;
    
    if (skipCount === 0) {
        document.getElementById('skipButton').disabled = true;
        document.getElementById('skipButton').classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    // Track user answer (skipped)
    const question = shuffledQuestions[currentQuestionIndex];
    userAnswers.push({
        question: question[1],
        userAnswer: 'skipped',
        correctAnswer: question[2],
        isCorrect: false,
        options: question.slice(3, 7)
    });
    
    document.getElementById('feedback').textContent = '⏭️ प्रश्न छोड़ा गया।';
    document.getElementById('feedback').classList.add('text-orange-600');
    
    // Disable all option buttons
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    setTimeout(() => {
        currentQuestionIndex++;
        
        // Check for break after 9 questions
        if (currentQuestionIndex === 9) {
            showBreak();
        } else {
            displayQuestion();
        }
    }, 1500);
}

// Display current question
function displayQuestion() {
    console.log('displayQuestion called, currentQuestionIndex:', currentQuestionIndex);
    console.log('shuffledQuestions.length:', shuffledQuestions.length);
    
    if (currentQuestionIndex >= shuffledQuestions.length) {
        finishQuiz();
        return;
    }

    const question = shuffledQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    document.getElementById('questionNumber').textContent = 
        `प्रश्न ${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;
    document.getElementById('progressText').textContent = 
        `${currentQuestionIndex + 1}/${shuffledQuestions.length}`;
    
    // Debug: Log the question data
    console.log('Question data:', question);
    console.log('Question text:', question[1]);
    
    document.getElementById('questionText').textContent = question[1];
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'mt-6 text-center font-semibold text-xl';
    
    // Update prize money display
    const currentPrize = prizeLevels[Math.min(currentQuestionIndex, prizeLevels.length - 1)] || 0;
    document.getElementById('prizeMoney').textContent = `₹${currentPrize.toLocaleString('hi-IN')}`;
    
    // Update prize ladder highlight
    updatePrizeLadder();

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    const optionLabels = ['a', 'b', 'c', 'd'];
    const correctAnswer = question[2].toLowerCase();
    
    question.slice(3, 7).forEach((option, index) => {
        const button = document.createElement('button');
        const isCorrect = optionLabels[index] === correctAnswer;
        
        button.className = 'option-btn w-full text-left p-4 border-2 border-gray-200 rounded-lg font-medium text-gray-700 flex items-center gap-3 slide-in';
        button.style.animationDelay = `${index * 0.1}s`;
        button.innerHTML = `
            <span class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                ${optionLabels[index].toUpperCase()}
            </span>
            <span>${option}</span>
        `;
        
        button.onclick = () => selectAnswer(optionLabels[index], correctAnswer, button);
        optionsContainer.appendChild(button);
    });

    // Start question timer (30 seconds)
    startQuestionTimer();
}

// Start question timer
function startQuestionTimer() {
    timeLeft = 30;
    updateQuestionTimerDisplay();
    
    clearInterval(questionTimerInterval);
    questionTimerInterval = setInterval(() => {
        timeLeft--;
        playTickSound();
        updateQuestionTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(questionTimerInterval);
            timeUp();
        }
    }, 1000);
}

// Update question timer display
function updateQuestionTimerDisplay() {
    document.getElementById('questionTimer').textContent = timeLeft;
    const percentage = (timeLeft / 30) * 100;
    document.getElementById('questionTimerBar').style.width = percentage + '%';
    
    // Change color when time is running low
    if (timeLeft <= 5) {
        document.getElementById('questionTimer').classList.remove('text-blue-600');
        document.getElementById('questionTimer').classList.add('text-red-600');
        document.getElementById('questionTimerBar').classList.remove('from-blue-500', 'to-cyan-500');
        document.getElementById('questionTimerBar').classList.add('from-red-500', 'to-orange-500');
    } else {
        document.getElementById('questionTimer').classList.add('text-blue-600');
        document.getElementById('questionTimer').classList.remove('text-red-600');
        document.getElementById('questionTimerBar').classList.add('from-blue-500', 'to-cyan-500');
        document.getElementById('questionTimerBar').classList.remove('from-red-500', 'to-orange-500');
    }
}

// Handle time up
function timeUp() {
    attempted++;
    
    // Track user answer (skipped)
    const question = shuffledQuestions[currentQuestionIndex];
    userAnswers.push({
        question: question[1],
        userAnswer: 'skipped',
        correctAnswer: question[2],
        isCorrect: false,
        options: question.slice(3, 7)
    });
    
    document.getElementById('feedback').textContent = '⏰ समय समाप्त! प्रश्न छोड़ा गया।';
    document.getElementById('feedback').classList.add('text-red-600');
    
    // Disable all option buttons
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    setTimeout(() => {
        currentQuestionIndex++;
        
        // Check for break after 9 questions
        if (currentQuestionIndex === 9) {
            showBreak();
        } else {
            displayQuestion();
        }
    }, 1500);
}

// Handle answer selection
function selectAnswer(selectedAnswer, correctAnswer, buttonElement) {
    // Clear question timer
    clearInterval(questionTimerInterval);
    
    // Show Lock kiya jaye? confirmation
    const confirmed = confirm(`लॉक किया जाए? आपने ${selectedAnswer.toUpperCase()} चुना है।`);
    
    if (!confirmed) {
        // Resume timer and re-enable buttons
        startQuestionTimer();
        const buttons = document.querySelectorAll('#options button');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.cursor = 'pointer';
        });
        return;
    }
    
    attempted++;
    
    // Track user answer
    const question = shuffledQuestions[currentQuestionIndex];
    userAnswers.push({
        question: question[1],
        userAnswer: selectedAnswer.toUpperCase(),
        correctAnswer: correctAnswer.toUpperCase(),
        isCorrect: selectedAnswer === correctAnswer,
        options: question.slice(3, 7)
    });
    
    // Disable all option buttons
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });

    if (selectedAnswer === correctAnswer) {
        score++;
        prizeMoney = prizeLevels[Math.min(currentQuestionIndex, prizeLevels.length - 1)] || 0;
        buttonElement.classList.add('correct-answer');
        document.getElementById('feedback').textContent = '✨ बेहतरीन! सही उत्तर ✨';
        document.getElementById('feedback').classList.add('text-green-600');
        playCorrectSound();
    } else {
        prizeMoney = 3000; // Reset prize money to 3000 on wrong answer
        
        // Blink screen and show message
        const quizScreen = document.getElementById('quizScreen');
        quizScreen.style.animation = 'blink 0.2s infinite';
        
        document.getElementById('feedback').textContent = 'ललच बुरी बला है लाला घोप घोप घोप ......';
        document.getElementById('feedback').classList.add('text-red-600', 'text-3xl');
        playWrongSound();
        
        // End quiz after showing message
        setTimeout(() => {
            quizScreen.style.animation = '';
            finishQuiz();
        }, 3000);
        return;
    }

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    setTimeout(() => {
        currentQuestionIndex++;
        
        // Check for break after 9 questions
        if (currentQuestionIndex === 9) {
            showBreak();
        } else {
            displayQuestion();
        }
    }, 1200);
}

// Finish quiz and show results
function finishQuiz() {
    clearInterval(timerInterval);
    clearInterval(questionTimerInterval);

    // Save quiz results to Excel file
    saveQuizResults();

    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('fade-in');

    document.getElementById('finalScore').textContent = `${score} / ${attempted}`;
    document.getElementById('attemptedCount').textContent = attempted;
    document.getElementById('prizeWon').textContent = `₹${prizeMoney.toLocaleString('hi-IN')}`;
    
    // Generate QR code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: 'Meow 😼😼 ... hahaha 😂😂 #shorts #laughing #memes.mp4',
        width: 128,
        height: 128
    });
    
    // Update result screen title based on score
    const percentage = attempted > 0 ? (score / attempted) * 100 : 0;
    const titleElement = document.querySelector('#resultScreen h1');
    if (percentage === 100) {
        titleElement.textContent = '🏆 परफेक्ट स्कोर!';
    } else if (percentage >= 80) {
        titleElement.textContent = '🌟 शानदार!';
    } else if (percentage >= 60) {
        titleElement.textContent = '👍 बहुत अच्छा!';
    } else if (percentage >= 40) {
        titleElement.textContent = '📚 अभ्यास जारी रखें!';
    } else {
        titleElement.textContent = '💪 फिर से कोशिश करें!';
    }
    
    // Update accuracy display
    document.getElementById('accuracyText').textContent = `${percentage.toFixed(0)}%`;
    
    // Show detailed answer review
    showAnswerReview();
}

// Show detailed answer review
function showAnswerReview() {
    const reviewContainer = document.createElement('div');
    reviewContainer.className = 'mt-6 bg-white rounded-xl p-6 max-h-96 overflow-y-auto';
    reviewContainer.innerHTML = '<h3 class="text-xl font-bold text-gray-800 mb-4">उत्तर समीक्षा</h3>';
    
    userAnswers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = `p-4 rounded-lg mb-3 ${answer.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`;
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        const correctOptionText = answer.options[optionLabels.indexOf(answer.correctAnswer)];
        
        answerDiv.innerHTML = `
            <p class="font-semibold text-gray-800 mb-2">${index + 1}. ${answer.question}</p>
            <p class="text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}">
                ${answer.isCorrect ? '✅ सही' : '❌ गलत'} - 
                आपका उत्तर: ${answer.userAnswer === 'skipped' ? 'छोड़ा गया' : answer.userAnswer} | 
                सही उत्तर: ${answer.correctAnswer} (${correctOptionText})
            </p>
        `;
        
        reviewContainer.appendChild(answerDiv);
    });
    
    // Insert before the play again button
    const resultScreen = document.getElementById('resultScreen');
    const playAgainButton = resultScreen.querySelector('button');
    resultScreen.insertBefore(reviewContainer, playAgainButton);
}

// Restart quiz
function restartQuiz() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('registrationScreen').classList.remove('hidden');
    document.getElementById('registrationScreen').classList.add('fade-in');
    
    // Reset form
    document.getElementById('userName').value = '';
    
    // Reset skip count
    skipCount = maxSkips;
    document.getElementById('skipCount').textContent = skipCount;
    document.getElementById('skipButton').disabled = false;
    document.getElementById('skipButton').classList.remove('opacity-50', 'cursor-not-allowed');
    
    // Stop all monitoring
    stopAllMonitoring();
}

// Show break screen
function showBreak() {
    clearInterval(timerInterval);
    clearInterval(questionTimerInterval);
    
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('breakScreen').classList.remove('hidden');
    document.getElementById('breakScreen').classList.add('fade-in');
    
    // Play intro music
    breakAudio = new Audio('kbc-intro_SD3sMiW.mp3');
    breakAudio.loop = true;
    breakAudio.play().catch(error => {
        console.log('Error playing break music:', error);
    });
    
    // Start light effects
    startLightEffects();
    
    // Speak break message
    speakText('ब्रेक समय! आराम करें और तैयार हो जाएं। Google का उपयोग न करें।');
}

// End break
function endBreak() {
    if (breakAudio) {
        breakAudio.pause();
        breakAudio.currentTime = 0;
    }
    
    stopLightEffects();
    
    document.getElementById('breakScreen').classList.add('hidden');
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('quizScreen').classList.add('fade-in');
    
    // Resume timer
    startTimer();
    displayQuestion();
}

// Text to speech
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }
}

// Use lifeline
function useLifeline(type) {
    if (!lifelines[type]) return;
    
    const question = shuffledQuestions[currentQuestionIndex];
    const correctAnswer = question[2].toLowerCase();
    const optionLabels = ['a', 'b', 'c', 'd'];
    
    switch(type) {
        case '5050':
            // Remove 2 wrong options
            const buttons = document.querySelectorAll('#options button');
            let removedCount = 0;
            buttons.forEach((btn, index) => {
                if (removedCount < 2 && optionLabels[index] !== correctAnswer) {
                    btn.style.display = 'none';
                    removedCount++;
                }
            });
            lifelines['5050'] = false;
            document.getElementById('lifeline5050').disabled = true;
            break;
            
        case 'audience':
            // Show audience poll (simulated)
            const poll = generateAudiencePoll(correctAnswer);
            alert(`जनता की राय:\nA: ${poll.a}%\nB: ${poll.b}%\nC: ${poll.c}%\nD: ${poll.d}%`);
            lifelines['audience'] = false;
            document.getElementById('lifelineAudience').disabled = true;
            break;
            
        case 'phone':
            // Stop timer
            clearInterval(questionTimerInterval);
            
            // Play phone lifeline audio
            const phoneAudio = new Audio('main-amitabh-bol-raha-hu.mp3');
            phoneAudio.play().catch(error => {
                console.log('Error playing phone lifeline audio:', error);
            });
            
            // Phone a friend with voice
            const friendAnswer = optionLabels[Math.floor(Math.random() * 4)];
            const friendMessage = `मुझे लगता है उत्तर ${friendAnswer.toUpperCase()} है।`;
            
            setTimeout(() => {
                speakText(friendMessage);
                alert(`आपके दोस्त का सुझाव: ${friendMessage}`);
                
                // Resume timer after friend speaks
                setTimeout(() => {
                    startQuestionTimer();
                }, 3000);
            }, 3000);
            
            lifelines['phone'] = false;
            document.getElementById('lifelinePhone').disabled = true;
            break;
            
        case 'flip':
            // Skip to next question
            clearInterval(questionTimerInterval);
            currentQuestionIndex++;
            
            // Check for break after 9 questions
            if (currentQuestionIndex === 9) {
                showBreak();
            } else if (currentQuestionIndex >= shuffledQuestions.length) {
                finishQuiz();
            } else {
                displayQuestion();
            }
            lifelines['flip'] = false;
            document.getElementById('lifelineFlip').disabled = true;
            break;
    }
}

// Generate audience poll (weighted towards correct answer)
function generateAudiencePoll(correctAnswer) {
    const poll = { a: 0, b: 0, c: 0, d: 0 };
    const labels = ['a', 'b', 'c', 'd'];
    
    // Give correct answer higher probability
    poll[correctAnswer] = Math.floor(Math.random() * 30) + 40; // 40-70%
    
    // Distribute remaining percentage among wrong answers
    let remaining = 100 - poll[correctAnswer];
    labels.forEach(label => {
        if (label !== correctAnswer) {
            poll[label] = Math.floor(Math.random() * remaining);
            remaining -= poll[label];
        }
    });
    
    // Add any remaining to a random wrong answer
    if (remaining > 0) {
        const wrongLabels = labels.filter(l => l !== correctAnswer);
        const randomWrong = wrongLabels[Math.floor(Math.random() * wrongLabels.length)];
        poll[randomWrong] += remaining;
    }
    
    return poll;
}

// Populate prize ladder
function populatePrizeLadder() {
    const ladderContent = document.getElementById('ladderContent');
    ladderContent.innerHTML = '';
    
    // Display prize levels in reverse order (highest at top)
    for (let i = prizeLevels.length - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 rounded text-sm';
        div.id = `ladder-${i}`;
        
        const isCurrentLevel = i === currentQuestionIndex;
        const isWon = i < currentQuestionIndex;
        
        if (isCurrentLevel) {
            div.className += ' bg-yellow-500 text-blue-900 font-bold';
        } else if (isWon) {
            div.className += ' bg-green-600 text-white';
        } else {
            div.className += ' bg-blue-800 text-gray-300';
        }
        
        div.innerHTML = `
            <span>${i + 1}</span>
            <span>₹${prizeLevels[i].toLocaleString('hi-IN')}</span>
        `;
        
        ladderContent.appendChild(div);
    }
}

// Update prize ladder highlight
function updatePrizeLadder() {
    for (let i = 0; i < prizeLevels.length; i++) {
        const div = document.getElementById(`ladder-${i}`);
        if (div) {
            div.className = 'flex justify-between items-center p-2 rounded text-sm';
            
            const isCurrentLevel = i === currentQuestionIndex;
            const isWon = i < currentQuestionIndex;
            
            if (isCurrentLevel) {
                div.className += ' bg-yellow-500 text-blue-900 font-bold';
            } else if (isWon) {
                div.className += ' bg-green-600 text-white';
            } else {
                div.className += ' bg-blue-800 text-gray-300';
            }
        }
    }
}

// Initialize - don't call loadQuestions immediately
// loadQuestions();
