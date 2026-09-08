/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Minimal Official Marketing Landing Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #00897B (Civic Teal)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Highlight CTA: #FFB300 (Action Yellow)
 */

import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';

// Global Navigation Components
import TopNav from './components/Header/TopNav';
import BottomNav from './components/Navigation/BottomNav';

// Lazy loading route components for optimal performance and code splitting
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Home = React.lazy(() => import('./pages/Home'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Feed = React.lazy(() => import('./pages/Feed'));
const More = React.lazy(() => import('./pages/More'));
const Report = React.lazy(() => import('./pages/Report'));
const Profile = React.lazy(() => import('./pages/Profile'));
const SOS = React.lazy(() => import('./pages/SOS'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// New Official Marketing Pages
const DownloadPage = React.lazy(() => import('./pages/DownloadPage'));
const MarketingLanding = React.lazy(() => import('./pages/MarketingLanding'));

// Civic Expansion Modules
const CivicDirectory = React.lazy(() => import('./pages/CivicDirectory'));
const CivicPolls = React.lazy(() => import('./pages/CivicPolls'));
const LostFound = React.lazy(() => import('./pages/LostFound'));
const VolunteerNetwork = React.lazy(() => import('./pages/VolunteerNetwork'));
const PublicAmenities = React.lazy(() => import('./pages/PublicAmenities'));
const CivicRights = React.lazy(() => import('./pages/CivicRights'));

// Advanced Social Network Modules (NEW)
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const CreateStory = React.lazy(() => import('./pages/CreateStory'));
const StoryViewer = React.lazy(() => import('./pages/StoryViewer'));
const Comments = React.lazy(() => import('./pages/Comments'));
const Messages = React.lazy(() => import('./pages/Messages'));

// Minimalist loader utilizing the strictly requested 4-color palette
const PageLoader = () => (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center w-full">
        <div className="w-10 h-10 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin"></div>
    </div>
);

// Strict Admin Route Guard (Frontend Security Layer)
const AdminRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <PageLoader />;

    // Strictly verify Super Admin credentials
    if (user && user.email === 'testcodecfg@gmail.com') {
        return children;
    }

    // Redirect unauthorized users immediately
    return <Navigate to="/home" replace />;
};

// Global Emergency Intrusion System
const GlobalEmergencyOverlay = ({ currentUser }) => {
    const [activeWarning, setActiveWarning] = useState(null);

    useEffect(() => {
        // Listen to the live emergency broadcast channel
        const q = query(collection(db, 'nagrik_sos'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    const data = change.doc.data();
                    // Trigger overlay if the event is marked active
                    if (data.status === 'active' || data.isCritical) {
                        setActiveWarning(data);
                        triggerAudioAlarm();
                    } else {
                        setActiveWarning(null);
                        stopAudioAlarm();
                    }
                }
            });
        });
        return () => {
            unsubscribe();
            stopAudioAlarm();
        };
    }, []);

    const triggerAudioAlarm = () => {
        try {
            // Standard priority alert sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.loop = true;
            audio.play().catch((e) => console.log("Audio autoplay restricted by browser policy."));
            window.globalAlarmInstance = audio;
        } catch (error) {}
    };

    const stopAudioAlarm = () => {
        if (window.globalAlarmInstance) {
            window.globalAlarmInstance.pause();
            window.globalAlarmInstance = null;
        }
        setActiveWarning(null);
    };

    const runAdminTest = () => {
        setActiveWarning({
            title: "System Test Warning",
            description: "This is a simulated critical event test. A danger zone has been reported within a 10km radius of your location."
        });
        triggerAudioAlarm();
    };

    return (
        <>
            {/* Exclusive Super Admin Testing Interface */}
            {currentUser && currentUser.email === 'testcodecfg@gmail.com' && (
                <button 
                    onClick={runAdminTest}
                    className="fixed bottom-24 right-4 z-[9000] bg-[#111111] text-[#FFFFFF] px-4 py-3 rounded-xl font-bold text-[0.8rem] shadow-2xl border border-[#FFFFFF]/20 outline-none uppercase tracking-wider"
                >
                    Test 10km Warning
                </button>
            )}

            {/* Intrusive Full-Screen Warning Overlay */}
            <AnimatePresence>
                {activeWarning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#DC2626] flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
                    >
                        <div className="bg-[#FFFFFF] p-8 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="w-20 h-20 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="w-10 h-10 bg-[#DC2626] rounded-full animate-pulse"></div>
                            </div>
                            
                            <h1 className="text-[#DC2626] text-[1.8rem] font-black mb-2 uppercase tracking-tight leading-tight">
                                Critical Alert
                            </h1>
                            
                            <p className="text-[#111111] text-[1.1rem] font-black mb-4 leading-snug">
                                {activeWarning.title || "Severe Danger Reported"}
                            </p>
                            
                            <p className="text-[#111111]/70 text-[0.95rem] font-bold mb-8 leading-relaxed">
                                {activeWarning.description || "An emergency event has been verified within 10km of your current position. Please move to safety immediately and follow local authority instructions."}
                            </p>
                            
                            <button 
                                onClick={stopAudioAlarm}
                                className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-xl active:scale-95 transition-transform uppercase tracking-wider text-sm outline-none"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Layout Wrapper to conditionally handle Navigation visibility based on current route
const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    
    // Global Authentication State Listener
    // Automatically intercepts the route and pushes authenticated users to /home
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            // Check limits user redirection on login to avoid blocking the public download page
            if (user && (location.pathname === '/onboarding' || location.pathname === '/')) {
                navigate('/home', { replace: true });
            }
        });
        return () => unsubscribe();
    }, [location.pathname, navigate]);
    
    // Conditionally hide navigation components for immersive screens (including dynamic story routes)
    const isExcludedRoute = ['/onboarding', '/sos', '/admin', '/download', '/landing', '/create-story'].includes(location.pathname) || location.pathname.startsWith('/story');
    
    // Strictly remove relative container restraints for marketing routes to force edge-to-edge widescreen rendering
    const isWidescreenRoute = ['/landing', '/download'].includes(location.pathname);

    return (
        <div className={`${isWidescreenRoute ? "w-full min-h-screen bg-[#FFFFFF]" : "relative min-h-screen bg-[#FFFFFF]"}`}>
            
            {/* Inject Global Emergency Warning System */}
            <GlobalEmergencyOverlay currentUser={currentUser} />

            {/* Conditionally render Top Navigation */}
            {!isExcludedRoute && <TopNav />}

            {/* Main Content Area - Adds padding if TopNav is active to prevent overlap, removes limits for widescreen pages */}
            <div className={!isExcludedRoute ? "pt-16 pb-24" : "w-full"}>
                <Suspense fallback={<PageLoader />}>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            {/* Core NagrikSetu Public Routes */}
                            <Route path="/" element={<Navigate to="/onboarding" replace />} />
                            <Route path="/onboarding" element={<Onboarding />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/feed" element={<Feed />} />
                            <Route path="/more" element={<More />} />
                            
                            {/* Auth & Profile */}
                            <Route path="/profile" element={<Profile />} />
                            
                            {/* Issue Reporting Engine */}
                            <Route path="/report" element={<Report />} />

                            {/* Live Panic Broadcast Engine */}
                            <Route path="/sos" element={<SOS />} />

                            {/* New Civic Expansion Routes */}
                            <Route path="/directory" element={<CivicDirectory />} />
                            <Route path="/polls" element={<CivicPolls />} />
                            <Route path="/lost-found" element={<LostFound />} />
                            <Route path="/volunteer" element={<VolunteerNetwork />} />
                            <Route path="/amenities" element={<PublicAmenities />} />
                            <Route path="/rights" element={<CivicRights />} />

                            {/* Civic Gamification */}
                            <Route path="/leaderboard" element={<Leaderboard />} />

                            {/* Advanced Social Network Routes (NEW) */}
                            <Route path="/create" element={<CreatePost />} />
                            <Route path="/create-story" element={<CreateStory />} />
                            <Route path="/story/:id" element={<StoryViewer />} />
                            <Route path="/comments/:id" element={<Comments />} />
                            <Route path="/profile/:id" element={<UserProfile />} />
                            <Route path="/messages" element={<Messages />} />

                            {/* Official Download Landing Page */}
                            <Route path="/download" element={<DownloadPage />} />
                            
                            {/* Marketing Showcase Landing Page */}
                            <Route path="/landing" element={<MarketingLanding />} />

                            {/* Exclusive Super Admin Moderation Route */}
                            <Route 
                                path="/admin" 
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                } 
                            />
                            
                            {/* Fallback Interception for Invalid URLs */}
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </AnimatePresence>
                </Suspense>
            </div>

            {/* Conditionally render Bottom Navigation */}
            {!isExcludedRoute && <BottomNav />}
        </div>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}