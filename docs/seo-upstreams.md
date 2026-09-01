# CliniGA Education SEO upstream kayıtları

Bu projeye “SEO deposu” adı altında toplu ve denetimsiz kaynak kod eklenmez. Araçlar görev
uyumu, bakım sinyali ve lisans açısından seçilir; kullanılan sürüm sabitlenir. Kontrol tarihi:
2026-09-01.

| Upstream                                                                    | Doğrulanan sürüm / commit                              | Lisans     | Kullanım modu           | Not                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------ | ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) | `v0.15.1` / `ebee453dad3f8acacd657a62ccc65e3296afb7d0` | Apache-2.0 | Sabit sürümlü CI aracı  | Temsilî üretim sayfalarında SEO, erişilebilirlik, iyi uygulama ve performans gerilemelerini denetler.                                                                                                                           |
| [harlan-zw/unlighthouse](https://github.com/harlan-zw/unlighthouse)         | `v0.18.0` / `9c69fb998e6a5253251793a2da6456e0a46d8ce9` | MIT        | Mimari referans         | Tüm siteyi sitemap üzerinden tarama yaklaşımı `scripts/seo-live-check.mjs` içinde bağımlılıksız ve CliniGA'ya özgü uygulanır. Node.js `>=22.18.0` gereksinimi ve mevcut kontrollerle çakışması nedeniyle paket olarak kurulmaz. |
| [ekalinin/sitemap.js](https://github.com/ekalinin/sitemap.js)               | `9.0.1` / `1a782cf41e0d391299029c9e00c8bfa8cdaad212`   | MIT        | XML doğrulama referansı | Mevcut tipli sitemap üreticisi testli ve çalışır durumda olduğundan üretim bağımlılığı eklenmez; değiştirmek gereksiz geçiş riski yaratır.                                                                                      |

Üç upstream de son kontrolde arşivlenmemişti. Depoların kökünde açık bir `SECURITY.md`
bulunmadığından güvenlik güncellemeleri sürüm notları ve bağımlılık taramasıyla ayrıca izlenir.
Lighthouse raporları üçüncü taraf geçici depolamaya gönderilmez; yalnızca GitHub Actions
artifact'ı olarak 14 gün saklanır.
