import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartGapDetector from './SmartGapDetector';
import { aiProvider } from '../../../../services/aiProvider';

// Mock the AI provider
jest.mock('../../../../services/aiProvider', () => ({
    aiProvider: {
        detectLearningGaps: jest.fn()
    }
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL for export functionality
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

describe('SmartGapDetector', () => {
    const mockAnalysisResponse = `{
        "topic": "Photosynthesis",
        "total_students": 5,
        "overall_understanding": 75,
        "identified_gaps": [
            {
                "id": "gap1",
                "gap_type": "conceptual",
                "description": "Students confuse photosynthesis with plant nutrition",
                "frequency": 3,
                "severity": "high",
                "affected_students": ["Student 1", "Student 3", "Student 5"],
                "teaching_strategies": ["Use visual diagrams", "Provide hands-on experiments"],
                "resources": ["Interactive models", "Video demonstrations"],
                "examples": ["Compare to cooking food", "Use plant observation activities"]
            },
            {
                "id": "gap2",
                "gap_type": "procedural",
                "description": "Unclear about the role of chlorophyll",
                "frequency": 2,
                "severity": "medium",
                "affected_students": ["Student 2", "Student 4"],
                "teaching_strategies": ["Explain chlorophyll function", "Use microscope observations"],
                "resources": ["Microscope slides", "Chlorophyll extraction lab"],
                "examples": ["Leaf color changes", "Green plant experiments"]
            }
        ],
        "student_breakdown": [],
        "recommendations": {
            "immediate_actions": ["Review basic plant biology", "Provide visual aids"],
            "lesson_modifications": ["Add hands-on activities", "Include more examples"],
            "assessment_suggestions": ["Use formative assessments", "Implement peer discussions"],
            "differentiation_strategies": ["Provide scaffolded support", "Offer extension activities"]
        },
        "misconception_patterns": [
            {
                "misconception": "Plants eat sunlight",
                "frequency": 2,
                "correction_strategy": "Explain energy conversion process"
            }
        ]
    }`;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
        
        // Mock successful API responses
        mockFetch.mockImplementation((url) => {
            if (url.includes('gap-analysis-history')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        history: [
                            {
                                id: '1',
                                topic: 'Previous Analysis',
                                date: '2025-08-01',
                                students_count: 20,
                                gaps_found: 2
                            }
                        ]
                    })
                });
            }
            if (url.includes('gap-analysis')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true })
                });
            }
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({})
            });
        });
    });

    test('renders main component elements', async () => {
        render(<SmartGapDetector />);
        
        await waitFor(() => {
            expect(screen.getByText('Smart Gap Detector')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('e.g., Photosynthesis')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /detect learning gaps/i })).toBeInTheDocument();
        });
    });

    test('loads and displays analysis history', async () => {
        render(<SmartGapDetector />);
        
        await waitFor(() => {
            expect(screen.getByText('Recent Analyses')).toBeInTheDocument();
            expect(screen.getByText('Previous Analysis')).toBeInTheDocument();
        });
    });

    test('shows quick stats correctly', async () => {
        render(<SmartGapDetector />);
        
        await waitFor(() => {
            expect(screen.getByText('Analyses Completed')).toBeInTheDocument();
            expect(screen.getByText('Total Gaps Found')).toBeInTheDocument();
            expect(screen.getByText('Class Understanding')).toBeInTheDocument();
        });
    });

    test('allows topic and answers input', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food from sunlight');

        expect(topicInput).toHaveValue('Photosynthesis');
        expect(answersTextarea).toHaveValue('Student 1: Plants make food from sunlight');
    });

    test('grade level and subject selection works', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const gradeLevelSelect = screen.getByDisplayValue('Select grade...');
        const subjectInput = screen.getByPlaceholderText('e.g., Biology');

        await user.selectOptions(gradeLevelSelect, '5');
        await user.type(subjectInput, 'Science');

        expect(gradeLevelSelect).toHaveValue('5');
        expect(subjectInput).toHaveValue('Science');
    });

    test('sample answers loading functionality', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const scienceButton = screen.getByRole('button', { name: 'Science' });
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);

        await user.click(scienceButton);

        expect(answersTextarea.value).toContain('Plants use water and air');
        expect(answersTextarea.value).toContain('photosynthesis');
    });

    test('shows student count as answers are typed', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        
        await user.type(answersTextarea, 'Student 1: Answer 1\nStudent 2: Answer 2\nStudent 3: Answer 3');

        expect(screen.getByText('3 student answers entered')).toBeInTheDocument();
    });

    test('submit button is disabled when inputs are empty', () => {
        render(<SmartGapDetector />);
        
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });
        expect(submitButton).toBeDisabled();
    });

    test('submit button is enabled when inputs are filled', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Test Topic');
        await user.type(answersTextarea, 'Student 1: Test answer');

        expect(submitButton).toBeEnabled();
    });

    test('handles form submission successfully', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food\nStudent 2: Sunlight helps plants');
        await user.click(submitButton);

        expect(screen.getByText('Analyzing...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
            expect(aiProvider.detectLearningGaps).toHaveBeenCalled();
        });
    });

    test('displays parsed analysis results correctly', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument(); // Students Analyzed
            expect(screen.getByText('75%')).toBeInTheDocument(); // Overall Understanding
            expect(screen.getByText('2')).toBeInTheDocument(); // Gaps Identified
        });
    });

    test('tab navigation works correctly', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        // Submit analysis first
        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
        });

        // Test tab navigation
        const gapsTab = screen.getByRole('button', { name: /identified gaps/i });
        await user.click(gapsTab);

        await waitFor(() => {
            expect(screen.getByText('Students confuse photosynthesis with plant nutrition')).toBeInTheDocument();
        });

        const strategiesTab = screen.getByRole('button', { name: /teaching strategies/i });
        await user.click(strategiesTab);

        await waitFor(() => {
            expect(screen.getByText('Assessment Suggestions')).toBeInTheDocument();
            expect(screen.getByText('Differentiation Strategies')).toBeInTheDocument();
        });
    });

    test('displays severity badges correctly', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
        });

        const gapsTab = screen.getByRole('button', { name: /identified gaps/i });
        await user.click(gapsTab);

        await waitFor(() => {
            expect(screen.getByText('high severity')).toBeInTheDocument();
            expect(screen.getByText('medium severity')).toBeInTheDocument();
        });
    });

    test('export functionality works', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        // Mock createElement for download link
        const mockCreateElement = jest.spyOn(document, 'createElement');
        const mockAnchor = {
            href: '',
            download: '',
            click: jest.fn()
        };
        mockCreateElement.mockReturnValue(mockAnchor as any);

        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            const exportButton = screen.getByText('Export Analysis');
            expect(exportButton).toBeInTheDocument();
        });

        const exportButton = screen.getByText('Export Analysis');
        await user.click(exportButton);

        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.download).toContain('gap_analysis_Photosynthesis_');

        mockCreateElement.mockRestore();
    });

    test('handles AI service errors gracefully', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to analyze gaps/)).toBeInTheDocument();
        });
    });

    test('parses text-based AI responses correctly', async () => {
        const user = userEvent.setup();
        const textResponse = `
        GAP: Students don't understand photosynthesis process
        STRATEGY: Use visual diagrams
        STRATEGY: Provide hands-on experiments
        GAP: Confusion about chlorophyll role
        STRATEGY: Explain chlorophyll function
        `;
        
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(textResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
        });

        // Should show parsed gaps
        const gapsTab = screen.getByRole('button', { name: /identified gaps/i });
        await user.click(gapsTab);

        await waitFor(() => {
            expect(screen.getByText(/Students don't understand photosynthesis process/)).toBeInTheDocument();
            expect(screen.getByText(/Confusion about chlorophyll role/)).toBeInTheDocument();
        });
    });

    test('handles API failures gracefully and shows fallback data', async () => {
        // Mock fetch to fail
        mockFetch.mockImplementation(() => Promise.reject(new Error('API unavailable')));
        
        render(<SmartGapDetector />);

        await waitFor(() => {
            // Should still show some history from fallback data
            expect(screen.getByText('Recent Analyses')).toBeInTheDocument();
        });
    });

    test('updates history after successful analysis', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'New Analysis Topic');
        await user.type(answersTextarea, 'Student 1: Test answer\nStudent 2: Another answer');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
        });

        // Should update stats
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument(); // Updated analyses count
        });
    });

    test('loading sample answers sets subject correctly', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const mathButton = screen.getByRole('button', { name: 'Math' });
        const subjectInput = screen.getByPlaceholderText('e.g., Biology');

        await user.click(mathButton);

        expect(subjectInput).toHaveValue('math');
        expect(screen.getByPlaceholderText(/Student 1: \[Answer\]/).value).toContain('3/4 + 1/2');
    });

    test('form validation prevents submission with empty fields', async () => {
        const user = userEvent.setup();
        render(<SmartGapDetector />);

        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });
        
        // Try to submit with empty fields
        await user.click(submitButton);
        
        expect(aiProvider.detectLearningGaps).not.toHaveBeenCalled();
    });

    test('displays comprehensive recommendations in strategies tab', async () => {
        const user = userEvent.setup();
        (aiProvider.detectLearningGaps as jest.Mock).mockResolvedValue(mockAnalysisResponse);
        
        render(<SmartGapDetector />);

        const topicInput = screen.getByPlaceholderText('e.g., Photosynthesis');
        const answersTextarea = screen.getByPlaceholderText(/Student 1: \[Answer\]/);
        const submitButton = screen.getByRole('button', { name: /detect learning gaps/i });

        await user.type(topicInput, 'Photosynthesis');
        await user.type(answersTextarea, 'Student 1: Plants make food');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Gap Analysis Results')).toBeInTheDocument();
        });

        const strategiesTab = screen.getByRole('button', { name: /teaching strategies/i });
        await user.click(strategiesTab);

        await waitFor(() => {
            expect(screen.getByText('Assessment Suggestions')).toBeInTheDocument();
            expect(screen.getByText('Differentiation Strategies')).toBeInTheDocument();
            expect(screen.getByText('Use formative assessments')).toBeInTheDocument();
            expect(screen.getByText('Provide scaffolded support')).toBeInTheDocument();
        });
    });
});
