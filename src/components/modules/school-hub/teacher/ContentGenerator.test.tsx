import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentGenerator from './ContentGenerator';
import { aiProvider } from '../../../../services/aiProvider';

// Mock the aiProvider
jest.mock('../../../../services/aiProvider', () => ({
    aiProvider: {
        generateEducationalContent: jest.fn(),
    }
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock the GlassmorphicContainer component
jest.mock('../../../ui/GlassmorphicContainer', () => {
    return function GlassmorphicContainer({ children, className }: any) {
        return <div className={className} data-testid="glassmorphic-container">{children}</div>;
    };
});

// Mock the Icons component
jest.mock('../../../icons', () => ({
    Icons: {
        ContentGen: ({ size, className }: any) => <div data-testid="content-gen-icon" style={{ fontSize: size }} className={className} />,
        ClipboardCheck: ({ size, className }: any) => <div data-testid="clipboard-check-icon" style={{ fontSize: size }} className={className} />,
        BookOpen: ({ size, className }: any) => <div data-testid="book-open-icon" style={{ fontSize: size }} className={className} />,
        FileText: ({ size, className }: any) => <div data-testid="file-text-icon" style={{ fontSize: size }} className={className} />,
        Lightbulb: ({ size, className }: any) => <div data-testid="lightbulb-icon" style={{ fontSize: size }} className={className} />,
        PowerPoint: ({ size, className }: any) => <div data-testid="powerpoint-icon" style={{ fontSize: size }} className={className} />,
        FlaskConical: ({ size, className }: any) => <div data-testid="flask-conical-icon" style={{ fontSize: size }} className={className} />,
        MessageSquare: ({ size, className }: any) => <div data-testid="message-square-icon" style={{ fontSize: size }} className={className} />,
        Gaming: ({ size, className }: any) => <div data-testid="gaming-icon" style={{ fontSize: size }} className={className} />,
        Wand2: ({ size, className }: any) => <div data-testid="wand2-icon" style={{ fontSize: size }} className={className} />,
        Layout: ({ size, className }: any) => <div data-testid="layout-icon" style={{ fontSize: size }} className={className} />,
    }
}));

// Mock GlassmorphicContainer
jest.mock('../../../ui/GlassmorphicContainer', () => {
    return function GlassmorphicContainer({ children, className }: any) {
        return <div data-testid="glassmorphic-container" className={className}>{children}</div>;
    };
});

const mockFetchSuccess = (data: any) => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => data,
    });
};

const mockFetchError = () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
};

