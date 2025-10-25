// Sydney postcode to coordinates mapping
// Coordinates are in [lat, lng] format

export interface LocationData {
  lat: number;
  lng: number;
  suburb: string;
}

// Default location: University of Sydney
export const DEFAULT_LOCATION: LocationData = {
  lat: -33.8886,
  lng: 151.1873,
  suburb: "University of Sydney"
};

// Sydney postcodes mapping (2000-2999)
export const SYDNEY_POSTCODES: Record<string, LocationData> = {
  // Sydney CBD & Inner City
  "2000": { lat: -33.8688, lng: 151.2093, suburb: "Sydney CBD" },
  "2007": { lat: -33.8826, lng: 151.1989, suburb: "Ultimo" },
  "2008": { lat: -33.8847, lng: 151.2140, suburb: "Chippendale" },
  "2009": { lat: -33.8916, lng: 151.1831, suburb: "Pyrmont" },
  "2010": { lat: -33.8913, lng: 151.2007, suburb: "Darlington" },
  "2011": { lat: -33.8716, lng: 151.2093, suburb: "Potts Point" },
  "2015": { lat: -33.8935, lng: 151.1750, suburb: "Blackwattle Bay" },
  "2016": { lat: -33.8695, lng: 151.1954, suburb: "Redfern" },
  "2017": { lat: -33.8874, lng: 151.1927, suburb: "Waterloo" },
  "2018": { lat: -33.9068, lng: 151.2043, suburb: "Alexandria" },
  "2019": { lat: -33.9246, lng: 151.2029, suburb: "Banksmeadow" },
  "2020": { lat: -33.9185, lng: 151.1954, suburb: "Mascot" },
  "2021": { lat: -33.8837, lng: 151.2242, suburb: "Paddington" },
  "2022": { lat: -33.8914, lng: 151.2366, suburb: "Bondi Junction" },
  "2023": { lat: -33.8946, lng: 151.2589, suburb: "Bellevue Hill" },
  "2024": { lat: -33.8844, lng: 151.2469, suburb: "Waverley" },
  "2025": { lat: -33.8926, lng: 151.2642, suburb: "Woollahra" },
  "2026": { lat: -33.8913, lng: 151.2806, suburb: "Bondi" },
  "2027": { lat: -33.8964, lng: 151.2685, suburb: "Darling Point" },
  "2028": { lat: -33.9153, lng: 151.2686, suburb: "Double Bay" },
  "2029": { lat: -33.9298, lng: 151.2756, suburb: "Rose Bay" },
  "2030": { lat: -33.9086, lng: 151.2793, suburb: "Dover Heights" },
  "2031": { lat: -33.9043, lng: 151.2494, suburb: "Randwick" },
  "2032": { lat: -33.9217, lng: 151.2418, suburb: "Daceyville" },
  "2033": { lat: -33.9185, lng: 151.2616, suburb: "Kingsford" },
  "2034": { lat: -33.9289, lng: 151.2559, suburb: "Coogee" },
  "2035": { lat: -33.9185, lng: 151.2281, suburb: "Maroubra" },
  "2036": { lat: -33.9964, lng: 151.2361, suburb: "La Perouse" },

  // Inner West
  "2037": { lat: -33.8775, lng: 151.1692, suburb: "Glebe" },
  "2038": { lat: -33.8793, lng: 151.1848, suburb: "Annandale" },
  "2039": { lat: -33.8656, lng: 151.1865, suburb: "Rozelle" },
  "2040": { lat: -33.8589, lng: 151.1648, suburb: "Leichhardt" },
  "2041": { lat: -33.8537, lng: 151.1795, suburb: "Balmain" },
  "2042": { lat: -33.8945, lng: 151.1786, suburb: "Enmore" },
  "2043": { lat: -33.8956, lng: 151.1648, suburb: "Erskineville" },
  "2044": { lat: -33.9068, lng: 151.1756, suburb: "Tempe" },
  "2045": { lat: -33.8846, lng: 151.1413, suburb: "Haberfield" },
  "2046": { lat: -33.8685, lng: 151.1327, suburb: "Abbotsford" },
  "2047": { lat: -33.8475, lng: 151.1248, suburb: "Drummoyne" },
  "2048": { lat: -33.8375, lng: 151.1412, suburb: "Stanmore" },
  "2049": { lat: -33.8762, lng: 151.1537, suburb: "Petersham" },
  "2050": { lat: -33.8886, lng: 151.1873, suburb: "Camperdown" },

  // Eastern Suburbs
  "2060": { lat: -33.8589, lng: 151.2092, suburb: "North Sydney" },
  "2061": { lat: -33.8242, lng: 151.2093, suburb: "Kirribilli" },
  "2062": { lat: -33.8389, lng: 151.2093, suburb: "Cammeray" },
  "2063": { lat: -33.8456, lng: 151.1848, suburb: "Northbridge" },
  "2064": { lat: -33.8189, lng: 151.1765, suburb: "Artarmon" },
  "2065": { lat: -33.8089, lng: 151.2026, suburb: "Crows Nest" },
  "2066": { lat: -33.7989, lng: 151.1993, suburb: "Lane Cove" },
  "2067": { lat: -33.7856, lng: 151.1648, suburb: "Chatswood" },
  "2068": { lat: -33.7589, lng: 151.1406, suburb: "Willoughby" },
  "2069": { lat: -33.7456, lng: 151.1648, suburb: "Castle Cove" },
  "2070": { lat: -33.7356, lng: 151.1848, suburb: "Lindfield" },

  // Northern Suburbs
  "2071": { lat: -33.7256, lng: 151.1593, suburb: "Killara" },
  "2072": { lat: -33.6956, lng: 151.1448, suburb: "Gordon" },
  "2073": { lat: -33.6756, lng: 151.1348, suburb: "Pymble" },
  "2074": { lat: -33.6556, lng: 151.1248, suburb: "Turramurra" },
  "2075": { lat: -33.6356, lng: 151.1148, suburb: "St Ives" },
  "2076": { lat: -33.6156, lng: 151.1048, suburb: "Normanhurst" },
  "2077": { lat: -33.5956, lng: 151.0948, suburb: "Hornsby" },
  "2079": { lat: -33.6089, lng: 151.0748, suburb: "Mount Colah" },
  "2080": { lat: -33.7089, lng: 151.1093, suburb: "Hunters Hill" },

  // Western Suburbs
  "2111": { lat: -33.7723, lng: 151.0867, suburb: "Gladesville" },
  "2112": { lat: -33.8023, lng: 151.0967, suburb: "Ryde" },
  "2113": { lat: -33.7823, lng: 151.1267, suburb: "Macquarie Park" },
  "2114": { lat: -33.7623, lng: 151.0867, suburb: "West Ryde" },
  "2115": { lat: -33.7923, lng: 151.0467, suburb: "Ermington" },
  "2116": { lat: -33.8123, lng: 151.0267, suburb: "Rydalmere" },
  "2117": { lat: -33.7823, lng: 151.0067, suburb: "Dundas" },
  "2118": { lat: -33.7523, lng: 151.0167, suburb: "Carlingford" },
  "2119": { lat: -33.7323, lng: 151.0367, suburb: "Beecroft" },
  "2120": { lat: -33.7123, lng: 151.0567, suburb: "Pennant Hills" },

  // South Sydney
  "2127": { lat: -33.8975, lng: 151.0845, suburb: "Newington" },
  "2128": { lat: -33.8477, lng: 151.0766, suburb: "Silverwater" },
  "2129": { lat: -33.8277, lng: 151.0566, suburb: "Sydney Olympic Park" },
  "2130": { lat: -33.8756, lng: 151.1267, suburb: "Summer Hill" },
  "2131": { lat: -33.8556, lng: 151.1067, suburb: "Ashfield" },
  "2132": { lat: -33.8856, lng: 151.1167, suburb: "Croydon" },
  "2133": { lat: -33.8656, lng: 151.0867, suburb: "Concord" },
  "2134": { lat: -33.8456, lng: 151.0967, suburb: "Burwood" },
  "2135": { lat: -33.8356, lng: 151.1167, suburb: "Strathfield" },
  "2136": { lat: -33.8756, lng: 151.0967, suburb: "Enfield" },
  "2137": { lat: -33.8556, lng: 151.0667, suburb: "Concord West" },
  "2138": { lat: -33.8256, lng: 151.0867, suburb: "Rhodes" },

  // Canterbury-Bankstown
  "2140": { lat: -33.9156, lng: 151.1367, suburb: "Homebush" },
  "2141": { lat: -33.8756, lng: 151.0567, suburb: "Lidcombe" },
  "2142": { lat: -33.8956, lng: 151.0967, suburb: "Granville" },
  "2143": { lat: -33.8356, lng: 151.0567, suburb: "Birrong" },
  "2144": { lat: -33.8656, lng: 151.0267, suburb: "Auburn" },
  "2145": { lat: -33.8056, lng: 150.9967, suburb: "Westmead" },
  "2146": { lat: -33.8156, lng: 150.9567, suburb: "Toongabbie" },
  "2147": { lat: -33.7956, lng: 150.9167, suburb: "Seven Hills" },
  "2148": { lat: -33.7456, lng: 150.9267, suburb: "Blacktown" },

  // Hills District
  "2150": { lat: -33.8156, lng: 150.9867, suburb: "Parramatta" },
  "2151": { lat: -33.7956, lng: 151.0067, suburb: "North Parramatta" },
  "2152": { lat: -33.7256, lng: 150.9167, suburb: "Northmead" },
  "2153": { lat: -33.7456, lng: 150.9567, suburb: "Baulkham Hills" },
  "2154": { lat: -33.7156, lng: 150.9767, suburb: "Castle Hill" },
  "2155": { lat: -33.6656, lng: 150.9067, suburb: "Rouse Hill" },
  "2156": { lat: -33.6256, lng: 150.8767, suburb: "Annangrove" },
};

