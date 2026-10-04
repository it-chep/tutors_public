# tutors_public

Публичный мультитенантный frontend для юридической информации клиентов. Он не содержит авторизации, JWT, `adminId` или административных экранов.

## Маршруты

- `/info` — юридические реквизиты;
- `/documents` — опубликованные юридические документы;
- `/` и неизвестные адреса перенаправляются на `/info`.

## Локальный запуск

Укажите домен клиента и адрес backend в `.env` и запустите:

```bash
npm install
npm start
```

В режиме разработки React перенаправляет запросы `/api/*` на `BACKEND_URL` (по умолчанию `http://localhost:8080`). В production `REACT_APP_BACKEND_URL` задаёт origin публичного API; если он не указан, запросы остаются относительными и идут на текущий origin.

Запросы передают параметр `hostname`: в обычном режиме это текущий домен из адресной строки, а при `REACT_APP_DEBUG=true` — значение `REACT_APP_CLIENT_DOMAIN` из `.env`.

Backend API:

- `GET /api/v1/public/legal-info`;
- `GET /api/v1/public/documents`.
- `GET /api/v1/public/documents/{document_id}/content`.
- `GET /api/v1/public/documents/{document_id}/versions/{version_id}/content`.
- `GET /api/v1/public/documents/{document_id}/versions`.