describe('ContentGenerator', () => {
    const mockGeneratedContent = `
# Photosynthesis Quiz

## Question 1
What is the primary purpose of photosynthesis?
a) To produce oxygen
b) To produce glucose
c) To produce water
d) To produce carbon dioxide

**Correct Answer: b) To produce glucose**

## Question 2
Which organelle is responsible for photosynthesis?
a) Mitochondria
b) Nucleus
c) Chloroplast
d) Ribosome

**Correct Answer: c) Chloroplast**
    `;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default fetch mock for content library
        mockFetchSuccess({ library: [] });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders the main header correctly', () => {
            render(<ContentGenerator />);
            
            expect(screen.getByText('AI Content Generator')).toBeInTheDocument();
            expect(screen.getByText(/Create comprehensive educational content/)).toBeInTheDocument();
            expect(screen.getByTestId('content-gen-icon')).toBeInTheDocument();
        });

        it('renders quick stats section', async () => {
            render(<ContentGenerator />);
            
            await waitFor(() => {
                expect(screen.getByText('Content Created')).toBeInTheDocument();
                expect(screen.getByText('Templates Available')).toBeInTheDocument();
                expect(screen.getByText('Total Usage')).toBeInTheDocument();
                expect(screen.getByText('Avg Rating')).toBeInTheDocument();
            });
        });

        it('renders tab navigation', () => {
            render(<ContentGenerator />);
            
            expect(screen.getByText('Content Generator')).toBeInTheDocument();
            expect(screen.getByText('Templates')).toBeInTheDocument();
            expect(screen.getByText('My Library')).toBeInTheDocument();
        });

        it('renders content templates in generator view', () => {
            render(<ContentGenerator />);
            
            expect(screen.getByText('Interactive Quiz')).toBeInTheDocument();
            expect(screen.getByText('Comprehensive Lesson Plan')).toBeInTheDocument();
            expect(screen.getByText('Practice Worksheet')).toBeInTheDocument();
            expect(screen.getByText('Project-Based Learning')).toBeInTheDocument();
        });
    });

    describe('Template Selection', () => {
        it('allows selecting a template', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            // Check if template info is displayed
            expect(screen.getByText('Multiple choice and short answer questions with instant feedback')).toBeInTheDocument();
            expect(screen.getByText('Create 5-10 questions with explanations for answers')).toBeInTheDocument();
        });

        it('displays template details when selected', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const lessonTemplate = screen.getByText('Comprehensive Lesson Plan');
            await user.click(lessonTemplate);
            
            // Check template details
            expect(screen.getByText('Detailed lesson with objectives, activities, and assessments')).toBeInTheDocument();
            expect(screen.getByText('intermediate')).toBeInTheDocument();
            expect(screen.getByText('45 min')).toBeInTheDocument();
        });

        it('allows entering custom content type', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const customInput = screen.getByPlaceholderText('e.g., Science Lab Report');
            await user.type(customInput, 'Custom Activity');
            
            expect(customInput).toHaveValue('Custom Activity');
        });
    });

    describe('Content Generation Form', () => {
        it('handles form input changes', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            // Fill in topic
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Cell Division');
            expect(topicInput).toHaveValue('Cell Division');
            
            // Change grade level
            const gradeSelect = screen.getAllByDisplayValue('10')[0];
            await user.selectOptions(gradeSelect, '8');
            expect(gradeSelect).toHaveValue('8');
            
            // Change difficulty
            const difficultySelect = screen.getByDisplayValue('intermediate');
            await user.selectOptions(difficultySelect, 'advanced');
            expect(difficultySelect).toHaveValue('advanced');
        });

        it('validates required fields', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const generateButton = screen.getByText('Generate Content');
            expect(generateButton).toBeDisabled();
            
            // Fill in topic to enable button
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            // Select a template to enable button
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            expect(generateButton).not.toBeDisabled();
        });

        it('handles optional fields correctly', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            // Fill optional fields
            const standardsInput = screen.getByPlaceholderText('e.g., NGSS 5-LS1-1');
            await user.type(standardsInput, 'NGSS 7-LS1-5');
            expect(standardsInput).toHaveValue('NGSS 7-LS1-5');
            
            const objectivesTextarea = screen.getByPlaceholderText('Students will be able to...');
            await user.type(objectivesTextarea, 'Explain the process of photosynthesis');
            expect(objectivesTextarea).toHaveValue('Explain the process of photosynthesis');
        });
    });

    describe('Content Generation', () => {
        it('generates content successfully', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockResolvedValue(mockGeneratedContent);
            
            render(<ContentGenerator />);
            
            // Fill form
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            // Select template
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            // Submit form
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            // Check loading state
            expect(screen.getByText('Generating...')).toBeInTheDocument();
            
            // Wait for content to be generated
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
            
            // Check generated content is displayed
            expect(screen.getByText(/Photosynthesis Quiz/)).toBeInTheDocument();
            expect(aiProvider.generateEducationalContent).toHaveBeenCalledWith(
                'Interactive Quiz',
                'Photosynthesis',
                '10',
                expect.stringContaining('Topic: Photosynthesis')
            );
        });

        it('handles generation errors gracefully', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockRejectedValue(new Error('AI Error'));
            
            render(<ContentGenerator />);
            
            // Fill form and submit
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            // Wait for error message
            await waitFor(() => {
                expect(screen.getByText(/Failed to generate content/)).toBeInTheDocument();
            });
        });

        it('displays loading state during generation', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve(mockGeneratedContent), 100))
            );
            
            render(<ContentGenerator />);
            
            // Fill form and submit
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            // Check loading state
            expect(screen.getByText('Generating...')).toBeInTheDocument();
            expect(generateButton).toBeDisabled();
            
            // Wait for completion
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
        });
    });

    describe('Content Export', () => {
        beforeEach(async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockResolvedValue(mockGeneratedContent);
            
            render(<ContentGenerator />);
            
            // Generate content first
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
        });

        it('shows export buttons after content generation', () => {
            expect(screen.getByText('Export TXT')).toBeInTheDocument();
            expect(screen.getByText('Export DOC')).toBeInTheDocument();
        });

        it('handles content export', async () => {
            const user = userEvent.setup();
            
            // Mock URL.createObjectURL and other DOM methods
            const mockCreateObjectURL = jest.fn(() => 'mock-url');
            const mockRevokeObjectURL = jest.fn();
            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;
            
            const mockClick = jest.fn();
            const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue({
                href: '',
                download: '',
                click: mockClick,
            } as any);
            
            const exportButton = screen.getByText('Export TXT');
            await user.click(exportButton);
            
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
            
            mockCreateElement.mockRestore();
        });
    });

    describe('Tab Navigation', () => {
        it('switches between different views', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            // Switch to Templates view
            const templatesTab = screen.getByText('Templates');
            await user.click(templatesTab);
            
            // Check that templates view is displayed
            expect(screen.getByText('Use Template')).toBeInTheDocument();
            
            // Switch to Library view
            const libraryTab = screen.getByText('My Library');
            await user.click(libraryTab);
            
            // Check that library view is displayed
            expect(screen.getByPlaceholderText('Search content...')).toBeInTheDocument();
            
            // Switch back to Generator view
            const generatorTab = screen.getByText('Content Generator');
            await user.click(generatorTab);
            
            // Check that generator view is displayed
            expect(screen.getByText('Content Template')).toBeInTheDocument();
        });
    });

    describe('Templates View', () => {
        beforeEach(async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const templatesTab = screen.getByText('Templates');
            await user.click(templatesTab);
        });

        it('displays all available templates', () => {
            expect(screen.getByText('Interactive Quiz')).toBeInTheDocument();
            expect(screen.getByText('Comprehensive Lesson Plan')).toBeInTheDocument();
            expect(screen.getByText('Practice Worksheet')).toBeInTheDocument();
            expect(screen.getByText('Project-Based Learning')).toBeInTheDocument();
            expect(screen.getByText('Interactive Presentation')).toBeInTheDocument();
            expect(screen.getByText('Hands-on Lab Activity')).toBeInTheDocument();
            expect(screen.getByText('Socratic Seminar')).toBeInTheDocument();
            expect(screen.getByText('Educational Game')).toBeInTheDocument();
        });

        it('allows using a template from templates view', async () => {
            const user = userEvent.setup();
            
            const useTemplateButtons = screen.getAllByText('Use Template');
            await user.click(useTemplateButtons[0]);
            
            // Should switch back to generator view with template selected
            expect(screen.getByText('Content Template')).toBeInTheDocument();
        });
    });

    describe('Library View', () => {
        beforeEach(async () => {
            const user = userEvent.setup();
            mockFetchSuccess({
                library: [
                    {
                        id: '1',
                        title: 'Photosynthesis Quiz',
                        type: 'quiz',
                        date: '2025-08-01',
                        gradeLevel: '7',
                        topic: 'Biology',
                        rating: 4.8,
                        usage: 45
                    },
                    {
                        id: '2',
                        title: 'World War II Lesson Plan',
                        type: 'lesson',
                        date: '2025-07-29',
                        gradeLevel: '10',
                        topic: 'History',
                        rating: 4.6,
                        usage: 32
                    }
                ]
            });
            
            render(<ContentGenerator />);
            
            const libraryTab = screen.getByText('My Library');
            await user.click(libraryTab);
        });

        it('displays content library items', async () => {
            await waitFor(() => {
                expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
                expect(screen.getByText('World War II Lesson Plan')).toBeInTheDocument();
            });
        });

        it('handles library search', async () => {
            const user = userEvent.setup();
            
            await waitFor(() => {
                expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
            });
            
            const searchInput = screen.getByPlaceholderText('Search content...');
            await user.type(searchInput, 'Photosynthesis');
            
            expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
            expect(screen.queryByText('World War II Lesson Plan')).not.toBeInTheDocument();
        });

        it('handles content filtering', async () => {
            const user = userEvent.setup();
            
            await waitFor(() => {
                expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
            });
            
            const filterSelect = screen.getByDisplayValue('All Types');
            await user.selectOptions(filterSelect, 'assessment');
            
            // Should show only quiz content
            expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
        });

        it('handles content rating', async () => {
            const user = userEvent.setup();
            mockFetchSuccess({});
            
            await waitFor(() => {
                expect(screen.getByText('Photosynthesis Quiz')).toBeInTheDocument();
            });
            
            // Find star rating buttons and click on a star
            const starButtons = screen.getAllByText('★');
            await user.click(starButtons[4]); // Click 5th star
            
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/crm/content-library/1/rate',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating: 5 })
                })
            );
        });
    });

    describe('Content Library Integration', () => {
        it('loads content library on mount', async () => {
            const mockLibrary = [
                {
                    id: '1',
                    title: 'Test Content',
                    type: 'quiz',
                    date: '2025-08-01',
                    gradeLevel: '8',
                    topic: 'Math',
                    rating: 4.5,
                    usage: 20
                }
            ];
            
            mockFetchSuccess({ library: mockLibrary });
            
            render(<ContentGenerator />);
            
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/crm/content-library');
            });
        });

        it('handles library loading error gracefully', async () => {
            mockFetchError();
            
            render(<ContentGenerator />);
            
            // Should fall back to mock data
            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument(); // Mock data count
            });
        });

        it('saves generated content to library', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockResolvedValue(mockGeneratedContent);
            mockFetchSuccess({}); // Mock save response
            
            render(<ContentGenerator />);
            
            // Generate content
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
            
            // Check that content was saved to library
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/crm/content-library',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining('Photosynthesis')
                })
            );
        });
    });

    describe('Content Metadata', () => {
        it('displays content metadata correctly', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockResolvedValue(mockGeneratedContent);
            
            render(<ContentGenerator />);
            
            // Generate content
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
            
            // Check metadata display
            expect(screen.getByText('assessment')).toBeInTheDocument(); // type
            expect(screen.getByText('10')).toBeInTheDocument(); // grade level
            expect(screen.getByText('45 minutes')).toBeInTheDocument(); // duration
        });

        it('displays content tags', async () => {
            const user = userEvent.setup();
            (aiProvider.generateEducationalContent as jest.Mock).mockResolvedValue(mockGeneratedContent);
            
            render(<ContentGenerator />);
            
            // Generate content
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Photosynthesis');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            const generateButton = screen.getByText('Generate Content');
            await user.click(generateButton);
            
            await waitFor(() => {
                expect(screen.getByText('Generated Content')).toBeInTheDocument();
            });
            
            // Check tags
            expect(screen.getByText('#interactive')).toBeInTheDocument();
            expect(screen.getByText('#photosynthesis')).toBeInTheDocument();
            expect(screen.getByText('#grade-10')).toBeInTheDocument();
            expect(screen.getByText('#intermediate')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper form labels', () => {
            render(<ContentGenerator />);
            
            expect(screen.getByLabelText('Topic')).toBeInTheDocument();
            expect(screen.getByLabelText('Grade Level')).toBeInTheDocument();
            expect(screen.getByLabelText('Difficulty')).toBeInTheDocument();
            expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
        });

        it('has proper button states', async () => {
            const user = userEvent.setup();
            render(<ContentGenerator />);
            
            const generateButton = screen.getByText('Generate Content');
            expect(generateButton).toBeDisabled();
            
            // Fill required fields
            const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
            await user.type(topicInput, 'Test Topic');
            
            const quizTemplate = screen.getByText('Interactive Quiz');
            await user.click(quizTemplate);
            
            expect(generateButton).not.toBeDisabled();
        });
    });
});
