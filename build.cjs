const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const srcDir = path.join(__dirname, "src");
const modulesDir = path.join(srcDir, "modules");

async function build() {
  const files = [
    "src/App.jsx",
    "src/modules/Tarjetas.jsx",
    "src/modules/EstadoDeCuenta.jsx",
  ];

  for (const file of files) {
    const entry = path.join(__dirname, file);
    const outfile = entry.replace(/\.jsx$/, ".compiled.js");

    console.log(`Building ${file} -> ${path.basename(outfile)}`);

    await esbuild.build({
      entryPoints: [entry],
      outfile,
      format: "esm",
      platform: "browser",
      target: "es2020",
      jsx: "automatic",
      bundle: true,
      external: ["react", "react-dom"],
      loader: { ".js": "jsx" },
      define: {
        "process.env.NODE_ENV": '"production"',
      },
    });
  }

  console.log("Build complete.");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
