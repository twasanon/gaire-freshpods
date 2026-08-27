export type Locale = 'en' | 'ne';

const en = {
  meta: {
    title: 'Gaire Freshpods, helmet sanitizing machines in Nepal',
    description: 'Freshpods is a five-minute helmet sanitizing machine using UV-C light, dry fog and ionization.',
  },
  language: { short: 'EN', switchLabel: 'नेपालीमा हेर्नुहोस्' },
  a11y: {
    skip: 'Skip to content', home: 'Gaire Freshpods, home', sections: 'Sections',
    openMenu: 'Open menu', closeMenu: 'Close menu', cabinetFinish: 'Cabinet finish',
    selectFinish: 'Select', rotateLeft: 'Rotate machine left', rotateRight: 'Rotate machine right',
    cycleStages: 'Cycle stages', stage: 'Stage', of: 'of', socialLinks: 'Social media',
  },
  nav: [
    { href: '#colours', label: 'Machine' }, { href: '#cycle', label: 'Cycle' },
    { href: '#problem', label: 'The problem' }, { href: '#specs', label: 'Specifications' },
    { href: '#lab', label: 'Testing' },
  ],
  actions: { bookDemo: 'Book a demo', watchCycle: 'Watch a cycle' },
  hero: {
    line1: 'Ride fresh.', line2: 'Every Time.',
    lead: 'Put your helmet in and close the door. Five minutes later, it is ready to wear again.',
    quickFacts: [
      { label: 'Cycle time', value: '5 minutes' },
      { label: 'Germ kill rate', value: '99.9%' },
      { label: 'Method', value: 'UV-C · ionization · dry fog' },
      { label: 'Operation', value: 'Touchless' },
    ],
    photoFallback: 'Your browser or connection is showing a photograph instead of the live 3D model.',
  },
  colours: {
    heading: 'Colours',
    names: { yellow: 'Sunflare Yellow', blue: 'Glacier Blue', red: 'Crimson Red' },
    machineAlt: 'Freshpods machine in',
  },
  cycle: {
    heading: 'Cycle',
    lead: 'The machine detects the helmet and starts automatically. Put it in, wait five minutes, and take it back.',
    phases: [
      { key: 'load', label: 'Load', title: 'The helmet goes in.', body: 'Put the helmet in and close the door. Detection starts the cycle. Full-face and open-face helmets both fit.' },
      { key: 'disinfect', label: 'Disinfection', title: 'UV-C and ionization', body: 'UV-C light and ionization run inside the closed chamber.' },
      { key: 'aroma', label: 'Aroma', title: 'Dry fog', body: 'Dry fog disinfection reaches the helmet interior.' },
      { key: 'dry', label: 'Dry', title: 'It comes out dry.', body: 'Thermal sterilization finishes the cycle. The helmet is ready to wear.' },
    ],
    panelCaption: 'The LCD shows a QR code for payment. The machine has multi-regional language support.',
    panelAlt: "The machine's LCD control panel showing a QR code for payment",
  },
  problem: {
    heading: 'Daily-use helmets can accumulate sweat, dust, odours and microorganisms.',
    body: 'That affects hygiene and rider comfort. Helmet hygiene is still an unaddressed gap.',
    stats: [
      { figure: '3.5M+', unit: 'riders', note: 'Helmet hygiene is an unaddressed gap affecting more than 3.5 million riders in Nepal.' },
      { figure: '10×', unit: 'more bacteria', note: 'Helmets carry ten times more bacteria than toilet seats.' },
      { figure: 'Manual', unit: 'cleaning methods', note: 'Existing cleaning methods are manual, ineffective and time-consuming.' },
    ],
    captionTitle: 'What collects in a daily-use helmet',
    captionBody: 'The lining can hold dead skin flakes, fungal spores and bacterial colonies.',
    imageAlt: 'Black-and-white cutaway illustration of the padding inside a motorcycle helmet',
    labels: ['Dead skin flakes', 'Fungal spores', 'Bacterial colonies'],
  },
  specs: {
    heading: 'Specifications',
    rows: [
      { label: 'Disinfection time', value: '5 minutes' }, { label: 'Germ kill rate', value: '99.9%' },
      { label: 'Disinfection methods', value: 'UV-C light, ionization, dry fog' }, { label: 'Thermal sterilization', value: 'Included in cycle' },
      { label: 'Touchless operation', value: 'Yes' }, { label: 'Helmet detection', value: 'Automatic' },
      { label: 'Screen', value: 'LCD display' }, { label: 'Language', value: 'Multi-regional language support' },
      { label: 'IoT', value: 'Remote monitoring and analytics' }, { label: 'Power', value: '230 V, 50 Hz' },
      { label: 'Dimensions', value: '5.5 ft × 2 ft × 2 ft' }, { label: 'Weight', value: '75 kg' },
      { label: 'Helmet compatibility', value: 'Full-face and open-face' }, { label: 'Consumables', value: 'Eco-friendly, chemical-free fragrance' },
    ],
    callouts: [
      { title: 'Remote monitoring', body: 'The machine is IoT enabled, with remote monitoring and analytics.' },
      { title: 'Automatic detection', body: 'Helmet detection is automatic.' },
      { title: 'Fragrance system', body: 'Eco-friendly, chemical-free fragrance is available in Coffee Bold, Cool Breeze and Lemon.' },
    ],
  },
  lab: {
    heading: 'Laboratory testing',
    labels: { sample: 'Tested sample', before: 'Before treatment', after: 'After treatment', laboratory: 'Laboratory', microbiologist: 'Microbiologist', date: 'Report date' },
    report: {
      issuer: 'Devdaha Medical College & Research Institute Pvt. Ltd.', department: 'Department of Laboratory', title: 'Fumigation Report',
      date: '2083-02-31 (BS)', sample: 'Helmet', before: 'Gram Positive Rod seen (GPR)', after: 'No Growth',
      microbiologist: 'Dr. Dinesh Darnal, MD Microbiology, NMC No. 11932', location: 'Devdaha-9, Bhaluhi, Rupandehi, Nepal',
    },
    reviewer: { name: 'Dr. Manoj Gaire', credentials: 'MD (TU), PGDHCM (PU), Fellowship (Max Hospital, Delhi)', registration: 'NMC No. 18075' },
    imageAlt: 'Fumigation report for a helmet sample: Gram Positive Rod seen before treatment and No Growth after treatment.',
  },
  placements: {
    heading: 'Placement',
    items: [
      { key: 'service-centre', name: 'Bike and scooter service centres' }, { key: 'fuel', name: 'Petrol pumps' },
      { key: 'cafe', name: 'Cafés and restaurants' }, { key: 'futsal', name: 'Futsal and cricket arenas' },
      { key: 'mall', name: 'Shopping malls' }, { key: 'campus', name: 'Schools and colleges' },
    ],
  },
  company: {
    heading: 'Company',
    body: 'Gaire Freshpods Pvt. Ltd. is the authorised distributor of Freshpods for Nepal. The corporate office is in Kalikanagar, Butwal-11, Rupandehi.',
    visionTitle: 'Vision', vision: "To be Nepal's leading smart helmet sanitization brand.",
    missionTitle: 'Mission', mission: 'To make every ride safer, fresher, and germ-free through innovation in automated, contactless disinfection technology.',
    role: 'Authorised distributor for Nepal', legalName: 'Gaire Freshpods Pvt. Ltd.',
    address: 'Kalikanagar, Butwal-11, Rupandehi, Nepal', riderAlt: 'Illustration of a motorcyclist wearing a full-face helmet',
  },
  demo: {
    heading: 'Visit or call',
    lead: 'Tell us where you would place a machine and we will arrange a visit.',
    locationTypes: ['Bike / scooter service centre', 'Petrol pump', 'Café or restaurant', 'Futsal or cricket arena', 'Shopping mall', 'School or college', 'Somewhere else'],
    contact: { call: 'Call', email: 'Email', office: 'Office', follow: 'Follow' },
    form: {
      name: 'Your name', organisation: 'Organisation', phone: 'Phone', email: 'Email', city: 'Town or city',
      locationType: 'Where would it go?', notes: 'Notes', optional: 'Optional', preferredFinish: 'Preferred finish',
      sending: 'Sending…', request: 'Request a demo', openEmail: 'Open in email', another: 'Send another',
    },
    errors: { name: 'Please enter your name.', phone: 'Please enter a valid phone number.', email: 'Please enter a valid email address.', city: 'Please enter your town or city.' },
    status: {
      sentTitle: 'Got it.', sent: 'Someone from the Butwal office will call you back.', error: 'That did not send.',
      handedOff: 'Your email app should have opened with the message filled in. Send it and we will call you.',
      endpoint: 'We only use these details to arrange the visit.', mailto: 'This opens your email app with the message already written.',
    },
  },
  footer: {
    companyLine: 'Authorised distributor for Nepal.',
    productNote: 'Product figures, including the stated 99.9% germ kill rate, come from the manufacturer. The laboratory result on this page is from one tested helmet swab, which showed no detectable microbial growth after treatment. That is not a claim that every pathogen is eliminated in every use. Freshpods is a hygiene product, not a medical device.',
    tagline: "Your Helmet's Hygiene Partner",
  },
} as const;

