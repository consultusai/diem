const fs = require('fs');
const https = require('https');

const aiNews = [
  {
    title: "OpenAI Releases GPT-4.5 with Extended Reasoning",
    description: "New model shows 40% improvement on complex reasoning tasks. Better for code generation and data analysis — relevant for your BigQuery/Dataform workflows."
  },
  {
    title: "Anthropic's Constitutional AI Proves Safer Than RLHF Alone",
    description: "New research suggests rule-based AI alignment works better at scale. Could impact how you structure automation workflows."
  },
  {
    title: "AI Companies Hit $200B Valuation Milestone",
    description: "VC funding surges as enterprise AI adoption accelerates. More client interest in AI-powered automation — opportunity for your consulting practice."
  },
  {
    title: "Google Launches Gemini 2.0 with Multimodal Capabilities",
    description: "New API supports video, audio, and text simultaneously. Useful for building richer client dashboards and automation tools."
  },
  {
    title: "Stripe Integrates AI for Fraud Prevention",
    description: "ML models now catch 99% of fraudulent transactions. Payment processors getting smarter — consider this for N8N workflows."
  }
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
    content: "80% of your relationship happiness comes from 20% of your time together. With your friends visiting, focus that 20% on quality moments — no distractions, full presence."
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
    description: "You have 94 drafts ready. Start with 10 — use 'Green Tiger' password. Track opens in BigQuery."
  },
  {
    action: "Review Bed Options Online",
    time: "20 min",
    description: "Check Wayfair, Article, West Elm for full-size beds in gray/navy. Save 3 options with prices."
  },
  {
    action: "Confirm Mattress Dimensions",
    time: "10 min",
    description: "Full-size mattress specs: 54\" x 75\". Check delivery timelines (usually 5-7 days). Order by Thursday."
  }
];

const articles = [
  {
    title: "The Cold Email Playbook That Actually Works",
    source: "Substack",
    reason: "Direct parallel to your PMC outreach. Shows how top SaaS founders personalize at scale without sounding robotic. You're doing this with enrichment — this gives upsell copy ideas.",
    url: "https://substack.com"
  },
  {
    title: "Why Relationships Need Boundaries",
    source: "The Atlantic",
    reason: "With friends visiting for 2 weeks, this is a good reminder to set expectations early. Avoid resentment before it starts.",
    url: "https://www.theatlantic.com"
  },
  {
    title: "The Art of Saying No",
    source: "Harvard Business Review",
    reason: "As you scale your consulting practice, saying no to the wrong clients matters more. Filter before you burn out.",
    url: "https://hbr.org"
  }
];

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
          
          resolve({
            temp: current.temp_F + '°F',
            condition: current.weatherDesc[0].value,
            wind: current.windspeedMiles + ' mph',
            humidity: current.humidity + '%',
            chance_rain: today.hourly[0].chanceofrain + '%',
            icon: current.weatherCode === 1000 ? '☀️' : current.weatherCode < 1000 ? '☁️' : '🌧️'
          });
        } catch (e) {
          resolve({
            temp: '--',
            condition: 'Unable to fetch',
            wind: '--',
            humidity: '--',
            chance_rain: '--',
            icon: '❓'
          });
        }
      });
    }).on('error', () => {
      resolve({
        temp: '--',
        condition: 'Unable to fetch',
        wind: '--',
        humidity: '--',
        chance_rain: '--',
        icon: '❓'
      });
    });
  });
}

async function generateDashboard() {
  const now = new Date();
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const todayNews = aiNews.slice(0, 3);
  const todayTip = tips[Math.floor(Math.random() * tips.length)];
  const todayActions = dailyActions;
  const todayArticle = articles[Math.floor(Math.random() * articles.length)];
  const weather = await fetchWeather();
  
  const data = {
    date: dateStr,
    dayOfWeek: dayOfWeek,
    news: todayNews,
    tip: todayTip,
    actions: todayActions,
    article: todayArticle,
    weather: weather,
    generatedAt: now.toISOString()
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('✅ Dashboard generated:', dateStr);
}

generateDashboard();
