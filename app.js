// フリーランスセラピストアカデミー - アプリケーションロジック

class AcademyApp {
  constructor() {
    this.currentLesson = 1;
    this.totalLessons = 5;
    this.surveyData = {};
    this.init();
  }

  init() {
    // Load saved progress
    this.loadProgress();
    
    // Setup event listeners for all survey forms
    for (let i = 1; i <= this.totalLessons; i++) {
      const form = document.getElementById(`survey${i}`);
      if (form) {
        form.addEventListener('submit', (e) => this.handleSurveySubmit(e, i));
      }
    }

    // Show current lesson
    this.showLesson(this.currentLesson);
    this.updateProgress();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  showLesson(lessonNumber) {
    // Hide all lessons and completion screen
    document.querySelectorAll('.lesson-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById('completionScreen').classList.remove('active');

    // Show current lesson or completion screen
    if (lessonNumber > this.totalLessons) {
      document.getElementById('completionScreen').classList.add('active');
    } else {
      const lessonSection = document.getElementById(`lesson${lessonNumber}`);
      if (lessonSection) {
        lessonSection.classList.add('active');
      }
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');
      
      if (stepNumber < this.currentLesson) {
        step.classList.add('completed');
      } else if (stepNumber === this.currentLesson) {
        step.classList.add('active');
      }
    });
  }

  handleSurveySubmit(event, lessonNumber) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const surveyAnswers = {};

    // Collect all form data
    for (let [key, value] of formData.entries()) {
      surveyAnswers[key] = value;
    }

    // Save survey data
    this.surveyData[`lesson${lessonNumber}`] = {
      answers: surveyAnswers,
      completedAt: new Date().toISOString()
    };

    // Save progress
    this.saveProgress();

    // Move to next lesson
    this.currentLesson = lessonNumber + 1;
    this.saveProgress();
    
    // Show next lesson or completion
    this.showLesson(this.currentLesson);
    this.updateProgress();
  }

  previousLesson() {
    if (this.currentLesson > 1) {
      this.currentLesson--;
      this.showLesson(this.currentLesson);
      this.updateProgress();
    }
  }

  saveProgress() {
    const progressData = {
      currentLesson: this.currentLesson,
      surveyData: this.surveyData,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      localStorage.setItem('academyProgress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  loadProgress() {
    try {
      const savedProgress = localStorage.getItem('academyProgress');
      
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        this.currentLesson = progressData.currentLesson || 1;
        this.surveyData = progressData.surveyData || {};
        
        // Restore form data for completed lessons
        this.restoreFormData();
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      this.currentLesson = 1;
      this.surveyData = {};
    }
  }

  restoreFormData() {
    // Restore saved answers to forms
    Object.keys(this.surveyData).forEach(lessonKey => {
      const lessonData = this.surveyData[lessonKey];
      const answers = lessonData.answers;
      
      Object.keys(answers).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
          field.value = answers[fieldName];
        }
      });
    });
  }

  resetProgress() {
    if (confirm('本当に最初からやり直しますか？これまでの回答は削除されます。')) {
      localStorage.removeItem('academyProgress');
      this.currentLesson = 1;
      this.surveyData = {};
      
      // Clear all forms
      for (let i = 1; i <= this.totalLessons; i++) {
        const form = document.getElementById(`survey${i}`);
        if (form) {
          form.reset();
        }
      }
      
      this.showLesson(1);
      this.updateProgress();
    }
  }

  exportData() {
    // Export survey data as JSON for potential backend integration
    const exportData = {
      completedAt: new Date().toISOString(),
      lessons: this.surveyData
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new AcademyApp();
  });
} else {
  app = new AcademyApp();
}

// Add smooth scroll behavior for better UX
document.addEventListener('click', (e) => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  // Alt + Right Arrow: Next lesson
  if (e.altKey && e.key === 'ArrowRight') {
    const currentForm = document.querySelector('.lesson-section.active form');
    if (currentForm) {
      currentForm.requestSubmit();
    }
  }
  
  // Alt + Left Arrow: Previous lesson
  if (e.altKey && e.key === 'ArrowLeft') {
    if (app && app.currentLesson > 1) {
      app.previousLesson();
    }
  }
});

// Prevent accidental page close if user has started the course
window.addEventListener('beforeunload', (e) => {
  if (app && app.currentLesson > 1 && app.currentLesson <= app.totalLessons) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});
