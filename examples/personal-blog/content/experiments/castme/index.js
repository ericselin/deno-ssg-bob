// namespace used to send custom messages to the receiver
import { NAMESPACE } from "./shared.js";
// application id (register on cast.google.com!)
const applicationId = "A791FE20";
// these are helper variables
var cast;
var castContext;

// initialization (called when the api is ready)
const initializeCastApi = () => {
  cast = window.cast;
  // initialize the cast api with application id
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: applicationId,
    autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });
  // set the current cast context
  castContext = cast.framework.CastContext.getInstance();
  // log session changes to the console and footer
  castContext.addEventListener(
    cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
    event => {
      console.log("Session state changed", event);
      document.querySelector("footer").innerText = event.sessionState;
    }
  );
  // set footer state here (above is not fired yet)
  document.querySelector("footer").innerText = castContext.getCastState();
  console.log("Cast API initialized");
};

// send messages to receiver on submit
document.querySelector("form").addEventListener("submit", async e => {
  // do not submit
  e.preventDefault();
  // get cast session
  let castSession = castContext.getCurrentSession();
  // if we don't have a session, open cast dialog
  if (!castSession) {
    // this will throw a `cancel` error if unsuccessful
    await castContext.requestSession();
    // now we should have a cast session to get
    castSession = castContext.getCurrentSession();
  }
  const input = document.querySelector("input");
  // send custom message to receiver
  const result = await castSession.sendMessage(NAMESPACE, {
    text: input.value
  });
  input.value = "";
  console.log("Message sending result", result);
});

// this is called when the cast api is available
window["__onGCastApiAvailable"] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};
