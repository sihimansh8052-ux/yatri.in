# Yatri.in API

Base URL: `/api`

## Auth

- `POST /auth/signup` - create account
- `POST /auth/login` - login and receive JWT
- `GET /auth/me` - current user profile

## Discovery

- `GET /discover/nearby?lat=..&lng=..&radius=10000&category=all&sort=nearest&price=budget&rating=4`
- `GET /discover/recommendations?interest=food,culture&lat=..&lng=..`
- `GET /discover/explore?city=New%20Delhi&search=market&category=local-experience&budget=mid&rating=4.5&sort=popularity`
- `GET /discover/highlights`

## Hotels

- `GET /hotels`
- `GET /hotels/:id`
- `POST /hotels`
- `PUT /hotels/:id`
- `DELETE /hotels/:id`
- `POST /hotels/:id/reviews`

## Restaurants

- `GET /restaurants`
- `GET /restaurants/:id`
- `POST /restaurants`
- `PUT /restaurants/:id`
- `DELETE /restaurants/:id`
- `POST /restaurants/:id/reviews`

## Tourist Places

- `GET /places`
- `GET /places/:id`
- `POST /places`
- `PUT /places/:id`
- `DELETE /places/:id`
- `POST /places/:id/reviews`

## Bookings

- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/:id/status`

## User

- `PATCH /users/profile`
- `POST /users/saved`
- `DELETE /users/saved`
- `POST /users/history`
- `GET /users/notifications`
- `POST /users/itinerary`
- `PUT /users/itinerary/:itineraryId`
- `DELETE /users/itinerary/:itineraryId`

## Admin Notes

- `POST`, `PUT`, and `DELETE` on `/hotels`, `/restaurants`, and `/places` require an authenticated admin user.
- Demo admin credentials for local development:
  - `admin@yatri.in`
  - `password123`

## Sample Request

```json
POST /api/bookings
{
  "hotelId": "hotel_object_id",
  "checkIn": "2026-05-20",
  "checkOut": "2026-05-22",
  "guests": 2
}
```
