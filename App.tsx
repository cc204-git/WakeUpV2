import React, { useState, useEffect, useCallback } from 'react';
import { AppPhase, CameraPurpose } from './types';
import { verifyGoalWithAI, setApiKey, hasApiKey } from './services/geminiService';
import { CameraModal } from './components/CameraModal';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.629 5.629l-2.371 2.37-1.414-1.414 2.371-2.371A6 6 0 0121 9zM15 9a6 6 0 01-6 6m-3.371-1.629l-2.37 2.37a1.5 1.5 0 01-2.122 0l-1.414-1.414a1.5 1.5 0 010-2.122l2.37-2.37A6 6 0 019 9m0 0a2 2 0 012-2m-2 2a2 2 0 00-2 2" />
    </svg>
);


const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// --- Sub-components defined inside App.tsx to reduce file count ---

const ApiKeySetup: React.FC<{ onKeySubmit: () => void }> = ({ onKeySubmit }) => {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) {
            setError('API Key cannot be empty.');
            return;
        }
        setApiKey(key);
        onKeySubmit();
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
                <KeyIcon />
                <h1 className="text-3xl font-bold text-white mt-4">Gemini API Key</h1>
                <p className="text-gray-400 mt-2">Please enter your API key to continue.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">Your API Key</label>
                    <input
                        id="apiKey"
                        type="password"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                        placeholder="Enter your secret key"
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                    Save & Continue
                </button>
            </form>
        </div>
    );
};


const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded credentials for demonstration
        if (username === 'admin' && password === 'password') {
            setError('');
            onLoginSuccess();
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 font-sans">
            <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <LockIcon />
                    <h1 className="text-3xl font-bold text-white mt-4">Welcome Back</h1>
                    <p className="text-gray-400 mt-2">Log in to continue your goals.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="password"
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                        Login
                    </button>
                </form>
            </div>
        </main>
    );
};


const GoalSetupForm: React.FC<{ onSubmit: (goal: string, deadline: number) => void }> = ({ onSubmit }) => {
    const [goal, setGoal] = useState('');
    const [deadline, setDeadline] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const deadlineDate = new Date(deadline);
        if (!goal.trim()) {
            setError('Please enter a goal.');
            return;
        }
        if (isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
            setError('Please select a future date and time for the deadline.');
            return;
        }
        onSubmit(goal, deadlineDate.getTime());
    };
    
    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() + 1);
    const minDateString = minDate.toISOString().slice(0, 16);

    return (
        <div className="w-full max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
                <LockIcon />
                <h1 className="text-3xl font-bold text-white mt-4">Goal Lock</h1>
                <p className="text-gray-400 mt-2">Set a goal. Lock up a secret. Achieve it to get it back.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-300">Your Goal</label>
                    <textarea
                        id="goal"
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        placeholder="e.g., Run a 5k, finish my project, clean the garage..."
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        rows={3}
                    />
                </div>
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-300">Deadline</label>
                    <input
                        type="datetime-local"
                        id="deadline"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                        min={minDateString}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                    Set Goal & Capture Lock
                </button>
            </form>
        </div>
    );
};

