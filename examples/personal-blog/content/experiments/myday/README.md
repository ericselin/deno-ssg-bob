# Myday

See your Google calendar events for today.

[Working domain](https://myday.ericselin.dev)

## Requirements

- Google Cloud Platform project with Calendar API enabled
- API key and OAuth client for the project
- Private top-level domain for hosting (see note below)

Note: You need to authorize the OAuth client for a particular URL.
This URL needs to be on a whitelisted domain, which in turn needs
to be a private top-level domain.

This project also showcases using Google Sign-In to request for
additional permissions on demand (incremental authorization). Note
that it's apparently not possible to bypass the account selection
when doing this.

**The Calendar API is restricted and requires validation by Google
before usage. It still works without validation, but shows a very
scary warning.**

[Quick start docs](https://developers.google.com/calendar/quickstart/js)
