"use strict";

(() => {
  const panels = Array.from(document.querySelectorAll("[data-page-panel]"));
  const panelById = new Map(panels.map((panel) => [panel.dataset.pagePanel, panel]));
  const navigationLinks = Array.from(document.querySelectorAll("[data-page-nav]"));
  const footer = document.querySelector("[data-site-footer]");
  const pageLabels = new Map([
    ["inicio", "Inicio"],
    ["plantas", "Plantas nativas"],
    ["aprende", "Formación"],
    ["colectivos", "Colectivos"],
    ["agenda", "Agenda"],
    ["aliados", "Aliados"],
    ["participa", "Participa"],
    ["prototipo", "Acerca"],
  ]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const groupDialog = document.getElementById("group-dialog");
  const groupDialogContent = document.getElementById("group-dialog-content");
  const statusToast = document.getElementById("status-toast");
  const statusMessage = document.getElementById("status-message");
  const groupSearch = document.getElementById("group-search");
  const groupCards = Array.from(document.querySelectorAll("[data-group-card]"));
  const groupCount = document.getElementById("group-count");
  const groupEmpty = document.getElementById("group-empty");
  const interests = new Set();
  let activeFilter = "Todos";
  let lastDialogOpener = null;
  let activePage = "inicio";

  function showPage(id, options = {}) {
    if (!panelById.has(id)) return;
    activePage = id;
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.pagePanel !== id;
    });
    navigationLinks.forEach((link) => {
      const isCurrent = link.hash === `#${id}`;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      link.classList.toggle("main-nav__active", isCurrent && link.closest("nav") !== null);
    });
    if (footer) footer.hidden = id === "inicio";
    document.title = `EcoTij · ${pageLabels.get(id) || "Comunidad ecológica de Tijuana"}`;

    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    }
    if (options.focus) {
      window.requestAnimationFrame(() => {
        panelById.get(id)?.querySelector("[data-page-heading]")?.focus({ preventScroll: true });
      });
    }
  }

  function pageFromHash() {
    const requested = window.location.hash.slice(1);
    return panelById.has(requested) ? requested : "inicio";
  }

  showPage(pageFromHash(), { scroll: false });
  window.addEventListener("hashchange", () => {
    const requested = window.location.hash.slice(1);
    if (panelById.has(requested)) showPage(requested, { focus: true });
    else if (!requested) showPage("inicio", { focus: true });
  });

  function announce(message) {
    if (!statusToast || !statusMessage) return;
    statusMessage.textContent = message;
    statusToast.hidden = false;
  }

  document.getElementById("status-close")?.addEventListener("click", () => {
    statusToast.hidden = true;
    statusMessage.textContent = "";
  });

  function normalize(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX").trim();
  }

  function filterGroups() {
    const query = normalize(groupSearch?.value || "");
    let visibleCount = 0;
    groupCards.forEach((card) => {
      const matchesCategory = activeFilter === "Todos" || card.dataset.category === activeFilter;
      const matchesText = normalize(card.dataset.search || "").includes(query);
      const visible = matchesCategory && matchesText;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (groupCount) groupCount.textContent = String(visibleCount);
    if (groupEmpty) groupEmpty.hidden = visibleCount > 0;
  }

  groupSearch?.addEventListener("input", filterGroups);
  document.querySelectorAll("[data-group-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.groupFilter || "Todos";
      document.querySelectorAll("[data-group-filter]").forEach((chip) => {
        const selected = chip === button;
        chip.classList.toggle("filter-chip--active", selected);
        chip.setAttribute("aria-pressed", String(selected));
      });
      filterGroups();
    });
  });
  document.getElementById("clear-group-search")?.addEventListener("click", () => {
    if (groupSearch) groupSearch.value = "";
    activeFilter = "Todos";
    document.querySelectorAll("[data-group-filter]").forEach((chip) => {
      const selected = chip.dataset.groupFilter === "Todos";
      chip.classList.toggle("filter-chip--active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    filterGroups();
    groupSearch?.focus();
  });

  function updateInterestButtons(id) {
    const selected = interests.has(id);
    document.querySelectorAll("[data-interest-id]").forEach((button) => {
      if (button.dataset.interestId !== id) return;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("button--selected", selected);
      if (selected) button.classList.remove("button--primary");
      else button.classList.add("button--primary");
      const label = button.querySelector("[data-interest-label]");
      if (label) {
        label.textContent = selected
          ? (button.dataset.interestSelected || "Me interesa")
          : (button.dataset.interestDefault || "Marcar interés");
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const interestButton = target.closest("[data-interest-id]");
    if (interestButton) {
      const id = interestButton.dataset.interestId;
      if (!id) return;
      const label = interestButton.dataset.interestSelected || interestButton.dataset.interestDefault || "esta opción";
      if (interests.has(id)) {
        interests.delete(id);
        announce(`Quitaste “${label}” de tu lista de interés de esta sesión.`);
      } else {
        interests.add(id);
        announce(`Marcaste “${label}” como una opción de interés. No se envió ni guardó información.`);
      }
      updateInterestButtons(id);
      return;
    }

    const demoButton = target.closest("[data-demo-message]");
    if (demoButton) {
      announce(demoButton.dataset.demoMessage || "Selección temporal; no se guardó ni envió ningún dato.");
      return;
    }

    const topicButton = target.closest("[data-topic]");
    if (topicButton) {
      document.querySelectorAll("[data-topic]").forEach((button) => {
        const selected = button === topicButton;
        button.classList.toggle("interest-option--selected", selected);
        button.setAttribute("aria-pressed", String(selected));
        const existingCheck = button.querySelector("[data-topic-check]");
        if (existingCheck) existingCheck.remove();
        if (selected) {
          const check = document.createElement("span");
          check.dataset.topicCheck = "true";
          check.setAttribute("aria-hidden", "true");
          check.textContent = "✓";
          button.append(check);
        }
      });
      announce(`Seleccionaste “${topicButton.dataset.topic}”. Tu respuesta es temporal y no se envió a ningún sitio.`);
      return;
    }

    const openButton = target.closest("[data-open-group]");
    if (openButton) {
      const template = document.getElementById(`group-template-${openButton.dataset.openGroup}`);
      if (!(template instanceof HTMLTemplateElement) || !groupDialog || !groupDialogContent) return;
      lastDialogOpener = openButton;
      groupDialogContent.replaceChildren(template.content.cloneNode(true));
      const profileInterest = groupDialogContent.querySelector("[data-interest-id]");
      if (profileInterest?.dataset.interestId) updateInterestButtons(profileInterest.dataset.interestId);
      groupDialog.showModal();
      groupDialog.querySelector("[data-close-dialog]")?.focus();
      return;
    }

    if (target.closest("[data-close-dialog]") && groupDialog?.open) {
      groupDialog.close();
    }
  });

  groupDialog?.addEventListener("click", (event) => {
    if (event.target === groupDialog) groupDialog.close();
  });
  groupDialog?.addEventListener("close", () => {
    groupDialogContent?.replaceChildren();
    lastDialogOpener?.focus();
    lastDialogOpener = null;
  });
})();
