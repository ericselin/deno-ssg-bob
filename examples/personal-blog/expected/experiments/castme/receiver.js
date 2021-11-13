// namespace for messages
import { NAMESPACE } from "./shared.js";

// helper variables
const cast = window.cast;
const context = cast.framework.CastReceiverContext.getInstance();

// on custom messages, show the message in the `h1`
context.addCustomMessageListener(NAMESPACE, function(e) {
  // hide explainer paragraph
  document.querySelector("p").style.display = "none";
  // show the text from the data sent
  document.querySelector("h1").innerText = e.data.text;
});

// start the receiver context
context.start({
  // do not close if no activity (see docs)
  disableIdleTimeout: true
});
