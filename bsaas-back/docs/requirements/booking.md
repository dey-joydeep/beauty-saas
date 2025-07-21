# Booking API Requirements

## Functional Requirements

- Users can create, view, update, and delete (cancel) bookings for salons.
- Bookings must include:
  - salonId
  - userId
  - serviceId(s)
  - status (e.g., PENDING, CONFIRMED, COMPLETED, CANCELED)
  - booking time/date
- The system must validate:
  - User and salon exist
  - Service(s) exist and belong to the salon
  - Booking time is valid (not in the past, not overlapping for user/salon)
- Only users with COMPLETED bookings are eligible to review the salon.
- Endpoints must support:
  - Creating a booking
  - Viewing bookings (by user, by salon, by status, etc.)
  - Updating booking status
  - Deleting/canceling a booking
- All booking logic must use PostgreSQL/MongoDB (no in-memory/demo data).

## API Parameters

### Create Booking

| Parameter  | Type     | Description                  |
| ---------- | -------- | ---------------------------- |
| salonId    | string   | Salon to book                |
| userId     | string   | User making the booking      |
| serviceIds | string[] | IDs of services being booked |
| time       | string   | Booking time/date (ISO 8601) |

### Update Booking Status

| Parameter | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| bookingId | string | ID of the booking                                    |
| status    | string | New status (PENDING, CONFIRMED, COMPLETED, CANCELED) |

## Notes

- All booking logic must use production databases (PostgreSQL/MongoDB).
- Interfaces must be in the `models` folder, one per file.
- Demo data is only allowed in tests/mocks.
