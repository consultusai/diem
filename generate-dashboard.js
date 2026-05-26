const fs = require('fs');
const https = require('https');

const NEWSAPI_KEY = 'f8679757-9b61-4d6b-adf4-99994b3019cd';

const importantDates = [
  { date: '2026-06-05', event: 'Clay and Maura coming to Miami' },
  { date: '2026-06-07', event: 'Guest bedroom ready (friends arriving)' },
  { date: '2026-06-12', event: "Jennies mom here" },
  { date: '2026-06-18', event: 'NYC for US Open' },
  { date: '2026-06-28', event: 'Key West' },
  { date: '2026-07-04', event: 'Puerto Rico' },
  { date: '2026-07-24', event: 'MF birthday weekend' },
  { date: '2026-09-16', event: 'Bruno Mars concert (Charlie + Hayley)' }
];

const tips = [
  {
    title: "The 10-Minute Audit Rule",
    content: "Before starting your day, spend 10 minutes reviewing your highest-value tasks. For you: Check how many PMC emails were opened/replied to overnight. This 10 minutes of context saves 2 hours of scattered work later."
  },
  {
    title: "Batch Your Email Reviews",
    content: "Check emails at 9 AM, 12 PM, 3 PM instead of constantly. Reduces context-switching and lets you focus on deep work. Apply this to your PMC outreach tracking."
  },
  {
    title: "The 80/20 Rule for Relationships",
    content: "80% of your relationship happiness comes from 20% of your time together. With your friends visiting, focus that 20% on quality moments without distractions."
  },
  {
    title: "One Thing Rule for Productivity",
    content: "Pick ONE main goal per day. Everything else is bonus. This week: Guest bedroom revamp. This month: Scale PMC outreach. Focus beats multitasking."
  }
];

const dailyActions = [
  {
    action: "Send 10 More PMC Outreach Emails",
    time: "30 min",
    description: "You have 94 drafts ready. Start with 10 - use Green Tiger password. Track opens in BigQuery."
  },
  {
    action: "Review Bed Options Online",
    time: "20 min",
    description: "Check Wayfair, Article, West Elm for full-size beds in gray/navy. Save 3 options with prices."
  },
  {
    action: "Confirm Mattress Dimensions",
    time: "10 min",
    description: "Full-size mattress specs: 54 x 75 inches. Check delivery timelines. Order by Thursday."
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
  '12-25': 'Christmas',
  '03-17': "St Patricks Day",
  '04-22': 'Earth Day'
};

function getTodaysCelebration() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = month + '-' + day;
  return holidays[key] || null;
}

function escapeJSON(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function curateNews(articles, count = 2) {
  const scored = articles.map(a => {
    let score = 0;
    const text = (a.title + ' ' + (a.description || '')).toLowerCase();
    
    if (text.includes('ai') || text.includes('artificial')) score += 5;
    if (text.includes('automation') || text.includes('automat')) score += 4;
    if (text.includes('data')) score += 3;
    if (text.includes('business') || text.includes('startup')) score += 2;
    if (text.includes('science') || text.includes('research')) score += 2;
    
    return { ...a, score };
  });
  
  return scored
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

function fetchNews(query, resultCount = 10) {
  return new Promise((resolve) => {
    const searchQuery = encodeURIComponent(query);
    const url = `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=${resultCount}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const articles = (json.articles || []).map(a => ({
            title: a.title || '',
            description: a.description || '',
            url: a.url || '',
            source: a.source.name || 'News'
          }));
          resolve(articles);
        } catch (e) {
          console.log('News API parse error');
          resolve([]);
        }
      });
    }).on('error', () => {
      resolve([]);
    });
  });
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
          
          resolve({
            temp_range: (minTemp === 999 ? '--' : minTemp) + '-' + (maxTemp === -999 ? '--' : maxTemp) + 'F',
            condition: current.weatherDesc[0].value,
            wind: current.windspeedMiles + ' mph',
            humidity: current.humidity + '%',
            chance_rain: today.hourly[0].chanceofrain + '%',
            icon: current.weatherCode === 1000 ? 'sunny' : current.weatherCode < 1000 ? 'cloudy' : 'rainy'
          });
        } catch (e) {
          resolve({
            temp_range: '--',
            condition: 'Unable to fetch',
            wind: '--',
            humidity: '--',
            chance_rain: '--',
            icon: 'unknown'
          });
        }
      });
    }).on('error', () => {
      resolve({
        temp_range: '--',
        condition: 'Unable to fetch',
        wind: '--',
        humidity: '--',
        chance_rain: '--',
        icon: 'unknown'
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
  
  console.log('Fetching news and weather...');
  
  const [allNews, miamiNewsRaw, weather] = await Promise.all([
    fetchNews('AI technology automation business', 10),
    fetchNews('Miami Florida news', 5),
    fetchWeather()
  ]);
  
  const usNews = curateNews(allNews, 2);
  const miamiNews = curateNews(miamiNewsRaw, 1);
  
  const todayTip = tips[Math.floor(Math.random() * tips.length)];
  const todayArticle = articles[Math.floor(Math.random() * articles.length)];
  const celebration = getTodaysCelebration();
  const upcoming = getUpcomingEvents();
  
  const newsJSON = usNews.map(n => ({
    title: escapeJSON(n.title),
    description: escapeJSON(n.description),
    url: n.url
  }));
  
  const miamiJSON = miamiNews.map(n => ({
    title: escapeJSON(n.title),
    description: escapeJSON(n.description),
    url: n.url
  }));
  
  const json = {
    date: dateStr,
    dayOfWeek: dayOfWeek,
    usNews: newsJSON,
    miamiNews: miamiJSON,
    tip: {
      title: todayTip.title,
      content: todayTip.content
    },
    actions: dailyActions,
    article: {
      title: todayArticle.title,
      source: todayArticle.source,
      reason: todayArticle.reason,
      url: todayArticle.url
    },
    weather: weather,
    celebration: celebration,
    upcoming: upcoming,
    generatedAt: now.toISOString()
  };
  
  fs.writeFileSync('data.json', JSON.stringify(json, null, 2));
  console.log('OK - Dashboard generated:', dateStr);
}

generateDashboard().catch(e => console.error('Error:', e.message));