/**
 * Validate if a postcode is within Sydney region (2000-2999)
 */
export function isValidSydneyPostcode(postcode: string): boolean {
  const code = parseInt(postcode, 10);
  return !isNaN(code) && code >= 2000 && code <= 2999;
}

/**
 * Get location coordinates for a postcode
 * Returns the exact location if found, or null if not in mapping
 */
export function getLocationByPostcode(postcode: string): LocationData | null {
  return SYDNEY_POSTCODES[postcode] || null;
}

/**
 * Get location with fallback to default (University of Sydney)
 */
export function getLocationOrDefault(postcode: string | null): LocationData {
  if (!postcode) {
    return DEFAULT_LOCATION;
  }

  return getLocationByPostcode(postcode) || DEFAULT_LOCATION;
}

/**
 * Format postcode validation error message
 */
export function getPostcodeErrorMessage(postcode: string): string {
  if (!postcode.trim()) {
    return "Please enter a postcode";
  }

  const code = parseInt(postcode, 10);

  if (isNaN(code)) {
    return "Please enter a valid postcode (numbers only)";
  }

  if (code < 2000 || code > 2999) {
    return "Please enter a Sydney postcode (2000-2999)";
  }

  // Valid range but not in our mapping
  return `Postcode ${postcode} is valid but location data not available. Using default location.`;
}
