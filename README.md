# JsonToMT940-Generator
## Introducing the MT940 Converter: A Powerful and Efficient JSON to MT940 Conversion Tool

Are you in need of a reliable and efficient way to convert JSON formatted bank transaction data into the MT940 format? Look no further! Our powerful MT940 Converter script is designed to make your life easier and save you time when dealing with financial data.

The MT940 Converter is a user-friendly solution that automatically processes JSON data and generates an MT940 formatted file. This script is perfect for businesses and individuals who need to convert their JSON transaction data to MT940 for seamless bank reconciliation or other financial purposes.

### Key Features:

1. Simple File Upload: Just upload your JSON file, and the MT940 Converter will handle the rest.
2. Group Transactions by Date: The script intelligently groups transactions by date, ensuring your MT940 file is organized and easy to read.
3. MT940 Content Generation: The converter processes JSON data and generates MT940 content, including opening and closing balance lines, transaction lines, and transaction descriptions.
4. Downloadable Output: Once the conversion is complete, you can easily download the MT940 file (.sta) for your records or further processing.
5. Streamlined Financial Management: Converting your JSON transaction data to the widely accepted MT940 format allows for more efficient bank reconciliation and financial reporting.
6. Error Reduction: Automated conversion minimizes the chance of errors, ensuring accurate and reliable financial data.
7. Easy Integration: The script is built using the popular Vue.js framework, making it easy to integrate with your existing applications or projects.

Let the MT940 Converter take care of your JSON to MT940 conversion needs and help you maintain an organized and efficient financial management system. Try the MT940 Converter today and see the difference!


## Example Input JSON
```json
[
 {
  "Buchung": "28.03.2023",
  "Wertstellung": "28.03.2023",
  "Verwendungszweck": "AMAZON PAYMENTS EUROPE S.C.",
  "IBAN": "DE34123500050001234567",
  "Kontonummer": "1234567",
  "Bankleitzahl": "123500050",
  "Bank": "Stadtsparkasse Wuppertal",
  "Anfangsbestand": 169.18,
  "Betrag": -134.95,
  "Endbetrag": 34.23,
  "Currency": "EUR"
 },
 {
  "Buchung": "28.03.2023",
  "Wertstellung": "28.03.2023",
  "Verwendungszweck": "WSW ENERGIE   WASSER AG B 8438952391 VK 3010764557 FRIEDRICH-ENGELS-ALLEE 321 ABS 28.03.23 BETRAG 82.08 EUR",
  "IBAN": "DE34123500050001234567",
  "Kontonummer": "1234567",
  "Bankleitzahl": "123500050",
  "Bank": "Stadtsparkasse Wuppertal",
  "Anfangsbestand": 34.23,
  "Betrag": -82.08,
  "Endbetrag": -47.85,
  "Currency": "EUR"
 },
 {
  "Buchung": "28.03.2023",
  "Wertstellung": "28.03.2023",
  "Verwendungszweck": "WSW ENERGIE   WASSER AG B 8378776688 VK 3010526428 FRIEDRICH-ENGELS-ALLEE 321 ABS 28.03.23 BETRAG 60.79 EUR",
  "IBAN": "DE34123500050001234567",
  "Kontonummer": "1234567",
  "Bankleitzahl": "123500050",
  "Bank": "Stadtsparkasse Wuppertal",
  "Anfangsbestand": -47.85,
  "Betrag": -60.79,
  "Endbetrag": -108.64,
  "Currency": "EUR"
 }
]
