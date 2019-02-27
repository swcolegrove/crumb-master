# crumb-master

agile planning poker

## Needed features for release

- Indicate a user has voted/ updated their vote
- Clear votes
- Lock voting
- Start/ stop timer

## Features we might want

- Customized voting values
- Customized voting cards
- Know when someone leaves room
- Chat within voting window
- Shared story description
- Redis is flushed daily
- Crumb master can lock votes in a room
- Validate users only affecting a room they're in (can't show votes in another room)
- Set/ edit a room name. Does it persist after redis wipe or get re created when someone re joins the room?
- Validate / sanitize api calls
