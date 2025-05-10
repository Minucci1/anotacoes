console.log("Anotacoes Script V9 - Polimento Visual - Carregado");

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM (mantendo a maioria das suas seleções originais)
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const htmlElement = document.documentElement;
    // const currentYearSpan = document.getElementById('currentYear'); // Removido se não existir no HTML
    const searchInput = document.getElementById('searchInput');
    // const toastContainer = document.getElementById('toastContainer'); // Re-obtido em showToast
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarDesktopBtn = document.getElementById('toggleSidebarDesktopBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtnMobile = document.getElementById('closeSidebarBtnMobile');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    const sidebarTitleH2 = sidebar ? sidebar.querySelector('h2.sidebar-title') : null;
    const addFolderBtnSidebar = sidebar ? sidebar.querySelector('#addFolderBtn') : null;

    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteModal = document.getElementById('noteModal');
    const modalDialogNote = document.getElementById('modalDialogNote');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const noteForm = document.getElementById('noteForm');
    // const modalTitle = document.getElementById('modalTitle'); // Re-obtido em openModal
    // const noteIdInput = document.getElementById('noteId'); // Re-obtido em openModal/handleNoteFormSubmit
    // const noteTitleInput = document.getElementById('noteTitle'); // Re-obtido
    // const noteContentInput = document.getElementById('noteContent'); // Re-obtido
    const noteColorInput = document.getElementById('noteColor'); // Usado globalmente para valor padrão
    const colorSelector = document.getElementById('colorSelector');
    const noteFontSelector = document.getElementById('noteFont');
    // const noteFolderSelector = document.getElementById('noteFolder'); // Re-obtido em populateFolderSelector/handleNoteFormSubmit
    
    // Removido: notesContainer e noNotesMessage daqui, pois são re-obtidos nas funções que os utilizam
    // const notesContainer = document.getElementById('notesContainer');
    // const noNotesMessage = document.getElementById('noNotesMessage');
    const noteTemplate = document.getElementById('noteTemplate'); // Essencial globalmente

    const folderModal = document.getElementById('folderModal');
    // const modalDialogFolder = document.getElementById('modalDialogFolder'); // Re-obtido
    const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    const folderForm = document.getElementById('folderForm');
    // const folderModalTitle = document.getElementById('folderModalTitle'); // Re-obtido
    // const folderIdInput = document.getElementById('folderId'); // Re-obtido
    // const folderNameInput = document.getElementById('folderName'); // Re-obtido
    const folderList = document.getElementById('folderList');
    const folderItemTemplate = document.getElementById('folderItemTemplate'); // Essencial globalmente
    const currentFolderNameDisplay = document.getElementById('currentFolderName');
    // const metaThemeColor = document.getElementById('metaThemeColor'); // Re-obtido em applyTheme


    // Estado da Aplicação
    let notes = [];
    let folders = [];
    let currentEditingNoteId = null;
    let currentEditingFolderId = null;
    let selectedColorInModal = '#FEF9C3'; // Cor padrão inicial
    let selectedFontInModal = "'Inter', sans-serif"; // Fonte padrão inicial
    let activeFolderId = 'all';
    let draggedNoteId = null;
    let placeholder = null;
    let currentSearchTerm = '';
    let isSidebarCollapsed = false;

    // --- FUNÇÕES ---

    function saveStateToLocalStorage() {
        try {
            localStorage.setItem('anotacoes_notes_v9', JSON.stringify(notes));
            localStorage.setItem('anotacoes_folders_v9', JSON.stringify(folders));
            localStorage.setItem('anotacoes_active_folder_v9', activeFolderId);
            localStorage.setItem('anotacoes_sidebar_collapsed_v9', String(isSidebarCollapsed));
        } catch (e) { console.error("Erro ao salvar estado no localStorage:", e); }
    }

    function loadStateFromLocalStorage() {
        const storedNotes = localStorage.getItem('anotacoes_notes_v9');
        const storedFolders = localStorage.getItem('anotacoes_folders_v9');
        const storedActiveFolder = localStorage.getItem('anotacoes_active_folder_v9');
        const storedSidebarCollapsed = localStorage.getItem('anotacoes_sidebar_collapsed_v9');

        if (storedNotes) {
            try {
                notes = JSON.parse(storedNotes); if (!Array.isArray(notes)) notes = [];
                notes.forEach((note, index) => { if (typeof note.order !== 'number') note.order = index; if (note.folderId === undefined) note.folderId = null; });
            } catch (e) { console.error("Erro ao analisar notas do localStorage:", e); notes = []; }
        } else { notes = []; }

        if (storedFolders) {
            try {
                folders = JSON.parse(storedFolders); if (!Array.isArray(folders)) folders = [];
            } catch (e) { console.error("Erro ao analisar pastas do localStorage:", e); folders = []; }
        } else { folders = []; }

        activeFolderId = storedActiveFolder || 'all';
        isSidebarCollapsed = storedSidebarCollapsed === 'true';
    }

    function applySidebarState() {
        if (!sidebar || !mainContent || !toggleSidebarDesktopBtn) {
            // console.warn("applySidebarState: Elementos da sidebar não encontrados.");
            return;
        }
        const sidebarTexts = sidebar.querySelectorAll('.sidebar-text');
        const toggleIcon = toggleSidebarDesktopBtn.querySelector('i');
        const addFolderBtnTextSpan = addFolderBtnSidebar ? addFolderBtnSidebar.querySelector('.sidebar-text') : null;

        sidebar.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        mainContent.style.transition = 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        if (isSidebarCollapsed) {
            sidebar.classList.remove('lg:w-64', 'sidebar-expanded');
            sidebar.classList.add('lg:w-20', 'sidebar-collapsed');
            mainContent.classList.remove('lg:ml-64');
            mainContent.classList.add('lg:ml-20');
            if (sidebarTitleH2) sidebarTitleH2.classList.add('opacity-0', 'lg:scale-90', 'lg:w-0', 'pointer-events-none', 'lg:invisible');
            if (addFolderBtnTextSpan) addFolderBtnTextSpan.classList.add('lg:hidden');
            sidebarTexts.forEach(text => text.classList.add('opacity-0', 'lg:hidden', 'pointer-events-none'));
            if (toggleIcon) { toggleIcon.classList.remove('fa-chevron-left'); toggleIcon.classList.add('fa-chevron-right'); }
            if (toggleSidebarDesktopBtn) toggleSidebarDesktopBtn.title = "Expandir Barra Lateral";
        } else {
            sidebar.classList.remove('lg:w-20', 'sidebar-collapsed');
            sidebar.classList.add('lg:w-64', 'sidebar-expanded');
            mainContent.classList.remove('lg:ml-20');
            mainContent.classList.add('lg:ml-64');
            if (sidebarTitleH2) sidebarTitleH2.classList.remove('opacity-0', 'lg:scale-90', 'lg:w-0', 'pointer-events-none', 'lg:invisible');
            if (addFolderBtnTextSpan) addFolderBtnTextSpan.classList.remove('lg:hidden');
            sidebarTexts.forEach(text => text.classList.remove('opacity-0', 'lg:hidden', 'pointer-events-none'));
            if (toggleIcon) { toggleIcon.classList.remove('fa-chevron-right'); toggleIcon.classList.add('fa-chevron-left'); }
            if (toggleSidebarDesktopBtn) toggleSidebarDesktopBtn.title = "Recolher Barra Lateral";
        }
    }

    function toggleSidebar() {
        isSidebarCollapsed = !isSidebarCollapsed;
        applySidebarState();
        saveStateToLocalStorage();
    }

    function openSidebarMobile() {
        if (!sidebar || !sidebarOverlay) return;
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0', 'shadow-2xl');
        sidebarOverlay.classList.remove('hidden');
        requestAnimationFrame(() => sidebarOverlay.classList.remove('opacity-0'));
    }

    function closeSidebarMobile() {
        if (!sidebar || !sidebarOverlay) return;
        sidebar.classList.remove('translate-x-0', 'shadow-2xl');
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('opacity-0');
        setTimeout(() => { sidebarOverlay.classList.add('hidden'); }, 300);
    }

    function renderFolders() {
        if (!folderList || !folderItemTemplate || !folderItemTemplate.content) {
            // console.warn("renderFolders: Elementos da lista de pastas ou template não encontrados.");
            return;
        }
        const generatedFolders = folderList.querySelectorAll('.folder-item[data-folder-id]:not([data-folder-id="all"])');
        generatedFolders.forEach(f => f.remove());
        folders.forEach(folder => {
            const template = folderItemTemplate.content.cloneNode(true);
            const folderLink = template.querySelector('.folder-item');
            const folderNameSpan = template.querySelector('.sidebar-text');
            if (folderLink && folderNameSpan) {
                folderLink.dataset.folderId = String(folder.id);
                folderNameSpan.textContent = folder.name;
                folderLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    setActiveFolder(folder.id);
                    if (window.innerWidth < 1024) closeSidebarMobile();
                });
                folderList.appendChild(template);
            }
        });
        updateActiveFolderVisual();
        applySidebarState();
    }

    function setActiveFolder(folderIdParam) {
        activeFolderId = (folderIdParam === 'all' || folderIdParam === null || folderIdParam === "") ? 'all' : parseInt(folderIdParam);
        updateActiveFolderVisual();
        renderNotes(); // Chamar renderNotes após definir a pasta ativa
        saveStateToLocalStorage();
        if (currentFolderNameDisplay) {
            if (activeFolderId === 'all') {
                currentFolderNameDisplay.textContent = "Todas as Anotações";
            } else {
                const folder = folders.find(f => f.id === activeFolderId);
                currentFolderNameDisplay.textContent = folder ? folder.name : "Pasta Desconhecida";
            }
        }
    }

    function updateActiveFolderVisual() {
        if (!folderList) return;
        const allFolderItems = folderList.querySelectorAll('.folder-item');
        allFolderItems.forEach(item => {
            item.classList.remove('active', 'bg-sky-100', 'dark:bg-slate-700', 'font-semibold', 'text-sky-700', 'dark:text-sky-300', 'shadow-inner');
            const icon = item.querySelector('i');
            if (icon) {
                icon.classList.remove('text-sky-600', 'dark:text-sky-300');
                icon.classList.add('text-sky-500', 'dark:text-sky-400');
            }
            if (item.dataset.folderId === String(activeFolderId)) {
                item.classList.add('active', 'bg-sky-100', 'dark:bg-slate-700', 'font-semibold', 'text-sky-700', 'dark:text-sky-300', 'shadow-inner');
                if (icon) {
                    icon.classList.remove('text-sky-500', 'dark:text-sky-400');
                    icon.classList.add('text-sky-600', 'dark:text-sky-300');
                }
            }
        });
    }

    function populateFolderSelector() {
        const localNoteFolderSelector = document.getElementById('noteFolder');
        if (!localNoteFolderSelector) {
            // console.warn("populateFolderSelector: Seletor de pastas no modal não encontrado.");
            return;
        }
        const currentSelection = localNoteFolderSelector.value;
        localNoteFolderSelector.innerHTML = '<option value="">Sem Pasta</option>';
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = String(folder.id);
            option.textContent = folder.name;
            localNoteFolderSelector.appendChild(option);
        });
        if (currentSelection) { // Restaurar seleção se houver
            localNoteFolderSelector.value = currentSelection;
        }
    }

    function renderNotes() {
        const localNotesContainer = document.getElementById('notesContainer');
        const localNoNotesMessage = document.getElementById('noNotesMessage');
        // noteTemplate é global

        if (!localNotesContainer || !noteTemplate || !noteTemplate.content || !localNoNotesMessage) {
            console.warn("renderNotes: Elementos essenciais (notesContainer, noteTemplate ou noNotesMessage) não encontrados. Renderização abortada.");
            if(localNotesContainer) localNotesContainer.innerHTML = ''; // Limpa para evitar notas antigas se a mensagem de erro for exibida
            if(localNoNotesMessage) localNoNotesMessage.classList.remove('hidden'); // Mostra mensagem de erro genérica se possível
            return;
        }

        const scrollTop = localNotesContainer.scrollTop;
        const searchTerm = currentSearchTerm.toLowerCase().trim();
        let notesToDisplay = notes;

        if (activeFolderId !== 'all') {
            notesToDisplay = notesToDisplay.filter(note =>
                String(note.folderId) === String(activeFolderId) ||
                (activeFolderId === null && (note.folderId === null || note.folderId === ""))
            );
        }

        if (searchTerm) {
            notesToDisplay = notesToDisplay.filter(note =>
                (note.title && note.title.toLowerCase().includes(searchTerm)) ||
                (note.content && note.content.toLowerCase().includes(searchTerm))
            );
        }

        const existingNoteElements = new Map();
        localNotesContainer.querySelectorAll('.note-card').forEach(el => {
            if (el.dataset.id) existingNoteElements.set(el.dataset.id, el);
        });

        const fragment = document.createDocumentFragment();
        const currentNoteIdsInDisplay = new Set();

        if (notesToDisplay.length === 0) {
            if (searchTerm && notes.length > 0) {
                localNoNotesMessage.textContent = `Nenhuma anotação encontrada para "${currentSearchTerm}".`;
            } else if (notes.length === 0) {
                localNoNotesMessage.innerHTML = `Nenhuma anotação por aqui. <br>Clique em "Criar Nova Anotação" para começar!`;
            } else if (activeFolderId !== 'all' && notes.length > 0) {
                const folder = folders.find(f => String(f.id) === String(activeFolderId));
                localNoNotesMessage.textContent = `Nenhuma anotação nesta pasta${folder ? ': ' + folder.name : ''}.`;
            } else {
                localNoNotesMessage.innerHTML = `Nenhuma anotação para exibir.`;
            }
            localNoNotesMessage.classList.remove('hidden');
        } else {
            localNoNotesMessage.classList.add('hidden');
        }

        const sortedNotes = [...notesToDisplay].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            const orderA = typeof a.order === 'number' ? a.order : Infinity;
            const orderB = typeof b.order === 'number' ? b.order : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return b.lastModified - a.lastModified; // Mais recente primeiro
        });

        sortedNotes.forEach(note => {
            const noteIdStr = String(note.id);
            currentNoteIdsInDisplay.add(noteIdStr);
            let noteElement = existingNoteElements.get(noteIdStr);

            if (noteElement) {
                noteElement.classList.remove('note-card-leaving', 'note-card-entering');
                // Reaplicar estilos dinâmicos
                updateNoteElementStyle(noteElement, note); // Função auxiliar para atualizar estilo
                fragment.appendChild(noteElement);
                existingNoteElements.delete(noteIdStr);
            } else {
                noteElement = createNoteElement(note);
                if (noteElement) {
                    fragment.appendChild(noteElement);
                    requestAnimationFrame(() => {
                        noteElement.classList.add('note-card-entering');
                    });
                }
            }
        });

        existingNoteElements.forEach((el, id) => {
            if (!currentNoteIdsInDisplay.has(id)) {
                el.classList.remove('note-card-entering');
                el.classList.add('note-card-leaving');
                el.addEventListener('animationend', () => el.remove(), { once: true });
            }
        });

        localNotesContainer.innerHTML = '';
        localNotesContainer.appendChild(fragment);
        localNotesContainer.scrollTop = scrollTop; // Restaurar posição do scroll
    }
    
    function updateNoteElementStyle(noteCard, note) {
        // Função auxiliar para centralizar atualização de estilos de uma nota existente
        const pinIcon = noteCard.querySelector('.pin-note-btn i');
        const localHtmlElement = document.documentElement;
        const isAppDark = localHtmlElement && localHtmlElement.classList.contains('dark');
        const isDarkNoteBg = isColorDark(note.color || '#FEF9C3');
        const pinActiveColor = isAppDark ? (isDarkNoteBg ? '#fde047' : '#eab308') : (isDarkNoteBg ? '#facc15' : '#ca8a04');

        noteCard.style.borderColor = note.pinned ? pinActiveColor : 'transparent';
        if (note.pinned) {
            noteCard.classList.add('pinned-note-visual');
            noteCard.style.setProperty('--pin-highlight-color', pinActiveColor);
            noteCard.style.setProperty('--pin-highlight-color-dark', pinActiveColor);
        } else {
            noteCard.classList.remove('pinned-note-visual');
            noteCard.style.removeProperty('--pin-highlight-color');
            noteCard.style.removeProperty('--pin-highlight-color-dark');
        }
        if (pinIcon) pinIcon.style.color = note.pinned ? pinActiveColor : (isDarkNoteBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
        // Atualizar outros estilos se necessário (cor do texto, etc.)
        applyTextAndBorderColorsToNoteCard(noteCard, note.color || '#FEF9C3');
    }


    function applyTheme(theme) {
        const localHtmlElement = document.documentElement;
        if (!localHtmlElement) return;
        localHtmlElement.classList.remove('light', 'dark');
        localHtmlElement.classList.add(theme);
        try {
            localStorage.setItem('anotacoes_theme_v9', theme);
            const localMetaThemeColor = document.getElementById('metaThemeColor');
            if (localMetaThemeColor) {
                localMetaThemeColor.content = theme === 'dark' ? '#0b1120' : '#0ea5e9';
            }
        } catch (e) { console.error("Erro ao salvar tema no localStorage:", e); }
        if (typeof renderNotes === "function") renderNotes(); // Re-renderizar notas para aplicar cores de texto corretas
    }

    function isColorDark(hexColor) {
        if (!hexColor || typeof hexColor !== 'string' || hexColor.length < 4) return false;
        let r, g, b;
        let localHexColor = hexColor;
        if (localHexColor.startsWith('#')) localHexColor = localHexColor.slice(1);

        if (localHexColor.length === 3) { r = parseInt(localHexColor[0] + localHexColor[0], 16); g = parseInt(localHexColor[1] + localHexColor[1], 16); b = parseInt(localHexColor[2] + localHexColor[2], 16); }
        else if (localHexColor.length === 6) { r = parseInt(localHexColor.substring(0, 2), 16); g = parseInt(localHexColor.substring(2, 4), 16); b = parseInt(localHexColor.substring(4, 6), 16); }
        else { return false; } // Formato inválido

        const r_srgb = r / 255, g_srgb = g / 255, b_srgb = b / 255;
        const r_l = r_srgb <= 0.03928 ? r_srgb / 12.92 : Math.pow((r_srgb + 0.055) / 1.055, 2.4);
        const g_l = g_srgb <= 0.03928 ? g_srgb / 12.92 : Math.pow((g_srgb + 0.055) / 1.055, 2.4);
        const b_l = b_srgb <= 0.03928 ? b_srgb / 12.92 : Math.pow((b_srgb + 0.055) / 1.055, 2.4);
        return (0.2126 * r_l + 0.7152 * g_l + 0.0722 * b_l) <= 0.179; // Limiar de luminância para "escuro"
    }
    
    function applyTextAndBorderColorsToNoteCard(noteCard, noteBgColor) {
        const titleEl = noteCard.querySelector('.note-title');
        const contentEl = noteCard.querySelector('.note-content');
        const timestampEl = noteCard.querySelector('.note-timestamp');
        const integrationBtns = noteCard.querySelectorAll('.integration-btn');

        const localHtmlElement = document.documentElement;
        const isDarkNoteBg = isColorDark(noteBgColor);
        const isAppDark = localHtmlElement && localHtmlElement.classList.contains('dark');
        
        let primaryTextColor, secondaryTextColor, internalBorderColorValue;

        if (isDarkNoteBg) {
            primaryTextColor = 'rgba(226, 232, 240, 0.95)'; // slate-200 com opacidade
            secondaryTextColor = 'rgba(148, 163, 184, 0.85)'; // slate-400 com opacidade
            internalBorderColorValue = isAppDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(255, 255, 255, 0.2)'; // slate-600/white com opacidade
        } else {
            primaryTextColor = isAppDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(30, 41, 59, 0.9)'; // slate-900/slate-800 com opacidade
            secondaryTextColor = isAppDark ? 'rgba(51, 65, 85, 0.85)' : 'rgba(71, 85, 105, 0.75)'; // slate-700/slate-600 com opacidade
            internalBorderColorValue = isAppDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.9)'; // slate-700/slate-200 com opacidade
        }
        if (!isAppDark && noteBgColor.toUpperCase() === '#FFFFFF') { // Ajuste para card branco em tema claro
            primaryTextColor = 'rgba(30, 41, 59, 0.9)';    // slate-800
            secondaryTextColor = 'rgba(71, 85, 105, 0.75)';  // slate-600
            internalBorderColorValue = 'rgba(226, 232, 240, 0.9)'; // slate-200
        }

        if (titleEl) titleEl.style.color = primaryTextColor;
        if (contentEl) contentEl.style.color = primaryTextColor;
        if (timestampEl) timestampEl.style.color = secondaryTextColor;
        
        const internalBorders = noteCard.querySelectorAll('.note-integrations, .note-footer');
        internalBorders.forEach(b => b.style.borderColor = internalBorderColorValue);

        const actionButtons = noteCard.querySelectorAll('.action-btn:not(.integration-btn)');
        actionButtons.forEach(btn => btn.style.color = secondaryTextColor);
        integrationBtns.forEach(btn => { // Estilo base para botões de integração
            btn.style.color = secondaryTextColor;
            // btn.style.backgroundColor = isDarkNoteBg ? (isAppDark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.1)') : (isAppDark ? 'rgba(30,41,59,0.3)' : 'rgba(229,231,235,1)');
        });
    }


    function createNoteElement(note) {
        // noteTemplate é global
        if (!noteTemplate || !noteTemplate.content) {
            console.error("createNoteElement: Template da nota não encontrado.");
            return null;
        }
        const templateContent = noteTemplate.content.cloneNode(true);
        const noteCard = templateContent.querySelector('.note-card');
        if (!noteCard) {
            console.error("createNoteElement: .note-card não encontrado no template.");
            return null;
        }

        noteCard.dataset.id = String(note.id);
        noteCard.setAttribute('draggable', true);

        const titleEl = noteCard.querySelector('.note-title');
        const contentEl = noteCard.querySelector('.note-content');
        const timestampEl = noteCard.querySelector('.note-timestamp');
        const pinBtn = noteCard.querySelector('.pin-note-btn');
        const pinIcon = pinBtn ? pinBtn.querySelector('i') : null;
        const integrationBtns = noteCard.querySelectorAll('.integration-btn');

        if (titleEl) titleEl.textContent = note.title || '';
        if (contentEl) contentEl.textContent = note.content;
        if (timestampEl) timestampEl.textContent = new Date(note.lastModified).toLocaleString('pt-BR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const noteBgColor = note.color || '#FEF9C3'; // Cor de fundo padrão
        noteCard.style.backgroundColor = noteBgColor;
        const noteFontFamily = note.font || "'Inter', sans-serif"; // Fonte padrão
        if (titleEl) titleEl.style.fontFamily = noteFontFamily;
        if (contentEl) contentEl.style.fontFamily = noteFontFamily;

        applyTextAndBorderColorsToNoteCard(noteCard, noteBgColor); // Aplica cores de texto e bordas internas
        updateNoteElementStyle(noteCard, note); // Aplica estilos de fixação

        noteCard.addEventListener('dragstart', handleDragStart);
        noteCard.addEventListener('dragend', handleDragEnd);

        if (pinBtn) pinBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePinNote(note.id); });
        const copyBtn = noteCard.querySelector('.copy-note-btn');
        if (copyBtn) copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyNoteText(note.id); });
        const shareBtn = noteCard.querySelector('.share-note-btn');
        if (shareBtn) shareBtn.addEventListener('click', (e) => { e.stopPropagation(); shareNote(note.id); });
        const editBtn = noteCard.querySelector('.edit-note-btn');
        if (editBtn) editBtn.addEventListener('click', (e) => { e.stopPropagation(); openModalForEdit(note.id); });
        const deleteBtn = noteCard.querySelector('.delete-note-btn');
        if (deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteNote(note.id); });

        integrationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showToast(`Funcionalidade "${btn.title}" será implementada em breve!`, 'info');
            });
        });

        noteCard.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn') || e.target.closest('.pin-note-btn') || e.target.closest('.integration-btn')) {
                return; // Não abrir modal de edição se um botão de ação foi clicado
            }
            openModalForEdit(note.id);
        });
        return noteCard;
    }

    function openModalForEdit(noteId) {
        const noteToEdit = notes.find(n => n.id === noteId);
        if (noteToEdit) openModal(noteToEdit);
        else console.error("Nota para edição não encontrada:", noteId);
    }

    let colorOptions = []; // Cache das opções de cor
    function updateSelectedColorVisual(selectedOptionElement) {
        const localColorSelector = document.getElementById('colorSelector');
        const currentOptions = localColorSelector ? Array.from(localColorSelector.querySelectorAll('.color-option')) : colorOptions; // Usa cache se DOM não disponível

        currentOptions.forEach(opt => {
            opt.classList.remove('selected');
            const checkIcon = opt.querySelector('i');
            if (checkIcon) checkIcon.style.display = 'none';
        });
        if (selectedOptionElement) {
            selectedOptionElement.classList.add('selected');
            const checkIcon = selectedOptionElement.querySelector('i');
            if (checkIcon) {
                const bgColor = selectedOptionElement.dataset.color;
                checkIcon.style.color = isColorDark(bgColor) ? 'white' : '#1e293b'; // Cor do ícone de check
                checkIcon.style.display = 'inline';
            }
        }
    }

    function setSelectedColorInModal(colorValue) {
        selectedColorInModal = colorValue || '#FEF9C3'; // Cor padrão
        const localNoteColorInput = document.getElementById('noteColor'); // Re-obtém para garantir
        if (localNoteColorInput) localNoteColorInput.value = selectedColorInModal;

        const localColorSelector = document.getElementById('colorSelector');
        const currentOptions = localColorSelector ? Array.from(localColorSelector.querySelectorAll('.color-option')) : colorOptions;

        if (currentOptions && currentOptions.length > 0) {
            const optionToSelect = currentOptions.find(opt => opt.dataset.color === selectedColorInModal);
            updateSelectedColorVisual(optionToSelect || currentOptions[0]); // Seleciona a primeira se a cor não for encontrada
        }
    }

    function setSelectedFontInModal(fontValue) {
        selectedFontInModal = fontValue || "'Inter', sans-serif"; // Fonte padrão
        const localNoteFontSelector = document.getElementById('noteFont'); // Re-obtém
        if (localNoteFontSelector) localNoteFontSelector.value = selectedFontInModal;
    }

    function setSelectedFolderInModal(folderId) {
        const localNoteFolderSelector = document.getElementById('noteFolder'); // Re-obtém
        if (localNoteFolderSelector) {
            localNoteFolderSelector.value = folderId === null || folderId === undefined ? "" : String(folderId);
        }
    }

    function openModal(note = null) {
        console.log('Tentando abrir modal. Nota:', note ? note.id : 'Nova'); // DEBUG
        // Re-obter elementos do DOM para garantir que estão corretos no momento da chamada
        const currentNoteModal = document.getElementById('noteModal');
        const currentNoteForm = document.getElementById('noteForm');
        const currentModalDialog = document.getElementById('modalDialogNote');
        const currentModalTitle = document.getElementById('modalTitle');
        const currentNoteIdInput = document.getElementById('noteId');
        const currentNoteTitleInput = document.getElementById('noteTitle');
        const currentNoteContentInput = document.getElementById('noteContent');

        if (!currentNoteModal || !currentNoteForm || !currentModalDialog || !currentModalTitle || !currentNoteIdInput || !currentNoteTitleInput || !currentNoteContentInput) {
            console.error("Erro Crítico: Elementos essenciais do modal de anotação não foram encontrados no DOM. O modal não pode ser aberto.");
            showToast("Erro ao abrir formulário de anotação. Verifique o console.", 'error');
            return;
        }

        populateFolderSelector(); // Popular pastas antes de definir valores

        currentNoteForm.reset(); // Limpa o formulário
        if (note) { // Editando nota existente
            currentModalTitle.textContent = 'Editar Anotação';
            currentNoteIdInput.value = note.id;
            currentNoteTitleInput.value = note.title || '';
            currentNoteContentInput.value = note.content;
            setSelectedColorInModal(note.color);
            setSelectedFontInModal(note.font);
            setSelectedFolderInModal(note.folderId);
            currentEditingNoteId = note.id;
        } else { // Nova nota
            currentModalTitle.textContent = 'Nova Anotação';
            currentNoteIdInput.value = ''; // Garante que não há ID
            setSelectedColorInModal('#FEF9C3'); // Cor padrão para nova nota
            setSelectedFontInModal("'Inter', sans-serif"); // Fonte padrão
            setSelectedFolderInModal(activeFolderId !== 'all' ? activeFolderId : null); // Pré-seleciona pasta ativa
            currentEditingNoteId = null;
        }

        currentNoteModal.classList.remove('hidden');
        void currentNoteModal.offsetWidth; // Força reflow para animação de opacidade
        currentNoteModal.classList.remove('opacity-0');
        currentModalDialog.classList.remove('scale-95', 'opacity-0');
        currentModalDialog.classList.add('scale-100', 'opacity-100');

        if (currentNoteContentInput) currentNoteContentInput.focus(); // Foco no campo de conteúdo
        console.log('Modal de anotação aberto.'); // DEBUG
    }

    function closeModal() {
        const currentNoteModal = document.getElementById('noteModal'); // Re-obter
        const currentModalDialog = document.getElementById('modalDialogNote'); // Re-obter
        if (!currentNoteModal || !currentModalDialog) {
            // console.warn("closeModal: Elementos do modal de anotação não encontrados.");
            return;
        }

        currentNoteModal.classList.add('opacity-0');
        currentModalDialog.classList.remove('scale-100', 'opacity-100');
        currentModalDialog.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            currentNoteModal.classList.add('hidden');
        }, 300); // Tempo da transição CSS
        currentEditingNoteId = null;
    }

    function openFolderModal(folder = null) {
        const currentFolderModal = document.getElementById('folderModal');
        const currentFolderForm = document.getElementById('folderForm');
        const currentModalDialogFolder = document.getElementById('modalDialogFolder');
        const currentFolderModalTitle = document.getElementById('folderModalTitle');
        const currentFolderIdInput = document.getElementById('folderId');
        const currentFolderNameInput = document.getElementById('folderName');

        if (!currentFolderModal || !currentFolderForm || !currentModalDialogFolder || !currentFolderModalTitle || !currentFolderIdInput || !currentFolderNameInput) {
            console.error("Erro Crítico: Elementos do modal de pasta não encontrados.");
            showToast("Erro ao abrir formulário de pasta.", 'error');
            return;
        }

        currentFolderForm.reset();
        if (folder) {
            currentFolderModalTitle.textContent = 'Editar Pasta';
            currentFolderIdInput.value = folder.id;
            currentFolderNameInput.value = folder.name;
            currentEditingFolderId = folder.id;
        } else {
            currentFolderModalTitle.textContent = 'Nova Pasta';
            currentFolderIdInput.value = '';
            currentEditingFolderId = null;
        }
        currentFolderModal.classList.remove('hidden');
        void currentFolderModal.offsetWidth;
        currentFolderModal.classList.remove('opacity-0');
        currentModalDialogFolder.classList.remove('scale-95', 'opacity-0');
        currentModalDialogFolder.classList.add('scale-100', 'opacity-100');
        if (currentFolderNameInput) currentFolderNameInput.focus();
    }

    function closeFolderModal() {
        const currentFolderModal = document.getElementById('folderModal');
        const currentModalDialogFolder = document.getElementById('modalDialogFolder');
        if (!currentFolderModal || !currentModalDialogFolder) return;

        currentFolderModal.classList.add('opacity-0');
        currentModalDialogFolder.classList.remove('scale-100', 'opacity-100');
        currentModalDialogFolder.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            currentFolderModal.classList.add('hidden');
        }, 300);
        currentEditingFolderId = null;
    }
    
    function loadStateAndApplyTheme() {
        loadStateFromLocalStorage();
        const localHtmlElement = document.documentElement;
        const storedTheme = localStorage.getItem('anotacoes_theme_v9') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (localHtmlElement) applyTheme(storedTheme);
        renderFolders();
        applySidebarState(); // Aplicar estado da sidebar (recolhida/expandida)
        setActiveFolder(activeFolderId); // Isso também chamará renderNotes
    }

    function reassignOrder() { // Chamado após exclusão ou drag-drop para manter a ordem consistente
        const tempNotes = [...notes].sort((a, b) => { // Re-sort baseado em fixado, ordem manual, e data
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            const orderA = typeof a.order === 'number' ? a.order : Infinity;
            const orderB = typeof b.order === 'number' ? b.order : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return b.lastModified - a.lastModified; // Fallback para data
        });
        notes = tempNotes.map((note, index) => ({ ...note, order: index }));
    }

    function handleNoteFormSubmit(event) {
        event.preventDefault();
        const currentNoteTitleInput = document.getElementById('noteTitle');
        const currentNoteContentInput = document.getElementById('noteContent');
        const currentNoteColorInput = document.getElementById('noteColor'); // O input hidden
        const currentNoteFontSelector = document.getElementById('noteFont');
        const currentNoteFolderSelector = document.getElementById('noteFolder');

        if (!currentNoteTitleInput || !currentNoteContentInput || !currentNoteColorInput || !currentNoteFontSelector || !currentNoteFolderSelector) {
            showToast("Erro ao salvar. Elementos do formulário não encontrados.", "error");
            return;
        }

        const title = currentNoteTitleInput.value.trim();
        const content = currentNoteContentInput.value.trim();
        // Usa selectedColorInModal como fallback se o input hidden não tiver valor (não deveria acontecer)
        const color = currentNoteColorInput.value || selectedColorInModal;
        const font = currentNoteFontSelector.value || selectedFontInModal;
        const folderIdValue = currentNoteFolderSelector.value;
        const folderId = folderIdValue === "" ? null : parseInt(folderIdValue);

        if (!content) {
            showToast('O conteúdo da Anotação não pode estar vazio!', 'error');
            if (currentNoteContentInput) currentNoteContentInput.focus();
            return;
        }

        const timestamp = Date.now();
        let actionType = 'adicionada';
        if (currentEditingNoteId) { // Editando
            const noteIndex = notes.findIndex(note => note.id === currentEditingNoteId);
            if (noteIndex > -1) {
                notes[noteIndex] = {
                    ...notes[noteIndex], // Preserva pinned, createdDate, order
                    title, content, color, font, folderId,
                    lastModified: timestamp
                };
                actionType = 'atualizada';
            } else {
                 showToast('Erro ao atualizar: Anotação não encontrada.', 'error'); return;
            }
        } else { // Nova nota
            const newNote = {
                id: timestamp, title, content, color, font, folderId,
                createdDate: timestamp, lastModified: timestamp, pinned: false,
                order: notes.length // Adiciona ao final da lista de ordem
            };
            notes.push(newNote);
        }
        reassignOrder(); // Garante que a ordem está correta, especialmente se uma nova nota foi adicionada
        saveStateToLocalStorage();
        renderNotes();
        closeModal();
        showToast(`Anotação ${actionType} com sucesso!`, 'success');
    }

    function handleFolderFormSubmit(event) {
        event.preventDefault();
        const currentFolderNameInput = document.getElementById('folderName');
        if (!currentFolderNameInput) {
            showToast("Erro ao criar pasta. Elemento não encontrado.", "error");
            return;
        }
        const name = currentFolderNameInput.value.trim();
        if (!name) {
            showToast('O nome da pasta não pode estar vazio!', 'error');
            if (currentFolderNameInput) currentFolderNameInput.focus();
            return;
        }
        if (folders.some(folder => folder.name.toLowerCase() === name.toLowerCase() && folder.id !== currentEditingFolderId )) { // Evita duplicidade
            showToast(`A pasta "${name}" já existe.`, 'error');
            return;
        }
        
        // Lógica para editar ou criar nova pasta (simplificada - seu código original só criava)
        // Para adicionar edição de pasta, você precisaria de uma lógica similar à de notas
        const newFolder = { id: Date.now(), name: name };
        folders.push(newFolder);
        saveStateToLocalStorage();
        renderFolders();
        populateFolderSelector(); // Atualiza o seletor no modal de notas
        closeFolderModal();
        showToast(`Pasta "${name}" criada com sucesso!`, 'success');
    }

    function deleteNote(id) {
        if (confirm('Tem certeza que deseja excluir esta Anotação?')) {
            deleteNoteWithAnimation(id);
        }
    }
    
    function deleteNoteWithAnimation(id) {
        const localNotesContainer = document.getElementById('notesContainer');
        const noteCard = localNotesContainer ? localNotesContainer.querySelector(`.note-card[data-id="${String(id)}"]`) : null;
        if (noteCard) {
            noteCard.classList.remove('note-card-entering');
            noteCard.classList.add('note-card-leaving');
            noteCard.addEventListener('animationend', () => {
                notes = notes.filter(note => note.id !== id);
                reassignOrder(); // Reajusta a ordem das notas restantes
                saveStateToLocalStorage();
                renderNotes(); // Re-renderiza a lista de notas
            }, { once: true });
            showToast('Anotação excluída.', 'info');
        } else { // Fallback se o elemento não estiver no DOM (raro, mas seguro)
            notes = notes.filter(note => note.id !== id);
            reassignOrder();
            saveStateToLocalStorage();
            renderNotes();
            showToast('Anotação excluída (sem animação).', 'info');
        }
    }

    function copyNoteText(id) {
        const note = notes.find(n => n.id === id);
        if (note && navigator.clipboard) {
            const textToCopy = `${note.title ? note.title + '\n\n' : ''}${note.content}`;
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast('Texto da Anotação copiado!', 'success'))
                .catch(err => { showToast('Falha ao copiar o texto.', 'error'); console.error("Erro ao copiar:", err); });
        } else if (!navigator.clipboard) {
            showToast('Cópia não suportada neste navegador.', 'error');
        }
    }

    async function shareNote(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            const shareData = { title: note.title || 'Anotação', text: `${note.title ? note.title + '\n\n' : ''}${note.content}` };
            try {
                if (navigator.share) { await navigator.share(shareData); }
                else { copyNoteText(id); showToast('Compartilhamento não suportado. Texto copiado para a área de transferência.', 'info'); }
            } catch (err) {
                if (err.name !== 'AbortError') { showToast('Falha ao tentar compartilhar.', 'error'); console.error("Erro ao compartilhar:", err); }
            }
        }
    }

    function togglePinNote(id) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex > -1) {
            notes[noteIndex].pinned = !notes[noteIndex].pinned;
            notes[noteIndex].lastModified = Date.now(); // Atualiza para reordenar
            reassignOrder(); // Garante que a ordem seja atualizada
            saveStateToLocalStorage();
            renderNotes(); // Re-renderiza para aplicar a nova ordem e estilo
            showToast(notes[noteIndex].pinned ? 'Anotação fixada!' : 'Anotação desafixada.', 'info');
        }
    }

    // Drag and Drop
    function handleDragStart(e) {
        if (e.target.classList.contains('note-card')) {
            draggedNoteId = parseInt(e.target.dataset.id);
            setTimeout(() => e.target.classList.add('dragging'), 0); // Adia para o navegador pintar primeiro
        }
    }
    function handleDragEnd(e) {
        if (e.target.classList.contains('note-card')) {
            e.target.classList.remove('dragging');
        }
        if (placeholder && placeholder.parentNode) placeholder.remove();
        placeholder = null;
        draggedNoteId = null;
    }
    function handleDragOver(e) {
        e.preventDefault(); // Necessário para permitir o drop
        const localNotesContainer = document.getElementById('notesContainer');
        if (!localNotesContainer) return;
        const draggingElement = localNotesContainer.querySelector('.dragging');
        if (!draggingElement) return;

        if (!placeholder) { // Criar placeholder se não existir
            placeholder = document.createElement('div');
            placeholder.classList.add('drag-over-placeholder');
            // Copiar dimensões e margens do elemento arrastado para o placeholder
            const computedStyle = window.getComputedStyle(draggingElement);
            placeholder.style.height = `${draggingElement.offsetHeight}px`;
            placeholder.style.width = `${draggingElement.offsetWidth}px`;
            ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(prop => {
                placeholder.style[prop] = computedStyle[prop];
            });
        }
        const afterElement = getDragAfterElement(localNotesContainer, e.clientY);
        if (afterElement == null) { // Se não houver elemento depois, anexa ao final
            if (!localNotesContainer.contains(placeholder) || localNotesContainer.lastChild !== placeholder) {
                 localNotesContainer.appendChild(placeholder);
            }
        } else { // Insere antes do elemento 'afterElement'
            if (!localNotesContainer.contains(placeholder) || afterElement.previousSibling !== placeholder) {
                 localNotesContainer.insertBefore(placeholder, afterElement);
            }
        }
    }
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.note-card:not(.dragging):not(.drag-over-placeholder)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2; // Distância do mouse ao centro do elemento filho
            if (offset < 0 && offset > closest.offset) { // Se o mouse está acima do centro, mas mais perto que o 'closest' anterior
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    function handleDrop(e) {
        e.preventDefault();
        if (placeholder && placeholder.parentNode) placeholder.remove();
        placeholder = null;
        if (draggedNoteId === null) return;

        const draggedNoteObject = notes.find(note => note.id === draggedNoteId);
        if (!draggedNoteObject) return;
        
        let tempNotesArray = notes.filter(note => note.id !== draggedNoteId); // Remove a nota arrastada temporariamente
        
        const localNotesContainer = document.getElementById('notesContainer');
        const afterElement = localNotesContainer ? getDragAfterElement(localNotesContainer, e.clientY) : null;
        
        let newLogicalIndex;
        if (afterElement) {
            const afterElementId = parseInt(afterElement.dataset.id);
            // Encontra o índice no array temporário (sem a nota arrastada)
            newLogicalIndex = tempNotesArray.findIndex(note => note.id === afterElementId);
            if(newLogicalIndex === -1) newLogicalIndex = tempNotesArray.length; // Fallback
        } else {
            newLogicalIndex = tempNotesArray.length; // Adiciona ao final
        }

        tempNotesArray.splice(newLogicalIndex, 0, draggedNoteObject); // Insere a nota arrastada na nova posição
        notes = tempNotesArray.map((note, index) => ({ ...note, order: index, lastModified: Date.now() }));

        saveStateToLocalStorage();
        renderNotes(); // Re-renderiza com a nova ordem visual
        draggedNoteId = null;
        showToast('Ordem das anotações atualizada!', 'info');
    }


    function showToast(message, type = 'info', duration = 3500) {
        const localToastContainer = document.getElementById('toastContainer');
        if (!localToastContainer) {
            console.warn("showToast: Container de toasts não encontrado.");
            return;
        }
        const toast = document.createElement('div');
        toast.classList.add('toast', type);
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-circle';
        toast.innerHTML = `<i class="toast-icon ${iconClass}"></i> <span class="flex-grow">${message}</span>`;
        localToastContainer.appendChild(toast);
        requestAnimationFrame(() => { toast.classList.add('show'); }); // Para animação
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                if (toast.parentNode) toast.remove();
            }, { once: true });
        }, duration);
    }

    // --- INICIALIZAÇÃO ---
    // if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear(); // Removido se 'currentYearSpan' não existir

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const localHtmlElement = document.documentElement;
            const newTheme = localHtmlElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    } else { console.warn("Botão de alternar tema não encontrado."); }

    if (sidebar) {
        if (toggleSidebarDesktopBtn) toggleSidebarDesktopBtn.addEventListener('click', toggleSidebar); else console.warn("Botão toggleSidebarDesktopBtn não encontrado.");
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebarMobile); else console.warn("Botão hamburgerBtn não encontrado.");
        if (closeSidebarBtnMobile) closeSidebarBtnMobile.addEventListener('click', closeSidebarMobile); else console.warn("Botão closeSidebarBtnMobile não encontrado.");
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMobile); else console.warn("SidebarOverlay não encontrado.");
    } else { console.warn("Elemento sidebar não encontrado."); }


    if (colorSelector) {
        colorOptions = Array.from(colorSelector.querySelectorAll('.color-option')); // Cache inicial
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedColorInModal = option.dataset.color;
                const localNoteColorInput = document.getElementById('noteColor'); // Re-obtém
                if (localNoteColorInput) localNoteColorInput.value = selectedColorInModal;
                updateSelectedColorVisual(option);
            });
        });
    } else { console.warn("Seletor de cores (#colorSelector) não encontrado."); }

    if (noteFontSelector) {
        noteFontSelector.addEventListener('change', (e) => {
            selectedFontInModal = e.target.value;
        });
    } else { console.warn("Seletor de fontes (#noteFont) não encontrado."); }


    // Listeners para o Modal de Notas
    console.log('Verificando #addNoteBtn:', addNoteBtn); // DEBUG
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => {
            console.log('#addNoteBtn CLICADO - chamando openModal()'); // DEBUG
            openModal(); // Abre para nova nota
        });
    } else {
        console.error('ERRO CRÍTICO: Botão #addNoteBtn não encontrado! O modal de notas não poderá ser aberto.');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal); else console.warn("Botão #closeModalBtn não encontrado.");
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal); else console.warn("Botão #cancelModalBtn não encontrado.");
    
    if (noteModal) { // Listener para fechar clicando fora do conteúdo do modal
        noteModal.addEventListener('click', (event) => {
            if (event.target === noteModal) closeModal();
        });
    } else { console.warn("Elemento #noteModal não encontrado."); }

    if (noteForm) noteForm.addEventListener('submit', handleNoteFormSubmit); else console.warn("Formulário #noteForm não encontrado.");

    // Listeners para o Modal de Pastas
    if (addFolderBtnSidebar) addFolderBtnSidebar.addEventListener('click', () => openFolderModal()); else console.warn("Botão #addFolderBtn (sidebar) não encontrado.");
    if (closeFolderModalBtn) closeFolderModalBtn.addEventListener('click', closeFolderModal); else console.warn("Botão #closeFolderModalBtn não encontrado.");
    if (cancelFolderBtn) cancelFolderBtn.addEventListener('click', closeFolderModal); else console.warn("Botão #cancelFolderBtn não encontrado.");

    if (folderModal) {
        folderModal.addEventListener('click', (event) => {
            if (event.target === folderModal) closeFolderModal();
        });
    } else { console.warn("Elemento #folderModal não encontrado."); }

    if (folderForm) folderForm.addEventListener('submit', handleFolderFormSubmit); else console.warn("Formulário #folderForm não encontrado.");

    // Listener para o item "Todas as Anotações"
    const allNotesFolderItem = folderList ? folderList.querySelector('.folder-item[data-folder-id="all"]') : null;
    if (allNotesFolderItem) {
        allNotesFolderItem.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveFolder('all');
            if (window.innerWidth < 1024) closeSidebarMobile();
        });
    } else { console.warn("Item de pasta 'Todas as Anotações' não encontrado."); }

    // Listeners para Drag and Drop no notesContainer
    const localNotesContainerForDrag = document.getElementById('notesContainer');
    if (localNotesContainerForDrag) {
        localNotesContainerForDrag.addEventListener('dragover', handleDragOver);
        localNotesContainerForDrag.addEventListener('drop', handleDrop);
    } else { console.warn("Container de notas (#notesContainer) não encontrado para drag and drop."); }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            renderNotes();
        });
    } else { console.warn("Campo de busca (#searchInput) não encontrado."); }
    
    // Carregar estado inicial e aplicar tema
    loadStateAndApplyTheme();

    console.log("Anotacoes App V9 (Polimento Visual) inicializado e pronto.");
});