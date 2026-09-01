module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: [
        "https://www.clinigaeducation.com/",
        "https://www.clinigaeducation.com/hizmetler",
        "https://www.clinigaeducation.com/portal",
        "https://www.clinigaeducation.com/blog",
        "https://www.clinigaeducation.com/sehir-rehberleri",
      ],
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-gpu",
        preset: "desktop",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
        canonical: "error",
        "document-title": "error",
        "http-status-code": "error",
        "is-crawlable": "error",
        "meta-description": "error",
        "robots-txt": "error",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