const CountdownDisplay: React.FC<{ goal: string, deadline: number, onVerify: () => void }> = ({ goal, deadline, onVerify }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = deadline - new Date().getTime();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
             timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    }, [deadline]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });
    
    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center mx-2 md:mx-4">
            <span className="text-4xl md:text-7xl font-mono font-bold text-indigo-400 tracking-wider">{String(value).padStart(2, '0')}</span>
            <span className="text-xs md:text-sm text-gray-400 uppercase">{interval}</span>
        </div>
    ));

    const isExpired = deadline < Date.now();

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 flex flex-col items-center text-center">
            <h2 className="text-lg text-gray-400 font-semibold mb-2 flex items-center"><TargetIcon/>YOUR GOAL</h2>
            <p className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed max-w-2xl">{goal}</p>
            <div className="flex justify-center my-4">
                {timerComponents}
            </div>
            {isExpired && <p className="text-red-400 font-bold my-4">The deadline has passed!</p>}
            <button
                onClick={onVerify}
                className="mt-8 w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-500"
            >
                Verify Goal Completion
            </button>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [isApiKeySet, setIsApiKeySet] = useState<boolean | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP_GOAL);
    const [goal, setGoal] = useState('');
    const [deadline, setDeadline] = useState<number>(0);
    const [lockImage, setLockImage] = useState<string | null>(null);
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraPurpose, setCameraPurpose] = useState<CameraPurpose>(CameraPurpose.LOCK);
    
    const [isLoading, setIsLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        // Check for the API key after the component has mounted to avoid
        // race conditions or errors with localStorage access on initial load.
        try {
            setIsApiKeySet(hasApiKey());
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            setIsApiKeySet(false); // Default to false if storage is inaccessible
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleGoalSubmit = (g: string, d: number) => {
        setGoal(g);
        setDeadline(d);
        setPhase(AppPhase.CAPTURE_LOCK);
        setCameraPurpose(CameraPurpose.LOCK);
        setIsCameraOpen(true);
    };

    const handlePictureTaken = async (imageDataUrl: string) => {
        setIsCameraOpen(false);
        if (cameraPurpose === CameraPurpose.LOCK) {
            setLockImage(imageDataUrl);
            setPhase(AppPhase.COUNTDOWN);
        } else if (cameraPurpose === CameraPurpose.PROOF) {
            setPhase(AppPhase.VERIFYING);
            setIsLoading(true);
            try {
                const isVerified = await verifyGoalWithAI(goal, imageDataUrl);
                setVerificationSuccess(isVerified);
            } catch (error) {
                console.error("Verification failed:", error);
                setVerificationSuccess(false);
            }
            setIsLoading(false);
            setPhase(AppPhase.RESULT);
        }
    };
    
    const handleStartVerification = () => {
        setCameraPurpose(CameraPurpose.PROOF);
        setIsCameraOpen(true);
    };
    
    const resetApp = () => {
        setPhase(AppPhase.SETUP_GOAL);
        setGoal('');
        setDeadline(0);
        setLockImage(null);
        setVerificationSuccess(null);
        setIsLoading(false);
    };

    const tryAgain = () => {
        setPhase(AppPhase.COUNTDOWN);
        setVerificationSuccess(null);
    }
    
    const renderContent = () => {
        if (isLoading) {
             return (
                <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
                    <Spinner />
                    <p className="mt-4 text-xl font-semibold">Verifying your achievement with AI...</p>
                    <p className="text-gray-400">This may take a moment.</p>
                </div>
            );
        }

        switch (phase) {
            case AppPhase.SETUP_GOAL:
                return <GoalSetupForm onSubmit={handleGoalSubmit} />;
            case AppPhase.COUNTDOWN:
                return <CountdownDisplay goal={goal} deadline={deadline} onVerify={handleStartVerification} />;
            case AppPhase.RESULT:
                if (verificationSuccess) {
                    return (
                        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-green-400">GOAL ACHIEVED!</h2>
                            <p className="text-gray-300 my-4">Congratulations! Here is your unlocked secret.</p>
                            <img src={lockImage!} alt="The unlocked secret lock code" className="rounded-lg shadow-lg mx-auto my-6 w-full object-contain" />
                            <button onClick={resetApp} className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                                Set a New Goal
                            </button>
                        </div>
                    );
                } else {
                     return (
                        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-red-400">Verification Failed</h2>
                            <p className="text-gray-300 my-4">The AI could not confirm that your goal was completed from the picture provided.</p>
                            <p className="text-gray-400 text-sm">Please provide clearer proof.</p>
                             <button onClick={tryAgain} className="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                                Try Again
                            </button>
                        </div>
                    );
                }
            default:
                // Fallback for CAPTURE_LOCK and VERIFYING if not showing loader
                return <GoalSetupForm onSubmit={handleGoalSubmit} />;
        }
    };

    // Render a loading state until the API key check is complete.
    if (isApiKeySet === null) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 font-sans">
                {/* Initial blank screen while checking for API key, can add a spinner here */}
            </main>
        );
    }

    if (!isApiKeySet) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 font-sans">
                <ApiKeySetup onKeySubmit={() => setIsApiKeySet(true)} />
            </main>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-900 font-sans">
            {isCameraOpen && <CameraModal onCapture={handlePictureTaken} onClose={() => setIsCameraOpen(false)} purpose={cameraPurpose === CameraPurpose.LOCK ? 'LOCK' : 'PROOF'} />}
            <div className="w-full">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;
