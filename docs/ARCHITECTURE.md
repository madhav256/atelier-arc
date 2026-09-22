# Architecture

## Boundaries

The browser owns presentation, route state, low-risk local collection/cart state, and server-state caching. The API is authoritative for identity, authorization, inventory, price, order totals, inquiry status, and admin work. Controllers translate HTTP; services own business rules; models own persistence constraints.

JWT access tokens are short-lived HTTP-only cookies. Refresh tokens are separately signed, rotated, hashed at rest, and scoped to the auth route. Production deployments should add a refresh and revocation controller backed by Redis or a token-family collection. Role checks run on the server.

## Data relationships

Artwork references Artist and Collection. UserCollection, Cart, Order, Inquiry and Notification reference User. Order line items snapshot title and unit price so historic orders do not drift when catalog data changes. Indexes cover public catalog, price/availability filters, user-owned records, and text search.

## Recommendations

`scoreArtwork` is deterministic: same artist +5, category +3, medium +2, shared tag +1. Candidate generation should later move to a nightly feature pipeline or vector store. Preserve a rule layer for inventory, geography, explicit collector exclusions, and advisor overrides.

## Frontend state

TanStack Query owns API state. Zustand is restricted to the acquisition bag and provisional private collection with local persistence. Authentication/session state should be hydrated from a `/me` endpoint in the next production iteration.

## Status transitions

Orders: pending → confirmed → preparing → shipped → delivered, with guarded cancel/refund branches. Inquiries: new → contacted → viewing scheduled → negotiation → acquired/closed. The schema constrains states; production service methods must enforce permitted edges and write an audit event for every staff mutation.
