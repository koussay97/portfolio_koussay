export async function initTemplates() {
    const templateElements = document.querySelectorAll('[data-template]');

    const loadPromises = Array.from(templateElements).map(async (el) => {
        const templateName = el.getAttribute('data-template');
        try {
            const response = await fetch(`./templates/${templateName}.html`);
            if (!response.ok) throw new Error(`Failed to load template: ${templateName}`);
            const html = await response.text();
            el.innerHTML = html;
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
        }
    });

    await Promise.all(loadPromises);
}
