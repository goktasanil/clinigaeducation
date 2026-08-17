# CliniGA Education

CliniGA Education'ın yurt dışı eğitim, vize ve akademik danışmanlık web uygulaması.

## Portal

`/portal` dünya ülkeleri, şehirleri, üniversiteleri ve enstitüleri OpenAlex üzerinden arar; ISO 3166 ülke listesi, bölüm alanları, üyelik fiyatları ve moderasyonlu öğrenci paylaşım alanları içerir. Portal tabloları RLS ile korunur. Stripe ödeme bağlantıları ve isteğe bağlı GeoNames/OpenAlex anahtarları `.env.example` üzerinden yapılandırılır.

## Geliştirme

```bash
npm install
npm run dev
```

## Doğrulama

```bash
npm run check
```

Uygulama TanStack Start, React, TypeScript, Supabase ve i18next kullanır. Çalışma zamanı yapılandırmasını repoya gizli anahtar eklemeden ortam değişkenleriyle sağlayın.
