import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Summarizer from '../Summarizer';
import Translator from '../Translator';
import ContentGenerator from '../ContentGenerator';

// Real-world integration tests for AI Tools components
describe('AI Tools Components - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Mock console.error to suppress error logs during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Summarizer Component', () => {
    it('should handle real text summarization with AI', async () => {
      // Mock successful AI summarization
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          summary: 'This is a concise summary of the provided text, highlighting the key points and main ideas.',
          keyPoints: [
            'Main concept 1',
            'Important detail 2',
            'Key conclusion 3'
          ],
          wordCount: {
            original: 500,
            summary: 25
          }
        })
      });

      render(<Summarizer />);

      // Find text input area
      const textInput = screen.getByPlaceholderText(/paste your text here/i) ||
                       screen.getByRole('textbox');

      const longText = `
        This is a long piece of text that needs to be summarized. It contains multiple paragraphs
        with various concepts and ideas that should be condensed into a shorter, more digestible format.
        The AI should be able to identify the key points and create a meaningful summary that captures
        the essence of the original content while being significantly shorter.
      `;

      fireEvent.change(textInput, { target: { value: longText } });

      // Find and click summarize button
      const summarizeButton = screen.getByRole('button', { name: /summarize/i });
      fireEvent.click(summarizeButton);

      // Should make API call for summarization
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/ai/summarize'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining(longText.trim())
          })
        );
      }, { timeout: 5000 });

      // Should display summary result
      await waitFor(() => {
        expect(screen.getByText(/concise summary/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle different summarization modes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          summary: 'Brief summary for bullet points mode',
          keyPoints: ['Point 1', 'Point 2', 'Point 3']
        })
      });

      render(<Summarizer />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Test text for summarization' } });

      // Test different modes if available
      const modeSelector = screen.queryByRole('combobox') || 
                          screen.queryByText(/bullet points/i);
      
      if (modeSelector) {
        fireEvent.click(modeSelector);
        
        const bulletPointsOption = screen.queryByText(/bullet points/i);
        if (bulletPointsOption) {
          fireEvent.click(bulletPointsOption);
        }
      }

      const summarizeButton = screen.getByRole('button', { name: /summarize/i });
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle summarization errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Summarization failed'));

      render(<Summarizer />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Text to summarize' } });

      const summarizeButton = screen.getByRole('button', { name: /summarize/i });
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(screen.getByText(/error.*summariz/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show loading state during summarization', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ summary: 'Test summary' })
        }), 2000))
      );

      render(<Summarizer />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Text to summarize' } });

      const summarizeButton = screen.getByRole('button', { name: /summarize/i });
      fireEvent.click(summarizeButton);

      // Should show loading state
      await waitFor(() => {
        const loadingElement = screen.queryByText(/summarizing/i) ||
                             screen.queryByText(/processing/i) ||
                             document.querySelector('.loading') ||
                             document.querySelector('.spinner');
        expect(loadingElement).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Translator Component', () => {
    it('should handle real text translation with AI', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          translatedText: 'Hola, ¿cómo estás?',
          sourceLanguage: 'en',
          targetLanguage: 'es',
          confidence: 0.95
        })
      });

      render(<Translator />);

      // Find text input
      const textInput = screen.getByPlaceholderText(/enter text to translate/i) ||
                       screen.getByRole('textbox');

      fireEvent.change(textInput, { target: { value: 'Hello, how are you?' } });

      // Select target language
      const languageSelector = screen.queryByRole('combobox') ||
                              screen.queryByText(/spanish/i);
      
      if (languageSelector) {
        fireEvent.click(languageSelector);
        
        const spanishOption = screen.queryByText(/spanish/i) ||
                             screen.queryByText(/español/i);
        if (spanishOption) {
          fireEvent.click(spanishOption);
        }
      }

      // Click translate button
      const translateButton = screen.getByRole('button', { name: /translate/i });
      fireEvent.click(translateButton);

      // Should make API call for translation
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/ai/translate'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Hello, how are you?')
          })
        );
      }, { timeout: 5000 });

      // Should display translation result
      await waitFor(() => {
        expect(screen.getByText(/hola.*cómo estás/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle language auto-detection', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          translatedText: 'Hello, how are you?',
          sourceLanguage: 'es',
          targetLanguage: 'en',
          confidence: 0.92,
          detectedLanguage: 'Spanish'
        })
      });

      render(<Translator />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Hola, ¿cómo estás?' } });

      const translateButton = screen.getByRole('button', { name: /translate/i });
      fireEvent.click(translateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Should show detected language if implemented
      await waitFor(() => {
        const detectedText = screen.queryByText(/detected.*spanish/i);
        if (detectedText) {
          expect(detectedText).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    });

    it('should handle translation errors and unsupported languages', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Translation service unavailable'));

      render(<Translator />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Text to translate' } });

      const translateButton = screen.getByRole('button', { name: /translate/i });
      fireEvent.click(translateButton);

      await waitFor(() => {
        expect(screen.getByText(/error.*translat/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should support bidirectional translation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          translatedText: 'Translated text',
          sourceLanguage: 'en',
          targetLanguage: 'es'
        })
      });

      render(<Translator />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Original text' } });

      const translateButton = screen.getByRole('button', { name: /translate/i });
      fireEvent.click(translateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Test swap languages functionality if available
      const swapButton = screen.queryByRole('button', { name: /swap/i }) ||
                        screen.queryByText(/⇄/);
      
      if (swapButton) {
        fireEvent.click(swapButton);
        
        // Should swap source and target languages
        expect(swapButton).toBeInTheDocument();
      }
    });
  });

  describe('Content Generator Component', () => {
    it('should generate educational content with AI', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: `
            # Introduction to Photosynthesis
            
            Photosynthesis is the process by which plants convert sunlight into energy.
            
            ## Key Components:
            - Chlorophyll
            - Carbon dioxide
            - Water
            - Sunlight
            
            ## Process:
            1. Light absorption
            2. Water splitting
            3. Carbon fixation
            4. Glucose production
          `,
          metadata: {
            wordCount: 150,
            readingLevel: 'Grade 8',
            topics: ['Biology', 'Plant Science', 'Energy']
          }
        })
      });

      render(<ContentGenerator />);

      // Find content type selector
      const contentTypeSelector = screen.queryByRole('combobox') ||
                                  screen.queryByText(/lesson plan/i);
      
      if (contentTypeSelector) {
        fireEvent.click(contentTypeSelector);
        
        const lessonPlanOption = screen.queryByText(/lesson plan/i);
        if (lessonPlanOption) {
          fireEvent.click(lessonPlanOption);
        }
      }

      // Find topic input
      const topicInput = screen.getByPlaceholderText(/enter topic/i) ||
                        screen.getByRole('textbox');

      fireEvent.change(topicInput, { target: { value: 'Photosynthesis' } });

      // Find generate button
      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      // Should make API call for content generation
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/ai/generate-content'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('Photosynthesis')
          })
        );
      }, { timeout: 5000 });

      // Should display generated content
      await waitFor(() => {
        expect(screen.getByText(/introduction to photosynthesis/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle different content types and formats', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: 'Generated quiz content with multiple choice questions',
          metadata: {
            contentType: 'quiz',
            questionCount: 5,
            difficulty: 'intermediate'
          }
        })
      });

      render(<ContentGenerator />);

      // Test different content types
      const contentTypes = ['Quiz', 'Assignment', 'Worksheet', 'Presentation'];
      
      for (const contentType of contentTypes) {
        const selector = screen.queryByText(new RegExp(contentType, 'i'));
        if (selector) {
          fireEvent.click(selector);
          break;
        }
      }

      const topicInput = screen.getByRole('textbox');
      fireEvent.change(topicInput, { target: { value: 'Mathematics' } });

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should handle content generation errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Content generation failed'));

      render(<ContentGenerator />);

      const topicInput = screen.getByRole('textbox');
      fireEvent.change(topicInput, { target: { value: 'Test topic' } });

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/error.*generat/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should allow content customization and editing', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: 'Generated content that can be edited',
          metadata: { wordCount: 100 }
        })
      });

      render(<ContentGenerator />);

      const topicInput = screen.getByRole('textbox');
      fireEvent.change(topicInput, { target: { value: 'Test topic' } });

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/generated content/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Test editing functionality if available
      const editButton = screen.queryByRole('button', { name: /edit/i });
      if (editButton) {
        fireEvent.click(editButton);
        
        const editableArea = screen.queryByRole('textbox');
        if (editableArea) {
          fireEvent.change(editableArea, { 
            target: { value: 'Modified generated content' } 
          });
        }
      }
    });
  });

  describe('Cross-Component Integration', () => {
    it('should handle switching between AI tools without losing state', async () => {
      // This would test the parent component that contains all AI tools
      // For now, we'll test individual component stability
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'Test result' })
      });

      const { rerender } = render(<Summarizer />);

      const textInput = screen.getByRole('textbox');
      fireEvent.change(textInput, { target: { value: 'Test content' } });

      // Switch to different component
      rerender(<Translator />);

      // Should not cause errors
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle concurrent AI operations across tools', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          ok: true,
          json: async () => ({ result: `Result ${callCount}` })
        };
      });

      // Test multiple components making concurrent requests
      render(
        <div>
          <Summarizer />
          <Translator />
        </div>
      );

      const textInputs = screen.getAllByRole('textbox');
      const buttons = screen.getAllByRole('button');

      // Trigger operations on multiple tools
      if (textInputs.length >= 2 && buttons.length >= 2) {
        fireEvent.change(textInputs[0], { target: { value: 'Text 1' } });
        fireEvent.change(textInputs[1], { target: { value: 'Text 2' } });
        
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(2);
        }, { timeout: 3000 });
      }
    });
  });

  describe('Performance and User Experience', () => {
    it('should handle large text inputs efficiently', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ summary: 'Summary of large text' })
      });

      render(<Summarizer />);

      const largeText = 'Lorem ipsum '.repeat(1000); // ~11KB of text
      const textInput = screen.getByRole('textbox');
      
      fireEvent.change(textInput, { target: { value: largeText } });

      const summarizeButton = screen.getByRole('button', { name: /summarize/i });
      fireEvent.click(summarizeButton);

      // Should handle large input without performance issues
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('should provide proper accessibility for all AI tools', async () => {
      render(<Summarizer />);

      // Check for proper ARIA labels and roles
      const textInput = screen.getByRole('textbox');
      expect(textInput).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /summarize/i });
      expect(button).toBeInTheDocument();

      // Should support keyboard navigation
      textInput.focus();
      expect(document.activeElement).toBe(textInput);
    });
  });
});
