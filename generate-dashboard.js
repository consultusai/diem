const fs = require('fs');
const https = require('https');

const NEWSAPI_KEY = '46d50d8790614a478c6fb3ca6ea2d2f0';

const importantDates = [
  { date: '2026-06-05', event: 'Clay and Maura coming to Miami' },
  { date: '2026-06-07', event: 'Art & rug installation complete + Friends arrive' },
  { date: '2026-06-12', event: 'Jennies mom here' },
  { date: '2026-06-18', event: 'NYC for US Open' },
  { date: '2026-06-19', event: 'Juneteenth' },
  { date: '2026-06-28', event: 'Key West' },
  { date: '2026-07-04', event: 'Puerto Rico & Independence Day' },
  { date: '2026-07-24', event: 'MF birthday weekend' },
  { date: '2026-09-01', event: 'Labor Day' },
  { date: '2026-09-16', event: 'Bruno Mars concert (Charlie + Hayley)' },
  { date: '2026-11-26', event: 'Thanksgiving' },
  { date: '2026-12-25', event: 'Christmas' }
];

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
    action: "Browse Art for Office",
    time: "20 min",
    description: "Check Etsy, Minted, or local galleries. Save 3 options that match your aesthetic."
  },
  {
    action: "Browse Art & Rugs for Entryway",
    time: "20 min",
    description: "Find cohesive pieces - entryway rug, wall art. Save options with prices before purchasing."
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

const historicalEvents = {
  '05-26': 'In 1993, the first website was published on the internet (www.info.cern.ch) - celebrating the birth of the web.',
  '06-19': 'In 1865, slaves in Galveston, Texas were finally freed, two years after the Emancipation Proclamation.',
  '07-04': 'In 1776, the Declaration of Independence was adopted in Philadelphia.',
  '12-25': 'In 1 AD (traditional date), Jesus Christ was born.'
};

function getTodaysCelebration() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const key = month + '-' + day;
  const holiday = holidays[key];
  const event = historicalEvents[key];
  
  if (holiday && event) {
    return { holiday, event };
  } else if (holiday) {
    return { holiday, event: null };
  } else if (event) {
    return { holiday: null, event };
  }
  return null;
}

function getYesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function scoreArticle(article) {
  const keywords = {
    ai: 5,
    'machine learning': 5,
    data: 4,
    startup: 4,
    founder: 4,
    automation: 4,
    algorithm: 3,
    bigquery: 4,
    analytics: 3,
    tech: 2,
    business: 2,
    innovation: 2,
    api: 3,
    cloud: 2,
    software: 2
  };
  
  let score = 0;
  const text = (article.title + ' ' + (article.description || '')).toLowerCase();
  
  Object.entries(keywords).forEach(([keyword, points]) => {
    if (text.includes(keyword)) score += points;
  });
  
  return score;
}

function fetchNews(query, resultCount = 15) {
  return new Promise((resolve) => {
    const searchQuery = encodeURIComponent(query);
    const yesterday = getYesterdayDate();
    const url = `https://newsapi.org/v2/everything?q=${searchQuery}&from=${yesterday}&sortBy=publishedAt&language=en&apiKey=${NEWSAPI_KEY}&pageSize=${resultCount}`;
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: { 'User-Agent': 'Diem Dashboard' }
    };
    
    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status !== 'ok' || !json.articles) {
            console.log('NewsAPI error:', json.message || 'Unknown error');
            resolve([]);
            return;
          }
          
          const articles = json.articles.map(a => ({
            title: a.title || 'News',
            description: a.description || a.content || 'Read more',
            url: a.url || '',
            source: a.source.name || 'News'
          }));
          
          resolve(articles);
        } catch (e) {
          console.log('Parse error:', e.message);
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.log('Request error:', e.message);
      resolve([]);
    }).end();
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
    }).end();
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
  
  console.log('Fetching news from yesterday...');
  
  const [aiNewsRaw, dataNewsRaw, startupNewsRaw, miamiNewsRaw, weather] = await Promise.all([
    fetchNews('artificial intelligence AI', 15),
    fetchNews('data analytics BigQuery', 15),
    fetchNews('startup founder automation', 15),
    fetchNews('Miami Florida', 20),
    fetchWeather()
  ]);
  
  // Combine all news (keep Miami separate)
  const allNews = [...aiNewsRaw, ...dataNewsRaw, ...startupNewsRaw];
  const miamiScored = miamiNewsRaw
    .map(a => ({ ...a, score: scoreArticle(a) }))
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Score and filter
  const scored = allNews
    .map(a => ({ ...a, score: scoreArticle(a) }))
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Dedupe by title and take top 3
  const seen = new Set();
  const finalNews = [];
  
  for (const article of scored) {
    if (seen.has(article.title)) continue;
    if (finalNews.length >= 3) break;
    seen.add(article.title);
    finalNews.push({
      title: article.title,
      description: article.description,
      url: article.url
    });
  }
  
  const todayTip = tips[Math.floor(Math.random() * tips.length)];
  const todayArticle = articles[Math.floor(Math.random() * articles.length)];
  const celebrationObj = getTodaysCelebration();
  const celebration = celebrationObj ? JSON.stringify(celebrationObj) : null;
  const upcoming = getUpcomingEvents();
  
  // Get top Miami news (be more lenient, take first non-scored if needed)
  const seen2 = new Set();
  let finalMiamiNews = [];
  
  // First try scored articles
  for (const article of miamiScored) {
    if (seen2.has(article.title)) continue;
    if (finalMiamiNews.length >= 1) break;
    seen2.add(article.title);
    finalMiamiNews.push({
      title: article.title,
      description: article.description,
      url: article.url
    });
  }
  
  // If no scored articles, take first Miami article regardless
  if (finalMiamiNews.length === 0 && miamiNewsRaw.length > 0) {
    console.log('Taking unscored Miami article, raw count:', miamiNewsRaw.length);
    finalMiamiNews.push({
      title: miamiNewsRaw[0].title,
      description: miamiNewsRaw[0].description,
      url: miamiNewsRaw[0].url
    });
  }
  
  if (finalMiamiNews.length === 0) {
    console.log('No Miami news found. Raw count:', miamiNewsRaw.length);
  }
  
  const data = {
    date: dateStr,
    dayOfWeek: dayOfWeek,
    usNews: finalNews,
    miamiNews: finalMiamiNews,
    tip: todayTip,
    actions: dailyActions,
    article: todayArticle,
    weather: weather,
    celebration: celebrationObj ? { holiday: celebrationObj.holiday, event: celebrationObj.event } : null,
    upcoming: upcoming,
    generatedAt: now.toISOString()
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('OK - Dashboard generated:', dateStr);
  console.log('News:', finalNews.length, '| Miami:', finalMiamiNews.length, '| Upcoming:', upcoming.length);
}

generateDashboard().catch(e => console.error('Error:', e.message));
