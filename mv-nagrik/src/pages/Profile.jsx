import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Mail, Calendar, ShieldCheck, Settings, Edit3, BadgeCheck, Grid, Archive, Bookmark, Play, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function Profile() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Tabbed Interface State
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'stories' | 'saved'
    const [userPosts, setUserPosts] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) setLang(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Real-time Firebase Authentication & Content Fetching
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                // Fetch User Posts & Archived Stories
                const reelsRef = collection(db, 'nagrik_reels');
                const qReels = query(reelsRef, where('authorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                
                const unsubscribeReels = onSnapshot(qReels, (snapshot) => {
                    const allContent = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setUserPosts(allContent.filter(item => !item.isStory));
                    setUserStories(allContent.filter(item => item.isStory));
                });

                // Fetch Saved Bookmarks
                const bookmarksRef = collection(db, 'nagrik_bookmarks');
                const qBookmarks = query(bookmarksRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'));
                
                const unsubscribeBookmarks = onSnapshot(qBookmarks, async (snapshot) => {
                    const fetchedSaved = [];
                    for (const bDoc of snapshot.docs) {
                        const postId = bDoc.data().postId;
                        const postRef = doc(db, 'nagrik_reels', postId);
                        const postSnap = await getDoc(postRef);
                        if (postSnap.exists()) {
                            fetchedSaved.push({ id: postSnap.id, ...postSnap.data() });
                        }
                    }
                    setSavedPosts(fetchedSaved);
                    setIsLoading(false);
                });

                return () => {
                    unsubscribeReels();
                    unsubscribeBookmarks();
                };
            } else {
                navigate('/onboarding', { replace: true });
                setIsLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, [navigate]);

    const t = {
        en: { title: "Profile", email: "Email Address", member: "Member Since", account: "Account ID", logout: "Sign Out", secure: "Secure Account", load: "Loading...", posts: "Active Posts", stories: "Archived Stories", saved: "Saved Content", edit: "Edit", settings: "Settings" },
        hi: { title: "प्रोफ़ाइल", email: "ईमेल पता", member: "सदस्य बने", account: "खाता आईडी", logout: "साइन आउट", secure: "सुरक्षित खाता", load: "लोड हो रहा है...", posts: "सक्रिय पोस्ट", stories: "संग्रहीत स्टोरी", saved: "सहेजी गई सामग्री", edit: "संपादित करें", settings: "सेटिंग्स" },
        hinglish: { title: "Profile", email: "Email Address", member: "Member Since", account: "Account ID", logout: "Sign Out", secure: "Secure Account", load: "Load ho raha hai...", posts: "Active Posts", stories: "Archived Stories", saved: "Saved Content", edit: "Edit", settings: "Settings" },
        mr: { title: "प्रोफाइल", email: "ईमेल पत्ता", member: "सदस्य झाल्यापासून", account: "खाते आयडी", logout: "साइन आउट", secure: "सुरक्षित खाते", load: "लोड होत आहे...", posts: "सक्रिय पोस्ट", stories: "संग्रहित स्टोरी", saved: "जतन केलेली सामग्री", edit: "संपादित करा", settings: "सेटिंग्ज" },
        gu: { title: "પ્રોફાઇલ", email: "ઇમેઇલ સરનામું", member: "સભ્ય બન્યા", account: "એકાઉન્ટ આઈડી", logout: "સાઇન આઉટ", secure: "સુરક્ષિત એકાઉન્ટ", load: "લોડ થઈ રહ્યું છે...", posts: "સક્રિય પોસ્ટ્સ", stories: "સંગ્રહિત વાર્તાઓ", saved: "સાચવેલ સામગ્રી", edit: "સંપાદિત કરો", settings: "સેટિંગ્સ" },
        te: { title: "ప్రొఫైల్", email: "ఇమెయిల్ చిరునామా", member: "సభ్యుడైన తేదీ", account: "ఖాతా ID", logout: "సైన్ అవుట్", secure: "సురక్షిత ఖాతా", load: "లోడ్ అవుతోంది...", posts: "క్రియాశీల పోస్ట్‌లు", stories: "ఆర్కైవ్ చేసిన కథనాలు", saved: "సేవ్ చేయబడిన కంటెంట్", edit: "సవరించండి", settings: "సెట్టింగ్‌లు" },
        ta: { title: "சுயவிவரம்", email: "மின்னஞ்சல் முகவரி", member: "உறுப்பினர் ஆன நாள்", account: "கணக்கு ID", logout: "வெளியேறு", secure: "பாதுகாப்பான கணக்கு", load: "ஏற்றப்படுகிறது...", posts: "செயலில் உள்ள பதிவுகள்", stories: "காப்பகப்படுத்தப்பட்ட கதைகள்", saved: "சேமிக்கப்பட்ட உள்ளடக்கம்", edit: "திருத்து", settings: "அமைப்புகள்" },
        kn: { title: "ಪ್ರೊಫೈಲ್", email: "ಇಮೇಲ್ ವಿಳಾಸ", member: "ಸದಸ್ಯರಾದ ದಿನಾಂಕ", account: "ಖಾತೆ ಐಡಿ", logout: "ಸೈನ್ ಔಟ್", secure: "ಸುರಕ್ಷಿತ ಖಾತೆ", load: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", posts: "ಸಕ್ರಿಯ ಪೋಸ್ಟ್‌ಗಳು", stories: "ಆರ್ಕೈವ್ ಮಾಡಿದ ಕಥೆಗಳು", saved: "ಉಳಿಸಿದ ವಿಷಯ", edit: "ತಿದ್ದು", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
        ml: { title: "പ്രൊഫൈൽ", email: "ഇമെയിൽ വിലാസം", member: "അംഗമായ തീയതി", account: "അക്കൗണ്ട് ഐഡി", logout: "സൈൻ ഔട്ട്", secure: "സുരക്ഷിത അക്കൗണ്ട്", load: "ലോഡ് ചെയ്യുന്നു...", posts: "സജീവ പോസ്റ്റുകൾ", stories: "ആർക്കൈവ് ചെയ്ത സ്റ്റോറികൾ", saved: "സംരക്ഷിച്ച ഉള്ളടക്കം", edit: "തിരുത്തുക", settings: "ക്രമീകരണങ്ങൾ" },
        bn: { title: "প্রোফাইল", email: "ইমেইল ঠিকানা", member: "সদস্য হওয়ার তারিখ", account: "অ্যাকাউন্ট আইডি", logout: "সাইন আউট", secure: "নিরাপদ অ্যাকাউন্ট", load: "লোড হচ্ছে...", posts: "সক্রিয় পোস্ট", stories: "আর্কাইভ করা স্টোরি", saved: "সংরক্ষিত সামগ্রী", edit: "সম্পাদনা করুন", settings: "সেটিংস" },
        pa: { title: "ਪ੍ਰੋਫਾਈਲ", email: "ਈਮੇਲ ਪਤਾ", member: "ਮੈਂਬਰ ਬਣਨ ਦੀ ਮਿਤੀ", account: "ਖਾਤਾ ਆਈਡੀ", logout: "ਸਾਈਨ ਆਉਟ", secure: "ਸੁਰੱਖਿਅਤ ਖਾਤਾ", load: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", posts: "ਸਰਗਰਮ ਪੋਸਟਾਂ", stories: "ਆਰਕਾਈਵ ਕੀਤੀਆਂ ਕਹਾਣੀਆਂ", saved: "ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਸਮੱਗਰੀ", edit: "ਸੋਧੋ", settings: "ਸੈਟਿੰਗਾਂ" },
        or: { title: "ପ୍ରୋଫାଇଲ୍", email: "ଇମେଲ୍ ଠିକଣା", member: "ସଦସ୍ୟ ହେବା ଦିନ", account: "ଆକାଉଣ୍ଟ୍ ଆଇଡି", logout: "ସାଇନ୍ ଆଉଟ୍", secure: "ସୁରକ୍ଷିତ ଆକାଉଣ୍ଟ୍", load: "ଲୋଡ୍ ହେଉଛି...", posts: "ସକ୍ରିୟ ପୋଷ୍ଟ", stories: "ଅଭିଲେଖାଗାର ଷ୍ଟୋରୀ", saved: "ସଂରକ୍ଷିତ ବିଷୟବସ୍ତୁ", edit: "ସମ୍ପାଦନ କରନ୍ତୁ", settings: "ସେଟିଂସମୂହ" },
        as: { title: "প্ৰফাইল", email: "ইমেইল ঠিকনা", member: "সদস্য হোৱা তাৰিখ", account: "একাউণ্ট আইডি", logout: "ছাইন আউট", secure: "সুৰক্ষিত একাউণ্ট", load: "ল'ড হৈ আছে...", posts: "সক্ৰিয় পোষ্ট", stories: "আৰ্কাইভ কৰা ষ্টোৰী", saved: "সংৰক্ষিত সমল", edit: "সম্পাদনা কৰক", settings: "ছেটিংছ" },
        ur: { title: "پروفائل", email: "ای میل ایڈریس", member: "ممبر بننے کی تاریخ", account: "اکاؤنٹ آئی ڈی", logout: "سائن آؤٹ", secure: "محفوظ اکاؤنٹ", load: "لوڈ ہو رہا ہے۔۔۔", posts: "فعال پوسٹس", stories: "آرکائیو شدہ کہانیاں", saved: "محفوظ کردہ مواد", edit: "ترمیم کریں", settings: "ترتیبات" },
        bho: { title: "प्रोफाइल", email: "ईमेल पता", member: "सदस्य बनला के तारीख", account: "खाता आईडी", logout: "साइन आउट", secure: "सुरक्षित खाता", load: "लोड हो रहल बा...", posts: "सक्रिय पोस्ट", stories: "संग्रहीत स्टोरी", saved: "सेव कइल सामग्री", edit: "संपादित करीं", settings: "सेटिंग्स" }
    };

    const currentT = t[lang] || t['en'];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            navigate('/onboarding', { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    const handleDeleteContent = async (id, isBookmark = false) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;
        try {
            if (isBookmark) {
                await deleteDoc(doc(db, 'nagrik_bookmarks', `${id}_${user.uid}`));
            } else {
                await deleteDoc(doc(db, 'nagrik_reels', id));
            }
        } catch (error) {
            console.error("Deletion failed:", error);
        }
    };

    const formatCreationDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-[#111111]">
                <div className="w-8 h-8 border-4 border-[#E0F2F1] border-t-[#00897B] rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-[0.9rem] text-[#888888]">{currentT.load}</span>
            </div>
        );
    }

    const renderGrid = (items, isBookmarkView = false) => {
        if (items.length === 0) {
            return (
                <div className="w-full py-12 flex items-center justify-center text-[#111111]/40 font-bold text-[0.9rem]">
                    No content available.
                </div>
            );
        }
        return (
            <div className="grid grid-cols-3 gap-1">
                {items.map((item) => (
                    <div key={item.id} className="relative aspect-square bg-[#111111]/5 group overflow-hidden cursor-pointer" onClick={() => navigate(item.isStory ? `/story/${item.id}` : `/profile`)}>
                        {item.type === 'video' ? (
                            <>
                                <video src={item.mediaUrl} className="w-full h-full object-cover" />
                                <div className="absolute top-1 right-1 text-[#FFFFFF] drop-shadow-md"><Play size={16} fill="#FFFFFF" /></div>
                            </>
                        ) : (
                            <img src={item.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        )}
                        
                        {/* Interactive Overlay for Management */}
                        <div className="absolute inset-0 bg-[#111111]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteContent(item.id, isBookmarkView); }}
                                className="w-10 h-10 bg-[#D32F2F] text-[#FFFFFF] rounded-full flex items-center justify-center hover:scale-105 transition-transform outline-none shadow-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
            
            {/* Action Bar Navigation */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
                <span className="font-black text-[1.2rem] text-[#FFFFFF] tracking-tight drop-shadow-sm">{currentT.title}</span>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/edit-profile')} className="w-10 h-10 bg-[#FFFFFF]/20 backdrop-blur-md rounded-full flex items-center justify-center text-[#FFFFFF] outline-none active:scale-95 transition-transform">
                        <Edit3 size={18} />
                    </button>
                    <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-[#FFFFFF]/20 backdrop-blur-md rounded-full flex items-center justify-center text-[#FFFFFF] outline-none active:scale-95 transition-transform">
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-[#00897B] pt-20 pb-12 px-6 rounded-b-[40px] shadow-sm">
                <div className="max-w-[500px] mx-auto text-center flex flex-col items-center">
                    
                    {/* User Avatar */}
                    <div className="w-24 h-24 bg-[#E0F2F1] rounded-full border-4 border-[#FFFFFF] shadow-sm flex items-center justify-center mb-4 relative">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={40} className="text-[#00897B]" strokeWidth={2.5} />
                        )}
                        {/* Verified Citizen Badge Integration */}
                        <div className="absolute bottom-0 right-0 bg-[#FFFFFF] rounded-full p-[2px] shadow-sm">
                            <BadgeCheck size={20} className="text-[#00897B]" fill="#00897B" color="#FFFFFF" />
                        </div>
                    </div>

                    <h2 className="text-[1.5rem] font-black text-[#FFFFFF] tracking-tight mb-1 flex items-center justify-center gap-1.5">
                        {user.displayName || 'Citizen'}
                    </h2>
                    <span className="text-[#FFFFFF]/80 text-[0.8rem] font-bold tracking-wide mb-4">Official Citizen Account</span>

                    <div className="flex items-center justify-center gap-6 w-full mt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-[1.2rem] font-black text-[#FFFFFF]">{userPosts.length}</span>
                            <span className="text-[0.7rem] text-[#FFFFFF]/80 font-bold uppercase tracking-wider">{currentT.posts}</span>
                        </div>
                        <div className="w-px h-8 bg-[#FFFFFF]/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[1.2rem] font-black text-[#FFFFFF]">{userStories.length}</span>
                            <span className="text-[0.7rem] text-[#FFFFFF]/80 font-bold uppercase tracking-wider">{currentT.stories}</span>
                        </div>
                        <div className="w-px h-8 bg-[#FFFFFF]/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[1.2rem] font-black text-[#FFFFFF]">{savedPosts.length}</span>
                            <span className="text-[0.7rem] text-[#FFFFFF]/80 font-bold uppercase tracking-wider">{currentT.saved}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Profile Management Interface */}
            <div className="max-w-[500px] mx-auto bg-[#FFFFFF] min-h-[400px]">
                
                {/* Tabs */}
                <div className="flex items-center w-full border-b border-[#111111]/10">
                    <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-4 flex items-center justify-center outline-none border-b-2 transition-colors ${activeTab === 'posts' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/40 hover:text-[#111111]/70'}`}
                    >
                        <Grid size={22} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('stories')}
                        className={`flex-1 py-4 flex items-center justify-center outline-none border-b-2 transition-colors ${activeTab === 'stories' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/40 hover:text-[#111111]/70'}`}
                    >
                        <Archive size={22} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-4 flex items-center justify-center outline-none border-b-2 transition-colors ${activeTab === 'saved' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/40 hover:text-[#111111]/70'}`}
                    >
                        <Bookmark size={22} />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="w-full">
                    {activeTab === 'posts' && renderGrid(userPosts)}
                    {activeTab === 'stories' && renderGrid(userStories)}
                    {activeTab === 'saved' && renderGrid(savedPosts, true)}
                </div>

                {/* Account Details & Logout Container */}
                <div className="px-4 py-8 mt-4 border-t border-[#111111]/5">
                    <div className="w-full flex flex-col gap-4 mb-8">
                        <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FAFAFA] border border-[#E0E0E0]">
                            <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                                <Mail size={18} className="text-[#1565C0]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.8rem] font-bold text-[#888888]">{currentT.email}</span>
                                <span className="text-[0.95rem] font-black text-[#111111] break-all">{user.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FAFAFA] border border-[#E0E0E0]">
                            <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center shrink-0">
                                <Calendar size={18} className="text-[#00897B]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.8rem] font-bold text-[#888888]">{currentT.member}</span>
                                <span className="text-[0.95rem] font-black text-[#111111] break-all">{formatCreationDate(user.metadata.creationTime)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center mt-2">
                            <span className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">{currentT.account}</span>
                            <span className="text-[0.7rem] font-mono font-medium text-[#cccccc] bg-[#FAFAFA] px-2 py-1 rounded-md border border-[#E0E0E0]">{user.uid}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full h-[60px] bg-[#FFEBEE] text-[#D32F2F] rounded-[20px] font-black text-[1rem] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-[#EF9A9A] outline-none"
                    >
                        {isLoggingOut ? (
                            <div className="w-6 h-6 border-2 border-t-transparent border-[#D32F2F] rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogOut size={20} strokeWidth={2.5} />
                                {currentT.logout}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}