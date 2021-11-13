// config needed for the gapi client
const CLIENT_ID =
  "153648350234-btn9vs3rm00o2421stah9pabocq01ql5.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAw5gPDCZa8WKNAIzHQBe96YiLGx6ZGsY";
// config needed for calendar api
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
// helper variables
var gapi;
const signinBtn = document.getElementById("signin");
const authorizeBtn = document.getElementById("authorize");
const signoutBtn = document.getElementById("signout");

// signin button
signinBtn.addEventListener("click", () => {
  gapi.auth2.getAuthInstance().signIn();
});

// authorize button
authorizeBtn.addEventListener("click", async () => {
  // get user
  const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
  // grant additional permissions
  const success = await googleUser.grant({
    scope: SCOPE
  });

  // show events
  listUpcomingEvents();
});

// signout button
signoutBtn.addEventListener("click", () => {
  gapi.auth2.getAuthInstance().signOut();
  // revoke all scopes
  gapi.auth2.getAuthInstance().disconnect();
});

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi = window.gapi;
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
async function initClient() {
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: "profile",
      fetch_basic_profile: false,
    });
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  } catch (error) {
    console.error(error);
    alert("Could not initialize. See console.");
  }
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    signoutBtn.disabled = false;
    signinBtn.disabled = true;

    // get current scopes
    if (
      gapi.auth2
        .getAuthInstance()
        .currentUser.get()
        .hasGrantedScopes(SCOPE)
    ) {
      listUpcomingEvents();
    } else {
      authorizeBtn.disabled = false;
    }
  } else {
    signoutBtn.disabled = true;
    signinBtn.disabled = false;
    authorizeBtn.disabled = true;
  }
}

// get ISO string of the previous midnight
const midnightISO = date => `${date.toISOString().split("T")[0]}T00:00:00.000Z`;

// format time from date object
const time = date =>
  date.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "numeric",
    minute: "numeric"
  });

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
async function listUpcomingEvents() {
  // load the calendar api
  await gapi.client.load(DISCOVERY_DOC);

  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const resp = await gapi.client.calendar.events.list({
    calendarId: "primary",
    timeMin: midnightISO(now),
    timeMax: midnightISO(tomorrow),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime"
  });

  const events = resp.result.items;
  const main = document.querySelector("main");

  if (events.length > 0) {
    main.innerHTML = events.reduce((html, event) => {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      // check for past and current events
      let modifier = "";
      if (end < now) modifier = ' class="past"';
      if (start <= now && end >= now) modifier = ' class="current"';
      return `${html}<div${modifier}>
        <div>${time(start)}&nbsp;</div>
        <div>-&nbsp;${time(end)}</div>
        <div>${event.summary}</div>
      </div>`;
    }, "");
  } else {
    main.innerText = "No upcoming events found.";
  }
}
