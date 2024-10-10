const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Función para validar un archivo HTML
function validateHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Validar etiquetas requeridas y vacías
  const requiredTags = {
    h1: document.querySelectorAll("h1").length,
    p: document.querySelectorAll("p").length,
    section: document.querySelectorAll("section").length,
    img: document.querySelectorAll("img").length,
    link: [...document.querySelectorAll("link")].filter(
      (link) => link.getAttribute("rel") === "stylesheet"
    ).length,
  };

  const emptyTags = {
    h1: [...document.querySelectorAll("h1")].filter(
      (h1) => h1.textContent.trim() === ""
    ).length,
    p: [...document.querySelectorAll("p")].filter(
      (p) => p.textContent.trim() === ""
    ).length,
    section: [...document.querySelectorAll("section")].filter(
      (section) => section.textContent.trim() === ""
    ).length,
  };

  // Validar estructura y semántica
  const hasHead = document.querySelector("head") !== null;
  const hasBody = document.querySelector("body") !== null;
  const hasMain = document.querySelector("main") !== null;
  const hasHeader = document.querySelector("header") !== null;
  const hasFooter = document.querySelector("footer") !== null;
  const hasNav = document.querySelector("nav") !== null;

  let hasErrors = false;

  // Validar etiquetas requeridas
  Object.keys(requiredTags).forEach((tag) => {
    if (requiredTags[tag] === 0) {
      console.error(
        `Error en ${filePath}: Falta la etiqueta requerida <${tag}>.`
      );
      hasErrors = true;
    } else if (emptyTags[tag] > 0) {
      console.warn(
        `Advertencia en ${filePath}: La etiqueta <${tag}> está vacía.`
      );
    }
  });

  // Validar estructura y semántica
  if (!hasHead) {
    console.error(`Error en ${filePath}: Falta la etiqueta <head>.`);
    hasErrors = true;
  }
  if (!hasBody) {
    console.error(`Error en ${filePath}: Falta la etiqueta <body>.`);
    hasErrors = true;
  }
  if (!hasMain) {
    console.warn(
      `Advertencia en ${filePath}: Se recomienda incluir una etiqueta <main>.`
    );
  }
  if (!hasHeader) {
    console.warn(
      `Advertencia en ${filePath}: Se recomienda incluir una etiqueta <header>.`
    );
  }
  if (!hasFooter) {
    console.warn(
      `Advertencia en ${filePath}: Se recomienda incluir una etiqueta <footer>.`
    );
  }
  if (!hasNav) {
    console.warn(
      `Advertencia en ${filePath}: Se recomienda incluir una etiqueta <nav>.`
    );
  }

  return hasErrors;
}
// Función para buscar y validar todos los archivos HTML en el directorio
function validateAllHtmlFiles(dir) {
  const files = fs.readdirSync(dir);

  let globalHasErrors = false;

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      // Si es un directorio, validar recursivamente
      globalHasErrors = validateAllHtmlFiles(filePath) || globalHasErrors;
    } else if (filePath.endsWith(".html")) {
      // Si es un archivo HTML, validarlo
      const hasErrors = validateHtmlFile(filePath);
      globalHasErrors = hasErrors || globalHasErrors;
    }
  });

  return globalHasErrors;
}

// Ejecutar la validación
const hasErrors = validateAllHtmlFiles("./"); // Asume que el script se ejecuta desde la raíz del proyecto

if (hasErrors) {
  process.exit(1); // Fallar si hay errores
} else {
  console.log("All required tags are present in all HTML files.");
}
