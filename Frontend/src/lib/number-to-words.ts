// Indian Currency Number to Words converter

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertLessThanThousand(n: number): string {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + " ";
  }
  return str.trim();
}

/**
 * Converts a number to Indian Currency words
 * e.g., 34790 -> "INR Thirty Four Thousand Seven Hundred Ninety Only"
 */
export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return "INR Zero Only";
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupeePart = Math.floor(rounded);
  const paisePart = Math.round((rounded - rupeePart) * 100);

  let result = "";

  const crore = Math.floor(rupeePart / 10000000);
  let remainder = rupeePart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundreds = remainder;

  if (crore > 0) {
    result += convertLessThanThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " Thousand ";
  }
  if (hundreds > 0) {
    result += convertLessThanThousand(hundreds) + " ";
  }

  result = ("INR " + result.trim()).trim();

  if (paisePart > 0) {
    result += " and " + convertLessThanThousand(paisePart) + " Paise";
  }

  return result + " Only";
}
