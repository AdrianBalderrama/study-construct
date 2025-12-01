export const PRELOADED_QUIZZES = [
    {
        id: 'auto-engine',
        title: 'Engine Basics',
        questions: [
            {
                type: 'multiple-choice',
                question: 'What is the primary function of a spark plug in a gasoline engine?',
                options: [
                    'To inject fuel into the cylinder',
                    'To ignite the air-fuel mixture',
                    'To lubricate the piston rings',
                    'To cool the engine block'
                ],
                correctIndex: 1
            },
            {
                type: 'true-false',
                question: 'A diesel engine uses spark plugs to ignite the fuel.',
                correctAnswer: false
            },
            {
                type: 'fill-blank',
                question: 'The component that connects the piston to the crankshaft is called the _____ rod.',
                correctAnswer: 'connecting',
                acceptableAnswers: ['connecting', 'con']
            },
            {
                type: 'multiple-choice',
                question: 'Which stroke in a 4-cycle engine expels the exhaust gases?',
                options: [
                    'Intake',
                    'Compression',
                    'Power',
                    'Exhaust'
                ],
                correctIndex: 3
            }
        ]
    },
    {
        id: 'auto-brakes',
        title: 'Braking Systems',
        questions: [
            {
                type: 'multiple-choice',
                question: 'What hydraulic fluid is commonly used in automotive brake systems?',
                options: [
                    'Motor Oil',
                    'Transmission Fluid',
                    'Brake Fluid (DOT 3/4)',
                    'Power Steering Fluid'
                ],
                correctIndex: 2
            },
            {
                type: 'true-false',
                question: 'ABS stands for Anti-lock Braking System.',
                correctAnswer: true
            },
            {
                type: 'fill-blank',
                question: 'Disc brakes use calipers to squeeze _____ against the rotor.',
                correctAnswer: 'pads',
                acceptableAnswers: ['pads', 'brake pads']
            }
        ]
    },
    {
        id: 'auto-electric',
        title: 'Electrical Systems',
        questions: [
            {
                type: 'multiple-choice',
                question: 'Which component charges the battery while the engine is running?',
                options: [
                    'Starter Motor',
                    'Alternator',
                    'Distributor',
                    'Ignition Coil'
                ],
                correctIndex: 1
            },
            {
                type: 'true-false',
                question: 'A blown fuse should be replaced with one of a higher amperage rating.',
                correctAnswer: false
            },
            {
                type: 'fill-blank',
                question: 'The device that stores electrical energy to start the car is the _____.',
                correctAnswer: 'battery',
                acceptableAnswers: ['battery', 'lead-acid battery']
            }
        ]
    }
];
