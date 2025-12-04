document.addEventListener('DOMContentLoaded', async () => {
  // MOBILE NAV TOGGLE
  const menuToggle = document.getElementById('mobile-menu');
  const navList = document.getElementById('nav-list');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
    });

    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('active');
      });
    });
  }

  // TWITCH API SETUP
  const channels = [
    {
      name: 'wolf_poe',
      statusEl: document.getElementById('wolf-status'),
      avatarEl: document.querySelector('img[alt="Wolf Poe"]')
    },
    {
      name: 'lethalxjoker',
      statusEl: document.getElementById('joker-status'),
      avatarEl: document.querySelector('img[alt="Lethal x Joker"]')
    }
  ];

  const clientId = 'gp762nuuoqcoxypju8c569th9wz7q5';
  const accessToken = 'r804gii0lw7dekrv7zotgi5ye1obq9';

  async function checkStreamStatus(channel) {
    if (!channel.statusEl || !channel.avatarEl) return;

    try {
      const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel.name}`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Stream is live → Green dot + green glow
        channel.statusEl.classList.remove('offline');
        channel.statusEl.classList.add('online');
        channel.avatarEl.classList.add('online-glow');
      } else {
        // Stream is offline → Red dot + no glow
        channel.statusEl.classList.remove('online');
        channel.statusEl.classList.add('offline');
        channel.avatarEl.classList.remove('online-glow');
      }
    } catch (error) {
      console.error('Error checking Twitch stream status:', error);
    }
  }

  async function updateAllStatuses() {
    for (const channel of channels) {
      await checkStreamStatus(channel);
    }
  }

  await updateAllStatuses();
  setInterval(updateAllStatuses, 300000); // Check every 5 minutes

  // COUNTDOWN TIMER
  const countdownTimerEl = document.getElementById("countdown-timer");

  function getNextStreamDate() {
    const now = new Date();
    let nextStream = new Date();
    nextStream.setHours(19, 15, 0, 0); // Set to 7:15 PM

    // Move to the next valid stream day (Tuesday, Wednesday, Thursday)
    while (![2, 3, 4].includes(nextStream.getDay()) || nextStream < now) {
      nextStream.setDate(nextStream.getDate() + 1);
    }

    return nextStream;
  }

  async function checkIfLive() {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=wolf_poe`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      return data.data.length > 0;
    } catch (error) {
      console.error("Error checking Twitch live status:", error);
      return false;
    }
  }

  async function updateCountdown() {
    const isLive = await checkIfLive();

    if (isLive) {
      countdownTimerEl.innerHTML = "We're Live Now!";
      return;
    }

    const nextStreamDate = getNextStreamDate();
    const countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextStreamDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(countdownInterval);
        countdownTimerEl.innerHTML = "We're Live Now!";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownTimerEl.innerHTML = `Next Stream: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  await updateCountdown();
});
