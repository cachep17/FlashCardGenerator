// Global State Management
class FlashCardApp {
  constructor() {
    this.flashcards = [];
    this.currentCardIndex = 0;
    this.cardFlipped = false;
    this.sets = JSON.parse(localStorage.getItem('flashcardSets')) || {};
    this.currentSet = null;
    this.studyMode = false;
    this.userAnswer = '';
    this.showAnswer = false;
    this.answeredCards = [];
    this.correctAnswers = 0;
    this.language = localStorage.getItem('language') || 'en';
    this.theme = localStorage.getItem('theme') || 'light';
    this.currentView = 'upload';

    this.initializeApp();
  }

  initializeApp() {
    this.setupEventListeners();
    this.setupLanguage();
    this.setupTheme();
    this.updateUI();
    this.setupAnimations();
  }

  setupEventListeners() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initEventHandlers();
      });
    } else {
      this.initEventHandlers();
    }

    // Scroll effects
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  initEventHandlers() {
    this.setupNavigation();
    this.setupTabNavigation();
    this.setupFileUpload();
    this.setupGenerator();
    this.setupFlashcardViewer();
    this.setupSetsManager();
    this.setupLanguageSelector();
    this.setupThemeToggle();
  }

  setupLanguageSelector() {
    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = this.language;
      languageSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }

  setupThemeToggle() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  setupNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
  }

  setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Remove active class from all tabs and panes
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab and corresponding pane
        btn.classList.add('active');
        const targetPane = document.getElementById(targetTab);
        if (targetPane) {
          targetPane.classList.add('active');
          this.currentView = targetTab;
          this.updateUI();
        }
      });
    });
  }

  setupFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    if (uploadZone && fileInput) {
      uploadZone.addEventListener('click', () => fileInput.click());

      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
      });

      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
      });

      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleFileUpload(files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }
  }

  setupGenerator() {
    const generateBtn = document.getElementById('generateBtn');
    const numCardsSlider = document.getElementById('numCards');
    const rangeValue = document.querySelector('.range-value');

    if (numCardsSlider && rangeValue) {
      numCardsSlider.addEventListener('input', (e) => {
        rangeValue.textContent = e.target.value;
      });
    }

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateFlashcards();
      });
    }
  }

  setupFlashcardViewer() {
    const flipBtn = document.getElementById('flipBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const studyModeBtn = document.getElementById('studyModeBtn');
    const editModeBtn = document.getElementById('editModeBtn');
    const flashcard = document.getElementById('flashcard');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const correctBtn = document.getElementById('correctBtn');
    const incorrectBtn = document.getElementById('incorrectBtn');
    const saveSetBtn = document.getElementById('saveSetBtn');

    if (flipBtn) {
      console.log('Setting up flip button event listener');
      flipBtn.addEventListener('click', () => {
        console.log('Flip button clicked');
        this.flipCard();
      });
    } else {
      console.log('Flip button not found');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousCard());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextCard());
    }

    if (studyModeBtn) {
      studyModeBtn.addEventListener('click', () => this.toggleStudyMode());
    }

    if (flashcard) {
      console.log('Setting up flashcard click event listener');
      flashcard.addEventListener('click', () => {
        console.log('Flashcard clicked');
        this.flipCard();
      });
    } else {
      console.log('Flashcard element not found for event listener');
    }

    if (checkAnswerBtn) {
      checkAnswerBtn.addEventListener('click', () => this.checkAnswer());
    }

    if (correctBtn) {
      correctBtn.addEventListener('click', () => this.markCorrect());
    }

    if (incorrectBtn) {
      incorrectBtn.addEventListener('click', () => this.markIncorrect());
    }

    if (saveSetBtn) {
      saveSetBtn.addEventListener('click', () => this.saveSet());
    }
  }

  setupSetsManager() {
    this.updateSetsDisplay();
  }

  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .set-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  async handleFileUpload(file) {
    if (!file) return;

    // Validate file using the file extractor
    try {
      fileExtractor.validateFile(file);
    } catch (error) {
      this.showNotification(error.message, 'error');
      return;
    }

    this.showLoading(true);
    this.updateProgressText('Extracting content from file...');

    try {
      // Set up progress callback
      fileExtractor.updateProgress = (message) => {
        this.updateProgressText(message);
      };
      
      // Extract content using the file extractor
      const extractedData = await fileExtractor.extractContent(file);
      
      const contentTextarea = document.getElementById('contentText');
      if (contentTextarea) {
        contentTextarea.value = extractedData.content;
      }

      // Show success message with file info
      let successMessage = `Successfully extracted content from ${file.name}`;
      if (extractedData.pages) {
        successMessage += ` (${extractedData.pages} pages)`;
      } else if (extractedData.slides) {
        successMessage += ` (${extractedData.slides} slides)`;
      }

      this.showNotification(successMessage, 'success');

      // Switch to text tab to show extracted content
      const textTab = document.querySelector('[data-tab="text"]');
      if (textTab) {
        textTab.click();
      }

      // Auto-populate subject field if possible
      this.autoPopulateSubject(extractedData.content);

    } catch (error) {
      console.error('File extraction error:', error);
      this.showNotification(error.message || 'Error extracting content from file', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async generateFlashcards() {
    const contentText = document.getElementById('contentText').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const numCards = parseInt(document.getElementById('numCards').value);

    if (!contentText) {
      this.showNotification('Please provide content to generate flashcards', 'error');
      return;
    }

    // Check if API key is available
    if (!window.config || !window.config.hasValidApiKey()) {
      this.showNotification('API key not configured properly. Please check configuration.', 'error');
      // Fallback to sample cards for demo
      this.createSampleCards(subject, numCards);
      return;
    }

    this.showLoading(true);

    try {
      // Test API connection first
      console.log('Testing API connection before generating flashcards...');
      const connectionTest = await window.config.testApiConnection();
      if (!connectionTest) {
        throw new Error('API connection test failed');
      }

      // Generate flashcards using Gemini API
      const flashcards = await this.generateWithGemini(contentText, subject, numCards);

      if (!flashcards || flashcards.length === 0) {
        throw new Error('No flashcards were generated');
      }

      this.flashcards = flashcards;
      this.currentCardIndex = 0;
      this.cardFlipped = false;
      this.resetStudyMode();

      console.log(`Successfully created ${this.flashcards.length} flashcards:`, this.flashcards);

      this.showNotification(`Successfully created ${this.flashcards.length} flashcards!`, 'success');

      // Switch to view tab
      const viewTab = document.querySelector('[data-tab="view"]');
      if (viewTab) {
        viewTab.click();
      }

      // Update display immediately
      this.updateUI();

    } catch (error) {
      console.error('Generation error:', error);
      this.showNotification('Error generating flashcards. Using sample cards for demo.', 'error');

      // Fallback to sample cards for demo
      this.createSampleCards(subject, numCards);
    } finally {
      this.showLoading(false);
    }
  }

  async generateWithGemini(content, subject, numCards) {
    const prompt = this.createPrompt(content, subject, numCards);

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    console.log('Sending request to Gemini API...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${window.config.GEMINI_API_URL}?key=${window.config.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API Response:', data);

    // Check if response has the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      console.error('Invalid candidate structure:', candidate);
      throw new Error('Invalid content structure in API response');
    }

    const generatedText = candidate.content.parts[0].text;

    if (!generatedText || generatedText.trim() === '') {
      console.error('Empty generated text');
      throw new Error('No content generated from Gemini API');
    }

    console.log('Generated text received:', generatedText);

    const flashcards = this.parseFlashcards(generatedText);

    if (!flashcards || flashcards.length === 0) {
      throw new Error('No valid flashcards could be parsed from the response');
    }

    return flashcards;
  }

  createPrompt(content, subject, numCards) {
    const languageInstruction = this.language === 'vi' ?
      'Tạo câu hỏi và câu trả lời bằng tiếng Việt' :
      'Create questions and answers in English';

    return `${languageInstruction}. Based on the following content about ${subject || 'the given topic'}, create exactly ${numCards} flashcards. 

Content: ${content}

IMPORTANT: You must respond with ONLY a valid JSON array in this exact format, with no additional text, explanations, or markdown formatting:

[
  {
    "front": "Question here",
    "back": "Answer here"
  },
  {
    "front": "Another question",
    "back": "Another answer"
  }
]

Requirements:
- Return ONLY the JSON array, no other text
- Create exactly ${numCards} flashcards
- Each flashcard must have "front" and "back" properties
- Questions should be clear and educational
- Answers should be concise but complete
- Focus on key concepts and important information
- Vary the types of questions (definitions, explanations, examples, etc.)

Do not include any text before or after the JSON array. Start your response immediately with [ and end with ].`;
  }

  parseFlashcards(generatedText) {
    try {
      console.log('Raw generated text:', generatedText);

      // Clean up the generated text - remove markdown code blocks if present
      let cleanText = generatedText.trim();

      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');

      // Try to find JSON array in the text
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      console.log('Cleaned text for parsing:', cleanText);

      const flashcards = JSON.parse(cleanText);

      // Validate flashcards structure
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }

      if (flashcards.length === 0) {
        throw new Error('No flashcards generated');
      }

      // Validate each flashcard
      const validFlashcards = flashcards.filter(card => {
        return card &&
          typeof card === 'object' &&
          card.front &&
          card.back &&
          typeof card.front === 'string' &&
          typeof card.back === 'string';
      });

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards found in response');
      }

      console.log(`Successfully parsed ${validFlashcards.length} flashcards`);

      return validFlashcards.map(card => ({
        front: card.front.trim(),
        back: card.back.trim()
      }));

    } catch (error) {
      console.error('Error parsing flashcards:', error);
      console.error('Original text:', generatedText);

      // Try to extract flashcards using regex as fallback
      return this.fallbackParseFlashcards(generatedText);
    }
  }

  fallbackParseFlashcards(generatedText) {
    try {
      console.log('Attempting fallback parsing...');

      // Try to find question-answer pairs using various patterns
      const patterns = [
        // Pattern 1: "Question: ... Answer: ..."
        /(?:Question|Q):\s*(.+?)(?:\n|\r\n)(?:Answer|A):\s*(.+?)(?:\n|\r\n|$)/gi,
        // Pattern 2: "Front: ... Back: ..."
        /(?:Front|Question):\s*(.+?)(?:\n|\r\n)(?:Back|Answer):\s*(.+?)(?:\n|\r\n|$)/gi,
        // Pattern 3: Numbers or bullets
        /\d+\.\s*(.+?)(?:\n|\r\n)(.+?)(?:\n|\r\n|$)/gi
      ];

      let flashcards = [];

      for (const pattern of patterns) {
        const matches = [...generatedText.matchAll(pattern)];
        if (matches.length > 0) {
          flashcards = matches.map(match => ({
            front: match[1].trim(),
            back: match[2].trim()
          }));
          break;
        }
      }

      if (flashcards.length === 0) {
        // Last resort: create sample cards
        console.log('No patterns matched, creating sample cards');
        throw new Error('Could not parse any flashcards from response');
      }

      console.log(`Fallback parsing found ${flashcards.length} flashcards`);
      return flashcards;

    } catch (error) {
      console.error('Fallback parsing failed:', error);
      this.showNotification('Error parsing AI response. Please try again or check your content.', 'error');
      return [];
    }
  }

  loadSet(setName) {
    if (this.sets[setName]) {
      this.flashcards = [...this.sets[setName]];
      this.currentCardIndex = 0;
      this.cardFlipped = false;
      this.resetStudyMode();

      // Switch to view tab
      const viewTab = document.querySelector('[data-tab="view"]');
      if (viewTab) {
        viewTab.click();
      }

      this.updateFlashcardDisplay();
      this.showNotification(`Loaded set "${setName}" with ${this.flashcards.length} cards`, 'success');
    }
  }

  loadSetAndStudy(setName) {
    this.loadSet(setName);
    setTimeout(() => {
      this.toggleStudyMode();
    }, 100);
  }

  deleteSet(setName) {
    if (confirm(`Are you sure you want to delete the set "${setName}"?`)) {
      delete this.sets[setName];
      localStorage.setItem('flashcardSets', JSON.stringify(this.sets));

      this.updateSetsDisplay();
      this.showNotification(`Deleted set "${setName}"`, 'success');
    }
  }

  resetStudyMode() {
    this.userAnswer = '';
    this.showAnswer = false;
    this.answeredCards = [];
    this.correctAnswers = 0;
    this.cardFlipped = false;
  }

  flipCard() {
    console.log('flipCard called, current state:', this.cardFlipped);
    this.cardFlipped = !this.cardFlipped;
    console.log('flipCard new state:', this.cardFlipped);
    this.updateFlashcardDisplay();
  }

  nextCard() {
    if (this.currentCardIndex < this.flashcards.length - 1) {
      this.currentCardIndex++;
      this.cardFlipped = false;
      this.updateFlashcardDisplay();
    }
  }

  previousCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.cardFlipped = false;
      this.updateFlashcardDisplay();
    }
  }

  toggleStudyMode() {
    this.studyMode = !this.studyMode;
    this.updateUI();
  }

  checkAnswer() {
    this.showAnswer = true;
    this.updateStudyInterface();
  }

  markCorrect() {
    this.correctAnswers++;
    this.answeredCards.push(this.currentCardIndex);
    this.nextCard();
    this.showAnswer = false;
    this.updateStudyInterface();
  }

  markIncorrect() {
    this.answeredCards.push(this.currentCardIndex);
    this.nextCard();
    this.showAnswer = false;
    this.updateStudyInterface();
  }

  saveSet() {
    const setNameInput = document.getElementById('setName');
    const setName = setNameInput ? setNameInput.value.trim() : '';

    if (!setName) {
      this.showNotification('Please enter a set name', 'error');
      return;
    }

    if (this.flashcards.length === 0) {
      this.showNotification('No flashcards to save', 'error');
      return;
    }

    if (this.sets[setName]) {
      if (!confirm(`A set named "${setName}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }

    // Save flashcards to sets
    this.sets[setName] = [...this.flashcards];
    localStorage.setItem('flashcardSets', JSON.stringify(this.sets));

    // Clear input
    if (setNameInput) {
      setNameInput.value = '';
    }

    this.updateSetsDisplay();
    this.showNotification(`Set "${setName}" saved successfully!`, 'success');
  }

  saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const apiKey = input?.value?.trim();

    if (apiKey && window.config.setApiKey(apiKey)) {
      this.showNotification('API key saved successfully!', 'success');
      this.updateApiKeyStatus();
      document.querySelector('.api-key-dialog')?.remove();
    } else {
      this.showNotification('Please enter a valid API key', 'error');
    }
  }

  setupLanguage() {
    // Initialize language manager if available
    if (window.languageManager) {
      languageManager.setLanguage(this.language);
    }

    // Update language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = this.language;
    }
  }

  setupTheme() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }

  updateUI() {
    this.updateFlashcardDisplay();
    this.updateSetsDisplay();
    this.updateStats();
    this.updateControls();
    this.updateStudyInterface();
  }

  updateFlashcardDisplay() {
    const cardFront = document.getElementById('cardFront');
    const cardBack = document.getElementById('cardBack');
    const flashcard = document.getElementById('flashcard');
    const currentCard = this.flashcards[this.currentCardIndex];

    if (cardFront && cardBack) {
      if (currentCard) {
        cardFront.textContent = currentCard.front;
        cardBack.textContent = currentCard.back;
      } else {
        cardFront.textContent = 'Click Generate to create flashcards';
        cardBack.textContent = 'Answer will appear here';
      }
    }

    // Apply flip effect
    if (flashcard) {
      console.log('Applying flip effect, cardFlipped:', this.cardFlipped);
      if (this.cardFlipped) {
        flashcard.classList.add('flipped');
        console.log('Added flipped class');
      } else {
        flashcard.classList.remove('flipped');
        console.log('Removed flipped class');
      }
    } else {
      console.log('Flashcard element not found');
    }

    // Update stats
    this.updateStats();
    this.updateControls();
    this.updateStudyInterface();
  }

  updateSetsDisplay() {
    const setsGrid = document.getElementById('setsGrid');
    const totalSetsSpan = document.getElementById('totalSets');
    const totalCardsSpan = document.getElementById('totalCardsInSets');

    if (!setsGrid) return;

    const setNames = Object.keys(this.sets);
    const totalCards = Object.values(this.sets).reduce((sum, cards) => sum + cards.length, 0);

    if (totalSetsSpan) {
      const setsText = window.languageManager ?
        languageManager.getText('sets_text') : 'sets';
      totalSetsSpan.textContent = `${setNames.length} ${setsText}`;
    }
    if (totalCardsSpan) {
      const cardsText = window.languageManager ?
        languageManager.getText('cards_text') : 'cards';
      totalCardsSpan.textContent = `${totalCards} ${cardsText}`;
    }

    if (setNames.length === 0) {
      const noSetsText = window.languageManager ? languageManager.getText('no_sets') : 'No saved sets yet';
      const noSetsDescText = window.languageManager ? languageManager.getText('no_sets_desc') : 'Create and save some flashcards first!';

      setsGrid.innerHTML = `
        <div class="no-sets">
          <i class="fas fa-folder-open"></i>
          <p>${noSetsText}</p>
          <p>${noSetsDescText}</p>
        </div>
      `;
      return;
    }

    setsGrid.innerHTML = setNames.map(setName => {
      const cards = this.sets[setName];
      const cardsText = window.languageManager ?
        languageManager.getText('cards_text') : 'cards';
      const viewText = window.languageManager ?
        languageManager.getText('view_btn') || 'View' : 'View';
      const studyText = window.languageManager ?
        languageManager.getText('study_btn') || 'Study' : 'Study';

      return `
        <div class="set-card">
          <div class="set-info">
            <h4>${setName}</h4>
            <p>${cards.length} ${cardsText}</p>
          </div>
          <div class="set-actions">
            <button class="btn btn-secondary" onclick="app.loadSet('${setName}')">
              <i class="fas fa-eye"></i> ${viewText}
            </button>
            <button class="btn btn-primary" onclick="app.loadSetAndStudy('${setName}')">
              <i class="fas fa-brain"></i> ${studyText}
            </button>
            <button class="btn btn-danger" onclick="app.deleteSet('${setName}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  loadSet(setName) {
    if (this.sets[setName]) {
      this.flashcards = [...this.sets[setName]];
      this.currentCardIndex = 0;
      this.cardFlipped = false;
      this.resetStudyMode();

      // Switch to view tab
      const viewTab = document.querySelector('[data-tab="view"]');
      if (viewTab) {
        viewTab.click();
      }

      this.updateFlashcardDisplay();
      this.showNotification(`Loaded set "${setName}" with ${this.flashcards.length} cards`, 'success');
    }
  }

  updateStats() {
    const totalCards = document.getElementById('totalCards');
    const currentCard = document.getElementById('currentCard');
    const progress = document.getElementById('progress');

    if (totalCards) totalCards.textContent = this.flashcards.length;
    if (currentCard) currentCard.textContent = this.flashcards.length > 0 ? this.currentCardIndex + 1 : 0;

    if (this.studyMode && this.flashcards.length > 0) {
      const progressPercent = (this.answeredCards.length / this.flashcards.length * 100).toFixed(0);
      if (progress) progress.textContent = `${progressPercent}%`;
    } else {
      if (progress) progress.textContent = '0%';
    }
  }

  updateControls() {
    const hasCards = this.flashcards.length > 0;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const flipBtn = document.getElementById('flipBtn');

    if (prevBtn) prevBtn.disabled = !hasCards;
    if (nextBtn) nextBtn.disabled = !hasCards;
    if (flipBtn) flipBtn.disabled = !hasCards; // Remove the study mode restriction
  }

  updateStudyInterface() {
    const studyInterface = document.getElementById('studyInterface');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const assessmentButtons = document.getElementById('assessmentButtons');
    const studyModeBtn = document.getElementById('studyModeBtn');

    if (studyInterface) {
      studyInterface.style.display = this.studyMode ? 'block' : 'none';
    }

    if (studyModeBtn) {
      const exitStudyText = window.languageManager ?
        languageManager.getText('exit_study') || 'Exit Study' : 'Exit Study';
      const studyModeText = window.languageManager ?
        languageManager.getText('study_mode') || 'Study Mode' : 'Study Mode';

      studyModeBtn.innerHTML = this.studyMode ?
        `<i class="fas fa-times"></i> ${exitStudyText}` :
        `<i class="fas fa-brain"></i> ${studyModeText}`;
    }

    if (this.studyMode) {
      if (checkAnswerBtn) {
        checkAnswerBtn.style.display = this.showAnswer ? 'none' : 'block';
      }
      if (assessmentButtons) {
        assessmentButtons.style.display = this.showAnswer ? 'flex' : 'none';
      }
    }
  }

  showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.toggle('show', show);
    }
  }

  updateProgressText(text) {
    const progressText = document.querySelector('.progress-text');
    const loadingText = document.querySelector('[data-lang="loading_text"]');
    
    if (progressText) {
      progressText.textContent = text;
    }
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  autoPopulateSubject(content) {
    const subjectInput = document.getElementById('subject');
    if (!subjectInput || subjectInput.value.trim()) {
      return; // Don't override if already has value
    }

    // Simple subject detection based on content keywords
    const subjects = {
      'biology': ['cell', 'dna', 'protein', 'organism', 'evolution', 'genetics'],
      'chemistry': ['molecule', 'atom', 'chemical', 'reaction', 'compound', 'element'],
      'physics': ['force', 'energy', 'motion', 'quantum', 'wave', 'particle'],
      'mathematics': ['equation', 'formula', 'theorem', 'proof', 'calculate', 'function'],
      'history': ['century', 'war', 'empire', 'revolution', 'ancient', 'medieval'],
      'literature': ['author', 'novel', 'poem', 'character', 'theme', 'metaphor'],
      'computer science': ['algorithm', 'programming', 'software', 'database', 'network', 'code']
    };

    const contentLower = content.toLowerCase();
    let bestMatch = '';
    let maxScore = 0;

    for (const [subject, keywords] of Object.entries(subjects)) {
      const score = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = contentLower.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = subject;
      }
    }

    if (bestMatch && maxScore > 2) {
      subjectInput.value = bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1);
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('.notification-text');

    if (notification && notificationText) {
      notificationText.textContent = message;
      notification.className = `notification ${type} show`;

      setTimeout(() => {
        notification.classList.remove('show');
      }, 4000);
    }
  }

  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem('language', lang);

    // Update language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = lang;
    }

    // Use the language manager to update UI
    if (window.languageManager) {
      languageManager.setLanguage(lang);

      // Update placeholders for input elements
      this.updatePlaceholders();

      this.showNotification(`Language changed to ${lang === 'en' ? 'English' : 'Tiếng Việt'}`, 'success');
    }
  }

  updatePlaceholders() {
    if (!window.languageManager) return;

    // Update input placeholders
    const placeholderElements = [
      { id: 'contentText', key: 'text_placeholder' },
      { id: 'subject', key: 'subject_placeholder' },
      { id: 'setName', key: 'set_name_placeholder' },
      { id: 'userAnswer', key: 'answer_placeholder' }
    ];

    placeholderElements.forEach(({ id, key }) => {
      const element = document.getElementById(id);
      if (element) {
        element.placeholder = languageManager.getText(key);
      }
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
    this.showNotification(`Switched to ${this.theme} theme`, 'success');
  }

  updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      if (this.theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }

  createSampleCards(subject, numCards) {
    const sampleCards = [];
    const cardCount = Math.min(numCards, 5); // Limit sample cards

    // Create sample cards based on subject or generic ones
    for (let i = 1; i <= cardCount; i++) {
      if (subject && subject.toLowerCase().includes('math')) {
        sampleCards.push({
          front: `What is ${i * 2} + ${i * 3}?`,
          back: `${i * 2 + i * 3}`
        });
      } else if (subject && subject.toLowerCase().includes('history')) {
        sampleCards.push({
          front: `Sample History Question ${i}`,
          back: `Sample History Answer ${i}`
        });
      } else {
        sampleCards.push({
          front: `Sample Question ${i}${subject ? ` about ${subject}` : ''}`,
          back: `Sample Answer ${i}${subject ? ` related to ${subject}` : ''}`
        });
      }
    }

    this.flashcards = sampleCards;
    this.currentCardIndex = 0;
    this.cardFlipped = false;
    this.resetStudyMode();

    // Switch to view tab
    const viewTab = document.querySelector('[data-tab="view"]');
    if (viewTab) {
      viewTab.click();
    }

    this.updateFlashcardDisplay();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FlashCardApp();
});

// Utility Functions
function scrollToGenerator() {
  const generatorSection = document.getElementById('generator');
  if (generatorSection) {
    generatorSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function showDemo() {
  // Implement demo functionality
  alert('Demo feature coming soon!');
}
