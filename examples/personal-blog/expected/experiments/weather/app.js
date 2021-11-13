if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

/** @type {PositionCallback} */
const getTemp = async (position) => {
  console.log(position);

  let resp = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=1f4885debc672bf3b3a91ade95a24c29`);
  const forecast = await resp.json();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayUnix = Math.floor(yesterday.getTime() / 1000);
  resp = await fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?dt=${yesterdayUnix}&lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=1f4885debc672bf3b3a91ade95a24c29`);
  const y = await resp.json();

  const todayTemp = forecast.current.feels_like;
  const yesterdayTemp = y.current.feels_like;
  /** @type {number} */
  const diff = todayTemp - yesterdayTemp;
  const icon = document.querySelector('h1');
  const sub = document.querySelector('h2');
  const p = document.querySelector('p');
  if (diff > 0.5) {
    icon.innerText = '🥵';
    sub.innerText = 'Warmer';
  }
  else if (diff < -0.5) {
    icon.innerText = '🥶';
    sub.innerText = 'Colder';
  }
  else {
    icon.innerText = '😇';
    sub.innerText = 'Similar';
  }
  p.innerHTML = `Today it feels like ${todayTemp.toFixed(1)}°C
    <br>Yesterday it felt like ${yesterdayTemp.toFixed(1)}°C`;

  console.log(forecast);
  console.log(y);
};

const refresh = () => {
  navigator.geolocation.getCurrentPosition(getTemp);
};

refresh();