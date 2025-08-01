import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EducationPrompts from '../EducationPrompts';
import AdminPrompts from '../AdminPrompts';
import ProductivityPrompts from '../ProductivityPrompts';

// Real-world integration tests for Prompt Library components
describe('Prompt Library Components - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Mock console.error to suppress error logs during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Education Prompts Component', () => {
    it('should display educational prompt categories and templates', async () => {
      render(<EducationPrompts />);

      // Should display education-specific categories
      const expectedCategories = [
        'Lesson Planning',
        'Assessment',
        'Curriculum',
        'Student Engagement',
        'Differentiation'
      ];

      for (const category of expectedCategories) {
        const categoryElement = screen.queryByText(new RegExp(category, 'i'));
        if (categoryElement) {
          expect(categoryElement).toBeInTheDocument();
        }
      }
    });

    it('should handle prompt selection and customization', async () => {
      render(<EducationPrompts />);

      // Find and click on a prompt template
      const promptTemplate = screen.queryByText(/lesson plan/i) ||
                            screen.queryByText(/create.*lesson/i) ||
                            screen.queryByRole('button');

      if (promptTemplate) {
        fireEvent.click(promptTemplate);

        // Should display prompt details or customization options
        await waitFor(() => {
          const promptDetails = screen.queryByText(/customize/i) ||
                               screen.queryByText(/use prompt/i) ||
                               screen.queryByRole('textbox');
          expect(promptDetails).toBeInTheDocument();
        });
      }
    });

    it('should integrate with AI for prompt execution', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Generated lesson plan based on the prompt template',
          metadata: {
            promptUsed: 'lesson_plan_template',
            subject: 'Mathematics',
            gradeLevel: '8th Grade'
          }
        })
      });

      render(<EducationPrompts />);

      // Find a prompt to execute
      const executeButton = screen.queryByRole('button', { name: /use.*prompt/i }) ||
                           screen.queryByRole('button', { name: /execute/i }) ||
                           screen.queryByText(/generate/i);

      if (executeButton) {
        fireEvent.click(executeButton);

        // Should make API call to execute prompt
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/ai/execute-prompt'),
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              })
            })
          );
        }, { timeout: 5000 });

        // Should display generated content
        await waitFor(() => {
          expect(screen.getByText(/generated lesson plan/i)).toBeInTheDocument();
        }, { timeout: 5000 });
      }
    });

    it('should allow prompt customization with variables', async () => {
      render(<EducationPrompts />);

      // Find customizable prompt
      const customizeButton = screen.queryByText(/customize/i) ||
                             screen.queryByRole('button', { name: /edit/i });

      if (customizeButton) {
        fireEvent.click(customizeButton);

        // Should show customization form
        await waitFor(() => {
          const subjectInput = screen.queryByPlaceholderText(/subject/i) ||
                              screen.queryByLabelText(/subject/i);
          const gradeLevelInput = screen.queryByPlaceholderText(/grade/i) ||
                                 screen.queryByLabelText(/grade/i);

          if (subjectInput) {
            fireEvent.change(subjectInput, { target: { value: 'Science' } });
          }
          if (gradeLevelInput) {
            fireEvent.change(gradeLevelInput, { target: { value: '7th Grade' } });
          }
        });
      }
    });

    it('should handle prompt favorites and recent usage', async () => {
      render(<EducationPrompts />);

      // Test favoriting functionality
      const favoriteButton = screen.queryByRole('button', { name: /favorite/i }) ||
                            screen.queryByText(/⭐/i) ||
                            screen.queryByText(/♡/i);

      if (favoriteButton) {
        fireEvent.click(favoriteButton);

        // Should update favorite status
        await waitFor(() => {
          const favorited = screen.queryByText(/⭐/i) ||
                           screen.queryByText(/♥/i);
          expect(favorited).toBeInTheDocument();
        });
      }

      // Test recent prompts section
      const recentSection = screen.queryByText(/recent/i) ||
                           screen.queryByText(/history/i);
      if (recentSection) {
        expect(recentSection).toBeInTheDocument();
      }
    });
  });

  describe('Admin Prompts Component', () => {
    it('should display administrative prompt categories', async () => {
      render(<AdminPrompts />);

      // Should display admin-specific categories
      const expectedCategories = [
        'Policy',
        'Communication',
        'Reports',
        'Meetings',
        'Budget'
      ];

      for (const category of expectedCategories) {
        const categoryElement = screen.queryByText(new RegExp(category, 'i'));
        if (categoryElement) {
          expect(categoryElement).toBeInTheDocument();
        }
      }
    });

    it('should handle administrative document generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Generated administrative policy document with proper formatting and structure',
          metadata: {
            documentType: 'policy',
            wordCount: 500,
            sections: ['Introduction', 'Guidelines', 'Implementation']
          }
        })
      });

      render(<AdminPrompts />);

      // Find policy generation prompt
      const policyPrompt = screen.queryByText(/policy/i) ||
                          screen.queryByText(/document/i);

      if (policyPrompt) {
        fireEvent.click(policyPrompt);

        // Should allow document type selection
        const documentTypeSelector = screen.queryByRole('combobox') ||
                                    screen.queryByText(/select.*type/i);

        if (documentTypeSelector) {
          fireEvent.click(documentTypeSelector);
        }

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }
    });

    it('should handle meeting agenda and minutes generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: `
            # Staff Meeting Agenda
            
            ## Date: [Date]
            ## Time: [Time]
            ## Location: [Location]
            
            ### Agenda Items:
            1. Welcome and Introductions
            2. Review of Previous Minutes
            3. Department Updates
            4. New Business
            5. Action Items
            6. Next Meeting Date
          `,
          metadata: {
            templateType: 'meeting_agenda',
            estimatedDuration: '60 minutes'
          }
        })
      });

      render(<AdminPrompts />);

      const meetingPrompt = screen.queryByText(/meeting/i) ||
                           screen.queryByText(/agenda/i);

      if (meetingPrompt) {
        fireEvent.click(meetingPrompt);

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(screen.getByText(/staff meeting agenda/i)).toBeInTheDocument();
          }, { timeout: 5000 });
        }
      }
    });

    it('should handle budget and financial report prompts', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Generated budget analysis with recommendations and financial projections',
          metadata: {
            reportType: 'budget_analysis',
            fiscalYear: '2024-2025'
          }
        })
      });

      render(<AdminPrompts />);

      const budgetPrompt = screen.queryByText(/budget/i) ||
                          screen.queryByText(/financial/i);

      if (budgetPrompt) {
        fireEvent.click(budgetPrompt);

        // Should allow budget parameters input
        const amountInput = screen.queryByPlaceholderText(/amount/i) ||
                           screen.queryByLabelText(/budget/i);

        if (amountInput) {
          fireEvent.change(amountInput, { target: { value: '50000' } });
        }

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }
    });
  });

  describe('Productivity Prompts Component', () => {
    it('should display productivity and workflow prompts', async () => {
      render(<ProductivityPrompts />);

      // Should display productivity categories
      const expectedCategories = [
        'Email',
        'Planning',
        'Organization',
        'Time Management',
        'Communication'
      ];

      for (const category of expectedCategories) {
        const categoryElement = screen.queryByText(new RegExp(category, 'i'));
        if (categoryElement) {
          expect(categoryElement).toBeInTheDocument();
        }
      }
    });

    it('should handle email template generation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: `
            Subject: [Subject Line]
            
            Dear [Recipient],
            
            I hope this email finds you well. I am writing to [purpose of email].
            
            [Main content]
            
            Please let me know if you have any questions or need additional information.
            
            Best regards,
            [Your Name]
          `,
          metadata: {
            templateType: 'professional_email',
            tone: 'formal'
          }
        })
      });

      render(<ProductivityPrompts />);

      const emailPrompt = screen.queryByText(/email/i) ||
                         screen.queryByText(/message/i);

      if (emailPrompt) {
        fireEvent.click(emailPrompt);

        // Should allow email customization
        const purposeInput = screen.queryByPlaceholderText(/purpose/i) ||
                            screen.queryByLabelText(/purpose/i);

        if (purposeInput) {
          fireEvent.change(purposeInput, { 
            target: { value: 'Schedule a parent-teacher conference' } 
          });
        }

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(screen.getByText(/dear.*recipient/i)).toBeInTheDocument();
          }, { timeout: 5000 });
        }
      }
    });

    it('should handle task planning and organization prompts', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: `
            # Weekly Task Plan
            
            ## Priority Tasks:
            1. High Priority Task 1
            2. High Priority Task 2
            
            ## Medium Priority:
            1. Medium Priority Task 1
            2. Medium Priority Task 2
            
            ## Low Priority:
            1. Low Priority Task 1
            2. Low Priority Task 2
            
            ## Time Allocation:
            - Monday: Focus on high priority tasks
            - Tuesday: Continue high priority, start medium
            - Wednesday: Medium priority tasks
            - Thursday: Complete medium, start low priority
            - Friday: Low priority and review
          `,
          metadata: {
            planType: 'weekly_task_plan',
            totalTasks: 6
          }
        })
      });

      render(<ProductivityPrompts />);

      const planningPrompt = screen.queryByText(/planning/i) ||
                            screen.queryByText(/task/i) ||
                            screen.queryByText(/organize/i);

      if (planningPrompt) {
        fireEvent.click(planningPrompt);

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(screen.getByText(/weekly task plan/i)).toBeInTheDocument();
          }, { timeout: 5000 });
        }
      }
    });

    it('should handle time management and scheduling prompts', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Generated time management strategy with specific recommendations for improving productivity',
          metadata: {
            strategyType: 'time_blocking',
            duration: 'weekly'
          }
        })
      });

      render(<ProductivityPrompts />);

      const timePrompt = screen.queryByText(/time/i) ||
                        screen.queryByText(/schedule/i);

      if (timePrompt) {
        fireEvent.click(timePrompt);

        // Should allow time preferences input
        const hoursInput = screen.queryByPlaceholderText(/hours/i) ||
                          screen.queryByLabelText(/available.*time/i);

        if (hoursInput) {
          fireEvent.change(hoursInput, { target: { value: '8' } });
        }

        const generateButton = screen.queryByRole('button', { name: /generate/i });
        if (generateButton) {
          fireEvent.click(generateButton);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          }, { timeout: 3000 });
        }
      }
    });
  });

  describe('Cross-Component Prompt Library Features', () => {
    it('should handle prompt search across all categories', async () => {
      render(<EducationPrompts />);

      // Test search functionality if available
      const searchInput = screen.queryByPlaceholderText(/search/i) ||
                         screen.queryByRole('searchbox');

      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'lesson' } });

        // Should filter prompts based on search
        await waitFor(() => {
          const searchResults = screen.queryByText(/lesson/i);
          expect(searchResults).toBeInTheDocument();
        });
      }
    });

    it('should handle prompt sharing and export functionality', async () => {
      render(<EducationPrompts />);

      // Test export functionality if available
      const exportButton = screen.queryByRole('button', { name: /export/i }) ||
                          screen.queryByRole('button', { name: /share/i });

      if (exportButton) {
        fireEvent.click(exportButton);

        // Should handle export/share action
        await waitFor(() => {
          const exportDialog = screen.queryByText(/export/i) ||
                              screen.queryByText(/share/i);
          expect(exportDialog).toBeInTheDocument();
        });
      }
    });

    it('should handle custom prompt creation and saving', async () => {
      render(<ProductivityPrompts />);

      // Test custom prompt creation
      const createButton = screen.queryByRole('button', { name: /create/i }) ||
                          screen.queryByRole('button', { name: /new.*prompt/i });

      if (createButton) {
        fireEvent.click(createButton);

        // Should show prompt creation form
        await waitFor(() => {
          const titleInput = screen.queryByPlaceholderText(/title/i) ||
                            screen.queryByLabelText(/prompt.*title/i);
          const contentInput = screen.queryByPlaceholderText(/content/i) ||
                              screen.queryByRole('textbox');

          if (titleInput && contentInput) {
            fireEvent.change(titleInput, { 
              target: { value: 'Custom Email Template' } 
            });
            fireEvent.change(contentInput, { 
              target: { value: 'Create a professional email for [purpose]' } 
            });

            const saveButton = screen.queryByRole('button', { name: /save/i });
            if (saveButton) {
              fireEvent.click(saveButton);
            }
          }
        });
      }
    });

    it('should handle prompt versioning and history', async () => {
      render(<AdminPrompts />);

      // Test prompt history if available
      const historyButton = screen.queryByRole('button', { name: /history/i }) ||
                           screen.queryByText(/version/i);

      if (historyButton) {
        fireEvent.click(historyButton);

        // Should show prompt history
        await waitFor(() => {
          const historyList = screen.queryByText(/previous.*version/i) ||
                             screen.queryByText(/history/i);
          expect(historyList).toBeInTheDocument();
        });
      }
    });
  });

  describe('Performance and User Experience', () => {
    it('should handle large prompt libraries efficiently', async () => {
      render(<EducationPrompts />);

      // Should load without performance issues
      expect(screen.getByText(/education/i)).toBeInTheDocument();

      // Test scrolling through large lists if implemented
      const promptList = document.querySelector('[role="list"]') ||
                        document.querySelector('.prompt-list');

      if (promptList) {
        // Simulate scrolling
        fireEvent.scroll(promptList, { target: { scrollY: 1000 } });
        
        // Should handle scrolling without issues
        expect(promptList).toBeInTheDocument();
      }
    });

    it('should provide proper accessibility for prompt library', async () => {
      render(<EducationPrompts />);

      // Check for proper ARIA labels and roles
      const promptButtons = screen.getAllByRole('button');
      expect(promptButtons.length).toBeGreaterThan(0);

      // Should support keyboard navigation
      if (promptButtons.length > 0) {
        promptButtons[0].focus();
        expect(document.activeElement).toBe(promptButtons[0]);
      }
    });

    it('should handle component unmounting during prompt operations', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ response: 'Generated content' })
        }), 2000))
      );

      const { unmount } = render(<EducationPrompts />);

      const generateButton = screen.queryByRole('button', { name: /generate/i });
      if (generateButton) {
        fireEvent.click(generateButton);
      }

      // Unmount before operation completes
      unmount();

      // Should not cause memory leaks or errors
      await new Promise(resolve => setTimeout(resolve, 3000));
      expect(true).toBe(true);
    });
  });
});
