module.exports = {
  ci: {
    collect: {
      startServerCommand:
        "python3 -u -m http.server 4173 --bind 127.0.0.1 --directory .output/public",
      startServerReadyPattern: "Serving HTTP",
      startServerReadyTimeout: 30000,
      url: ["http://127.0.0.1:4173/"],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.6 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
