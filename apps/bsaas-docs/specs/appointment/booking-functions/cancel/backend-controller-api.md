# Appointment Cancellation - Backend API

## Endpoint

/api/v1/appointment/cancel

### Request

`http
GET /api/v1/appointment/cancel
Authorization: Bearer {token}
`

### Response

`json
{
  "data": {},
  "meta": {}
}
`

## Error Responses

| Status Code | Error Code   | Description              |
| ----------- | ------------ | ------------------------ |
| 401         | UNAUTHORIZED | Missing or invalid token |
| 403         | FORBIDDEN    | Insufficient permissions |
