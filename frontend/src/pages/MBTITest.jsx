import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const MBTITest = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = [
        {
            id: 1,
            question: 'At a party, do you:',
            options: [
                { value: 'E', text: 'Interact with many, including strangers' },
                { value: 'I', text: 'Interact with a few, known to you' },
            ],
        },
        {
            id: 2,
            question: 'Are you more:',
            options: [
                { value: 'S', text: 'Realistic than speculative' },
                { value: 'N', text: 'Speculative than realistic' },
            ],
        },
        {
            id: 3,
            question: 'Is it worse to:',
            options: [
                { value: 'S', text: 'Have your "head in the clouds"' },
                { value: 'N', text: 'Be "in a rut"' },
            ],
        },
        {
            id: 4,
            question: 'Are you more impressed by:',
            options: [
                { value: 'T', text: 'Principles' },
                { value: 'F', text: 'Emotions' },
            ],
        },
        {
            id: 5,
            question: 'Are you more drawn toward the:',
            options: [
                { value: 'T', text: 'Convincing' },
                { value: 'F', text: 'Touching' },
            ],
        },
        {
            id: 6,
            question: 'Do you prefer to work:',
            options: [
                { value: 'J', text: 'To deadlines' },
                { value: 'P', text: 'Just "whenever"' },
            ],
        },
        {
            id: 7,
            question: 'Do you tend to choose:',
            options: [
                { value: 'J', text: 'Rather carefully' },
                { value: 'P', text: 'Somewhat impulsively' },
            ],
        },
        {
            id: 8,
            question: 'At parties do you:',
            options: [
                { value: 'E', text: 'Stay late, with increasing energy' },
                { value: 'I', text: 'Leave early with decreased energy' },
            ],
        },
    ];

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentQuestion]: value });

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate MBTI type
            const result = calculateMBTI(answers);
            navigate('/student/my-results', { state: { mbtiType: result } });
        }
    };

    const calculateMBTI = (answers) => {
        // Simple calculation - count occurrences
        const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        Object.values(answers).forEach(value => {
            counts[value]++;
        });

        const type =
            (counts.E > counts.I ? 'E' : 'I') +
            (counts.S > counts.N ? 'S' : 'N') +
            (counts.T > counts.F ? 'T' : 'F') +
            (counts.J > counts.P ? 'J' : 'P');

        return type;
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-600 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">MBTI Personality Test</h1>
                    <p className="text-gray-600">Discover your learning style</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {currentQuestion + 1} of {questions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {questions[currentQuestion].question}
                    </h2>

                    <div className="space-y-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option.value)}
                                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                            >
                                <span className="text-gray-900 font-medium">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                {currentQuestion > 0 && (
                    <button
                        onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        className="mt-6 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Previous Question
                    </button>
                )}
            </div>
        </div>
    );
};

export default MBTITest;
