import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, UploadCloud, MapPin, EyeOff, Eye, Image as ImageIcon, Video, X, CheckCircle, Shield } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function CreatePost() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [lang, setLang] = useState('en');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Media Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Simplified Terminology
    const t = {
        en: { header: "Add Post", media_box: "Select Photo or Video", title_ph: "Post Title", desc_ph: "Write details here...", loc_ph: "Ward or Area Name", anon_title: "Hide Identity", anon_sub: "Hide your name and photo", submit: "Share Post", publishing: "Uploading...", err_media: "Please add a photo or video.", err_fields: "Please fill all details." },
        hi: { header: "पोस्ट डालें", media_box: "फ़ोटो या वीडियो चुनें", title_ph: "पोस्ट का शीर्षक", desc_ph: "यहाँ विवरण लिखें...", loc_ph: "वार्ड या क्षेत्र का नाम", anon_title: "पहचान छिपाएं", anon_sub: "अपना नाम और फ़ोटो छिपाएं", submit: "पोस्ट साझा करें", publishing: "अपलोड हो रहा है...", err_media: "कृपया एक फ़ोटो या वीडियो चुनें।", err_fields: "कृपया सभी विवरण भरें।" },
        hinglish: { header: "Post Daalein", media_box: "Photo ya Video Chunein", title_ph: "Post Title", desc_ph: "Details likhein...", loc_ph: "Ward ya Area ka naam", anon_title: "Identity Hide Karein", anon_sub: "Apna naam aur photo hide karein", submit: "Post Share Karein", publishing: "Upload ho raha hai...", err_media: "Ek photo ya video add karein.", err_fields: "Sabhi details bharein." },
        mr: { header: "पोस्ट जोडा", media_box: "फोटो किंवा व्हिडिओ निवडा", title_ph: "पोस्टचे शीर्षक", desc_ph: "येथे तपशील लिहा...", loc_ph: "प्रभाग किंवा परिसराचे नाव", anon_title: "ओळख लपवा", anon_sub: "तुमचे नाव आणि फोटो लपवा", submit: "पोस्ट शेअर करा", publishing: "अपलोड होत आहे...", err_media: "कृपया फोटो किंवा व्हिडिओ निवडा.", err_fields: "कृपया सर्व माहिती भरा." },
        gu: { header: "પોસ્ટ ઉમેરો", media_box: "ફોટો અથવા વિડિઓ પસંદ કરો", title_ph: "પોસ્ટ શીર્ષક", desc_ph: "અહીં વિગતો લખો...", loc_ph: "વોર્ડ અથવા વિસ્તારનું નામ", anon_title: "ઓળખ છુપાવો", anon_sub: "તમારું નામ અને ફોટો છુપાવો", submit: "પોસ્ટ શેર કરો", publishing: "અપલોડ થઈ રહ્યું છે...", err_media: "કૃપા કરીને ફોટો અથવા વિડિઓ ઉમેરો.", err_fields: "કૃપા કરીને બધી વિગતો ભરો." },
        te: { header: "పోస్ట్‌ను జోడించండి", media_box: "ఫోటో లేదా వీడియోను ఎంచుకోండి", title_ph: "పోస్ట్ శీర్షిక", desc_ph: "ఇక్కడ వివరాలు రాయండి...", loc_ph: "వార్డు లేదా ప్రాంతం పేరు", anon_title: "గుర్తింపు దాచు", anon_sub: "మీ పేరు మరియు ఫోటోను దాచండి", submit: "పోస్ట్‌ను భాగస్వామ్యం చేయండి", publishing: "అప్‌లోడ్ అవుతోంది...", err_media: "దయచేసి ఫోటో లేదా వీడియోను జోడించండి.", err_fields: "దయచేసి అన్ని వివరాలను పూరించండి." },
        ta: { header: "பதிவைச் சேர்", media_box: "புகைப்படம் அல்லது வீடியோவைத் தேர்ந்தெடு", title_ph: "பதிவு தலைப்பு", desc_ph: "இங்கே விவரங்களை எழுதவும்...", loc_ph: "வார்டு அல்லது பகுதி பெயர்", anon_title: "அடையாளத்தை மறை", anon_sub: "உங்கள் பெயர் மற்றும் புகைப்படத்தை மறைக்கவும்", submit: "பதிவை பகிரவும்", publishing: "பதிவேற்றப்படுகிறது...", err_media: "ஒரு புகைப்படம் அல்லது வீடியோவைச் சேர்க்கவும்.", err_fields: "அனைத்து விவரங்களையும் நிரப்பவும்." },
        kn: { header: "ಪೋಸ್ಟ್ ಸೇರಿಸಿ", media_box: "ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೊ ಆಯ್ಕೆಮಾಡಿ", title_ph: "ಪೋಸ್ಟ್ ಶೀರ್ಷಿಕೆ", desc_ph: "ಇಲ್ಲಿ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ...", loc_ph: "ವಾರ್ಡ್ ಅಥವಾ ಪ್ರದೇಶದ ಹೆಸರು", anon_title: "ಗುರುತನ್ನು ಮರೆಮಾಡಿ", anon_sub: "ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಫೋಟೋ ಮರೆಮಾಡಿ", submit: "ಪೋಸ್ಟ್ ಹಂಚಿಕೊಳ್ಳಿ", publishing: "ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...", err_media: "ದಯವಿಟ್ಟು ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೊ ಸೇರಿಸಿ.", err_fields: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ." },
        ml: { header: "പോസ്റ്റ് ചേർക്കുക", media_box: "ഫോട്ടോ അല്ലെങ്കിൽ വീഡിയോ തിരഞ്ഞെടുക്കുക", title_ph: "പോസ്റ്റ് തലക്കെട്ട്", desc_ph: "വിശദാംശങ്ങൾ ഇവിടെ എഴുതുക...", loc_ph: "വാർഡ് അല്ലെങ്കിൽ പ്രദേശത്തിന്റെ പേര്", anon_title: "ഐഡന്റിറ്റി മറയ്ക്കുക", anon_sub: "നിങ്ങളുടെ പേരും ഫോട്ടോയും മറയ്ക്കുക", submit: "പോസ്റ്റ് പങ്കിടുക", publishing: "അപ്‌ലോഡ് ചെയ്യുന്നു...", err_media: "ഒരു ഫോട്ടോയോ വീഡിയോയോ ചേർക്കുക.", err_fields: "എല്ലാ വിശദാംശങ്ങളും പൂരിപ്പിക്കുക." },
        bn: { header: "পোস্ট যোগ করুন", media_box: "ছবি বা ভিডিও নির্বাচন করুন", title_ph: "পোস্টের শিরোনাম", desc_ph: "এখানে বিস্তারিত লিখুন...", loc_ph: "ওয়ার্ড বা এলাকার নাম", anon_title: "পরিচয় লুকান", anon_sub: "আপনার নাম এবং ছবি লুকান", submit: "পোস্ট শেয়ার করুন", publishing: "আপলোড হচ্ছে...", err_media: "অনুগ্রহ করে একটি ছবি বা ভিডিও যোগ করুন।", err_fields: "সব বিস্তারিত পূরণ করুন।" },
        pa: { header: "ਪੋਸਟ ਸ਼ਾਮਲ ਕਰੋ", media_box: "ਫੋਟੋ ਜਾਂ ਵੀਡੀਓ ਚੁਣੋ", title_ph: "ਪੋਸਟ ਸਿਰਲੇਖ", desc_ph: "ਇੱਥੇ ਵੇਰਵੇ ਲਿਖੋ...", loc_ph: "ਵਾਰਡ ਜਾਂ ਖੇਤਰ ਦਾ ਨਾਮ", anon_title: "ਪਛਾਣ ਲੁਕਾਓ", anon_sub: "ਆਪਣਾ ਨਾਮ ਅਤੇ ਫੋਟੋ ਲੁਕਾਓ", submit: "ਪੋਸਟ ਸਾਂਝੀ ਕਰੋ", publishing: "ਅੱਪਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", err_media: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਫੋਟੋ ਜਾਂ ਵੀਡੀਓ ਸ਼ਾਮਲ ਕਰੋ।", err_fields: "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਵੇਰਵੇ ਭਰੋ।" },
        or: { header: "ପୋଷ୍ଟ ଯୋଡନ୍ତୁ", media_box: "ଫଟୋ କିମ୍ବା ଭିଡିଓ ବାଛନ୍ତୁ", title_ph: "ପୋଷ୍ଟ ଶୀର୍ଷକ", desc_ph: "ଏଠାରେ ବିବରଣୀ ଲେଖନ୍ତୁ...", loc_ph: "ୱାର୍ଡ କିମ୍ବା ଅଞ୍ଚଳ ନାମ", anon_title: "ପରିଚୟ ଲୁଚାନ୍ତୁ", anon_sub: "ଆପଣଙ୍କ ନାମ ଏବଂ ଫଟୋ ଲୁଚାନ୍ତୁ", submit: "ପୋଷ୍ଟ ଅଂଶୀଦାର କରନ୍ତୁ", publishing: "ଅପଲୋଡ୍ ହେଉଛି...", err_media: "ଦୟାକରି ଏକ ଫଟୋ କିମ୍ବା ଭିଡିଓ ଯୋଡନ୍ତୁ।", err_fields: "ଦୟାକରି ସମସ୍ତ ବିବରଣୀ ପୂରଣ କରନ୍ତୁ।" },
        as: { header: "পোষ্ট যোগ কৰক", media_box: "ফটো বা ভিডিঅ' বাছক", title_ph: "পোষ্টৰ শিৰোনাম", desc_ph: "ইয়াত বিৱৰণ লিখক...", loc_ph: "ৱাৰ্ড বা অঞ্চলৰ নাম", anon_title: "পৰিচয় লুকুৱাওক", anon_sub: "আপোনাৰ নাম আৰু ফটো লুকুৱাওক", submit: "পোষ্ট শ্বেয়াৰ কৰক", publishing: "আপলোড হৈ আছে...", err_media: "অনুগ্ৰহ কৰি এখন ফটো বা ভিডিঅ' যোগ কৰক।", err_fields: "অনুগ্ৰহ কৰি সকলো বিৱৰণ পূৰণ কৰক।" },
        ur: { header: "پوسٹ شامل کریں", media_box: "تصویر یا ویڈیو منتخب کریں", title_ph: "پوسٹ کا عنوان", desc_ph: "یہاں تفصیلات لکھیں۔۔۔", loc_ph: "وارڈ یا علاقے کا نام", anon_title: "شناخت چھپائیں", anon_sub: "اپنا نام اور تصویر چھپائیں", submit: "پوسٹ شیئر کریں", publishing: "اپ لوڈ ہو رہا ہے۔۔۔", err_media: "براہ کرم ایک تصویر یا ویڈیو شامل کریں۔", err_fields: "براہ کرم تمام تفصیلات پُر کریں۔" },
        bho: { header: "पोस्ट डालीं", media_box: "फोटो या वीडियो चुनीं", title_ph: "पोस्ट के शीर्षक", desc_ph: "इहाँ विवरण लिखीं...", loc_ph: "वार्ड या इलाका के नाम", anon_title: "पहचान छिपाईं", anon_sub: "अपन नाम आ फोटो छिपाईं", submit: "पोस्ट साझा करीं", publishing: "अपलोड हो रहल बा...", err_media: "कृपया एगो फोटो या वीडियो डालीं।", err_fields: "कृपया सगरी जानकारी भरीं।" }
    };

    const currentT = t[lang] || t['en'];

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setErrorMessage('');
        setSelectedFile(file);

        if (file.type.startsWith('video/')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
    };

    // Remove Selected Media
    const handleRemoveMedia = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Form Submission & Upload Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!selectedFile) {
            setErrorMessage(currentT.err_media);
            return;
        }

        if (!title.trim() || !description.trim()) {
            setErrorMessage(currentT.err_fields);
            return;
        }

        setIsSubmitting(true);

        try {
            const currentUser = auth.currentUser;
            const userId = currentUser ? currentUser.uid : 'guest';
            const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Citizen';

            // Step 1: Upload media to external Hugging Face PocketBase instance
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userId', userId); // CORRECTED PAYLOAD KEY
            formData.append('postId', 'pending'); // CORRECTED PAYLOAD KEY
            formData.append('is_anonymous', isAnonymous ? 'true' : 'false');

            const pbResponse = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/posts_media/records', {
                method: 'POST',
                body: formData
            });

            if (!pbResponse.ok) {
                throw new Error("External storage upload failed.");
            }

            const pbRecord = await pbResponse.json();
            const mediaUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${pbRecord.collectionId}/${pbRecord.id}/${pbRecord.file}`;

            // Step 2: Write metadata to Firestore collection
            await addDoc(collection(db, 'nagrik_reels'), {
                authorId: userId,
                authorName: isAnonymous ? 'Hidden Citizen' : userDisplayName,
                title: title.trim(),
                description: description.trim(),
                location: location.trim() || 'Local Area',
                mediaUrl: mediaUrl,
                type: mediaType,
                isAnonymous: isAnonymous,
                isStory: false, 
                likes: 0,
                createdAt: serverTimestamp()
            });

            navigate('/feed');
        } catch (err) {
            console.error("Submission failed:", err);
            setErrorMessage("Failed to publish post. Please verify your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="outline-none active:scale-95 transition-transform">
                        <ChevronLeft size={28} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <span className="font-black text-[1.2rem] tracking-tight">{currentT.header}</span>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-[600px] mx-auto p-4 flex flex-col gap-5">
                
                {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl">
                        {errorMessage}
                    </div>
                )}

                {/* Media Selector Box */}
                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] bg-[#F9FAFB] border-2 border-dashed border-[#111111]/20 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#00897B] transition-colors p-6 text-center"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#00897B]/10 flex items-center justify-center text-[#00897B]">
                            <UploadCloud size={28} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[0.95rem] text-[#111111]">{currentT.media_box}</span>
                        <span className="text-[0.75rem] font-medium text-[#111111]/50">JPG, PNG, WEBP, MP4 (Max 50MB)</span>
                    </div>
                ) : (
                    <div className="w-full aspect-[4/3] bg-[#111111] rounded-2xl relative overflow-hidden flex items-center justify-center">
                        {mediaType === 'image' ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={previewUrl} controls className="w-full h-full object-cover" />
                        )}
                        <button 
                            type="button" 
                            onClick={handleRemoveMedia} 
                            className="absolute top-3 right-3 w-8 h-8 bg-[#111111]/80 text-[#FFFFFF] rounded-full flex items-center justify-center outline-none shadow-md"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp,video/mp4" 
                    className="hidden" 
                />

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    <input 
                        type="text" 
                        placeholder={currentT.title_ph} 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-3.5 text-[0.95rem] font-bold outline-none focus:border-[#00897B]" 
                    />

                    <textarea 
                        placeholder={currentT.desc_ph} 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-3.5 text-[0.95rem] font-medium outline-none focus:border-[#00897B] min-h-[110px]" 
                    />

                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#111111]/40">
                            <MapPin size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={currentT.loc_ph} 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl py-3.5 pl-10 pr-3.5 text-[0.95rem] font-medium outline-none focus:border-[#00897B]" 
                        />
                    </div>

                    {/* Anonymous Toggle */}
                    <div 
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isAnonymous ? 'bg-[#111111] border-[#111111] text-[#FFFFFF]' : 'bg-[#F9FAFB] border-[#111111]/15 text-[#111111]'}`}
                    >
                        <div className="flex items-center gap-3">
                            {isAnonymous ? <EyeOff size={22} className="text-[#FFB300]" /> : <Eye size={22} className="text-[#111111]/60" />}
                            <div className="flex flex-col">
                                <span className="font-black text-[0.9rem] leading-tight flex items-center gap-1.5">
                                    {currentT.anon_title}
                                    {!isAnonymous && <Shield size={12} className="text-[#00897B]" fill="#00897B" />}
                                </span>
                                <span className={`text-[0.75rem] ${isAnonymous ? 'text-[#FFFFFF]/70' : 'text-[#111111]/50'}`}>{currentT.anon_sub}</span>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isAnonymous ? 'bg-[#FFB300] border-[#FFB300] text-[#111111]' : 'border-[#111111]/30'}`}>
                            {isAnonymous && <CheckCircle size={16} strokeWidth={3} />}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-[#00897B] text-[#FFFFFF] font-black py-4 rounded-xl mt-2 active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm shadow-md flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <div className="w-4 h-4 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>}
                        {isSubmitting ? currentT.publishing : currentT.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}