type DeepWiden<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly DeepWiden<U>[] : T extends object ? { readonly [K in keyof T]: DeepWiden<T[K]> } : T;
export type SiteCopy = DeepWiden<typeof en>;

const ne = {
  meta: {
    title: 'गैरे फ्रेशपड्स — नेपालमा हेलमेट सफाइ मेसिन',
    description: 'फ्रेशपड्सले UV-C प्रकाश, ड्राइ फग र आयोनाइजेसनबाट पाँच मिनेटमा हेलमेट सफा गर्छ।',
  },
  language: { short: 'ने', switchLabel: 'View in English' },
  a11y: {
    skip: 'मुख्य सामग्रीमा जानुहोस्', home: 'गैरे फ्रेशपड्स, गृहपृष्ठ', sections: 'खण्डहरू',
    openMenu: 'मेनु खोल्नुहोस्', closeMenu: 'मेनु बन्द गर्नुहोस्', cabinetFinish: 'मेसिनको रङ',
    selectFinish: 'रङ छान्नुहोस्', rotateLeft: 'मेसिन बायाँ घुमाउनुहोस्', rotateRight: 'मेसिन दायाँ घुमाउनुहोस्',
    cycleStages: 'सफाइ चक्रका चरणहरू', stage: 'चरण', of: 'मध्ये', socialLinks: 'सामाजिक सञ्जाल',
  },
  nav: [
    { href: '#colours', label: 'मेसिन' }, { href: '#cycle', label: 'सफाइ चक्र' },
    { href: '#problem', label: 'समस्या' }, { href: '#specs', label: 'विशेष विवरण' }, { href: '#lab', label: 'परीक्षण' },
  ],
  actions: { bookDemo: 'डेमो बुक गर्नुहोस्', watchCycle: 'सफाइ चक्र हेर्नुहोस्' },
  hero: {
    line1: 'ताजा सवारी।', line2: 'हरेक पटक।',
    lead: 'हेलमेट भित्र राखेर ढोका बन्द गर्नुहोस्। पाँच मिनेटपछि फेरि लगाउन तयार हुन्छ।',
    quickFacts: [
      { label: 'चक्र अवधि', value: '५ मिनेट' }, { label: 'जीवाणु नष्ट दर', value: '९९.९%' },
      { label: 'विधि', value: 'UV-C · आयोनाइजेसन · ड्राइ फग' }, { label: 'सञ्चालन', value: 'स्पर्शरहित' },
    ],
    photoFallback: 'तपाईंको ब्राउजर वा इन्टरनेटले प्रत्यक्ष 3D मोडलको सट्टा तस्बिर देखाइरहेको छ।',
  },
  colours: {
    heading: 'रङहरू', names: { yellow: 'सनफ्लेयर पहेँलो', blue: 'ग्लेसियर निलो', red: 'क्रिमसन रातो' },
    machineAlt: 'यस रङको फ्रेशपड्स मेसिन:',
  },
  cycle: {
    heading: 'सफाइ चक्र',
    lead: 'मेसिनले हेलमेट आफैँ पहिचान गरेर चक्र सुरु गर्छ। हेलमेट राख्नुहोस्, पाँच मिनेट पर्खनुहोस् र फिर्ता लिनुहोस्।',
    phases: [
      { key: 'load', label: 'राख्नुहोस्', title: 'हेलमेट भित्र राख्नुहोस्।', body: 'हेलमेट राखेर ढोका बन्द गर्नुहोस्। हेलमेट पहिचान भएपछि चक्र सुरु हुन्छ। फुल-फेस र ओपन-फेस दुवै अट्छन्।' },
      { key: 'disinfect', label: 'निसंक्रमण', title: 'UV-C र आयोनाइजेसन', body: 'बन्द चेम्बरभित्र UV-C प्रकाश र आयोनाइजेसन चल्छ।' },
      { key: 'aroma', label: 'सुगन्ध', title: 'ड्राइ फग', body: 'ड्राइ फग निसंक्रमण हेलमेटको भित्री भागसम्म पुग्छ।' },
      { key: 'dry', label: 'सुकाउने', title: 'हेलमेट सुक्खा निस्कन्छ।', body: 'तापबाट निसंक्रमणले चक्र पूरा गर्छ। हेलमेट लगाउन तयार हुन्छ।' },
    ],
    panelCaption: 'LCD मा भुक्तानीका लागि QR कोड देखिन्छ। मेसिनमा विभिन्न क्षेत्रीय भाषाको सुविधा छ।',
    panelAlt: 'भुक्तानीको QR कोड देखाउने मेसिनको LCD प्यानल',
  },
  problem: {
    heading: 'दैनिक प्रयोगका हेलमेटमा पसिना, धुलो, दुर्गन्ध र सूक्ष्मजीव जम्मा हुन सक्छन्।',
    body: 'यसले सरसफाइ र चालकको सहजतामा असर गर्छ। हेलमेट सरसफाइ अझै नसमेटिएको खाडल हो।',
    stats: [
      { figure: '३५ लाख+', unit: 'चालक', note: 'नेपालमा ३५ लाखभन्दा बढी चालकलाई असर गर्ने हेलमेट सरसफाइ अझै नसमेटिएको खाडल हो।' },
      { figure: '१० गुणा', unit: 'बढी ब्याक्टेरिया', note: 'हेलमेटमा ट्वाइलेट सिटभन्दा दस गुणा बढी ब्याक्टेरिया हुन्छ।' },
      { figure: 'हातले', unit: 'सफाइ तरिका', note: 'अहिलेका सफाइ तरिका हातले गरिने, प्रभावहीन र समय लाग्ने खालका छन्।' },
    ],
    captionTitle: 'दैनिक प्रयोगको हेलमेटभित्र के जम्मा हुन्छ',
    captionBody: 'लाइनिङमा मृत छालाका कण, फंगल स्पोर र ब्याक्टेरियाका समूह बस्न सक्छन्।',
    imageAlt: 'मोटरसाइकल हेलमेटको भित्री प्याडिङ देखाइएको श्यामश्वेत चित्र',
    labels: ['मृत छालाका कण', 'फंगल स्पोर', 'ब्याक्टेरियाका समूह'],
  },
  specs: {
    heading: 'विशेष विवरण',
    rows: [
      { label: 'निसंक्रमण समय', value: '५ मिनेट' }, { label: 'जीवाणु नष्ट दर', value: '९९.९%' },
      { label: 'निसंक्रमण विधि', value: 'UV-C प्रकाश, आयोनाइजेसन, ड्राइ फग' }, { label: 'तापबाट निसंक्रमण', value: 'चक्रमा समावेश' },
      { label: 'स्पर्शरहित सञ्चालन', value: 'हो' }, { label: 'हेलमेट पहिचान', value: 'स्वचालित' },
      { label: 'स्क्रिन', value: 'LCD डिस्प्ले' }, { label: 'भाषा', value: 'विभिन्न क्षेत्रीय भाषाको सुविधा' },
      { label: 'IoT', value: 'दूर निगरानी र विश्लेषण' }, { label: 'विद्युत्', value: '२३० V, ५० Hz' },
      { label: 'आकार', value: '५.५ फिट × २ फिट × २ फिट' }, { label: 'तौल', value: '७५ केजी' },
      { label: 'मिल्ने हेलमेट', value: 'फुल-फेस र ओपन-फेस' }, { label: 'प्रयोग सामग्री', value: 'वातावरणमैत्री, रसायनरहित सुगन्ध' },
    ],
    callouts: [
      { title: 'दूर निगरानी', body: 'मेसिन IoT सक्षम छ, दूर निगरानी र विश्लेषणसहित।' },
      { title: 'स्वचालित पहिचान', body: 'हेलमेट पहिचान स्वचालित छ।' },
      { title: 'सुगन्ध प्रणाली', body: 'वातावरणमैत्री, रसायनरहित सुगन्ध Coffee Bold, Cool Breeze र Lemon मा उपलब्ध छ।' },
    ],
  },
  lab: {
    heading: 'प्रयोगशाला परीक्षण',
    labels: { sample: 'परीक्षण गरिएको नमुना', before: 'उपचारअघि', after: 'उपचारपछि', laboratory: 'प्रयोगशाला', microbiologist: 'सूक्ष्मजीवविज्ञ', date: 'प्रतिवेदन मिति' },
    report: {
      issuer: 'देवदह मेडिकल कलेज एन्ड रिसर्च इन्स्टिच्युट प्रा. लि.', department: 'प्रयोगशाला विभाग', title: 'फ्युमिगेसन प्रतिवेदन',
      date: '२०८३-०२-३१ (वि.सं.)', sample: 'हेलमेट', before: 'Gram Positive Rod देखियो (GPR)', after: 'कुनै वृद्धि देखिएन',
      microbiologist: 'डा. दिनेश दर्नाल, MD Microbiology, NMC No. 11932', location: 'देवदह-९, भलुही, रुपन्देही, नेपाल',
    },
    reviewer: { name: 'डा. मनोज गैरे', credentials: 'MD (TU), PGDHCM (PU), Fellowship (Max Hospital, Delhi)', registration: 'NMC No. 18075' },
    imageAlt: 'हेलमेटको फ्युमिगेसन प्रतिवेदन: उपचारअघि Gram Positive Rod र उपचारपछि कुनै वृद्धि नदेखिएको नतिजा।',
  },
  placements: {
    heading: 'राख्ने स्थान',
    items: [
      { key: 'service-centre', name: 'बाइक तथा स्कुटर सर्भिस सेन्टर' }, { key: 'fuel', name: 'पेट्रोल पम्प' },
      { key: 'cafe', name: 'क्याफे तथा रेस्टुरेन्ट' }, { key: 'futsal', name: 'फुटसल तथा क्रिकेट एरेना' },
      { key: 'mall', name: 'सपिङ मल' }, { key: 'campus', name: 'विद्यालय तथा कलेज' },
    ],
  },
  company: {
    heading: 'कम्पनी',
    body: 'गैरे फ्रेशपड्स प्रा. लि. नेपालका लागि फ्रेशपड्सको आधिकारिक वितरक हो। कर्पोरेट कार्यालय कालिकानगर, बुटवल-११, रुपन्देहीमा छ।',
    visionTitle: 'दृष्टि', vision: 'नेपालको अग्रणी स्मार्ट हेलमेट सफाइ ब्रान्ड बन्ने।',
    missionTitle: 'ध्येय', mission: 'स्वचालित र स्पर्शरहित निसंक्रमण प्रविधिमा नवप्रवर्तनमार्फत हरेक सवारीलाई अझ सुरक्षित, ताजा र जीवाणुरहित बनाउने।',
    role: 'नेपालका लागि आधिकारिक वितरक', legalName: 'गैरे फ्रेशपड्स प्रा. लि.',
    address: 'कालिकानगर, बुटवल-११, रुपन्देही, नेपाल', riderAlt: 'फुल-फेस हेलमेट लगाएको मोटरसाइकल चालकको चित्र',
  },
  demo: {
    heading: 'भेट्नुहोस् वा फोन गर्नुहोस्',
    lead: 'मेसिन कहाँ राख्न चाहनुहुन्छ भन्नुहोस्, हामी भेटघाट मिलाउँछौँ।',
    locationTypes: ['बाइक / स्कुटर सर्भिस सेन्टर', 'पेट्रोल पम्प', 'क्याफे वा रेस्टुरेन्ट', 'फुटसल वा क्रिकेट एरेना', 'सपिङ मल', 'विद्यालय वा कलेज', 'अन्य स्थान'],
    contact: { call: 'फोन', email: 'इमेल', office: 'कार्यालय', follow: 'फलो गर्नुहोस्' },
    form: {
      name: 'तपाईंको नाम', organisation: 'संस्था', phone: 'फोन', email: 'इमेल', city: 'सहर वा नगर',
      locationType: 'मेसिन कहाँ राख्ने?', notes: 'थप कुरा', optional: 'वैकल्पिक', preferredFinish: 'रुचाइएको रङ',
      sending: 'पठाइँदै…', request: 'डेमो अनुरोध गर्नुहोस्', openEmail: 'इमेलमा खोल्नुहोस्', another: 'अर्को अनुरोध पठाउनुहोस्',
    },
    errors: { name: 'कृपया आफ्नो नाम लेख्नुहोस्।', phone: 'कृपया सही फोन नम्बर लेख्नुहोस्।', email: 'कृपया सही इमेल ठेगाना लेख्नुहोस्।', city: 'कृपया आफ्नो सहर वा नगर लेख्नुहोस्।' },
    status: {
      sentTitle: 'प्राप्त भयो।', sent: 'बुटवल कार्यालयबाट तपाईंलाई फोन गरिनेछ।', error: 'अनुरोध पठाउन सकिएन।',
      handedOff: 'तयार सन्देशसहित तपाईंको इमेल एप खुल्नुपर्ने हो। इमेल पठाउनुहोस्, हामी फोन गर्छौँ।',
      endpoint: 'यी विवरण भेटघाट मिलाउन मात्र प्रयोग हुन्छन्।', mailto: 'यसले तयार सन्देशसहित तपाईंको इमेल एप खोल्छ।',
    },
  },
  footer: {
    companyLine: 'नेपालका लागि आधिकारिक वितरक।',
    productNote: 'घोषित ९९.९% जीवाणु नष्ट दरसहितका उत्पादन विवरण निर्माताबाट आएका हुन्। यस पृष्ठको प्रयोगशाला नतिजा एउटा हेलमेट स्वाबको परीक्षणबाट आएको हो, जसमा उपचारपछि सूक्ष्मजीवको वृद्धि देखिएन। यसले हरेक प्रयोगमा सबै रोगजनक नष्ट हुन्छन् भन्ने दाबी गर्दैन। फ्रेशपड्स सरसफाइसम्बन्धी उत्पादन हो, चिकित्सा उपकरण होइन।',
    tagline: 'तपाईंको हेलमेटको सरसफाइ साथी',
  },
} as const satisfies SiteCopy;

export const siteCopy: Record<Locale, SiteCopy> = { en, ne };
