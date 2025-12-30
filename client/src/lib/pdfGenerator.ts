/**
 * Utilitário para gerar PDF de e-books no navegador usando print
 * Abre uma janela formatada para impressão que pode ser salva como PDF
 */

export interface EbookPDFData {
  title: string;
  subtitle?: string;
  description?: string;
  chapters: Array<{
    number?: number;
    title: string;
    content: string;
  }>;
  conclusion?: string;
  callToAction?: string;
}

/**
 * Abre uma janela de impressão formatada para salvar o e-book como PDF
 * O usuário pode usar Ctrl+P ou o diálogo de impressão para salvar como PDF
 */
export function printEbookAsPDF(data: EbookPDFData): void {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    throw new Error(
      "Não foi possível abrir a janela de impressão. Verifique se popups estão habilitados."
    );
  }

  const chaptersHTML = data.chapters
    .map(
      (chapter, index) => `
      <div class="chapter" style="page-break-before: always;">
        <h2 style="color: #6b2fa8; margin-bottom: 1rem; font-size: 1.5rem;">
          ${chapter.number ?? index + 1}. ${chapter.title}
        </h2>
        <div class="chapter-content" style="text-align: justify; line-height: 1.8; color: #444;">
          ${formatContent(chapter.content)}
        </div>
      </div>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title} - E-book</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .cover {
          text-align: center;
          padding: 4rem 2rem;
          page-break-after: always;
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .cover h1 {
          color: #6b2fa8;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .cover .subtitle {
          color: #555;
          font-size: 1.25rem;
          font-style: italic;
          margin-bottom: 2rem;
        }
        
        .cover .description {
          color: #666;
          font-size: 1rem;
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        
        .cover .brand {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 2px solid #b8975a;
          color: #999;
          font-size: 0.9rem;
        }
        
        .toc {
          page-break-after: always;
          padding: 2rem 0;
        }
        
        .toc h2 {
          color: #6b2fa8;
          margin-bottom: 1.5rem;
          font-size: 1.75rem;
        }
        
        .toc ul {
          list-style: none;
          padding-left: 1rem;
        }
        
        .toc li {
          padding: 0.5rem 0;
          border-bottom: 1px dotted #ddd;
          color: #555;
        }
        
        .chapter {
          padding: 2rem 0;
        }
        
        .chapter h2 {
          color: #6b2fa8;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          border-bottom: 2px solid #b8975a;
          padding-bottom: 0.5rem;
        }
        
        .chapter-content {
          text-align: justify;
          line-height: 1.8;
        }
        
        .chapter-content p {
          margin-bottom: 1rem;
          text-indent: 2rem;
        }
        
        .conclusion {
          page-break-before: always;
          padding: 2rem 0;
        }
        
        .conclusion h2 {
          color: #6b2fa8;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        
        .cta {
          background: linear-gradient(135deg, #6b2fa8 0%, #8b5cf6 100%);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          margin-top: 2rem;
          text-align: center;
        }
        
        .cta h3 {
          margin-bottom: 1rem;
        }
        
        .footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 0.8rem;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .cover {
            min-height: 100vh;
          }
          
          .chapter {
            page-break-inside: avoid;
          }
          
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- Botão de impressão -->
      <div class="no-print" style="position: fixed; top: 1rem; right: 1rem; z-index: 1000;">
        <button onclick="window.print()" style="
          background: #6b2fa8;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        ">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <!-- Capa -->
      <div class="cover">
        <h1>${escapeHtml(data.title)}</h1>
        ${data.subtitle ? `<p class="subtitle">${escapeHtml(data.subtitle)}</p>` : ""}
        ${data.description ? `<p class="description">${escapeHtml(data.description)}</p>` : ""}
        <div class="brand">
          <p>Gerado por <strong>Elevare AI</strong></p>
          <p style="margin-top: 0.5rem;">${new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      <!-- Índice -->
      <div class="toc">
        <h2>Índice</h2>
        <ul>
          ${data.chapters
            .map(
              (chapter, index) => `
            <li>${chapter.number ?? index + 1}. ${escapeHtml(chapter.title)}</li>
          `
            )
            .join("")}
          ${data.conclusion ? "<li>Conclusão</li>" : ""}
        </ul>
      </div>

      <!-- Capítulos -->
      ${chaptersHTML}

      <!-- Conclusão -->
      ${
        data.conclusion
          ? `
        <div class="conclusion">
          <h2>Conclusão</h2>
          <div style="text-align: justify; line-height: 1.8;">
            ${formatContent(data.conclusion)}
          </div>
        </div>
      `
          : ""
      }

      <!-- Call to Action -->
      ${
        data.callToAction
          ? `
        <div class="cta">
          <h3>Próximos Passos</h3>
          <p>${escapeHtml(data.callToAction)}</p>
        </div>
      `
          : ""
      }

      <!-- Rodapé -->
      <div class="footer">
        <p>Este e-book foi gerado automaticamente pela plataforma Elevare AI</p>
        <p>© ${new Date().getFullYear()} Elevare AI - Todos os direitos reservados</p>
      </div>

      <script>
        // Auto-mostrar diálogo de impressão após carregar
        window.onload = function() {
          // Pequeno delay para garantir que o CSS carregou
          setTimeout(() => {
            // Não abre automaticamente para não frustrar o usuário
            // O botão está visível e claro
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Formata conteúdo de texto em parágrafos HTML
 */
function formatContent(content: string): string {
  return content
    .split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join("");
}
