import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, MapPin, TrendingUp, Users, Calculator, ShoppingCart, Globe, Settings } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface PriceData {
  item: string;
  itemTamil: string;
  current: number;
  predicted: number;
  wholesale: number;
  trend: 'up' | 'down' | 'stable';
}

interface Location {
  city: string;
  cityTamil: string;
  state: string;
  stateTamil: string;
}

const mockPriceData: PriceData[] = [
  { item: 'Onion', itemTamil: 'வெங்காயம்', current: 45, predicted: 48, wholesale: 38, trend: 'up' },
  { item: 'Tomato', itemTamil: 'தக்காளி', current: 35, predicted: 32, wholesale: 28, trend: 'down' },
  { item: 'Potato', itemTamil: 'உருளைக்கிழங்கு', current: 25, predicted: 26, wholesale: 20, trend: 'stable' },
  { item: 'Spinach', itemTamil: 'கீரை', current: 15, predicted: 16, wholesale: 12, trend: 'up' },
  { item: 'Carrot', itemTamil: 'கேரட்', current: 30, predicted: 28, wholesale: 24, trend: 'down' },
  { item: 'Cabbage', itemTamil: 'முட்டைகோஸ்', current: 20, predicted: 22, wholesale: 16, trend: 'up' },
];

const locations: Location[] = [
  { city: 'Chennai', cityTamil: 'சென்னை', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
  { city: 'Coimbatore', cityTamil: 'கோயம்புத்தூர்', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
  { city: 'Madurai', cityTamil: 'மதுரை', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
  { city: 'Tiruchirappalli', cityTamil: 'திருச்சிராப்பள்ளி', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
  { city: 'Salem', cityTamil: 'சேலம்', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
  { city: 'Tirunelveli', cityTamil: 'திருநெல்வேலி', state: 'Tamil Nadu', stateTamil: 'தமிழ்நாடு' },
];

const wholesaleMarkets = {
  Chennai: [
    { name: 'Koyambedu Market', nameTamil: 'கோயம்பேடு சந்தை', distance: '2.5 km', contact: '98765 43210' },
    { name: 'Thiruvallikeni Market', nameTamil: 'திருவல்லிக்கேணி சந்தை', distance: '4.1 km', contact: '98765 43211' },
    { name: 'Mylapore Market', nameTamil: 'மைலாப்பூர் சந்தை', distance: '6.2 km', contact: '98765 43212' },
  ],
  Coimbatore: [
    { name: 'Ukkadam Market', nameTamil: 'உக்கடம் சந்தை', distance: '3.2 km', contact: '98765 43213' },
    { name: 'Gandhipuram Market', nameTamil: 'காந்திபுரம் சந்தை', distance: '5.1 km', contact: '98765 43214' },
    { name: 'Peelamedu Market', nameTamil: 'பீளமேடு சந்தை', distance: '7.3 km', contact: '98765 43215' },
  ],
  Madurai: [
    { name: 'Mattuthavani Market', nameTamil: 'மட்டுத்தவணி சந்தை', distance: '2.8 km', contact: '98765 43216' },
    { name: 'Periyar Market', nameTamil: 'பெரியார் சந்தை', distance: '4.5 km', contact: '98765 43217' },
    { name: 'Anna Nagar Market', nameTamil: 'அண்ணா நகர் சந்தை', distance: '6.1 km', contact: '98765 43218' },
  ],
};

type Language = 'en' | 'ta';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'prices' | 'markets' | 'analysis'>('chat');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedLocation, setSelectedLocation] = useState<Location>(locations[0]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: 'Street Vendor Assistant',
      subtitle: 'AI-Powered Street Vendor Assistant',
      tabs: {
        chat: 'Chat',
        prices: 'Prices',
        markets: 'Markets',
        analysis: 'Analysis'
      },
      chat: {
        placeholder: 'Ask your question in English or Tamil...',
        welcome: 'Hello! I am your street food business assistant. I can help with price predictions, market information, and profit-loss calculations. How can I help you?'
      },
      prices: {
        current: 'Current Price:',
        predicted: 'Tomorrow Prediction:',
        wholesale: 'Wholesale Price:',
        profit: 'Profit Margin:'
      },
      markets: {
        title: 'Nearby Wholesale Markets',
        distance: 'Distance:',
        contact: 'Contact:',
        directions: 'Get Directions',
        groupBuying: 'Group Buying Opportunities',
        groupTitle: 'Available Group Purchase Today',
        groupDesc: '4 vendors in your area want to buy onions together',
        totalAmount: 'Total: 50 kg • Savings: ₹150',
        joinGroup: 'Join Group'
      },
      analysis: {
        todaySales: 'Today\'s Sales',
        weeklyProfit: 'Weekly Profit',
        bestItem: 'Best Item',
        salesAnalysis: 'Sales Analysis',
        morning: 'Morning (6-10 AM)',
        afternoon: 'Afternoon (12-2 PM)',
        evening: 'Evening (6-9 PM)'
      },
      settings: {
        language: 'Language',
        location: 'Location',
        save: 'Save Settings'
      }
    },
    ta: {
      title: 'தமிழ்நாடு தெருவோர உணவு உதவியாளர்',
      subtitle: 'AI-Powered Street Vendor Assistant',
      tabs: {
        chat: 'அரட்டை',
        prices: 'விலை',
        markets: 'சந்தைகள்',
        analysis: 'பகுப்பாய்வு'
      },
      chat: {
        placeholder: 'உங்கள் கேள்வியை தமிழில் அல்லது ஆங்கிலத்தில் கேளுங்கள்...',
        welcome: 'வணக்கம்! நான் உங்கள் தெருவோர உணவு வியாபார உதவியாளர். நான் விலை முன்னறிவிப்பு, சந்தை தகவல், மற்றும் லாப நஷ்ட கணக்கீடு ஆகியவற்றில் உதவ முடியும். எப்படி உதவலாம்?'
      },
      prices: {
        current: 'தற்போதைய விலை:',
        predicted: 'நாளை முன்னறிவிப்பு:',
        wholesale: 'மொத்த விலை:',
        profit: 'லாப வரம்பு:'
      },
      markets: {
        title: 'அருகிலுள்ள மொத்த சந்தைகள்',
        distance: 'தூரம்:',
        contact: 'தொடர்பு:',
        directions: 'வழிகாட்டுதல் பெறுக',
        groupBuying: 'கூட்டு வாங்குதல் வாய்ப்புகள்',
        groupTitle: 'இன்று கிடைக்கும் கூட்டு வாங்குதல்',
        groupDesc: 'உங்கள் பகுதியில் 4 விற்பனையாளர்கள் வெங்காயம் கூட்டாக வாங்க விரும்புகின்றனர்',
        totalAmount: 'மொத்தம்: 50 கிலோ • சேமிப்பு: ₹150',
        joinGroup: 'சேருங்கள்'
      },
      analysis: {
        todaySales: 'இன்றைய விற்பனை',
        weeklyProfit: 'வாராந்திர லாபம்',
        bestItem: 'சிறந்த பொருள்',
        salesAnalysis: 'விற்பனை பகுப்பாய்வு',
        morning: 'காலை (6-10 மணி)',
        afternoon: 'மதியம் (12-2 மணி)',
        evening: 'மாலை (6-9 மணி)'
      },
      settings: {
        language: 'மொழி',
        location: 'இடம்',
        save: 'அமைப்புகளை சேமிக்கவும்'
      }
    }
  };

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: '1',
      type: 'bot',
      content: t.chat.welcome,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [language]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detect language preference from user input
    const isTamilInput = /[\u0B80-\u0BFF]/.test(userMessage);
    const responseLanguage = isTamilInput ? 'ta' : language;
    
    // Stock recommendation logic
    if (lowerMessage.includes('வெங்காயம்') || lowerMessage.includes('onion')) {
      if (responseLanguage === 'ta') {
        return `நீங்கள் கடந்த 7 நாட்களில் சராசரியாக 5 கிலோ வெங்காயம் விற்றுள்ளீர்கள். இன்று விலை உயர்ந்துள்ளது (₹45/கிலோ), எனவே 4 கிலோ வாங்க பரிந்துரைக்கிறேன். மொத்த விலை ₹38/கிலோ - ${selectedLocation.cityTamil} சந்தையில்.`;
      } else {
        return `You have sold an average of 5 kg onions in the last 7 days. Today's price is high (₹45/kg), so I recommend buying 4 kg. Wholesale price is ₹38/kg at ${selectedLocation.city} market.`;
      }
    }
    
    if (lowerMessage.includes('தக்காளி') || lowerMessage.includes('tomato')) {
      if (responseLanguage === 'ta') {
        return 'தக்காளி விலை நாளை குறையும் என்ற முன்னறிவிப்பு உள்ளது (₹35லிருந்து ₹32). இன்று 3 கிலோ மட்டும் வாங்குங்கள். நாளை அதிகமாக வாங்கலாம்.';
      } else {
        return 'Tomato price is predicted to decrease tomorrow (₹35 to ₹32). Buy only 3 kg today. You can buy more tomorrow.';
      }
    }
    
    // Wholesale market info
    if (lowerMessage.includes('சந்தை') || lowerMessage.includes('market') || lowerMessage.includes('wholesale')) {
      const markets = wholesaleMarkets[selectedLocation.city as keyof typeof wholesaleMarkets] || wholesaleMarkets.Chennai;
      if (responseLanguage === 'ta') {
        return `உங்களுக்கு அருகில் உள்ள மொத்த சந்தைகள்:\n\n1. ${markets[0].nameTamil} - ${markets[0].distance}\n2. ${markets[1].nameTamil} - ${markets[1].distance}\n3. ${markets[2].nameTamil} - ${markets[2].distance}\n\n${markets[0].nameTamil} சந்தையில் இன்று விலை குறைவு!`;
      } else {
        return `Nearby wholesale markets:\n\n1. ${markets[0].name} - ${markets[0].distance}\n2. ${markets[1].name} - ${markets[1].distance}\n3. ${markets[2].name} - ${markets[2].distance}\n\nBest prices today at ${markets[0].name}!`;
      }
    }
    
    // Price prediction
    if (lowerMessage.includes('விலை') || lowerMessage.includes('price') || lowerMessage.includes('நாளை') || lowerMessage.includes('tomorrow')) {
      if (responseLanguage === 'ta') {
        return 'நாளை விலை முன்னறிவிப்பு:\n\n🔺 வெங்காயம்: ₹45 → ₹48 (+₹3)\n🔻 தக்காளி: ₹35 → ₹32 (-₹3)\n➡️ உருளை: ₹25 → ₹26 (+₹1)\n🔺 கீரை: ₹15 → ₹16 (+₹1)\n\nதக்காளி விலை குறையும், அதிகமாக வாங்க தயாராக இருங்கள்!';
      } else {
        return 'Tomorrow\'s price prediction:\n\n🔺 Onion: ₹45 → ₹48 (+₹3)\n🔻 Tomato: ₹35 → ₹32 (-₹3)\n➡️ Potato: ₹25 → ₹26 (+₹1)\n🔺 Spinach: ₹15 → ₹16 (+₹1)\n\nTomato prices will drop, be ready to buy more!';
      }
    }
    
    // Profit analysis
    if (lowerMessage.includes('லாபம்') || lowerMessage.includes('profit') || lowerMessage.includes('நஷ்டம்') || lowerMessage.includes('loss')) {
      if (responseLanguage === 'ta') {
        return 'கடந்த வாரம் உங்கள் கணக்கு:\n\n💰 மொத்த விற்பனை: ₹2,850\n💸 செலவு: ₹1,950\n✅ லாபம்: ₹900 (31.6%)\n\nசிறந்த விற்பனை: தோசை மிக்ஸ் (45% லாபம்)\nஅதிக செலவு: வெங்காயம் (₹450)\n\nசிறந்த நேரம்: மாலை 6-8 மணி';
      } else {
        return 'Last week\'s account:\n\n💰 Total Sales: ₹2,850\n💸 Expenses: ₹1,950\n✅ Profit: ₹900 (31.6%)\n\nBest seller: Dosa mix (45% profit)\nHighest expense: Onions (₹450)\n\nBest time: Evening 6-8 PM';
      }
    }
    
    // Group buying
    if (lowerMessage.includes('கூட்டு') || lowerMessage.includes('group') || lowerMessage.includes('together')) {
      if (responseLanguage === 'ta') {
        return 'கூட்டு வாங்குவதற்கு உங்கள் பகுதியில் 3 விற்பனையாளர்கள் ஆர்வம் காட்டியுள்ளனர்:\n\n👥 ராஜேஷ் - 200மீ தூரத்தில்\n👥 பிரியா - 350மீ தூரத்தில்\n👥 குமார் - 500மீ தூரத்தில்\n\nகூட்டாக வாங்கினால் 15-20% விலை குறைவு கிடைக்கும்!';
      } else {
        return 'Group buying interest from 3 vendors in your area:\n\n👥 Rajesh - 200m away\n👥 Priya - 350m away\n👥 Kumar - 500m away\n\nGroup buying can save 15-20% on prices!';
      }
    }
    
    // Location-based responses
    if (lowerMessage.includes('location') || lowerMessage.includes('இடம்') || lowerMessage.includes('எங்கே')) {
      if (responseLanguage === 'ta') {
        return `நீங்கள் தற்போது ${selectedLocation.cityTamil}, ${selectedLocation.stateTamil} இல் உள்ளீர்கள். இந்த பகுதியில் ${wholesaleMarkets[selectedLocation.city as keyof typeof wholesaleMarkets]?.length || 3} மொத்த சந்தைகள் உள்ளன. அமைப்புகளில் இருந்து உங்கள் இடத்தை மாற்றலாம்.`;
      } else {
        return `You are currently in ${selectedLocation.city}, ${selectedLocation.state}. There are ${wholesaleMarkets[selectedLocation.city as keyof typeof wholesaleMarkets]?.length || 3} wholesale markets in this area. You can change your location from settings.`;
      }
    }
    
    // Default responses
    const defaultResponses = {
      ta: [
        'நான் விலை முன்னறிவிப்பு, சந்தை தகவல், லாப நஷ்ட கணக்கீடு ஆகியவற்றில் உதவ முடியும். என்ன தேவை?',
        'எந்த காய்கறி அல்லது பொருளைப் பற்றி கேட்க விரும்புகிறீர்கள்? வெங்காயம், தக்காளி, உருளை என்று சொல்லுங்கள்.',
        'உங்கள் வியாபாரத்திற்கு எப்படி உதவலாம்? விலை, சந்தை, அல்லது லாப கணக்கீடு?',
      ],
      en: [
        'I can help with price predictions, market information, and profit-loss calculations. What do you need?',
        'Which vegetable or item would you like to know about? You can ask about onions, tomatoes, potatoes, etc.',
        'How can I help your business? Price predictions, market info, or profit analysis?',
      ]
    };
    
    const responses = defaultResponses[responseLanguage];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(inputText),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecognition = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '🔺';
      case 'down': return '🔻';
      default: return '➡️';
    }
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    // Here you would typically save to localStorage or backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-orange-100 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                className="p-2 bg-orange-700 rounded-lg hover:bg-orange-800 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-orange-700 rounded-lg hover:bg-orange-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.language}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.location}
                </label>
                <select
                  value={selectedLocation.city}
                  onChange={(e) => {
                    const location = locations.find(loc => loc.city === e.target.value);
                    if (location) setSelectedLocation(location);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {locations.map((location) => (
                    <option key={location.city} value={location.city}>
                      {language === 'ta' ? location.cityTamil : location.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSaveSettings}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                {t.settings.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'chat', label: t.tabs.chat, icon: Send },
              { id: 'prices', label: t.tabs.prices, icon: TrendingUp },
              { id: 'markets', label: t.tabs.markets, icon: MapPin },
              { id: 'analysis', label: t.tabs.analysis, icon: Calculator },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-orange-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.chat.placeholder}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={toggleVoiceRecognition}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPriceData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {language === 'ta' ? item.itemTamil : item.item}
                  </h3>
                  <span className="text-2xl">{getTrendIcon(item.trend)}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.prices.current}</span>
                    <span className="font-semibold">₹{item.current}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.prices.predicted}</span>
                    <span className={`font-semibold ${
                      item.predicted > item.current ? 'text-red-600' : 
                      item.predicted < item.current ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      ₹{item.predicted}/kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.prices.wholesale}</span>
                    <span className="font-semibold text-blue-600">₹{item.wholesale}/kg</span>
                  </div>
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">
                      {t.prices.profit} <span className="font-semibold text-green-600">
                        ₹{item.current - item.wholesale}/kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-orange-600" />
                {t.markets.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(wholesaleMarkets[selectedLocation.city as keyof typeof wholesaleMarkets] || wholesaleMarkets.Chennai).map((market, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-800 mb-2">
                      {language === 'ta' ? market.nameTamil : market.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📍 {t.markets.distance} {market.distance}</p>
                      <p>📞 {t.markets.contact} {market.contact}</p>
                    </div>
                    <button className="mt-3 w-full bg-orange-100 text-orange-700 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                      {t.markets.directions}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-green-600" />
                {t.markets.groupBuying}
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">{t.markets.groupTitle}</h3>
                <p className="text-green-700 text-sm mb-3">
                  {t.markets.groupDesc}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">{t.markets.totalAmount}</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    {t.markets.joinGroup}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{t.analysis.todaySales}</h3>
                  <div className="text-2xl">💰</div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">₹1,240</div>
                <div className="text-sm text-gray-600">
                  {language === 'ta' ? 'நேற்றை விட +12%' : 'Yesterday +12%'}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{t.analysis.weeklyProfit}</h3>
                  <div className="text-2xl">📈</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">₹4,850</div>
                <div className="text-sm text-gray-600">
                  {language === 'ta' ? 'लाभ मार्जिन: 32%' : 'Profit Margin: 32%'}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{t.analysis.bestItem}</h3>
                  <div className="text-2xl">🏆</div>
                </div>
                <div className="text-xl font-bold text-orange-600 mb-2">
                  {language === 'ta' ? 'தோசை மிக்ஸ்' : 'Dosa Mix'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'ta' ? '45% லாபம்' : '45% Profit'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.analysis.salesAnalysis}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.analysis.morning}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-medium">₹930</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.analysis.afternoon}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <span className="text-sm font-medium">₹1,120</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.analysis.evening}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">₹1,050</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <div className="bg-white rounded-full shadow-lg p-2">
          <button className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;