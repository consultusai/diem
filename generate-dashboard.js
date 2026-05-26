const fs = require('fs');
const https = require('https');

const importantDates = [
  { date: '2026-06-05', event: 'Clay and Maura coming to Miami' },
  { date: '2026-06-07', event: 'Guest bedroom ready (friends arriving)' },
  { date: '2026-06-12', event: 'Jennies mom here' },
  { date: '2026-06-18', event: 'NYC for US Open' },
  { date: '2026-06-28', event: 'Key West' },
  { date: '2026-07-04', event: 'Puerto Rico' },
  { date: '2026-07-24', event: 'MF birthday weekend' },
  { date: '2026-09-16', event: 'Bruno Mars concert (Charlie + Hayley)' }
];

// Manually curated news - update each morning
const newsStories = {
  usNews: [
    {
      title: "OpenAI Announces New AI Model",
      description: "Latest advances in artificial intelligence continue to shape the tech landscape.",
      url: "https://openai.com"
    },
    {
      title: "Tech Companies Report Strong Q2 Earnings",
      description: "Major tech firms exceed expectations as cloud adoption accelerates.",
      url: "https://techcrunch.com"
    }
  ],
  miamiNews: [
    {
      title: "Miami Hosts Major Tech Conference",
      description: "South Florida emerging as a hub for technology innovation and startups.",
      url: "https://local.miami"
    }
  ]
};

const tips = [
  {
    title: "The 10-Minute Audit Rule",
    content: "Before starting your day, spend 10 minutes reviewing your highest-value tasks. Check how many PMC emails were opened/replied to overnight. This 10 minutes saves 2 hours of scattered work."
  },
  {
    title: "Batch Your Email Reviews",
    content: "Check emails at 9 AM, 12 PM, 3 PM instead of constantly. Reduces context-switching and lets you focus on deep work."
  },
  {
    title: "The 80/20 Rule for Relationships",
    content: "80% of your relationship happiness comes from 20% of your time together. Focus that 20% on quality moments without distractions."
  },
  {
    title: "One Thing Rule for Productivity",
    content: "Pick ONE main goal per day. Everything else is bonus. This week: Guest bedroom revamp. This month: Scale PMC outreach."
  }
];

const dailyActions = [
  {
    action: "Send 10 More PMC Outreach Emails",
    time: "30 min",
    description: "You have 94 drafts ready. Start with 10 - use Green Tiger password. Track opens in BigQuery."
  },
  {
    action: "Debug NewsAPI Key",
    time: "15 min",
    description: "Test NewsAPI key at newsapi.org. Verify account and key are active. Report back once confirmed."
  },
  {
    action: "Review Bed Options Online",
    time: "20 min",
    description: "Check Wayfair, Article, West Elm for full-size beds in gray/navy. Save 3 options with prices."
  }
];

const articles = [
  {
    title: "The Cold Email Playbook That Actually Works",
    source: "Substack",
    reason: "Direct parallel to your PMC outreach. Shows how top SaaS founders personalize at scale.",
    url: "https://substack.com"
  },
  {
    title: "Why Relationships Need Boundaries",
    source: "The Atlantic",
    reason: "With friends visiting for 2 weeks, good reminder to set expectations early.",
    url: "https://www.theatlantic.com"
  }
];

const holidays = {
  '01-01': "New Years Day",
  '02-14': 'Valentines Day',
  '05-26': 'Memorial Day (observed)',
  '06-19': 'Juneteenth',
  '07-04': 'Independence Day',
  '09-01': 'Labor Day',
  '11-27': 'Thanksgiving',
  '12-25': 'Christmas'
};

function getTodaysCelebration() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = month + '-' + day;
  return holidays[key] || null;
}

function fetchWeather() {
  return new Promise((resolve) => {
    https.get('https://wttr.in/Miami?format=j1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const weather = JSON.parse(data);
          const current = weather.current_condition[0];
          const today = weather.weather[0];
          
          let minTemp = 999, maxTemp = -999;
          const hours = today.hourly || [];
          
          hours.forEach(h => {
            const tempF = parseInt(h.tempF);
            if (tempF) {
              minTemp = Math.min(minTemp, tempF);
              maxTemp = Math.max(maxTemp, tempF);
            }
          });
          
          const tempRange = (minTemp === 999 ? '--' : minTemp) + '-' + (maxTemp === -999 ? '--' : maxTemp);
          
          resolve({
            temp_range: tempRange,
            condition: current.weatherDesc[0].value,
            wind: current.windspeedMiles + ' mph',
            humidity: current.humidity + '%',
            chance_rain: today.hourly[0].chanceofrain + '%'
          });
        } catch (e) {
          resolve({
            temp_range: '--',
            condition: 'Unable to fetch',
            wind: '--',
            humidity: '--',
            chance_rain: '--'
          });
        }
      });
    }).on('error', () => {
      resolve({
        temp_range: '--',
        condition: 'Unable to fetch',
        wind: '--',
        humidity: '--',
        chance_rain: '--'
      });
    });
  });
}

function getUpcomingEvents() {
  const now = new Date();
  const upcoming = importantDates
    .map(item => ({
      ...item,
      daysUntil: Math.ceil((new Date(item.date) - now) / (1000 * 60 * 60 * 24))
    }))
    .filter(item => item.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);
  
  return upcoming;
}

async function generateDashboard() {
  const now = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const weather = await fetchWeather();
  
  const todayTip = tips[Math.floor(Math.random() * tips.length)];
  const todayArticle = articles[Math.floor(Math.random() * articles.length)];
  const celebration = getTodaysCelebration();
  const upcoming = getUpcomingEvents();
  
  const data = {
    date: dateStr,
    dayOfWeek: dayOfWeek,
    usNews: newsStories.usNews,
    miamiNews: newsStories.miamiNews,
    tip: todayTip,
    actions: dailyActions,
    article: todayArticle,
    weather: weather,
    celebration: celebration,
    upcoming: upcoming,
    generatedAt: now.toISOString()
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('OK - Dashboard generated:', dateStr);
}

generateDashboard().catch(e => console.error('Error:', e.message));
