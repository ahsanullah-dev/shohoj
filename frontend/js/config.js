// Segment + category definitions. Drives the whole app UI.
window.SEGMENTS = [
  {
    key: 'tuition',
    name: 'Tuition Offers',
    icon: '📚',
    tagline: 'Find a tutor or offer to teach a course.',
    postTypes: [
      { key: 'offer', label: 'Offering tuition' },
      { key: 'wanted', label: 'Looking for a tutor' },
    ],
    categories: [
      'HSC / A-Level',
      'University Course',
      'Programming',
      'Math / Physics',
      'Language (English/IELTS)',
      'Other',
    ],
    fields: ['courseCode', 'mode', 'price'],
  },
  {
    key: 'tech',
    name: 'Tech & Repair',
    icon: '🛠️',
    tagline: 'Laptop, mobile, bike, electronics repair.',
    postTypes: [
      { key: 'offer', label: 'Offering service' },
      { key: 'wanted', label: 'Need this fixed' },
    ],
    categories: [
      'Laptop / PC',
      'Mobile',
      'Bike / Cycle',
      'Electronics',
      'Software / OS install',
      'Other',
    ],
    fields: ['price', 'deliveryTime', 'location'],
  },
  {
    key: 'creative',
    name: 'Creative & Design',
    icon: '🎨',
    tagline: 'Graphic design, photography, video, dev help.',
    postTypes: [
      { key: 'offer', label: 'Offering service' },
      { key: 'wanted', label: 'Looking for a designer' },
    ],
    categories: [
      'Graphic Design',
      'Photography / Videography',
      'Video Editing',
      'CV / Resume',
      'Web / App Dev',
      'Other',
    ],
    fields: ['price', 'deliveryTime'],
  },
  {
    key: 'errands',
    name: 'Campus Errands',
    icon: '📦',
    tagline: 'Printing, delivery, ride-splitting, odd jobs.',
    postTypes: [
      { key: 'offer', label: 'Available to help' },
      { key: 'wanted', label: 'Need help with' },
    ],
    categories: ['Printing / Binding', 'Delivery / Pickup', 'Shared Ride', 'Odd Job'],
    fields: ['urgency', 'location', 'price'],
  },
  {
    key: 'marketplace',
    name: 'Buy, Sell & Exchange',
    icon: '🛍️',
    tagline: 'Books, calculators, cycles, electronics.',
    postTypes: [
      { key: 'sell', label: 'Selling' },
      { key: 'buy', label: 'Looking to buy' },
      { key: 'exchange', label: 'Exchange' },
    ],
    categories: [
      'Textbooks',
      'Calculators / Instruments',
      'Lab Equipment',
      'Electronics',
      'Cycle',
      'Furniture',
      'Other',
    ],
    fields: ['condition', 'price', 'location'],
  },
];

window.getSegment = function (key) {
  return window.SEGMENTS.find((s) => s.key === key);
};
