// Create a new Vue app instance
const app = Vue.createApp({
    data() {
        return {
            file: null, // Store the uploaded file
            mt940: null, // Store the generated MT940 content
        };
    },
    methods: {
 
        // Handle file upload
        onFileUpload(event) {
            this.file = event.target.files[0];
        },

        
        // Generate MT940 from uploaded JSON file
        async generateMT940() {
          if (!this.file) {
            alert("Please upload a Json file first");
            return;
          }

          console.log("Generating MT940...");

          try {
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(JSON.parse(reader.result));
              reader.onerror = error => reject(error);
              reader.readAsText(this.file);
            });
            await this.processMT940(data);
            // console.log("MT940 generated:", this.mt940);
          } catch (error) {
            console.error(error);
            alert("Error generating MT940");
          }
        },

        // Extract Bankleitzahl and Kontonummer from an IBAN
        extractBankDetailsFromIban(iban) {
            const Bankleitzahl = iban.slice(4, 12);
            const Kontonummer = iban.slice(12);
            return { Bankleitzahl, Kontonummer };
        },

        // Process JSON data and generate MT940 content
        processMT940(data) {
          console.log('processing MT940 data:', data);
          let result = "";

          if (data && data.length > 0) {
            // Extract Bankleitzahl and Kontonummer from the first transaction
            const { Bankleitzahl, Kontonummer } = this.extractBankDetailsFromIban(data[0].IBAN);

            const initialStatement = `:20:STARTUMS
:25:${Bankleitzahl}/${Kontonummer}
:28C:`;

            // Group transactions by date
            const groupedTransactions = this.groupTransactionsByDate(data);
            // Generate MT940 content based on grouped transactions
            result = this.generateMT940Content(groupedTransactions, initialStatement);
          }

          console.log('generated MT940:', result);
          this.mt940 = result;
        },

        // Group transactions by date, resulting in an object with dates as keys
        groupTransactionsByDate(data) {
            return data.reduce((acc, transaction) => {
                if (!acc[transaction.Buchung]) {
                    acc[transaction.Buchung] = [];
                }
                acc[transaction.Buchung].push(transaction);
                return acc;
            }, {});
        },


        // Generate MT940 content based on grouped transactions and initial statement
        generateMT940Content(groupedTransactions, initialStatement) {
            let result = "";
            let statementCounter = 1;
            let balance = 0;

            const { Bankleitzahl, Kontonummer } = this.extractBankDetailsFromIban(groupedTransactions[Object.keys(groupedTransactions)[0]][0].IBAN);


            // Iterate over each date with transactions
            for (const date in groupedTransactions) {
                const transactions = groupedTransactions[date];

                if (transactions.length > 0) {
                    // Use moment.js to format date as YYMMDD
                    const formattedDate = moment(date, 'DD.MM.YYYY').format('YYMMDD');

                    // Add start of statement and account information
                    result += `:20:STARTUMS\n`;
                    result += `:25:${Bankleitzahl}/${Kontonummer}\n`;
                    result += `:28C:${statementCounter}/001\n`;

                    if (statementCounter === 1) {
                        // Set the initial balance to the "Anfangsbestand" of the first transaction
                        balance = transactions[0].Anfangsbestand;
                    }

                    const openingBalance = balance;
                    // Add opening balance line to the result
                    result += this.generateOpeningBalanceLine(formattedDate, openingBalance);

                    // Iterate over transactions for the current date
                    for (const transaction of transactions) {
                        const transactionAmount = this.getTransactionAmount(transaction);
                        balance += transactionAmount;
                        result += this.generateTransactionLines(formattedDate, transaction, transactionAmount);
                    }

                    result += this.generateClosingBalanceLine(formattedDate, balance);

                    statementCounter++;
                }
            }

            return result;
        },

        // Get transaction amount, converting string to float if necessary
        getTransactionAmount(transaction) {
          if (typeof transaction.Betrag === 'string') {
            return parseFloat(transaction.Betrag.replace(',', '.'));
          } else {
            return transaction.Betrag;
          }
        },


        // Generate opening balance line for MT940 content
        generateOpeningBalanceLine(formattedDate, openingBalance) {
          return `:60F:${openingBalance >= 0 ? 'C' : 'D'}${formattedDate}EUR${Math.abs(openingBalance).toFixed(2).toString().replace('.', ',')}\n`;
        },


        // Function to create transaction line (:61:)
        createTransactionLine(formattedDate, transaction, transactionAmount) {
          const transactionType = transactionAmount > 0 ? 'CR' : 'DR';
          const transactionCode = 'NTRF';
          const transactionMoment = moment(transaction.Buchung, 'DD.MM.YYYY');
          const valueDate = transactionMoment.format('YYMMDD');
          const entryDate = transactionMoment.format('MMDD');

          return `:61:${valueDate}${entryDate}${transactionType}${Math.abs(transactionAmount).toFixed(2).toString().replace('.', ',')}${transactionCode}NONREF\n`;
        },

        // Remove special Characters that aren't allowed in MT940-Description
        sanitizeDescription(description) {
          if (!description) {
            return '';
          }

          const allowedCharacters = /[A-Za-z0-9 \/-?().,'+]/g;
          const sanitizedDescription = (description.match(allowedCharacters) || []).join('');

          // console.log('Original Description:', description);
          // console.log('Sanitized Description:', sanitizedDescription);

          return sanitizedDescription;
        },


        // Function to create transaction description lines (:86:)
        createTransactionDescriptionLines(transaction) {
          const category = this.sanitizeDescription(transaction.Kategorie || 'NONREF').replace(/\n/g, ' ');
          const purpose = this.sanitizeDescription(transaction.Verwendungszweck || 'NONREF').replace(/\n/g, ' ');
          const orderingParty = this.sanitizeDescription(transaction.Auftraggeber || 'NONREF').replace(/\n/g, ' ');


          // Split purpose into lines with a maximum of 65 characters and add appropriate line identifiers
          const splitPurposeArray = purpose.match(/.{1,65}/g) || [];
          const splitPurposeWithIdentifiers = splitPurposeArray.map((line, index) => `?${20 + index}${line}`).join('');

          // Concatenate the description segments with appropriate identifiers
          const formattedDescription = `:86:116?00${category}${splitPurposeWithIdentifiers}?32${orderingParty}`;

          // Split lines that are longer than 65 characters
          const splitDescriptionArray = formattedDescription.match(/.{1,65}/g);

          // Limit the number of lines to a maximum of three
          const limitedDescriptionArray = splitDescriptionArray.slice(0, 3);
          const limitedDescription = limitedDescriptionArray.join('\n');

          return limitedDescription;
        },



        // Generate transaction lines for MT940 content
        generateTransactionLines(formattedDate, transaction, transactionAmount) {
          const transactionLine = this.createTransactionLine(formattedDate, transaction, transactionAmount);
          const transactionDescriptionLines = this.createTransactionDescriptionLines(transaction);

          return transactionLine + transactionDescriptionLines + '\n';
        },


        // Generate closing balance line for MT940 content
        generateClosingBalanceLine(formattedDate, balance) {
          return `:62F:${balance > 0 ? 'C' : 'D'}${formattedDate}EUR${Math.abs(balance).toFixed(2).toString().replace('.', ',')}\n-\n`;
        },


        // Download generated MT940 content as .sta file
        downloadMT940() {
            const blob = new Blob([this.mt940], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "mt940.sta";
            link.click();
            URL.revokeObjectURL(link.href);
        },
    },
});

// Mount the Vue app to the div with the id of 'app'
app.mount("#app");
