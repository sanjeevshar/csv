// Expanded station dataset covering major cities across India (north/south/east/west)
export const stations = [
  { id:'new_delhi', name:'New Delhi', coord:[77.1025,28.7041], dwell:60, info:'Capital region - major junction' },
  { id:'gurgaon', name:'Gurgaon', coord:[77.0266,28.4595], dwell:30, info:'Gurugram, NCR' },
  { id:'noida', name:'Noida', coord:[77.3910,28.5355], dwell:20, info:'Noida sector' },
  { id:'jaipur', name:'Jaipur', coord:[75.7873,26.9124], dwell:35, info:'Pink City' },
  { id:'agra', name:'Agra Cantt', coord:[78.0081,27.1767], dwell:30, info:'Taj Mahal access' },
  { id:'lucknow', name:'Lucknow', coord:[80.9462,26.8467], dwell:40, info:'UP capital' },
  { id:'kanpur', name:'Kanpur', coord:[80.3319,26.4499], dwell:30, info:'Large industrial city' },
  { id:'varanasi', name:'Varanasi', coord:[82.9739,25.3176], dwell:30, info:'Pilgrimage city' },
  { id:'patna', name:'Patna', coord:[85.1376,25.5941], dwell:35, info:'Bihar capital' },
  { id:'kolkata', name:'Kolkata', coord:[88.3639,22.5726], dwell:55, info:'Eastern terminus' },
  { id:'siliguri', name:'Siliguri', coord:[88.4650,26.7271], dwell:25, info:'Gateway to NE' },
  { id:'guwahati', name:'Guwahati', coord:[91.7425,26.1445], dwell:40, info:'Largest city in NE' },

  { id:'mumbai', name:'Mumbai Central', coord:[72.8777,19.0760], dwell:60, info:'Financial hub' },
  { id:'pune', name:'Pune', coord:[73.8567,18.5204], dwell:35, info:'IT & education center' },
  { id:'surat', name:'Surat', coord:[72.8311,21.1702], dwell:30, info:'Textile hub' },
  { id:'ahmedabad', name:'Ahmedabad', coord:[72.5714,23.0225], dwell:40, info:'Cultural center', fountain:true },
  { id:'vadodara', name:'Vadodara', coord:[73.1812,22.3072], dwell:30, info:'Baroda' },

  { id:'indore', name:'Indore', coord:[75.8577,22.7196], dwell:30, info:'Madhya Pradesh commercial' },
  { id:'bhopal', name:'Bhopal', coord:[77.4126,23.2599], dwell:35, info:'MP capital' },
  { id:'jabalpur', name:'Jabalpur', coord:[79.9864,23.1668], dwell:25, info:'Central MP' },
  { id:'nagpur', name:'Nagpur', coord:[79.0882,21.1458], dwell:30, info:'Central India' },

  { id:'hyderabad', name:'Hyderabad', coord:[78.4867,17.3850], dwell:45, info:'Telangana capital' },
  { id:'secunderabad', name:'Secunderabad', coord:[78.5019,17.4399], dwell:40, info:'Twin city' },

  { id:'bengaluru', name:'Bengaluru Cantt', coord:[77.5946,12.9716], dwell:45, info:'IT hub' },
  { id:'mysuru', name:'Mysuru', coord:[76.6394,12.2958], dwell:30, info:'Tourist city' },

  { id:'chennai', name:'Chennai Central', coord:[80.2707,13.0827], dwell:50, info:'Southern hub' },
  { id:'marina_beach', name:'Marina (near Chennai)', coord:[80.2811,13.0489], dwell:10, info:'Marina area', fountain:true },
  { id:'coimbatore', name:'Coimbatore', coord:[76.9558,11.0168], dwell:30, info:'Textile city' },
  { id:'madurai', name:'Madurai', coord:[78.1198,9.9252], dwell:30, info:'Temple city' },
  { id:'trivandrum', name:'Thiruvananthapuram', coord:[76.9366,8.5241], dwell:35, info:'Kerala capital' },
  { id:'koch', name:'Kochi', coord:[76.2673,9.9312], dwell:30, info:'Port city' },

  { id:'goa', name:'Madgaon (Goa)', coord:[73.9402,15.3009], dwell:25, info:'Goa tourism' },

  { id:'visakhapatnam', name:'Visakhapatnam', coord:[83.2185,17.6868], dwell:30, info:'Port and industrial city' },
  { id:'bhubaneswar', name:'Bhubaneswar', coord:[85.8245,20.2961], dwell:30, info:'Odisha capital' },

  { id:'raipur', name:'Raipur', coord:[81.6296,21.2514], dwell:30, info:'Chhattisgarh capital' },
  { id:'ranchi', name:'Ranchi', coord:[85.3096,23.3441], dwell:30, info:'Jharkhand capital' }
  ,
  // Jammu & Kashmir region
  { id:'jammu_tawi', name:'Jammu Tawi', coord:[74.8473,32.7266], dwell:45, info:'Major Jammu station' },
  { id:'katra', name:'Katra', coord:[74.9340,32.9876], dwell:35, info:'Gateway to Vaishno Devi' },
  { id:'srinagar', name:'Srinagar', coord:[74.7973,34.0837], dwell:40, info:'Srinagar (near by, limited rail connectivity)' }
  ,
  // Additional stations for key routes
  { id:'howrah', name:'Howrah Junction', coord:[88.3462,22.5958], dwell:50, info:'Howrah, Kolkata region' },
  { id:'gaya', name:'Gaya Junction', coord:[85.0000,24.7953], dwell:30, info:'Gaya, Bihar' },
  { id:'pd_upadhyaya', name:'Pt. Deen Dayal Upadhyaya Junction', coord:[83.0114,25.9160], dwell:30, info:'PD Upadhyaya (Mughal Sarai)' },
  { id:'sealdah', name:'Sealdah', coord:[88.3639,22.5745], dwell:40, info:'Sealdah, Kolkata suburban' },
  { id:'asansol', name:'Asansol', coord:[86.9594,23.6828], dwell:25, info:'Asansol junction' },
  { id:'dhanbad', name:'Dhanbad', coord:[86.4304,23.7957], dwell:25, info:'Dhanbad junction' },
  { id:'kota', name:'Kota Junction', coord:[75.8339,25.2138], dwell:25, info:'Kota, Rajasthan' },
  { id:'vijayawada', name:'Vijayawada Junction', coord:[80.6480,16.5062], dwell:30, info:'Vijayawada' },
  { id:'ernakulam', name:'Ernakulam Junction', coord:[76.2755,9.9816], dwell:35, info:'Ernakulam (Cochin)' },
  { id:'prayagraj', name:'Prayagraj Junction', coord:[81.8463,25.4358], dwell:30, info:'Prayagraj (Allahabad)' },
  { id:'ambala', name:'Ambala Cantt', coord:[76.7911,30.3782], dwell:25, info:'Ambala Cantt' },
  { id:'ludhiana', name:'Ludhiana', coord:[75.8573,30.9010], dwell:25, info:'Ludhiana junction' }
];
