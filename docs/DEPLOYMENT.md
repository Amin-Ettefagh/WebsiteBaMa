# راهنمای دیپلوی و Docker

## اجرای سریع با Docker Compose
```bash
docker compose up --build -d
```

پروژه روی پورت `3022` بالا می‌آید:

```text
http://localhost:3022
```

## تغییر پورت
- در `docker-compose.yml` مقدار پورت را تغییر دهید.
- در صورت اجرای محلی بدون Docker نیز پورت از طریق اسکریپت‌ها قابل تغییر است.

## ساخت ایمیج و اجرای دستی
```bash
docker build -t websithebama .
```

```bash
docker run -d --name websithebama -p 3022:3022 websithebama
```

## متغیرهای محیطی
- `PORT`: پورت اجرای سرور (پیش‌فرض 3022)

## عیب‌یابی
- اگر پورت اشغال است، مقدار پورت را در `docker-compose.yml` تغییر دهید.
- در صورت بریک بودن تصاویر خارجی، `npm run sync:remote` را اجرا کنید.
