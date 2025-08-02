# dashboard - quick actions - Backend API

## Endpoint

/api/v1/dashboard/quick-actions

### Request

`http
GET /api/v1/dashboard/quick-actions
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
