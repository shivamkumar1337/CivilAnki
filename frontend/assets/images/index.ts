// src/assets/images/index.ts
const imageMap: Record<string, any> = {
  'Art&Culture': require('./Art&Culture.png'),
  'Economy': require('./Economy.png'),
  'Environment': require('./Environment.png'),
  'Geography': require('./Geography.png'),
  'GovernmentSchemes': require('./GovernmentSchemes.png'),
  'History': require('./History.png'),
  'Mapping': require('./Mapping.png'),
  'Polity': require('./Polity.png'),
  'Science&Tech': require('./Science&Tech.png'),
  'CurrentAffiars': require('./CurrentAffiars.png'),
};

export const getImageSource = (imageName: string): any | null => {
  return imageMap[imageName] || null;
};
