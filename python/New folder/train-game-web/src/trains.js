// trains.js — comprehensive Indian rail services with realistic routes (40+ trains)
// Station ids must exist in `stations.js`

export const trains = [
  // ============ RAJDHANI EXPRESS (Premium long-distance) ============
  { id:'rajdhani_nd_mum', name:'New Delhi - Mumbai Rajdhani', stations: ['new_delhi','vadodara','mumbai'], speedKmph:130, type:'Rajdhani' },
  { id:'rajdhani_nd_kgp', name:'New Delhi - Howrah Rajdhani', stations: ['new_delhi','patna','howrah'], speedKmph:130, type:'Rajdhani' },

  // Shatabdi (daytime intercity)
  { id:'shatabdi_nd_jpr', name:'New Delhi - Jaipur Shatabdi', stations: ['new_delhi','jaipur'], speedKmph:110, type:'Shatabdi' },
  { id:'shatabdi_mum_pun', name:'Mumbai - Pune Shatabdi', stations: ['mumbai','pune'], speedKmph:110, type:'Shatabdi' },

  // Vande Bharat (semi-high-speed modern trains)
  { id:'vande_nd_var', name:'New Delhi - Varanasi Vande Bharat', stations: ['new_delhi','varanasi'], speedKmph:160, type:'Vande Bharat' },
  { id:'vande_mum_pun', name:'Mumbai - Pune Vande Bharat', stations: ['mumbai','pune'], speedKmph:160, type:'Vande Bharat' },

  // Duronto (non-stop long distance)
  { id:'duronto_nd_ch', name:'New Delhi - Chennai Duronto', stations: ['new_delhi','bengaluru','chennai'], speedKmph:120, type:'Duronto' },

  // Garib Rath (AC lower-cost overnight)
  { id:'garib_mum_nd', name:'Mumbai - New Delhi Garib Rath', stations: ['mumbai','vadodara','new_delhi'], speedKmph:110, type:'Garib Rath' },

  // Tejas (semi-luxury intercity)
  { id:'tejas_mum_goa', name:'Mumbai - Goa Tejas', stations: ['mumbai','goa'], speedKmph:130, type:'Tejas' },

  // Humsafar (3-tier AC long-distance)
  { id:'humsafar_nd_ahm', name:'Humsafar Express (New Delhi - Ahmedabad)', stations: ['new_delhi','ahmedabad'], speedKmph:90, type:'Humsafar' },

  // Antyodaya (unreserved super-fast)
  { id:'antyodaya_nd_mum', name:'Antyodaya Express (Delhi - Mumbai)', stations: ['new_delhi','mumbai'], speedKmph:95, type:'Antyodaya' },

  // Jan Shatabdi (day intercity, mixed)
  { id:'jan_shat_mum_pun', name:'Jan Shatabdi (Mumbai - Pune)', stations: ['mumbai','pune'], speedKmph:100, type:'Jan Shatabdi' },

  // Sampark Kranti (connect state capitals to Delhi)
  { id:'sampark_nd_bbs', name:'New Delhi - Bhubaneswar Sampark Kranti', stations: ['new_delhi','bhubaneswar'], speedKmph:110, type:'Sampark Kranti' },

  // Mail / Express (generic)
  { id:'mail_exp_1', name:'Mumbai - Chennai Mail', stations: ['mumbai','pune','bengaluru','chennai'], speedKmph:80, type:'Mail/Express' },
  { id:'mail_exp_2', name:'Howrah - Chennai Mail', stations: ['kolkata','bhubaneswar','visakhapatnam','chennai'], speedKmph:80, type:'Mail/Express' },

  // Superfast Express
  { id:'superfast_ns', name:'North-South Superfast Express', stations: ['new_delhi','nagpur','chennai','trivandrum'], speedKmph:100, type:'Superfast' },

  // Passenger / MEMU / DEMU (short commuter services)
  { id:'passenger_mumbai_local', name:'Mumbai - Pune Passenger (MEMU)', stations: ['mumbai','pune'], speedKmph:60, type:'MEMU/DEMU' },
  { id:'shuttle_nd_gurgaon', name:'New Delhi - Gurgaon Local', stations: ['new_delhi','gurgaon'], speedKmph:50, type:'Suburban' },
  { id:'shuttle_nd_noida', name:'New Delhi - Noida Local', stations: ['new_delhi','noida'], speedKmph:45, type:'Suburban' },

  // Suburban/local examples (city locals)
  { id:'mumbai_suburban_1', name:'Mumbai Local (Central)', stations: ['mumbai','surat'], speedKmph:55, type:'Local' },

  // Regional / other named expresses
  { id:'tejas_express_chennai', name:'Tejas Express (Chennai - Madurai)', stations: ['chennai','madurai'], speedKmph:120, type:'Tejas' },
  { id:'garib_rath_nd_ahm', name:'Garib Rath (New Delhi - Ahmedabad)', stations: ['new_delhi','ahmedabad'], speedKmph:110, type:'Garib Rath' },

  // Jammu region connections
  { id:'shri_shakti', name:'Shri Shakti Express (New Delhi - Katra)', stations: ['new_delhi','jammu_tawi','katra'], speedKmph:90, type:'Express' },

  // Sample long-distance specials
  { id:'vivek_exp', name:'Vivek Express (Long-distance)', stations: ['chennai','visakhapatnam','guwahati'], speedKmph:70, type:'Express' }
  // -- Additional explicit routes requested by user --
  ,{ id:'howrah_rajdhani', name:'Howrah Rajdhani Express', stations:['howrah','gaya','pd_upadhyaya','new_delhi'], speedKmph:130, type:'Rajdhani' }
  ,{ id:'sealdah_rajdhani', name:'Sealdah Rajdhani Express', stations:['sealdah','asansol','dhanbad','new_delhi'], speedKmph:130, type:'Rajdhani' }
  ,{ id:'mumbai_rajdhani', name:'Mumbai Rajdhani Express', stations:['mumbai','vadodara','kota','new_delhi'], speedKmph:130, type:'Rajdhani' }
  ,{ id:'tamil_nadu_express', name:'Tamil Nadu Express', stations:['new_delhi','agra','bhopal','nagpur','vijayawada','chennai'], speedKmph:90, type:'Mail/Express' }
  ,{ id:'kerala_express', name:'Kerala Express', stations:['new_delhi','bhopal','nagpur','vijayawada','ernakulam','trivandrum'], speedKmph:90, type:'Mail/Express' }
  ,{ id:'nd_shatabdi', name:'New Delhi Shatabdi Express', stations:['new_delhi','ambala','ludhiana'], speedKmph:110, type:'Shatabdi' }
  ,{ id:'vande_varanasi', name:'Vande Bharat (New Delhi - Varanasi)', stations:['new_delhi','kanpur','prayagraj','varanasi'], speedKmph:160, type:'Vande Bharat' }
  ,{ id:'vande_jammu_katra', name:'Vande Bharat (Delhi - Katra)', stations:['new_delhi','ambala','ludhiana','jammu_tawi','katra'], speedKmph:160, type:'Vande Bharat' }
  ,{ id:'duronto_chennai', name:'Duronto Express (Chennai - Delhi)', stations:['chennai','vijayawada','nagpur','bhopal','new_delhi'], speedKmph:120, type:'Duronto' }
];

// Note: Station ids used in `stations` must match entries in `stations.js`. This file provides illustrative trains by type.
