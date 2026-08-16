# Newsletter Provider Notes

> Fill this in once a provider is chosen. Non-sensitive config only.

Provider: `TBC`
Audience / list name: `Schuggies Ceilidh Newsletter`
Account owner: `Schuggies-Ceilidhs`

## Important URLs

- List / audience URL: `TBC`
- Embed form URL: `TBC`
- Login URL: `TBC`

## Settings to confirm on setup

- [ ] Double opt-in **enabled** (UK GDPR — records proof of consent)
- [ ] Consent timestamp + source captured on each signup
- [ ] Unsubscribe link present in every send (legally required)
- [ ] From-name `Schuggie`, from-email `info@schuggies-ceilidhs.co.uk`
- [ ] Sending domain authenticated (SPF / DKIM) or mail lands in spam
- [ ] Physical postal address configured — most providers require one, and
      CAN-SPAM/PECR expect it. Use the registered address:
      Suite 69, Sneinton Market Unit 6, Gedling Street, Nottingham, NG1 1DS

## Never put secrets in this folder

- Passwords
- API keys or access tokens
- Subscriber exports (CSV of real email addresses)

Two reasons, both verified:

1. **This folder is served to the public.** The repo root *is* the web root —
   Railway and `tryon.py` both serve everything in it. Once pushed, this file
   is readable at `https://schuggies.caitryapps.com/data_in/newsletter/provider-notes.md`.
   There is no `.gitignore`-style protection for served paths.
2. **Git history is permanent.** Deleting a committed secret in a later commit
   does not remove it from history.

If a key is ever needed, put it in Railway's environment variables.

(Repo visibility on GitHub was not confirmed at the time of writing — check it
before assuming anything here is private either way.)
