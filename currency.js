function lettersonly (input){
    var regex = /[^a-z]/gi;
    input.value = input.value.replace(regex, "");
}

document.addEventListener("DOMContentLoaded", () => {
    const gdscurrencyInput = document.getElementById("gdscurrency");
    const serviceFeeCurrencyInput = document.getElementById("serviceFeeCurrency");
    const suggestionsGds = document.getElementById("suggestionsgds");
    const suggestionsServiceFee = document.getElementById("suggestionsservicefee");
    let currencies = [];

    // Load currencies from the JSON file
    fetch('https://mis-ghostjm.github.io/Test/currencies.json')
        .then(response => response.json())
        .then(data => {
            currencies = data;
        })
        .catch(error => console.error("Error loading currency data:", error));

    // Function to display suggestions
    function showSuggestions(input, suggestionsDiv) {
        const query = input.value.toUpperCase();
        suggestionsDiv.innerHTML = ""; // Clear previous suggestions
        if (query.length === 0) return;

        const matchedCurrencies = currencies.filter(currency => 
            currency.code.startsWith(query)
        );

        matchedCurrencies.forEach((currency, index) => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = `${currency.code} - ${currency.name}`;
            suggestionItem.addEventListener("click", () => {
                input.value = currency.code;
                suggestionsDiv.innerHTML = ""; // Clear suggestions after selection
            });
            suggestionsDiv.appendChild(suggestionItem);
        });

        suggestionsDiv.style.display = matchedCurrencies.length > 0 ? "block" : "none";
    }

    // Function to set the first suggestion as the input value
    function setFirstSuggestion(input, suggestionsDiv) {
        const firstSuggestion = suggestionsDiv.querySelector(".suggestion-item");
        if (firstSuggestion) {
            input.value = firstSuggestion.textContent.split(" - ")[0];
            suggestionsDiv.innerHTML = ""; // Clear suggestions after setting value
        }
    }

    // Event listeners for input fields
    gdscurrencyInput.addEventListener("keyup", (event) => {
        showSuggestions(gdscurrencyInput, suggestionsGds);
        if (event.key === "Tab") {
            setFirstSuggestion(gdscurrencyInput, suggestionsGds);
        }
    });

    serviceFeeCurrencyInput.addEventListener("keyup", (event) => {
        showSuggestions(serviceFeeCurrencyInput, suggestionsServiceFee);
        if (event.key === "Tab") {
            setFirstSuggestion(serviceFeeCurrencyInput, suggestionsServiceFee);
        }
    });

    // Event listeners for losing focus or clicking outside
    gdscurrencyInput.addEventListener("blur", () => setFirstSuggestion(gdscurrencyInput, suggestionsGds));
    serviceFeeCurrencyInput.addEventListener("blur", () => setFirstSuggestion(serviceFeeCurrencyInput, suggestionsServiceFee));

    document.addEventListener("click", (event) => {
        if (!gdscurrencyInput.contains(event.target) && !suggestionsGds.contains(event.target)) {
            setFirstSuggestion(gdscurrencyInput, suggestionsGds);
            suggestionsGds.style.display = "none";
        }
        if (!serviceFeeCurrencyInput.contains(event.target) && !suggestionsServiceFee.contains(event.target)) {
            setFirstSuggestion(serviceFeeCurrencyInput, suggestionsServiceFee);
            suggestionsServiceFee.style.display = "none";
        }
    });
});
